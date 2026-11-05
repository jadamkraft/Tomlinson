import type { CorpusToken, NtBook, NtManifest, ParsedVerse } from '../types';

const BOOKS = ['Matt', 'Mark', 'Luke', 'John', 'Acts', 'Rom', '1Cor', '2Cor', 'Gal', 'Eph', 'Phil', 'Col', '1Thess', '2Thess', '1Tim', '2Tim', 'Titus', 'Phlm', 'Heb', 'Jas', '1Pet', '2Pet', '1John', '2John', '3John', 'Jude', 'Rev'];
const HASH = /^[a-f0-9]{64}$/;
const CORPUS = /^morphgnt-sblgnt-[a-f0-9]{32}$/;
const POS = /^(A-|C-|D-|I-|N-|P-|RA|RD|RI|RP|RR|V-|X-)$/;
const MORPH = /^[123-][PIFAXY-][AMP-][IDSONP-][NGDAV-][SP-][MFN-][CS-]$/;
const REVISION = 'aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d';

function requireValid(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`NT corpus: ${message}`);
}

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function nonempty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function positive(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

function httpsUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; } catch { return false; }
}

function validateManifest(value: unknown): asserts value is NtManifest {
  requireValid(record(value), 'invalid manifest object');
  requireValid(value.schemaVersion === 1 && typeof value.corpusId === 'string' && CORPUS.test(value.corpusId), 'manifest schema/version mismatch');
  requireValid(nonempty(value.title) && value.annotationSystem === 'MorphGNT' && value.sourceRevision === REVISION && value.sourceUrl === `https://github.com/morphgnt/sblgnt/tree/${REVISION}`, 'source snapshot mismatch');
  requireValid(Array.isArray(value.notices) && value.notices.length >= 4 && value.notices.every(notice => record(notice) && nonempty(notice.label) && httpsUrl(notice.url)), 'invalid attribution notices');
  requireValid(Array.isArray(value.coverageNotes) && value.coverageNotes.length > 0 && value.coverageNotes.every(nonempty), 'missing coverage notes');
  requireValid(Array.isArray(value.books) && value.books.length === BOOKS.length, 'manifest must contain 27 canonical books');
  value.books.forEach((entry, index) => {
    requireValid(record(entry) && entry.book === BOOKS[index], 'invalid manifest book/order');
    requireValid(typeof entry.sha256 === 'string' && HASH.test(entry.sha256) && typeof entry.sourceSha256 === 'string' && HASH.test(entry.sourceSha256), 'invalid manifest hash');
    requireValid(entry.file === `${entry.book}.${entry.sha256}.json`, 'unsafe or mismatched book filename');
    requireValid(positive(entry.tokenCount) && positive(entry.verseCount) && entry.verseCount <= entry.tokenCount, 'invalid manifest counts');
  });
}

interface BookIndex {
  book: NtBook;
  verses: Map<string, ParsedVerse>;
  chapters: Map<number, ParsedVerse[]>;
  references: string[];
  positions: Map<string, number>;
  last: { chapter: number; verse: number };
}

function indexBook(value: unknown, manifest: NtManifest, entry: NtManifest['books'][number]): BookIndex {
  requireValid(record(value) && value.schemaVersion === 1 && value.corpusId === manifest.corpusId && value.book === entry.book, 'book schema/version/identity mismatch');
  requireValid(Array.isArray(value.tokens) && value.tokens.length === entry.tokenCount, 'book token count mismatch');
  const verses = new Map<string, ParsedVerse>();
  const chapters = new Map<number, ParsedVerse[]>();
  const references: string[] = [];
  const positions = new Map<string, number>();
  let previousChapter = 0;
  let previousVerse = 0;
  let ordinal = 0;
  const bookNumber = String(BOOKS.indexOf(entry.book) + 1).padStart(2, '0');
  value.tokens.forEach((token, index) => {
    requireValid(record(token), 'invalid token object');
    requireValid(token.book === entry.book && token.corpusId === manifest.corpusId && token.language === 'grc', 'token identity mismatch');
    requireValid(positive(token.chapter) && token.chapter <= 99 && positive(token.verse) && token.verse <= 99 && positive(token.ordinal) && token.sourceLine === index + 1, 'invalid numeric token provenance');
    const chapter = token.chapter;
    const verse = token.verse;
    requireValid(chapter > previousChapter || (chapter === previousChapter && verse >= previousVerse), 'unordered token reference');
    const sameVerse = chapter === previousChapter && verse === previousVerse;
    ordinal = sameVerse ? ordinal + 1 : 1;
    const reference = `${entry.book}.${chapter}.${verse}`;
    requireValid(token.reference === reference && token.ordinal === ordinal && token.id === `${manifest.corpusId}/${reference}/${ordinal}`, 'invalid token reference/ordinal/ID');
    requireValid(token.sourceReference === `${bookNumber}${String(chapter).padStart(2, '0')}${String(verse).padStart(2, '0')}`, 'invalid raw source reference');
    requireValid(['text', 'word', 'normalizedWord', 'lexicalLemma'].every(field => nonempty(token[field]) && !/\s/u.test(token[field] as string)), 'invalid source word fields');
    requireValid(typeof token.pos === 'string' && POS.test(token.pos) && typeof token.morph === 'string' && MORPH.test(token.morph) && token.lemma === '' && token.strongs === '', 'invalid annotations/legacy linkage');
    if (!sameVerse) {
      const parsed: ParsedVerse = { osisID: reference, book: entry.book, chapter, verse, words: [] };
      verses.set(reference, parsed);
      if (!chapters.has(chapter)) chapters.set(chapter, []);
      chapters.get(chapter)!.push(parsed);
      positions.set(reference, references.length);
      references.push(reference);
    }
    verses.get(reference)!.words.push(token as unknown as CorpusToken);
    Object.freeze(token);
    previousChapter = chapter;
    previousVerse = verse;
  });
  requireValid(verses.size === entry.verseCount, 'book verse count mismatch');
  for (const parsed of verses.values()) { Object.freeze(parsed.words); Object.freeze(parsed); }
  for (const chapter of chapters.values()) Object.freeze(chapter);
  Object.freeze(value.tokens);
  Object.freeze(value);
  return { book: value as unknown as NtBook, verses, chapters, references, positions, last: { chapter: previousChapter, verse: previousVerse } };
}

