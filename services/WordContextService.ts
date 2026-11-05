import type { WordContextQuery, WordContextResult } from '../types';

type PendingRequest = { resolve: (value: unknown) => void; reject: (error: Error) => void };
type WorkerReply = { id: number; result?: WordContextResult | string[]; error?: string };

export class WordContextService {
  private worker: Worker | null = null;
  private nextId = 0;
  private pending = new Map<number, PendingRequest>();

  constructor(private readonly workerFactory: () => Worker = () => new Worker(
    new URL('../workers/ntResearch.worker.ts', import.meta.url), { type: 'module' },
  )) {}

  private fail(error: Error): void {
    const worker = this.worker;
    this.worker = null;
    if (worker) {
      worker.onmessage = null;
      worker.onerror = null;
      worker.onmessageerror = null;
      worker.terminate();
    }
    for (const request of this.pending.values()) request.reject(error);
    this.pending.clear();
  }

  private getWorker(): Worker {
    if (this.worker) return this.worker;
    const worker = this.workerFactory();
    this.worker = worker;
    worker.onmessage = (event: MessageEvent<WorkerReply>) => {
      if (this.worker !== worker) return;
      const request = this.pending.get(event.data.id);
      if (!request) return;
      this.pending.delete(event.data.id);
      if (event.data.error !== undefined) request.reject(new Error(event.data.error));
      else request.resolve(event.data.result);
    };
    worker.onerror = event => {
      event.preventDefault();
      if (this.worker === worker) this.fail(new Error(event.message || 'NT research worker failed'));
    };
    worker.onmessageerror = () => {
      if (this.worker === worker) this.fail(new Error('NT research worker response could not be decoded'));
    };
    return worker;
  }

  private request<Result>(message: { type: 'search'; query: WordContextQuery } | { type: 'lemmas'; prefix: string }): Promise<Result> {
    return new Promise((resolve, reject) => {
      try {
        const worker = this.getWorker();
        const id = ++this.nextId;
        this.pending.set(id, { resolve: value => resolve(value as Result), reject });
        worker.postMessage({ id, ...message });
      } catch (error) {
        const failure = error instanceof Error ? error : new Error(String(error));
        this.fail(failure);
        reject(failure);
      }
    });
  }

  search(query: WordContextQuery): Promise<WordContextResult> {
    return this.request({ type: 'search', query });
  }

  getLemmas(prefix = ''): Promise<string[]> {
    return this.request({ type: 'lemmas', prefix });
  }

  terminate(): void {
    this.fail(new Error('NT research requests cancelled: worker terminated'));
  }

  dispose(): void {
    this.terminate();
  }
}

export const wordContext = new WordContextService();