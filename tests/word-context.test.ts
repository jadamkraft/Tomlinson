import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import type { CorpusToken, NtBook, NtManifest, WordContextQuery } from '../types';
import { NT_BOOK_ORDER, WordContextIndex } from '../services/WordContextIndex';
import { WordContextService } from '../services/WordContextService';

const sourceDirectory = resolve(process.cwd(), 'sblgnt');
const sourceFiles = readdirSync(sourceDirectory).filter(file => file.endsWith('-morphgnt.txt')).sort();
const rawBooks = sourceFiles.map(file => readFileSync(resolve(sourceDirectory, file), 'utf8').trim().split(/\r?\n/).map(row => row.split(/\s+/)));

function sourceBook(rows: string[][], book: string): NtBook {
  return {
    schemaVersion: 1, corpusId: 'source-test', book,
    tokens: rows.map((columns, ordinal) => ({
      id: `${book}:${ordinal}`, text: columns[3], word: columns[4], normalizedWord: columns[5],
      lexicalLemma: columns[6], pos: columns[1], morph: columns[2], lemma: '', strongs: '',
      language: 'grc', corpusId: 'source-test', book, chapter: Number(columns[0].slice(2, 4)),
      verse: Number(columns[0].slice(4, 6)), reference: `${book}.${Number(columns[0].slice(2, 4))}.${Number(columns[0].slice(4, 6))}`,
      ordinal, sourceLine: ordinal + 1,
    })),
  };
}

const corpusBooks = rawBooks.map((rows, position) => sourceBook(rows, NT_BOOK_ORDER[position]));
const corpus = new WordContextIndex();
for (const book of [...corpusBooks].reverse()) corpus.addBook(book);
const query = (changes: Partial<WordContextQuery> = {}): WordContextQuery => ({
  mode: 'lemma', term: 'σάρξ', books: ['Rom'], direction: 'either', distance: 1, boundary: 'chapter', page: 0, ...changes,
});

function straightSourceMatches(search: WordContextQuery): string[] {
  const found: string[] = [];
  rawBooks.forEach((rows, bookPosition) => {
    const book = NT_BOOK_ORDER[bookPosition];
    if (!search.books.includes(book)) return;
    rows.forEach((columns, position) => {
      if (columns[search.mode === 'lemma' ? 6 : 4].normalize('NFC') !== search.term.normalize('NFC')) return;
      let qualifies = search.companion === undefined;
      for (let offset = -search.distance; search.companion !== undefined && offset <= search.distance; offset++) {
        if (!offset || (search.direction === 'before' && offset > 0) || (search.direction === 'after' && offset < 0)) continue;
        const neighbor = rows[position + offset];
        if (neighbor && neighbor[0].slice(0, 4) === columns[0].slice(0, 4) && neighbor[6].normalize('NFC') === search.companion.normalize('NFC')) qualifies = true;
      }
      if (qualifies) found.push(`${book}:${position}`);
    });
  });
  return found;
}

function synthetic(book = 'Rom', lemmas = ['ἐν', 'σάρξ', 'ἐν']): NtBook {
  const tokens: CorpusToken[] = lemmas.map((lexicalLemma, ordinal) => ({
    id: `${book}:${ordinal}`, text: lexicalLemma, word: lexicalLemma, normalizedWord: 'unused',
    lexicalLemma, lemma: 'G4561', strongs: 'G4561', pos: 'N-', morph: '--------', language: 'grc',
    corpusId: 'synthetic', book, chapter: 1, verse: ordinal + 1, reference: `${book}.1.${ordinal + 1}`, ordinal, sourceLine: ordinal + 1,
  }));
  return { schemaVersion: 1, corpusId: 'synthetic', book, tokens };
}

