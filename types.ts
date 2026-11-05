
export interface VerseWord {
  text: string;      // The display word
  lemma: string;     // The root word ID/Lemma
  morph: string;     // The morphology code
  strongs: string;   // The Strong's number
  id: string;        // Unique ID for React keys
  lexicalLemma?: string;
  pos?: string;
  word?: string;
  normalizedWord?: string;
  language?: "grc" | "he" | "arc";
  corpusId?: string;
}

export interface ParsedVerse {
  osisID: string;
  words: VerseWord[];
  book: string;
  chapter: number;
  verse: number;
}

export interface CorpusToken extends VerseWord {
  lexicalLemma: string;
  pos: string;
  word: string;
  normalizedWord: string;
  language: "grc";
  corpusId: string;
  reference: string;
  book: string;
  chapter: number;
  verse: number;
  ordinal: number;
  sourceLine: number;
}

export interface NtBook {
  schemaVersion: 1;
  corpusId: string;
  book: string;
  tokens: CorpusToken[];
}

export interface NtManifest {
  schemaVersion: 1;
  corpusId: string;
  title: string;
  sourceRevision: string;
  sourceUrl: string;
  annotationSystem: "MorphGNT";
  notices: { label: string; url: string }[];
  coverageNotes: string[];
  books: { book: string; file: string; sha256: string; sourceSha256: string; tokenCount: number; verseCount: number }[];
}

export interface WordContextQuery {
  mode: "lemma" | "form";
  term: string;
  books: string[];
  companion?: string;
  direction: "before" | "after" | "either";
  distance: number;
  boundary: "chapter";
  page: number;
  scopePreset?: string;
  excludeCurrent?: boolean;
  selectedBooks?: string[];
}

export interface WordContextHit {
  target: CorpusToken;
  companions: string[];
  context: CorpusToken[];
}

export interface WordContextResult {
  corpusId: string;
  total: number;
  scopeTokens: number;
  page: number;
  hits: WordContextHit[];
}

export enum EngineStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  READY = 'READY',
  ERROR = 'ERROR'
}
