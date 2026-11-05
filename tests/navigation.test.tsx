import { cleanup, renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useBibleNavigation } from '../hooks/useBibleNavigation';
import { engine } from '../services/BibleEngine';

beforeEach(() => {
  cleanup();
  vi.spyOn(engine, 'getAdjacentVerse').mockReturnValue(null);
  vi.spyOn(engine, 'getLastVerseOfBook').mockReturnValue(null);
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.stubGlobal('fetch', vi.fn(() => { throw new Error('Navigation must not fetch'); }));
});

afterEach(() => {
  cleanup();
  expect(fetch).not.toHaveBeenCalled();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('navigation hook boundaries and engine delegation', () => {
  it('cannot move before Genesis 1:1', () => {
    const { result } = renderHook(() => useBibleNavigation({ book: 'Gen', chapter: 1, verse: 1 }));
    expect(result.current.goToPrevVerse()).toBeNull();
    expect(result.current.canGoPrev()).toBe(false);
    expect(engine.getAdjacentVerse).toHaveBeenCalledWith('Gen.1.1', -1);
    expect(engine.getLastVerseOfBook).not.toHaveBeenCalled();
  });

  it('cannot move beyond the last verse of Revelation', () => {
    const { result } = renderHook(() => useBibleNavigation({ book: 'Rev', chapter: 22, verse: 21 }));
    expect(result.current.goToNextVerse()).toBeNull();
    expect(result.current.canGoNext()).toBe(false);
    expect(engine.getAdjacentVerse).toHaveBeenCalledWith('Rev.22.21', 1);
  });

  it('uses engine-provided adjacent references in both directions', () => {
    vi.mocked(engine.getAdjacentVerse).mockImplementation((_reference, offset) =>
      offset === 1 ? 'Matt.2.1' : 'Matt.1.24');
    const { result } = renderHook(() => useBibleNavigation({ book: 'Matt', chapter: 1, verse: 25 }));
    expect(result.current.goToNextVerse()).toEqual({ book: 'Matt', chapter: 2, verse: 1 });
    expect(result.current.goToPrevVerse()).toEqual({ book: 'Matt', chapter: 1, verse: 24 });
    expect(result.current.canGoNext()).toBe(true);
    expect(result.current.canGoPrev()).toBe(true);
    expect(engine.getAdjacentVerse).toHaveBeenCalledWith('Matt.1.25', 1);
    expect(engine.getAdjacentVerse).toHaveBeenCalledWith('Matt.1.25', -1);
    expect(engine.getLastVerseOfBook).not.toHaveBeenCalled();
  });

  it('moves from the end of Genesis to Exodus 1:1', () => {
    const { result } = renderHook(() => useBibleNavigation({ book: 'Gen', chapter: 50, verse: 26 }));
    expect(result.current.goToNextVerse()).toEqual({ book: 'Exod', chapter: 1, verse: 1 });
    expect(result.current.canGoNext()).toBe(true);
  });

  it('uses the actual last verse of the loaded previous book', () => {
    vi.mocked(engine.getLastVerseOfBook).mockReturnValue({ chapter: 50, verse: 26 });
    const { result } = renderHook(() => useBibleNavigation({ book: 'Exod', chapter: 1, verse: 1 }));
    expect(result.current.goToPrevVerse()).toEqual({ book: 'Gen', chapter: 50, verse: 26 });
    expect(engine.getLastVerseOfBook).toHaveBeenCalledWith('Gen');
  });

  it('falls back to the last chapter, verse 1 of an unloaded previous book', () => {
    const { result } = renderHook(() => useBibleNavigation({ book: 'Exod', chapter: 1, verse: 1 }));
    expect(result.current.goToPrevVerse()).toEqual({ book: 'Gen', chapter: 50, verse: 1 });
    expect(result.current.canGoPrev()).toBe(true);
    expect(engine.getLastVerseOfBook).toHaveBeenCalledWith('Gen');
  });

  it('keeps Phlm in canonical book transitions', () => {
    const { result, rerender } = renderHook((reference) => useBibleNavigation(reference), {
      initialProps: { book: 'Titus', chapter: 3, verse: 15 },
    });
    expect(result.current.goToNextVerse()).toEqual({ book: 'Phlm', chapter: 1, verse: 1 });
    rerender({ book: 'Heb', chapter: 1, verse: 1 });
    expect(result.current.goToPrevVerse()).toEqual({ book: 'Phlm', chapter: 1, verse: 1 });
    expect(engine.getLastVerseOfBook).toHaveBeenCalledWith('Phlm');
  });
});