import { webcrypto } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { TextDecoder, TextEncoder } from 'node:util';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BibleEngine } from '../services/BibleEngine';
import { NtCorpusService } from '../services/NtCorpusService';
import type { NtManifest } from '../types';

const genesis = readFileSync(resolve('tests/fixtures/gen-1-1.xml'), 'utf8');
const matthew = readFileSync(resolve('tests/fixtures/matt-1-1.xml'), 'utf8');
const xmlResponse = (xml: string) => ({ ok: true, text: async () => xml });
const assetDirectory = resolve('public/assets/nt');
const manifestText = readFileSync(resolve(assetDirectory, 'manifest.json'), 'utf8');
const manifest: NtManifest = JSON.parse(manifestText);
const entryFor = (book: string) => manifest.books.find(entry => entry.book === book)!;
const bookText = (book: string) => readFileSync(resolve(assetDirectory, entryFor(book).file), 'utf8');
const sourceRows = (file: string) => readFileSync(resolve('sblgnt', file), 'utf8')
  .trimEnd().split('\n').map((row, index) => ({ fields: row.split(/\s+/u), sourceLine: index + 1 }));

function jsonResponse(body: string, status = 200): Response {
  const bytes = new TextEncoder().encode(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({ 'content-type': 'application/json' }),
    arrayBuffer: async () => bytes.buffer,
  } as Response;
}

const assetResponse = async (input: RequestInfo | URL) => {
  const file = String(input).split('/').at(-1)!;
  return jsonResponse(readFileSync(resolve(assetDirectory, file), 'utf8'));
};