describe('source-backed word context index', () => {
  it('preserves Romans 8:9 surface, normalized spelling and lexical identity', () => {
    const result = corpus.search(query({ companion: 'ἐν', direction: 'before' }));
    const hit = result.hits.find(entry => entry.target.reference === 'Rom.8.9');
    expect(hit?.target).toMatchObject({ text: 'σαρκὶ', word: 'σαρκὶ', normalizedWord: 'σαρκί', lexicalLemma: 'σάρξ', lemma: '', strongs: '' });
    expect(hit?.companions).toHaveLength(1);
    expect(hit?.context.find(token => token.id === hit.companions[0])?.lexicalLemma).toBe('ἐν');
    expect(corpus.search(query({ mode: 'form', term: 'σαρκὶ' })).hits.some(entry => entry.target.reference === 'Rom.8.9')).toBe(true);
    expect(corpus.search(query({ mode: 'form', term: 'σαρκί' })).hits.some(entry => entry.target.reference === 'Rom.8.9')).toBe(false);
  });

  it('finds the source Christ lemma at Romans 8:1', () => {
    const rows = rawBooks[5].filter(columns => columns[0] === '060801');
    const index = new WordContextIndex();
    index.addBook(sourceBook(rows, 'Rom'));
    expect(index.search(query({ term: 'Χριστός', companion: 'ἐν', direction: 'before' })).hits[0]?.target)
      .toMatchObject({ reference: 'Rom.8.1', lexicalLemma: 'Χριστός', word: 'Χριστῷ' });
  });

  it.each([
    { term: 'σάρξ' }, { term: 'πνεῦμα', companion: 'ἐν', distance: 3 },
    { term: 'Χριστός', companion: 'ἐν', direction: 'before' as const, distance: 2 },
    { term: 'ἐν', companion: 'ἐν', distance: 10 },
    { term: 'ἐν', companion: 'πνεῦμα', direction: 'after' as const, distance: 3 },
    { mode: 'form' as const, term: 'σαρκὶ' },
  ])('matches an independent full-NT source scan: %j', changes => {
    const search = query({ ...changes, books: [...NT_BOOK_ORDER].reverse() });
    const expected = straightSourceMatches(search);
    const result = corpus.search(search);
    expect(result.total).toBe(expected.length);
    expect(result.scopeTokens).toBe(rawBooks.reduce((total, rows) => total + rows.length, 0));
    expect(result.hits.map(hit => hit.target.id)).toEqual(expected.slice(0, 25));
    const lastPage = Math.floor(expected.length / 25);
    expect(corpus.search({ ...search, page: lastPage }).hits.map(hit => hit.target.id)).toEqual(expected.slice(lastPage * 25, lastPage * 25 + 25));
  });
});