export class NtCorpusService {
  private manifestPromise: Promise<NtManifest> | null = null;
  private readonly pendingBooks = new Map<string, Promise<NtBook>>();
  private readonly loaded = new Map<string, BookIndex>();

  constructor(private readonly fetcher?: typeof fetch) {}

  private async request(file: string, cache: RequestCache): Promise<Uint8Array> {
    const response = await (this.fetcher ?? globalThis.fetch)(`/assets/nt/${file}`, { cache });
    requireValid(response.ok, `HTTP ${response.status} loading ${file}`);
    const contentType = response.headers.get('content-type');
    requireValid(!contentType || /^application\/(?:[\w.+-]*\+)?json(?:\s*;|$)/i.test(contentType), 'non-JSON HTTP response');
    return new Uint8Array(await response.arrayBuffer());
  }

  private decode(bytes: Uint8Array): unknown {
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  }

  getManifest(): Promise<NtManifest> {
    if (!this.manifestPromise) {
      this.manifestPromise = this.request('manifest.json', 'no-cache').then(bytes => {
        const manifest = this.decode(bytes);
        validateManifest(manifest);
        manifest.books.forEach(Object.freeze);
        manifest.notices.forEach(Object.freeze);
        Object.freeze(manifest.books);
        Object.freeze(manifest.notices);
        Object.freeze(manifest.coverageNotes);
        return Object.freeze(manifest);
      }).catch(error => { this.manifestPromise = null; throw error; });
    }
    return this.manifestPromise;
  }

  loadBook(book: string): Promise<NtBook> {
    if (!BOOKS.includes(book)) return Promise.reject(new Error(`NT corpus: unknown book ${book}`));
    const cached = this.loaded.get(book);
    if (cached) return Promise.resolve(cached.book);
    const pending = this.pendingBooks.get(book);
    if (pending) return pending;
    const promise = this.getManifest().then(async manifest => {
      const entry = manifest.books.find(candidate => candidate.book === book)!;
      const bytes = await this.request(entry.file, 'force-cache');
      const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes as Uint8Array<ArrayBuffer>);
      const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
      requireValid(hash === entry.sha256, 'book SHA-256 mismatch');
      const indexed = indexBook(this.decode(bytes), manifest, entry);
      this.loaded.set(book, indexed);
      return indexed.book;
    }).finally(() => { this.pendingBooks.delete(book); });
    this.pendingBooks.set(book, promise);
    return promise;
  }

  getBook(book: string): NtBook | null { return this.loaded.get(book)?.book ?? null; }

  getVerse(reference: string): ParsedVerse | null {
    return this.loaded.get(reference.split('.')[0])?.verses.get(reference) ?? null;
  }

  getChapter(book: string, chapter: number): ParsedVerse[] {
    return this.loaded.get(book)?.chapters.get(chapter) ?? [];
  }

  getAdjacentVerse(reference: string, offset: number): string | null {
    if (!Number.isSafeInteger(offset)) return null;
    const indexed = this.loaded.get(reference.split('.')[0]);
    const position = indexed?.positions.get(reference);
    return position === undefined ? null : indexed!.references[position + offset] ?? null;
  }

  getLastVerseOfChapter(book: string, chapter: number): number | null {
    return this.loaded.get(book)?.chapters.get(chapter)?.at(-1)?.verse ?? null;
  }

  getLastVerseOfBook(book: string): { chapter: number; verse: number } | null {
    const last = this.loaded.get(book)?.last;
    return last ? { ...last } : null;
  }
}

export const ntCorpus = new NtCorpusService();