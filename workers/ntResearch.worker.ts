import type { NtManifest, WordContextQuery, WordContextResult } from '../types';
import { ntCorpus } from '../services/NtCorpusService';
import { WordContextIndex } from '../services/WordContextIndex';

type ResearchRequest = { id: number } & (
  { type: 'search'; query: WordContextQuery } | { type: 'lemmas'; prefix: string }
);
type ResearchReply = { id: number; result: WordContextResult | string[] } | { id: number; error: string };

const scope = self as unknown as {
  onmessage: (event: MessageEvent<ResearchRequest>) => void;
  postMessage: (message: ResearchReply) => void;
};
let ready: Promise<{ manifest: NtManifest; index: WordContextIndex }> | null = null;
const loaded = new Set<string>();
const loading = new Map<string, Promise<void>>();

function initialize() {
  if (!ready) {
    ready = ntCorpus.getManifest().then(manifest => ({ manifest, index: new WordContextIndex(manifest) }))
      .catch(error => { ready = null; throw error; });
  }
  return ready;
}

async function loadScope(books: string[], manifest: NtManifest, index: WordContextIndex): Promise<void> {
  if (!Array.isArray(books) || books.length === 0) throw new Error('Select at least one NT book');
  const selected = [...new Set(books)];
  for (const book of selected) {
    if (!manifest.books.some(entry => entry.book === book)) throw new Error(`Unknown NT scope book: ${book}`);
  }
  await Promise.all(selected.map(book => {
    if (loaded.has(book)) return Promise.resolve();
    let pending = loading.get(book);
    if (!pending) {
      pending = ntCorpus.loadBook(book).then(data => {
        index.addBook(data);
        loaded.add(book);
      }).catch(error => {
        throw new Error(`Incomplete NT scope: could not load ${book}: ${error instanceof Error ? error.message : String(error)}`);
      }).finally(() => { loading.delete(book); });
      loading.set(book, pending);
    }
    return pending;
  }));
}

scope.onmessage = async ({ data }) => {
  try {
    if (data.type !== 'search' && data.type !== 'lemmas') throw new Error('Unknown NT research request');
    const { manifest, index } = await initialize();
    const books = data.type === 'search' ? data.query.books : manifest.books.map(entry => entry.book);
    await loadScope(books, manifest, index);
    const result = data.type === 'search' ? index.search(data.query) : index.lemmas(data.prefix);
    scope.postMessage({ id: data.id, result });
  } catch (error) {
    scope.postMessage({ id: data.id, error: `NT research incomplete: ${error instanceof Error ? error.message : String(error)}` });
  }
};