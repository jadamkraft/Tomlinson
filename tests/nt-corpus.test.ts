import { createHash, webcrypto } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { TextDecoder, TextEncoder } from 'node:util';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NtCorpusService, ntCorpus } from '../services/NtCorpusService';
import type { NtBook, NtManifest } from '../types';

const assetDirectory = resolve('public/assets/nt');
const manifestText = readFileSync(resolve(assetDirectory, 'manifest.json'), 'utf8');
const manifest: NtManifest = JSON.parse(manifestText);
const hash = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
const entryFor = (book: string) => manifest.books.find(entry => entry.book === book)!;
const bookText = (book: string) => readFileSync(resolve(assetDirectory, entryFor(book).file), 'utf8');
const sourceRows = (file: string) => readFileSync(resolve('sblgnt', file), 'utf8').trimEnd().split('\n');

function response(body: string, status = 200, contentType = 'application/json'): Response {
  const bytes = new TextEncoder().encode(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({ 'content-type': contentType }),
    arrayBuffer: async () => bytes.buffer,
  } as Response;
}

function fixtureFetch() {
  return vi.fn(async (input: RequestInfo | URL) => {
    const file = String(input).split('/').at(-1)!;
    return response(readFileSync(resolve(assetDirectory, file), 'utf8'));
  });
}

beforeEach(() => {
  vi.stubGlobal('crypto', webcrypto);
  vi.stubGlobal('TextDecoder', TextDecoder);
  vi.stubGlobal('TextEncoder', TextEncoder);
});

afterEach(() => { vi.unstubAllGlobals(); });