let bible: BibleEngine;
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.stubGlobal('crypto', webcrypto);
  vi.stubGlobal('TextDecoder', TextDecoder);
  vi.stubGlobal('TextEncoder', TextEncoder);
  bible = new BibleEngine();
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('bounded authentic verse fixtures', () => {
  it('preserves Hebrew Unicode, segmentation, morphology, and Strong linkage', async () => {
    fetchMock.mockResolvedValue(xmlResponse(genesis));
    await bible.loadBook('Gen');
    const verse = bible.getVerse('Gen.1.1');
    expect(verse).toMatchObject({ osisID: 'Gen.1.1', book: 'Gen', chapter: 1, verse: 1 });
    expect(verse?.words.map(({ text, lemma, morph, strongs, id }) =>
      [text, lemma, morph, strongs, id])).toEqual([
      ['בְּ/רֵאשִׁ֖ית', 'b/7225', 'HR/Ncfsa', 'H7225', '01xeN'],
      ['בָּרָ֣א', '1254 a', 'HVqp3ms', 'H1254', '01Nvk'],
      ['אֱלֹהִ֑ים', '430', 'HNcmpa', 'H430', '01TyA'],
      ['אֵ֥ת', '853', 'HTo', 'H853', '01vuQ'],
      ['הַ/שָּׁמַ֖יִם', 'd/8064', 'HTd/Ncmpa', 'H8064', '01TSc'],
      ['וְ/אֵ֥ת', 'c/853', 'HC/To', 'H853', '01k5P'],
      ['הָ/אָֽרֶץ', 'd/776', 'HTd/Ncbsa', 'H776', '01nPh'],
    ]);
    expect(fetchMock).toHaveBeenCalledWith('/assets/Gen.xml');
  });

  it('reads canonical Matthew with source lexical fields, punctuation and stable IDs, not XML linkage', async () => {
    fetchMock.mockImplementation(assetResponse);
    await bible.loadBook('Matt');
    const verse = bible.getVerse('Matt.1.1');
    const rows = sourceRows('61-Mt-morphgnt.txt').filter(({ fields }) => fields[0] === '010101');
    expect(verse).toMatchObject({ osisID: 'Matt.1.1', book: 'Matt', chapter: 1, verse: 1 });
    expect(verse?.words).toEqual(rows.map(({ fields, sourceLine }, index) => ({
      text: fields[3], word: fields[4], normalizedWord: fields[5], lexicalLemma: fields[6],
      pos: fields[1], morph: fields[2], lemma: '', strongs: '',
      id: `${manifest.corpusId}/Matt.1.1/${index + 1}`, language: 'grc', corpusId: manifest.corpusId,
      reference: 'Matt.1.1', sourceReference: fields[0], book: 'Matt', chapter: 1, verse: 1,
      ordinal: index + 1, sourceLine,
    })));
    const legacy = new DOMParser().parseFromString(matthew, 'text/xml');
    expect(Array.from(legacy.querySelectorAll('w'), word => [word.textContent, word.getAttribute('morph')]))
      .toEqual(rows.map(({ fields }) => [fields[3], fields[2]]));
    expect(bible.getVerse('Matt.1.1')).toBe(verse);
    expect(fetchMock).toHaveBeenCalledWith('/assets/nt/manifest.json', { cache: 'no-cache' });
    expect(fetchMock).toHaveBeenCalledWith(`/assets/nt/${entryFor('Matt').file}`, { cache: 'force-cache' });
  });

  it('uses a warm book cache without duplicate fetches', async () => {
    fetchMock.mockResolvedValue(xmlResponse(genesis));
    await bible.loadBook('Gen');
    await bible.loadBook('Gen');
    expect(bible.getVerse('Gen.1.1')?.words).toHaveLength(7);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('keeps each fixture well-formed and bounded to the named verse', () => {
    for (const [xml, reference] of [[genesis, 'Gen.1.1'], [matthew, 'Matt.1.1']]) {
      const doc = new DOMParser().parseFromString(xml, 'text/xml');
      expect(doc.querySelector('parsererror')).toBeNull();
      expect(doc.querySelectorAll('verse')).toHaveLength(1);
      expect(doc.querySelector('verse')?.getAttribute('osisID')).toBe(reference);
    }
  });
});

describe('synthetic XML layout and local adjacency', () => {
  it('reads synthetic flat verse-number siblings without crossing the next marker', async () => {
    fetchMock.mockResolvedValue(xmlResponse(`<osis><book osisID="Gen">
      <verse-number id="Gen 1:1"/><w strongs="strong:H12" morph="HNcmsa">test-first</w>
      <w strongs="13">test-second</w><verse-number id="Gen 1:2"/>
      <w strongs="14">test-next</w></book></osis>`));
    await bible.loadBook('Gen');
    expect(bible.getVerse('Gen.1.1')?.words.map(({ text, strongs, morph }) =>
      [text, strongs, morph])).toEqual([
      ['test-first', 'H12', 'HNcmsa'], ['test-second', 'H13', ''],
    ]);
    expect(bible.getChapter('Gen', 1).map(verse => verse.osisID)).toEqual(['Gen.1.1', 'Gen.1.2']);
  });

  it('navigates locally across two synthetic chapters and stops at book edges', async () => {
    fetchMock.mockResolvedValue(xmlResponse(`<osis><div type="book" osisID="Gen">
      <chapter osisID="Gen.1">
        <verse osisID="Gen.1.1"><w>test-one</w></verse>
        <verse osisID="Gen.1.2"><w>test-two</w></verse>
      </chapter><chapter osisID="Gen.2">
        <verse osisID="Gen.2.1"><w>test-three</w></verse>
      </chapter></div></osis>`));
    await bible.loadBook('Gen');
    expect(bible.getAdjacentVerse('Gen.1.1', 1)).toBe('Gen.1.2');
    expect(bible.getAdjacentVerse('Gen.1.2', 1)).toBe('Gen.2.1');
    expect(bible.getAdjacentVerse('Gen.2.1', -1)).toBe('Gen.1.2');
    expect(bible.getAdjacentVerse('Gen.1.1', -1)).toBeNull();
    expect(bible.getAdjacentVerse('Gen.2.1', 1)).toBeNull();
    expect(bible.getLastVerseOfChapter('Gen', 1)).toBe(2);
    expect(bible.getLastVerseOfBook('Gen')).toEqual({ chapter: 2, verse: 1 });
    expect(bible.getChapter('Gen', 1).map(verse => verse.osisID)).toEqual(['Gen.1.1', 'Gen.1.2']);
    expect(bible.getChapter('Gen', 3)).toEqual([]);
  });
});

describe('canonical NT engine integration', () => {
  it('preserves Romans 8:9 metadata and retrieves the complete source chapter', async () => {
    fetchMock.mockImplementation(assetResponse);
    await bible.loadBook('Rom');
    const rows = sourceRows('66-Ro-morphgnt.txt');
    const chapterRows = rows.filter(({ fields }) => fields[0].startsWith('0608'));
    const references = [...new Set(chapterRows.map(({ fields }) => `Rom.8.${Number(fields[0].slice(4))}`))];
    const chapter = bible.getChapter('Rom', 8);
    expect(chapter.map(verse => verse.osisID)).toEqual(references);
    expect(chapter.flatMap(verse => verse.words.map(word => word.text)))
      .toEqual(chapterRows.map(({ fields }) => fields[3]));
    const verse = bible.getVerse('Rom.8.9');
    expect(chapter.find(candidate => candidate.verse === 9)).toBe(verse);
    const source = rows.find(({ fields }) => fields[0] === '060809' && fields[6] === 'σάρξ')!;
    expect(verse?.words[5]).toMatchObject({
      text: 'σαρκὶ', word: 'σαρκὶ', normalizedWord: 'σαρκί', lexicalLemma: 'σάρξ',
      pos: 'N-', morph: '----DSF-', lemma: '', strongs: '', language: 'grc',
      corpusId: manifest.corpusId, id: `${manifest.corpusId}/Rom.8.9/6`,
      sourceReference: '060809', sourceLine: source.sourceLine, ordinal: 6,
    });
    const lastVerse = Number(chapterRows.at(-1)!.fields[0].slice(4));
    expect(bible.getLastVerseOfChapter('Rom', 8)).toBe(lastVerse);
    expect(bible.getAdjacentVerse(`Rom.8.${lastVerse}`, 1)).toBe('Rom.9.1');
    expect(bible.getAdjacentVerse('Rom.9.1', -1)).toBe(`Rom.8.${lastVerse}`);
    const lastSource = rows.at(-1)!.fields[0];
    const last = { chapter: Number(lastSource.slice(2, 4)), verse: Number(lastSource.slice(4)) };
    expect(bible.getLastVerseOfBook('Rom')).toEqual(last);
    expect(bible.getAdjacentVerse(`Rom.${last.chapter}.${last.verse}`, 1)).toBeNull();
    expect(bible.getAdjacentVerse('Rom.1.1', -1)).toBeNull();
    expect(bible.getAdjacentVerse('Rom.8.9', 0.5)).toBeNull();
    expect(bible.getChapter('Rom', 99)).toEqual([]);
    expect(bible.getLastVerseOfChapter('Rom', 99)).toBeNull();
  });

  it('uses actual sorted source references across John edition omissions in both directions', async () => {
    const references = [...new Set(sourceRows('64-Jn-morphgnt.txt')
      .map(({ fields }) => `John.${Number(fields[0].slice(2, 4))}.${Number(fields[0].slice(4))}`))];
    expect(references[references.indexOf('John.7.52') + 1]).toBe('John.8.12');
    fetchMock.mockImplementation(assetResponse);
    await bible.loadBook('John');
    expect(bible.getAdjacentVerse('John.7.52', 1)).toBe('John.8.12');
    expect(bible.getAdjacentVerse('John.8.12', -1)).toBe('John.7.52');
    expect(bible.getVerse('John.8.1')).toBeNull();
    expect(bible.getChapter('John', 8)[0].osisID).toBe('John.8.12');
  });

  it.each(['Phlm', 'Philem', 'phm', ' PHILEMON '])('normalizes %s to canonical Phlm JSON', async alias => {
    fetchMock.mockImplementation(assetResponse);
    await bible.loadBook(alias);
    expect(bible.getVerse('Phlm.1.1')?.book).toBe('Phlm');
    expect(bible.getLastVerseOfBook('Phlm')).toEqual({ chapter: 1, verse: 25 });
    expect(fetchMock).toHaveBeenCalledWith(`/assets/nt/${entryFor('Phlm').file}`, { cache: 'force-cache' });
    await bible.loadBook('Phlm');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('coalesces NT loads and isolates default engines while supporting explicit injection', async () => {
    fetchMock.mockImplementation(assetResponse);
    await Promise.all([bible.loadBook('Matthew'), bible.loadBook('matt')]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const isolated = new BibleEngine();
    expect(isolated.getVerse('Matt.1.1')).toBeNull();
    expect(isolated.getChapter('Matt', 1)).toEqual([]);
    expect(isolated.getAdjacentVerse('Matt.1.1', 1)).toBeNull();
    expect(isolated.getLastVerseOfChapter('Matt', 1)).toBeNull();
    expect(isolated.getLastVerseOfBook('Matt')).toBeNull();
    await isolated.loadBook('Matt');
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(isolated.getVerse('Matt.1.1')?.words.map(word => word.id))
      .toEqual(bible.getVerse('Matt.1.1')?.words.map(word => word.id));
    const corpus = new NtCorpusService();
    const injected = new BibleEngine(corpus);
    await injected.loadBook('Phlm');
    expect(injected.getVerse('Phlm.1.1')).toBe(corpus.getVerse('Phlm.1.1'));
    expect(injected.getChapter('Phlm', 1)).toBe(corpus.getChapter('Phlm', 1));
  });

  it.each([
    ['missing manifest', () => jsonResponse('{}', 404)],
    ['schema mismatch', () => jsonResponse(JSON.stringify({ ...manifest, schemaVersion: 2 }))],
    ['missing schema', () => jsonResponse('{}')],
  ])('propagates %s and retries without NT XML fallback', async (_label, invalid) => {
    fetchMock.mockImplementation(assetResponse).mockImplementationOnce(async () => invalid());
    await expect(bible.loadBook('Matt')).rejects.toThrow('NT corpus:');
    expect(bible.getVerse('Matt.1.1')).toBeNull();
    await bible.loadBook('Matt');
    expect(bible.getVerse('Matt.1.1')).not.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls.every(([url]) => String(url).startsWith('/assets/nt/'))).toBe(true);
  });

  it('propagates shard hash failure and retries without publishing a partial book or XML fallback', async () => {
    fetchMock.mockImplementation(assetResponse)
      .mockImplementationOnce(async () => jsonResponse(manifestText))
      .mockImplementationOnce(async () => jsonResponse(`${bookText('Matt')} `));
    await expect(bible.loadBook('Matt')).rejects.toThrow('SHA-256');
    expect(bible.getVerse('Matt.1.1')).toBeNull();
    expect(bible.getChapter('Matt', 1)).toEqual([]);
    await bible.loadBook('Matt');
    expect(bible.getVerse('Matt.1.1')).not.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls.every(([url]) => String(url).startsWith('/assets/nt/'))).toBe(true);
  });
});

describe('failed loads are not silently cached', () => {
  it.each([
    ['HTML soft 404', '<html><body>Not found</body></html>'],
    ['DOCTYPE soft 404', '<!DOCTYPE html><html/>'],
    ['XML parsererror', '<osis><unclosed></osis>'],
  ])('allows retry after %s', async (_label, xml) => {
    fetchMock.mockResolvedValueOnce(xmlResponse(xml)).mockResolvedValueOnce(xmlResponse(genesis));
    await bible.loadBook('Gen');
    expect(bible.getVerse('Gen.1.1')).toBeNull();
    expect(console.error).toHaveBeenCalledWith('BibleEngine: Failed to load Gen', expect.any(Error));
    await bible.loadBook('Gen');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(bible.getVerse('Gen.1.1')?.words).toHaveLength(7);
  });

  it.each(['http', 'network'])('allows retry after %s fetch failure', async (failure) => {
    if (failure === 'http') {
      fetchMock.mockResolvedValueOnce({ ok: false, statusText: 'Not Found' });
    } else {
      fetchMock.mockRejectedValueOnce(new Error('synthetic network failure'));
    }
    fetchMock.mockResolvedValueOnce(xmlResponse(genesis));
    await bible.loadBook('Gen');
    expect(bible.getVerse('Gen.1.1')).toBeNull();
    expect(console.error).toHaveBeenCalledWith('BibleEngine: Failed to load Gen', expect.any(Error));
    await bible.loadBook('Gen');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(bible.getVerse('Gen.1.1')?.words).toHaveLength(7);
  });

  it('rejects an unknown load alias without fetching', async () => {
    await expect(bible.loadBook('test-unknown-book')).rejects.toThrow('Unknown book alias');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('reference parsing', () => {
  it.each([
    ['Jn 1:1', 'John.1.1'], ['1 John 2:3', '1John.2.3'],
    ['2 Cor 3.4', '2Cor.3.4'], ['Gen 2', 'Gen.2.1'], ['Jn 1 2', 'John.1.2'],
  ])('parses %s', (query, reference) => {
    expect(bible.parseReference(query)).toBe(reference);
  });

  it.each(['', 'not a reference', 'Jn 1:bad'])('current limitation: invalid syntax %j falls back unchanged, not validation', (query) => {
    expect(bible.parseReference(query)).toBe(query);
  });
});