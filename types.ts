
export interface VerseWord {
  text: string;      // The display word
  lemma: string;     // The root word ID/Lemma
  morph: string;     // The morphology code
  strongs: string;   // The Strong's number
  id: string;        // Unique ID for React keys
}

export interface ParsedVerse {
  osisID: string;
  words: VerseWord[];
  book: string;
  chapter: number;
  verse: number;
}

export enum EngineStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  READY = 'READY',
  ERROR = 'ERROR'
}