describe('canonical NT generation and provenance', () => {
  it('reproduces all bytes in read-only check mode without changing artifacts or pins', () => {
    const paths = [...readdirSync(assetDirectory).map(file => resolve(assetDirectory, file)), resolve('data/nt-source.json')];
    const before = paths.map(file => [hash(readFileSync(file)), statSync(file).mtimeMs]);
    const result = execFileSync(process.execPath, ['scripts/build_nt_corpus.cjs', '--check'], { encoding: 'utf8' });
    expect(result).toContain('Verified 27 books, 137554 tokens, 7927 verses');
    expect(paths.map(file => [hash(readFileSync(file)), statSync(file).mtimeMs])).toEqual(before);
  }, 20000);

  it('pins all 27 independent source hashes and whole JSON hashes', () => {
    const pins = JSON.parse(readFileSync(resolve('data/nt-source.json'), 'utf8'));
    expect(pins.sourceRevision).toBe('aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d');
    expect(manifest.sourceRevision).toBe(pins.sourceRevision);
    expect(pins.sources).toHaveLength(27);
    for (const [index, entry] of manifest.books.entries()) {
      const source = pins.sources[index];
      expect(entry.book).toBe(source.book);
      expect(entry.sourceSha256).toBe(hash(readFileSync(resolve('sblgnt', source.file))));
      expect(source.sha256).toBe(entry.sourceSha256);
      expect(entry.sha256).toBe(hash(bookText(entry.book)));
      expect(entry.file).toBe(`${entry.book}.${entry.sha256}.json`);
    }
  });

  it('preserves every field and exact Unicode independently for Romans 8:1 and 8:9', () => {
    const book: NtBook = JSON.parse(bookText('Rom'));
    const rows = sourceRows('66-Ro-morphgnt.txt');
    for (const verse of [1, 9]) {
      const reference = `Rom.8.${verse}`;
      const sourceReference = `0608${String(verse).padStart(2, '0')}`;
      const selected = rows.map((row, index) => ({ fields: row.split(/\s+/u), sourceLine: index + 1 })).filter(row => row.fields[0] === sourceReference);
      const tokens = book.tokens.filter(token => token.reference === reference);
      expect(tokens).toHaveLength(verse === 1 ? 8 : 26);
      expect(tokens).toEqual(selected.map(({ fields, sourceLine }, index) => ({
        text: fields[3], word: fields[4], normalizedWord: fields[5], lexicalLemma: fields[6],
        pos: fields[1], morph: fields[2], lemma: '', strongs: '',
        id: `${manifest.corpusId}/${reference}/${index + 1}`, language: 'grc', corpusId: manifest.corpusId,
        reference, sourceReference: fields[0], book: 'Rom', chapter: 8, verse, ordinal: index + 1, sourceLine,
      })));
    }
    expect(book.tokens.find(token => token.reference === 'Rom.8.9' && token.lexicalLemma === 'σάρξ')).toMatchObject({ text: 'σαρκὶ', word: 'σαρκὶ', normalizedWord: 'σαρκί', pos: 'N-', morph: '----DSF-' });
    expect(book.tokens.find(token => token.reference === 'Rom.8.1' && token.word === 'Ἰησοῦ')).toMatchObject({ text: '⸀Ἰησοῦ·', lexicalLemma: 'Ἰησοῦς' });
  });

  it('retains source imperative D without translating codes', () => {
    const rows = sourceRows('61-Mt-morphgnt.txt');
    const index = rows.findIndex(row => row.split(/\s+/u)[2][3] === 'D');
    expect(index).toBeGreaterThan(-1);
    const token = (JSON.parse(bookText('Matt')) as NtBook).tokens[index];
    expect(token.morph).toBe(rows[index].split(/\s+/u)[2]);
    expect(token.morph[3]).toBe('D');
    expect(token.pos).toBe('V-');
  });

  it('documents edition-specific omissions and distinct text/annotation rights', () => {
    const detailed = JSON.parse(manifestText);
    expect(detailed.knownAbsentReferences).toEqual(['John.7.53', ...Array.from({ length: 11 }, (_, index) => `John.8.${index + 1}`)]);
    const john: NtBook = JSON.parse(bookText('John'));
    expect(john.tokens.some(token => token.reference === 'John.7.53' || (token.chapter === 8 && token.verse <= 11))).toBe(false);
    const chapter = detailed.coverage.find(book => book.book === 'John').chapters.find(chapter => chapter.chapter === 8);
    expect(chapter.missingReferences).toEqual(Array.from({ length: 11 }, (_, index) => `John.8.${index + 1}`));
    expect(manifest.coverageNotes.join(' ')).toContain('predates SBLGNT v1.2');
    expect(manifest.coverageNotes.join(' ')).toContain('John 7:53-8:11');
    expect(manifest.notices.map(notice => notice.url)).toEqual(expect.arrayContaining(['https://creativecommons.org/licenses/by/4.0/', 'https://creativecommons.org/licenses/by-sa/3.0/', 'https://doi.org/10.5281/zenodo.376200']));
    expect(manifest.notices.some(notice => notice.label.startsWith('Modifications:'))).toBe(true);
  });
});