describe('exact boundaries, scope and pagination', () => {
  it('counts each target once with both companions across verse boundaries and interprets direction relative to target', () => {
    const index = new WordContextIndex();
    index.addBook(synthetic());
    const either = index.search(query({ companion: 'ἐν' }));
    expect(either.total).toBe(1);
    expect(either.hits[0].companions).toEqual(['Rom:0', 'Rom:2']);
    expect(index.search(query({ companion: 'ἐν', direction: 'before' })).hits[0].companions).toEqual(['Rom:0']);
    expect(index.search(query({ companion: 'ἐν', direction: 'after' })).hits[0].companions).toEqual(['Rom:2']);
    expect(index.search(query({ companion: 'ἐν', books: ['Rom', 'Rom'] }))).toEqual(either);
  });

  it('never pairs a token with itself, or crosses chapters or books', () => {
    const index = new WordContextIndex();
    const book = synthetic('Rom', ['ἐν', 'σάρξ', 'ἐν']);
    book.tokens[2].chapter = 2;
    index.addBook(book);
    index.addBook(synthetic('Gal', ['σάρξ']));
    expect(index.search(query({ companion: 'ἐν', direction: 'after', distance: 10 })).total).toBe(0);
    expect(index.search(query({ term: 'ἐν', companion: 'ἐν', distance: 10 })).total).toBe(0);
    const hit = index.search(query({ books: ['Gal', 'Rom'], companion: 'ἐν', distance: 10 })).hits[0];
    expect(hit.context.map(token => token.id)).toEqual(['Rom:0', 'Rom:1']);
    expect(index.search(query({ books: ['Gal'], companion: 'ἐν' })).total).toBe(0);
  });

  it('returns 25 canonical targets per page with chapter-clipped eight-token KWIC', () => {
    const index = new WordContextIndex();
    index.addBook(synthetic('Gal', Array(30).fill('σάρξ')));
    index.addBook(synthetic('Rom', Array(30).fill('σάρξ')));
    const first = index.search(query({ books: ['Gal', 'Rom'] }));
    expect(first).toMatchObject({ total: 60, scopeTokens: 60, page: 0 });
    expect(first.hits).toHaveLength(25);
    expect(first.hits[0].target.book).toBe('Rom');
    expect(first.hits[0].context).toHaveLength(9);
    expect(first.hits[10].context.map(token => token.ordinal)).toEqual(Array.from({ length: 17 }, (_, position) => position + 2));
    expect(index.search(query({ books: ['Gal', 'Rom'], page: 1 })).hits[5].target.book).toBe('Gal');
    expect(index.search(query({ page: 100 }))).toMatchObject({ total: 30, page: 100, hits: [] });
  });

  it('normalizes only NFC, never case, accents, normalizedWord, or legacy Strong IDs', () => {
    const index = new WordContextIndex();
    index.addBook(synthetic('Rom', ['ἐν', 'Χριστός', 'χριστός', 'Χριστος']));
    expect(index.search(query({ term: 'Χριστός'.normalize('NFD') })).total).toBe(1);
    expect(index.search(query({ mode: 'form', term: 'Χριστός'.normalize('NFD') })).total).toBe(1);
    expect(index.search(query({ term: 'Χριστός', companion: 'ἐν'.normalize('NFD'), direction: 'before' })).total).toBe(1);
    for (const term of ['G4561', 'unused', 'ΧΡΙΣΤΌΣ']) expect(index.search(query({ term })).total).toBe(0);
  });

  it('provides sorted bounded prefix suggestions including common default lemmas', () => {
    const suggestions = corpus.lemmas();
    expect(suggestions.length).toBeLessThanOrEqual(100);
    expect(suggestions).toEqual([...suggestions].sort());
    expect(suggestions).toEqual(expect.arrayContaining(['ἐν', 'πνεῦμα', 'Χριστός']));
    expect(corpus.lemmas('πνε'.normalize('NFD'))).toEqual(expect.arrayContaining(['πνεῦμα']));
    expect(corpus.lemmas('πνε').every(lemma => lemma.startsWith('πνε'))).toBe(true);
  });

  it.each([
    { books: [] }, { books: ['Gen'] }, { books: ['Gal'] }, { books: ['Rom', 'Gal'] },
    { distance: 0 }, { distance: 11 }, { distance: 1.5 }, { distance: NaN },
    { page: -1 }, { page: 0.1 }, { page: Infinity }, { boundary: 'verse' },
    { mode: 'strongs' }, { direction: 'left' }, { term: '' }, { companion: '' },
  ])('rejects invalid or incomplete query %j', changes => {
    const index = new WordContextIndex();
    index.addBook(synthetic());
    expect(() => index.search(query(changes as Partial<WordContextQuery>))).toThrow();
  });

  it('rejects mixed corpus identities atomically and replaces a book without duplicate postings', () => {
    const index = new WordContextIndex();
    index.addBook(synthetic());
    expect(() => index.addBook({ ...synthetic('Gal'), corpusId: 'other' })).toThrow(/corpusId/);
    const malformed = synthetic('Gal');
    malformed.tokens[0].corpusId = 'other';
    expect(() => index.addBook(malformed)).toThrow(/corpusId/);
    index.addBook(synthetic());
    expect(index.search(query())).toMatchObject({ total: 1, scopeTokens: 3 });
  });
});

class FakeWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  onmessageerror: (() => void) | null = null;
  postMessage = vi.fn();
  terminate = vi.fn();
  reply(data: unknown) { this.onmessage?.({ data } as MessageEvent); }
}

describe('worker bridge lifecycle', () => {
  it('lazily creates a worker and settles every overlapping request by ID, including out-of-order replies', async () => {
    const worker = new FakeWorker();
    const factory = vi.fn(() => worker as unknown as Worker);
    const service = new WordContextService(factory);
    expect(factory).not.toHaveBeenCalled();
    const first = service.search(query());
    const second = service.search(query({ term: 'πνεῦμα' }));
    const lemmas = service.getLemmas();
    const messages = worker.postMessage.mock.calls.map(call => call[0]);
    expect(messages.map(message => message.id)).toEqual([1, 2, 3]);
    expect(messages[2]).toEqual({ id: 3, type: 'lemmas', prefix: '' });
    const result = corpus.search(query());
    worker.reply({ id: 2, result: { ...result, total: 99 } });
    worker.reply({ id: 3, result: ['ἐν'] });
    worker.reply({ id: 1, result });
    await expect(first).resolves.toEqual(result);
    await expect(second).resolves.toMatchObject({ total: 99 });
    await expect(lemmas).resolves.toEqual(['ἐν']);
    expect(factory).toHaveBeenCalledTimes(1);
    service.dispose();
  });

  it('rejects request errors without discarding other pending requests', async () => {
    const worker = new FakeWorker();
    const service = new WordContextService(() => worker as unknown as Worker);
    const failed = service.search(query());
    const failure = expect(failed).rejects.toThrow('incomplete');
    const success = service.getLemmas('πνε');
    worker.reply({ id: 1, error: 'incomplete scope' });
    worker.reply({ id: 2, result: ['πνεῦμα'] });
    await failure;
    await expect(success).resolves.toEqual(['πνεῦμα']);
    expect(worker.terminate).not.toHaveBeenCalled();
    service.dispose();
  });

  it.each(['error', 'messageerror', 'terminate', 'dispose', 'postMessage'])('rejects all pending on %s and recreates the worker on retry', async cause => {
    const workers = [new FakeWorker(), new FakeWorker()];
    const factory = vi.fn().mockReturnValueOnce(workers[0]).mockReturnValueOnce(workers[1]);
    const service = new WordContextService(factory);
    const first = service.search(query());
    const firstRejected = expect(first).rejects.toThrow();
    if (cause === 'postMessage') workers[0].postMessage.mockImplementationOnce(() => { throw new Error('clone failure'); });
    const second = service.getLemmas();
    const secondRejected = expect(second).rejects.toThrow();
    const staleHandler = workers[0].onmessage;
    if (cause === 'error') workers[0].onerror?.({ message: 'worker failure', preventDefault: vi.fn() } as unknown as ErrorEvent);
    if (cause === 'messageerror') workers[0].onmessageerror?.();
    if (cause === 'terminate') service.terminate();
    if (cause === 'dispose') service.dispose();
    await Promise.all([firstRejected, secondRejected]);
    expect(workers[0].terminate).toHaveBeenCalledTimes(1);
    const retry = service.getLemmas('ἐ');
    staleHandler?.({ data: { id: 3, result: ['stale'] } } as MessageEvent);
    workers[1].reply({ id: 3, result: ['ἐν'] });
    await expect(retry).resolves.toEqual(['ἐν']);
    expect(factory).toHaveBeenCalledTimes(2);
    service.dispose();
  });

  it('retries factory creation after a synchronous failure', async () => {
    const worker = new FakeWorker();
    const factory = vi.fn().mockImplementationOnce(() => { throw new Error('worker unavailable'); }).mockReturnValueOnce(worker);
    const service = new WordContextService(factory);
    await expect(service.search(query())).rejects.toThrow('worker unavailable');
    const retry = service.getLemmas();
    worker.reply({ id: 1, result: ['ἐν'] });
    await expect(retry).resolves.toEqual(['ἐν']);
    service.dispose();
  });
});

