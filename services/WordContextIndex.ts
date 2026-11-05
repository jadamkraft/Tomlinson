import type { CorpusToken, NtBook, NtManifest, WordContextQuery, WordContextResult } from '../types';

export const NT_BOOK_ORDER = [
  'Matt', 'Mark', 'Luke', 'John', 'Acts', 'Rom', '1Cor', '2Cor', 'Gal', 'Eph',
  'Phil', 'Col', '1Thess', '2Thess', '1Tim', '2Tim', 'Titus', 'Phlm', 'Heb',
  'Jas', '1Pet', '2Pet', '1John', '2John', '3John', 'Jude', 'Rev',
];

type IndexedBook = {
  tokens: CorpusToken[];
  lemma: Map<string, number[]>;
  form: Map<string, number[]>;
  bounds: { start: number; end: number }[];
};

const nfc = (value: string) => value.normalize('NFC');

function lowerBound(values: number[], minimum: number): number {
  let left = 0;
  let right = values.length;
  while (left < right) {
    const middle = Math.floor((left + right) / 2);
    if (values[middle] < minimum) left = middle + 1;
    else right = middle;
  }
  return left;
}

export class WordContextIndex {
  private books = new Map<string, IndexedBook>();
  private corpusId = '';
  private order: string[];

  constructor(manifest?: NtManifest) {
    this.corpusId = manifest?.corpusId ?? '';
    this.order = manifest ? manifest.books.map(entry => entry.book) : [...NT_BOOK_ORDER];
  }

  addBook(book: NtBook): void {
    if (!NT_BOOK_ORDER.includes(book.book) || !this.order.includes(book.book)) {
      throw new Error(`Unknown NT book: ${book.book}`);
    }
    if (!book.corpusId || (this.corpusId && book.corpusId !== this.corpusId)) {
      throw new Error('Cannot mix corpusId values');
    }
    const ids = new Set<string>();
    let previousChapter = 0;
    for (const token of book.tokens) {
      if (token.corpusId !== book.corpusId || token.book !== book.book) {
        throw new Error('Token corpusId/book does not match its book');
      }
      if (!Number.isInteger(token.chapter) || token.chapter < 1 || token.chapter < previousChapter || ids.has(token.id)) {
        throw new Error('Book requires ordered chapters and unique token IDs');
      }
      ids.add(token.id);
      previousChapter = token.chapter;
    }
    const indexed: IndexedBook = { tokens: book.tokens.slice(), lemma: new Map(), form: new Map(), bounds: [] };
    let start = 0;
    while (start < indexed.tokens.length) {
      let end = start + 1;
      while (end < indexed.tokens.length && indexed.tokens[end].chapter === indexed.tokens[start].chapter) end++;
      const bounds = { start, end };
      for (let position = start; position < end; position++) {
        const token = indexed.tokens[position];
        indexed.bounds.push(bounds);
        for (const [postings, key] of [[indexed.lemma, nfc(token.lexicalLemma)], [indexed.form, nfc(token.word)]] as const) {
          const positions = postings.get(key);
          if (positions) positions.push(position);
          else postings.set(key, [position]);
        }
      }
      start = end;
    }
    this.corpusId = book.corpusId;
    this.books.set(book.book, indexed);
  }

  lemmas(prefix = ''): string[] {
    const normalized = nfc(prefix);
    const matches = new Set<string>();
    for (const book of this.books.values()) {
      for (const lemma of book.lemma.keys()) {
        if (lemma.startsWith(normalized)) matches.add(lemma);
      }
    }
    const sorted = [...matches].sort();
    const common = ['ἐν', 'πνεῦμα', 'Χριστός'].filter(lemma => matches.has(lemma));
    return [...new Set([...common, ...sorted.slice(0, 100 - common.length)])].sort();
  }

  search(query: WordContextQuery): WordContextResult {
    if (!query || !['lemma', 'form'].includes(query.mode) || typeof query.term !== 'string' || !query.term.trim()) {
      throw new Error('A nonempty exact lemma or form is required');
    }
    if (query.boundary !== 'chapter' || !['before', 'after', 'either'].includes(query.direction)) {
      throw new Error('Search requires chapter boundary and a valid direction');
    }
    if (!Number.isInteger(query.distance) || query.distance < 1 || query.distance > 10) {
      throw new Error('Distance must be an integer from 1 to 10');
    }
    if (!Number.isSafeInteger(query.page) || query.page < 0) throw new Error('Page must be a nonnegative integer');
    if (!Array.isArray(query.books) || query.books.length === 0) throw new Error('Select at least one loaded NT book');
    const selected = new Set(query.books);
    for (const book of selected) {
      if (!this.order.includes(book) || !this.books.has(book)) throw new Error(`NT scope is incomplete: ${book} is not loaded`);
    }
    if (query.companion !== undefined && (typeof query.companion !== 'string' || !query.companion.trim())) {
      throw new Error('Companion must be a nonempty exact source lemma');
    }
    const term = nfc(query.term);
    const companion = query.companion === undefined ? undefined : nfc(query.companion);
    const result: WordContextResult = { corpusId: this.corpusId, total: 0, scopeTokens: 0, page: query.page, hits: [] };
    for (const bookId of this.order) {
      if (!selected.has(bookId)) continue;
      const book = this.books.get(bookId)!;
      result.scopeTokens += book.tokens.length;
      const partners = companion === undefined ? [] : book.lemma.get(companion) ?? [];
      for (const position of book[query.mode === 'lemma' ? 'lemma' : 'form'].get(term) ?? []) {
        const bounds = book.bounds[position];
        const minimum = Math.max(bounds.start, position - (query.direction === 'after' ? 0 : query.distance));
        const maximum = Math.min(bounds.end - 1, position + (query.direction === 'before' ? 0 : query.distance));
        const companions: string[] = [];
        if (companion !== undefined) {
          for (let offset = lowerBound(partners, minimum); offset < partners.length && partners[offset] <= maximum; offset++) {
            if (partners[offset] !== position) companions.push(book.tokens[partners[offset]].id);
          }
          if (companions.length === 0) continue;
        }
        const match = result.total++;
        if (Math.floor(match / 25) !== query.page) continue;
        result.hits.push({
          target: book.tokens[position],
          companions,
          context: book.tokens.slice(Math.max(bounds.start, position - 8), Math.min(bounds.end, position + 9)),
        });
      }
    }
    return result;
  }
}