describe('NtCorpusService', () => {
  it('exports a singleton and dynamically uses global fetch', async () => {
    expect(ntCorpus).toBeInstanceOf(NtCorpusService);
    const fetcher = fixtureFetch();
    const service = new NtCorpusService();
    vi.stubGlobal('fetch', fetcher);
    expect(await service.getManifest()).toEqual(manifest);
    expect(fetcher).toHaveBeenCalledWith('/assets/nt/manifest.json', { cache: 'no-cache' });
  });

  it('coalesces requests, verifies all books, and reuses indexed verses/chapters', async () => {
    const fetcher = fixtureFetch();
    const service = new NtCorpusService(fetcher);
    expect(service.getBook('Rom')).toBeNull();
    expect(service.getVerse('Rom.8.9')).toBeNull();
    expect(service.getChapter('Rom', 8)).toEqual([]);
    expect(service.getAdjacentVerse('Rom.8.9', 1)).toBeNull();
    expect(service.getLastVerseOfBook('Rom')).toBeNull();
    expect(service.getLastVerseOfChapter('Rom', 8)).toBeNull();
    const [first, second] = await Promise.all([service.loadBook('Rom'), service.loadBook('Rom'), service.getManifest()]);
    expect(first).toBe(second);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher).toHaveBeenCalledWith(`/assets/nt/${entryFor('Rom').file}`, { cache: 'force-cache' });
    expect(await service.loadBook('Rom')).toBe(first);
    expect(service.getBook('Rom')).toBe(first);
    expect(service.getVerse('Rom.8.9')).toBe(service.getVerse('Rom.8.9'));
    expect(service.getChapter('Rom', 8)).toBe(service.getChapter('Rom', 8));
    expect(service.getChapter('Rom', 8).find(verse => verse.verse === 9)).toBe(service.getVerse('Rom.8.9'));
    expect(service.getVerse('Rom.8.9')?.words[5]).toBe(first.tokens.find(token => token.reference === 'Rom.8.9' && token.ordinal === 6));
    expect(service.getLastVerseOfChapter('Rom', 8)).toBe(39);
    expect(sourceRows('66-Ro-morphgnt.txt').at(-1)?.split(/\s+/u)[0]).toBe('061624');
    expect(service.getLastVerseOfBook('Rom')).toEqual({ chapter: 16, verse: 24 });
    expect(service.getAdjacentVerse('Rom.8.39', 1)).toBe('Rom.9.1');
    expect(service.getAdjacentVerse('Rom.9.1', -1)).toBe('Rom.8.39');
    expect(service.getAdjacentVerse('Rom.1.1', -1)).toBeNull();
    expect(service.getAdjacentVerse('Rom.16.24', 1)).toBeNull();
    expect(service.getAdjacentVerse('Rom.8.9', 0.5)).toBeNull();
    for (const entry of manifest.books) await service.loadBook(entry.book);
    expect(fetcher).toHaveBeenCalledTimes(28);
    expect(service.getAdjacentVerse('John.7.52', 1)).toBe('John.8.12');
    expect(service.getAdjacentVerse('John.8.12', -1)).toBe('John.7.52');
    expect(service.getVerse('John.8.1')).toBeNull();
    expect(service.getLastVerseOfBook('Phlm')).toEqual({ chapter: 1, verse: 25 });
    await expect(service.loadBook('../Rom')).rejects.toThrow('unknown book');
    expect(fetcher).toHaveBeenCalledTimes(28);
  });

  it.each([
    ['HTTP error', () => response('missing', 404)],
    ['HTML response', () => response('<html>fallback</html>', 200, 'text/html')],
    ['malformed JSON', () => response('{')],
    ['wrong schema', () => response(JSON.stringify({ ...manifest, schemaVersion: 2 }))],
    ['wrong snapshot', () => response(JSON.stringify({ ...manifest, sourceRevision: '0'.repeat(40) }))],
    ['wrong corpus ID', () => response(JSON.stringify({ ...manifest, corpusId: 'old' }))],
    ['missing books', () => response(JSON.stringify({ ...manifest, books: manifest.books.slice(1) }))],
    ['path traversal', () => response(JSON.stringify({ ...manifest, books: manifest.books.map((entry, index) => index ? entry : { ...entry, file: '../Matt.json' }) }))],
    ['bad hash', () => response(JSON.stringify({ ...manifest, books: manifest.books.map((entry, index) => index ? entry : { ...entry, sourceSha256: 'invalid' }) }))],
    ['bad count', () => response(JSON.stringify({ ...manifest, books: manifest.books.map((entry, index) => index ? entry : { ...entry, tokenCount: 0 }) }))],
    ['bad notice', () => response(JSON.stringify({ ...manifest, notices: [{ label: 'license', url: 'javascript:alert(1)' }] }))],
    ['missing coverage', () => response(JSON.stringify({ ...manifest, coverageNotes: [] }))],
  ])('rejects %s manifests and retries without XML fallback', async (_label, invalid) => {
    const fetcher = fixtureFetch().mockImplementationOnce(async () => invalid());
    const service = new NtCorpusService(fetcher);
    await expect(service.loadBook('Phlm')).rejects.toThrow();
    expect(service.getBook('Phlm')).toBeNull();
    await expect(service.loadBook('Phlm')).resolves.toMatchObject({ book: 'Phlm' });
    expect(fetcher.mock.calls.every(([url]) => String(url).startsWith('/assets/nt/'))).toBe(true);
    expect(fetcher.mock.calls.filter(([url]) => String(url).endsWith('manifest.json'))).toHaveLength(2);
  });

  it('rejects altered body bytes and retries failed book requests', async () => {
    const fetcher = fixtureFetch().mockImplementationOnce(async () => response(manifestText)).mockImplementationOnce(async () => response(`${bookText('Phlm')} `));
    const service = new NtCorpusService(fetcher);
    await expect(service.loadBook('Phlm')).rejects.toThrow('SHA-256');
    expect(service.getBook('Phlm')).toBeNull();
    await expect(service.loadBook('Phlm')).resolves.toMatchObject({ book: 'Phlm' });
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it.each([
    ['schema', (book: any) => { book.schemaVersion = 2; }],
    ['corpus version', (book: any) => { book.corpusId = 'different'; }],
    ['book identity', (book: any) => { book.book = 'Rom'; }],
    ['token count', (book: any) => { book.tokens.pop(); }],
    ['ordinal', (book: any) => { book.tokens[0].ordinal = 2; }],
    ['source line', (book: any) => { book.tokens[0].sourceLine = '1'; }],
    ['chapter', (book: any) => { book.tokens[0].chapter = 0; }],
    ['reference', (book: any) => { book.tokens[0].reference = 'Phlm.1.2'; }],
    ['source reference', (book: any) => { book.tokens[0].sourceReference = '780101'; }],
    ['token ID', (book: any) => { book.tokens[0].id = book.tokens[1].id; }],
    ['word', (book: any) => { book.tokens[0].word = ''; }],
    ['lexical lemma', (book: any) => { book.tokens[0].lexicalLemma = null; }],
    ['POS', (book: any) => { book.tokens[0].pos = 'unknown'; }],
    ['morphology', (book: any) => { book.tokens[0].morph = '----'; }],
    ['legacy conflation', (book: any) => { book.tokens[0].lemma = book.tokens[0].lexicalLemma; }],
    ['Strong linkage', (book: any) => { book.tokens[0].strongs = 'G1'; }],
    ['language', (book: any) => { book.tokens[0].language = 'he'; }],
    ['order', (book: any) => { book.tokens.reverse(); }],
  ])('rejects hash-consistent invalid book %s', async (_label, mutate) => {
    const book = JSON.parse(bookText('Phlm'));
    mutate(book);
    const body = JSON.stringify(book);
    const digest = hash(body);
    const altered = { ...manifest, books: manifest.books.map(entry => entry.book === 'Phlm' ? { ...entry, sha256: digest, file: `Phlm.${digest}.json` } : entry) };
    const fetcher = vi.fn().mockResolvedValueOnce(response(JSON.stringify(altered))).mockResolvedValueOnce(response(body));
    const service = new NtCorpusService(fetcher);
    await expect(service.loadBook('Phlm')).rejects.toThrow();
    expect(service.getBook('Phlm')).toBeNull();
  });

  it('rejects hash-consistent verse count mismatches', async () => {
    const altered = { ...manifest, books: manifest.books.map(entry => entry.book === 'Phlm' ? { ...entry, verseCount: entry.verseCount + 1 } : entry) };
    const fetcher = vi.fn().mockResolvedValueOnce(response(JSON.stringify(altered))).mockResolvedValueOnce(response(bookText('Phlm')));
    await expect(new NtCorpusService(fetcher).loadBook('Phlm')).rejects.toThrow('verse count');
  });
});