describe('authorship comparison presets', () => {
  it('keeps seven, additional six and full thirteen explicit, canonical and free of Hebrews', () => {
    const presets = JSON.parse(readFileSync(resolve(process.cwd(), 'data/nt-author-groups.json'), 'utf8'));
    expect(presets.map(preset => preset.books.length)).toEqual([7, 6, 13]);
    expect(presets[0].books).toEqual(['Rom', '1Cor', '2Cor', 'Gal', 'Phil', '1Thess', 'Phlm']);
    expect(presets[1].books).toEqual(['Eph', 'Col', '2Thess', '1Tim', '2Tim', 'Titus']);
    expect(new Set(presets.flatMap(preset => preset.books)).size).toBe(13);
    for (const preset of presets) {
      expect(preset.books).toEqual(NT_BOOK_ORDER.filter(book => preset.books.includes(book)));
      expect(preset.books).not.toContain('Heb');
      expect(preset.description).toMatch(/adjudicat|settles/);
      expect(preset.sourceUrl).toBe('https://en.wikipedia.org/wiki/Authorship_of_the_Pauline_epistles');
    }
  });
});

function manifestFor(books: NtBook[]): NtManifest {
  return {
    schemaVersion: 1, corpusId: books[0].corpusId, title: 'Test source', sourceRevision: 'test',
    sourceUrl: 'https://github.com/morphgnt/sblgnt', annotationSystem: 'MorphGNT', notices: [], coverageNotes: [],
    books: books.map(book => ({ book: book.book, file: `${book.book}.json`, sha256: '', sourceSha256: '', tokenCount: book.tokens.length, verseCount: 1 })),
  };
}

async function workerHarness(books = [synthetic(), synthetic('Gal')]) {
  vi.resetModules();
  const manifest = manifestFor(books);
  const getManifest = vi.fn().mockResolvedValue(manifest);
  const loadBook = vi.fn(async (bookId: string) => {
    const book = books.find(candidate => candidate.book === bookId);
    if (!book) throw new Error('not available');
    return book;
  });
  vi.doMock('../services/NtCorpusService', () => ({ ntCorpus: { getManifest, loadBook } }));
  const scope = {
    onmessage: null as ((event: { data: unknown }) => Promise<void>) | null,
    postMessage: vi.fn(),
  };
  vi.stubGlobal('self', scope);
  await import('../workers/ntResearch.worker');
  return { scope, getManifest, loadBook, send: (data: unknown) => scope.onmessage!({ data }) };
}

