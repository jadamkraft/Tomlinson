import React from 'react';
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useWordResearch } from '../hooks/useWordResearch';
import WordResearchPanel from '../components/WordResearchPanel';
import type { CorpusToken, WordContextResult } from '../types';
import { NT_BOOK_ORDER } from '../services/WordContextIndex';

const service = vi.hoisted(() => ({ search: vi.fn(), getLemmas: vi.fn() }));
vi.mock('../services/WordContextService', () => ({ wordContext: service }));

const target: CorpusToken = {
  id: 'rom-target', text: 'σαρκὶ', word: 'σαρκὶ', normalizedWord: 'σαρκί',
  lexicalLemma: 'σάρξ', lemma: '', strongs: '', morph: '----DSF-', pos: 'N-',
  language: 'grc', corpusId: 'test-corpus', book: 'Rom', chapter: 8, verse: 9,
  reference: 'Rom.8.9', ordinal: 5, sourceLine: 10,
};
const companion: CorpusToken = { ...target, id: 'companion', text: 'ἐν', word: 'ἐν', lexicalLemma: 'ἐν', ordinal: 4, verse: 8, reference: 'Rom.8.8' };
const resultData = (patch: Partial<WordContextResult> = {}): WordContextResult => ({
  corpusId: 'test-corpus', total: 26, scopeTokens: 1000, page: 0,
  hits: [{ target, companions: [companion.id], context: [companion, target] }], ...patch,
});
function deferred<Value>() {
  let resolve!: (value: Value) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<Value>((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}
function Harness({ onOpen = vi.fn(), onClose = vi.fn() }: { onOpen?: (hit: WordContextResult['hits'][number]) => void; onClose?: () => void }) {
  const research = useWordResearch();
  return <>
    <button onClick={() => research.start(target, 'Rom')}>Research word</button>
    {research.query && <WordResearchPanel research={research} book="Rom" onOpen={onOpen} onClose={onClose} />}
  </>;
}
beforeEach(() => {
  vi.resetAllMocks();
  service.search.mockResolvedValue(resultData());
  service.getLemmas.mockResolvedValue(['ἀγάπη']);
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('word research lifecycle', () => {
  it('starts only explicitly with the lexical lemma and specified defaults', async () => {
    const { result } = renderHook(() => useWordResearch());
    expect(result.current.status).toBe('idle');
    expect(service.search).not.toHaveBeenCalled();
    act(() => result.current.start(target, 'Rom'));
    expect(result.current.query).toEqual({ mode: 'lemma', term: 'σάρξ', books: ['Rom'], boundary: 'chapter', distance: 5, direction: 'either', page: 0, companion: undefined });
    expect(result.current.target).toEqual(target);
    expect(result.current.target).not.toBe(target);
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(service.getLemmas).not.toHaveBeenCalled();
  });

  it('drops stale success and failure and clears old results immediately', async () => {
    const older = deferred<WordContextResult>();
    const newer = deferred<WordContextResult>();
    const latest = deferred<WordContextResult>();
    service.search.mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise).mockReturnValueOnce(latest.promise);
    const { result } = renderHook(() => useWordResearch());
    act(() => result.current.start(target, 'Rom'));
    act(() => result.current.update({ distance: 2 }));
    await act(async () => newer.resolve(resultData({ total: 2 })));
    expect(result.current.result?.total).toBe(2);
    await act(async () => older.reject(new Error('Old failure')));
    expect(result.current.status).toBe('ready');
    act(() => result.current.update({ distance: 3 }));
    expect(result.current.result).toBeNull();
    expect(result.current.status).toBe('loading');
    await act(async () => latest.resolve(resultData({ total: 3 })));
    expect(result.current.result?.total).toBe(3);
  });

  it('ignores a previous origin result after a new start', async () => {
    const older = deferred<WordContextResult>();
    service.search.mockReturnValueOnce(older.promise);
    const { result } = renderHook(() => useWordResearch());
    act(() => result.current.start(target, 'Rom'));
    act(() => result.current.start({ ...target, lexicalLemma: 'πνεῦμα' }, 'John'));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    await act(async () => older.resolve(resultData({ total: 99 })));
    expect(result.current.result?.total).toBe(26);
    expect(result.current.query.term).toBe('πνεῦμα');
  });

  it('retries errors, rejects corpus mismatches, and keeps no failed result', async () => {
    service.search.mockRejectedValueOnce(new Error('Worker unavailable')).mockResolvedValueOnce(resultData({ corpusId: 'different' })).mockResolvedValueOnce(resultData());
    const { result } = renderHook(() => useWordResearch());
    act(() => result.current.start(target, 'Rom'));
    await waitFor(() => expect(result.current.error).toBe('Worker unavailable'));
    act(() => result.current.retry());
    expect(result.current.error).toBeNull();
    await waitFor(() => expect(result.current.error).toMatch(/corpus version/));
    expect(result.current.result).toBeNull();
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(service.search).toHaveBeenCalledTimes(3);
  });

  it('resets pages on filters, preserves explicit pages, and derives mode terms from origin', async () => {
    const { result } = renderHook(() => useWordResearch());
    act(() => result.current.start(target, 'Rom'));
    act(() => result.current.update({ page: 3 }));
    expect(result.current.query.page).toBe(3);
    act(() => result.current.update({ books: ['John'] }));
    expect(result.current.query.page).toBe(0);
    expect(result.current.query.term).toBe('σάρξ');
    act(() => result.current.update({ mode: 'form', term: 'wrong', page: 2 }));
    expect(result.current.query).toMatchObject({ mode: 'form', term: 'σαρκὶ', page: 2 });
    act(() => result.current.update({ mode: 'lemma' }));
    expect(result.current.query.term).toBe('σάρξ');
    await waitFor(() => expect(result.current.status).toBe('ready'));
  });

  it('settles outstanding requests after unmount without publishing', async () => {
    const pending = deferred<WordContextResult>();
    service.search.mockReturnValueOnce(pending.promise);
    const { result, unmount } = renderHook(() => useWordResearch());
    act(() => result.current.start(target, 'Rom'));
    unmount();
    await act(async () => pending.resolve(resultData()));
    expect(result.current.result).toBeNull();
  });
});

describe('word research panel', () => {
  it('restores scope and exclusion controls when reopening a research panel', async () => {
    function ReopenHarness() {
      const research = useWordResearch();
      const [open, setOpen] = React.useState(true);
      return <>
        <button onClick={() => research.start(target, 'Rom')}>Start</button>
        <button onClick={() => setOpen(value => !value)}>Toggle panel</button>
        {open && research.query && <WordResearchPanel research={research} book="Rom" onOpen={vi.fn()} onClose={vi.fn()} />}
      </>;
    }
    render(<ReopenHarness />);
    fireEvent.click(screen.getByText('Start'));
    await screen.findByText(/26 occurrences/);
    fireEvent.change(screen.getByLabelText('Scope'), { target: { value: 'paul7' } });
    fireEvent.click(screen.getByLabelText('Exclude current book'));
    fireEvent.click(screen.getByText('Toggle panel'));
    fireEvent.click(screen.getByText('Toggle panel'));
    expect((screen.getByLabelText('Scope') as HTMLSelectElement).value).toBe('paul7');
    expect((screen.getByLabelText('Exclude current book') as HTMLInputElement).checked).toBe(true);
    fireEvent.click(screen.getByLabelText('Exclude current book'));
    expect(service.search.mock.lastCall[0].books).toContain('Rom');
    await waitFor(() => expect(screen.queryByText('Searching...')).toBeNull());
  });
  it('focuses Back, preserves Greek and cross-verse references, and opens an exact hit', async () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const { container } = render(<Harness onOpen={onOpen} onClose={onClose} />);
    fireEvent.click(screen.getByText('Research word'));
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Back' }));
    const hit = await screen.findByRole('button', { name: 'Open Rom 8:9' });
    expect(hit.textContent).toContain('Rom 8:8');
    expect(hit.textContent).toContain('σαρκὶ');
    expect(container.querySelectorAll('mark')).toHaveLength(2);
    expect(container.querySelector('[lang="grc"][title="Source: test-corpus"]')).toBeTruthy();
    expect(screen.getByText('26 occurrences · 1000 scope tokens')).toBeTruthy();
    fireEvent.click(hit);
    expect(onOpen).toHaveBeenCalledWith(resultData().hits[0]);
    expect(service.search).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(service.getLemmas).not.toHaveBeenCalled();
  });

  it('uses origin forms and explicit scopes including other NT and selected books', async () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('Research word'));
    await screen.findByRole('button', { name: 'Open Rom 8:9' });
    fireEvent.click(screen.getByRole('button', { name: 'Form' }));
    expect(service.search.mock.lastCall[0]).toMatchObject({ mode: 'form', term: 'σαρκὶ' });
    fireEvent.click(screen.getByRole('button', { name: 'Lemma' }));
    expect(service.search.mock.lastCall[0].term).toBe('σάρξ');
    fireEvent.change(screen.getByLabelText('Scope'), { target: { value: 'paul7' } });
    expect(service.search.mock.lastCall[0].books).toEqual(['Rom', '1Cor', '2Cor', 'Gal', 'Phil', '1Thess', 'Phlm']);
    expect(screen.getByText(/not an adjudication of authorship/)).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Exclude current book'));
    expect(service.search.mock.lastCall[0].books).not.toContain('Rom');
    fireEvent.change(screen.getByLabelText('Scope'), { target: { value: 'other' } });
    expect(service.search.mock.lastCall[0].books).toContain('Heb');
    expect(service.search.mock.lastCall[0].books).not.toContain('Eph');
    fireEvent.click(screen.getByLabelText('Exclude current book'));
    fireEvent.change(screen.getByLabelText('Scope'), { target: { value: 'all' } });
    expect(service.search.mock.lastCall[0].books).toEqual(NT_BOOK_ORDER);
    fireEvent.change(screen.getByLabelText('Scope'), { target: { value: 'selected' } });
    expect(screen.getAllByRole('checkbox')).toHaveLength(28);
    fireEvent.click(screen.getByLabelText('Philemon'));
    expect(service.search.mock.lastCall[0].books).not.toContain('Phlm');
    await waitFor(() => expect(screen.queryByText('Searching...')).toBeNull());
  });

  it('updates companion, direction, distance and pagination without stale totals', async () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('Research word'));
    await screen.findByText('26 occurrences · 1000 scope tokens');
    expect((screen.getByRole('button', { name: 'Previous results' }) as HTMLButtonElement).disabled).toBe(true);
    const next = deferred<WordContextResult>();
    service.search.mockReturnValueOnce(next.promise);
    fireEvent.click(screen.getByRole('button', { name: 'Next results' }));
    expect(service.search.mock.lastCall[0].page).toBe(1);
    expect(screen.queryByText(/26 occurrences/)).toBeNull();
    expect(screen.getByRole('status').textContent).toBe('Searching...');
    await act(async () => next.resolve(resultData({ page: 1 })));
    expect((screen.getByRole('button', { name: 'Next results' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Previous results' }));
    expect(service.search.mock.lastCall[0].page).toBe(0);
    fireEvent.change(screen.getByLabelText('Companion lemma'), { target: { value: 'ἐν' } });
    expect(service.search.mock.lastCall[0].companion).toBe('ἐν');
    fireEvent.change(screen.getByLabelText('Direction'), { target: { value: 'before' } });
    fireEvent.change(screen.getByLabelText('Distance (tokens)'), { target: { value: '10' } });
    expect(service.search.mock.lastCall[0]).toMatchObject({ direction: 'before', distance: 10, page: 0 });
    const calls = service.search.mock.calls.length;
    fireEvent.change(screen.getByLabelText('Distance (tokens)'), { target: { value: '11' } });
    expect(service.search).toHaveBeenCalledTimes(calls);
    fireEvent.change(screen.getByLabelText('Companion lemma'), { target: { value: '' } });
    expect(service.search.mock.lastCall[0].companion).toBeUndefined();
    await waitFor(() => expect(screen.queryByText('Searching...')).toBeNull());
  });

  it('shows failure, Retry and complete-scope empty counts', async () => {
    service.search.mockRejectedValueOnce(new Error('Search failed')).mockResolvedValueOnce(resultData({ total: 0, scopeTokens: 0, hits: [] }));
    render(<Harness />);
    fireEvent.click(screen.getByText('Research word'));
    expect((await screen.findByRole('alert')).textContent).toContain('Search failed');
    expect(screen.queryByText(/occurrences ·/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await screen.findByText('0 occurrences · 0 scope tokens');
    expect(screen.getByText('No occurrences in the complete selected scope.')).toBeTruthy();
    expect(screen.queryByText(/undefined/)).toBeNull();
  });

  it('loads lemmas only after typing, debounces, drops stale replies, and verifies companions', async () => {
    vi.useFakeTimers();
    render(<Harness />);
    fireEvent.click(screen.getByText('Research word'));
    await act(async () => {});
    fireEvent.click(screen.getByText('Additional companion lemma'));
    expect(service.getLemmas).not.toHaveBeenCalled();
    const old = deferred<string[]>();
    service.getLemmas.mockReturnValueOnce(old.promise);
    const input = screen.getByLabelText('Find companion lemma');
    fireEvent.change(input, { target: { value: 'ἀ' } });
    await act(async () => vi.advanceTimersByTime(299));
    expect(service.getLemmas).not.toHaveBeenCalled();
    await act(async () => vi.advanceTimersByTime(1));
    fireEvent.change(input, { target: { value: 'ἀγάπη' } });
    await act(async () => vi.advanceTimersByTime(300));
    await act(async () => old.resolve(['ἀδικία']));
    expect(screen.queryByRole('option', { name: 'ἀδικία' })).toBeNull();
    expect(service.getLemmas).toHaveBeenLastCalledWith('ἀγάπη');
    fireEvent.click(screen.getByRole('button', { name: 'Use companion lemma' }));
    expect(service.search.mock.lastCall[0].companion).toBe('ἀγάπη');
    fireEvent.change(input, { target: { value: 'not-a-lemma' } });
    service.getLemmas.mockResolvedValueOnce([]);
    await act(async () => vi.advanceTimersByTime(300));
    const calls = service.search.mock.calls.length;
    fireEvent.click(screen.getByRole('button', { name: 'Use companion lemma' }));
    expect(screen.getByRole('alert').textContent).toContain('verified suggestions');
    expect(service.search).toHaveBeenCalledTimes(calls);
    await act(async () => {});
  });
});