describe('worker scope completeness and bounded replies', () => {
  it('withholds totals until the whole scope loads, shares overlapping loads and replies to every ID', async () => {
    const harness = await workerHarness();
    let finishGal: (book: NtBook) => void = () => {};
    const delayedGal = new Promise<NtBook>(resolveBook => { finishGal = resolveBook; });
    harness.loadBook.mockImplementation(book => book === 'Gal' ? delayedGal : Promise.resolve(synthetic()));
    try {
      const first = harness.send({ id: 1, type: 'search', query: query({ books: ['Gal', 'Rom', 'Rom'] }) });
      const second = harness.send({ id: 2, type: 'search', query: query() });
      await second;
      expect(harness.loadBook).toHaveBeenCalledTimes(2);
      expect(harness.scope.postMessage).toHaveBeenCalledTimes(1);
      expect(harness.scope.postMessage.mock.calls[0][0]).toMatchObject({ id: 2, result: { total: 1, scopeTokens: 3 } });
      finishGal(synthetic('Gal'));
      await first;
      const reply = harness.scope.postMessage.mock.calls[1][0];
      expect(reply).toMatchObject({ id: 1, result: { total: 2, scopeTokens: 6 } });
      expect(reply.result.hits.map(hit => hit.target.book)).toEqual(['Rom', 'Gal']);
    } finally {
      finishGal(synthetic('Gal'));
      vi.unstubAllGlobals();
      vi.doUnmock('../services/NtCorpusService');
    }
  });

  it('reports incomplete scopes without totals and retries failed book loads', async () => {
    const harness = await workerHarness();
    harness.loadBook.mockImplementationOnce(async () => synthetic()).mockRejectedValueOnce(new Error('offline'));
    try {
      await harness.send({ id: 1, type: 'search', query: query({ books: ['Rom', 'Gal'] }) });
      expect(harness.scope.postMessage.mock.calls[0][0]).toEqual({ id: 1, error: expect.stringMatching(/incomplete.*Gal.*offline/i) });
      await harness.send({ id: 2, type: 'search', query: query({ books: ['Rom', 'Gal'] }) });
      expect(harness.scope.postMessage.mock.calls[1][0]).toMatchObject({ id: 2, result: { total: 2, scopeTokens: 6 } });
      expect(harness.loadBook).toHaveBeenCalledTimes(3);
    } finally {
      vi.unstubAllGlobals();
      vi.doUnmock('../services/NtCorpusService');
    }
  });

  it('loads all books for bounded lemma suggestions and returns only one page for frequent prepositions', async () => {
    const harness = await workerHarness(corpusBooks);
    try {
      await harness.send({ id: 1, type: 'lemmas', prefix: '' });
      const suggestions = harness.scope.postMessage.mock.calls[0][0].result;
      expect(harness.loadBook).toHaveBeenCalledTimes(27);
      expect(suggestions.length).toBeLessThanOrEqual(100);
      expect(suggestions).toEqual(expect.arrayContaining(['ἐν', 'πνεῦμα', 'Χριστός']));
      await harness.send({ id: 2, type: 'search', query: query({ books: [...NT_BOOK_ORDER], term: 'ἐν' }) });
      const reply = harness.scope.postMessage.mock.calls[1][0];
      expect(reply.result.total).toBe(straightSourceMatches(query({ books: [...NT_BOOK_ORDER], term: 'ἐν' })).length);
      expect(reply.result.hits).toHaveLength(25);
      expect(reply.result.hits.every(hit => hit.context.length <= 17)).toBe(true);
      expect(harness.loadBook).toHaveBeenCalledTimes(27);
    } finally {
      vi.unstubAllGlobals();
      vi.doUnmock('../services/NtCorpusService');
    }
  });

  it('retries manifest failure and rejects invalid scope before loading any books', async () => {
    const harness = await workerHarness();
    harness.getManifest.mockRejectedValueOnce(new Error('manifest unavailable'));
    try {
      await harness.send({ id: 1, type: 'search', query: query() });
      expect(harness.scope.postMessage.mock.calls[0][0]).toMatchObject({ id: 1, error: expect.stringMatching(/incomplete.*manifest unavailable/i) });
      await harness.send({ id: 2, type: 'search', query: query({ books: ['Rom', 'Gen'] }) });
      expect(harness.scope.postMessage.mock.calls[1][0]).toMatchObject({ id: 2, error: expect.stringMatching(/Gen/) });
      expect(harness.loadBook).not.toHaveBeenCalled();
      await harness.send({ id: 3, type: 'search', query: query() });
      expect(harness.scope.postMessage.mock.calls[2][0]).toMatchObject({ id: 3, result: { total: 1, scopeTokens: 3 } });
      expect(harness.getManifest).toHaveBeenCalledTimes(2);
    } finally {
      vi.unstubAllGlobals();
      vi.doUnmock('../services/NtCorpusService');
    }
  });
});