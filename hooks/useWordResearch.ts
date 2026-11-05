import { useEffect, useRef, useState } from 'react';
import type { VerseWord, WordContextQuery, WordContextResult } from '../types';
import { wordContext } from '../services/WordContextService';

type ResearchState = {
  query: WordContextQuery | null;
  target: VerseWord | null;
  result: WordContextResult | null;
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
  attempt: number;
};

export function useWordResearch() {
  const [state, setState] = useState<ResearchState>({
    query: null, target: null, result: null, status: 'idle', error: null, attempt: 0,
  });
  const requestId = useRef(0);

  useEffect(() => {
    if (!state.query) return;
    const id = ++requestId.current;
    let active = true;
    const corpusId = state.target?.corpusId;
    wordContext.search(state.query).then(result => {
      if (!active || id !== requestId.current) return;
      if (!corpusId || result.corpusId !== corpusId) {
        throw new Error('Research corpus version does not match the selected word.');
      }
      setState(previous => ({ ...previous, result, status: 'ready', error: null }));
    }).catch(error => {
      if (!active || id !== requestId.current) return;
      setState(previous => ({
        ...previous, result: null, status: 'error',
        error: error instanceof Error ? error.message : String(error),
      }));
    });
    return () => { active = false; };
  }, [state.query, state.target, state.attempt]);

  function start(word: VerseWord, book: string): void {
    requestId.current++;
    setState({
      target: { ...word }, result: null, status: 'loading', error: null, attempt: 0,
      query: {
        mode: 'lemma', term: word.lexicalLemma ?? word.lemma, books: [book],
        boundary: 'chapter', distance: 5, direction: 'either', page: 0, companion: undefined,
      },
    });
  }

  function update(patch: Partial<WordContextQuery>): void {
    requestId.current++;
    setState(previous => {
      if (!previous.query) return previous;
      const term = patch.mode === 'form' ? previous.target?.word
        : patch.mode === 'lemma' ? previous.target?.lexicalLemma ?? previous.target?.lemma
        : patch.term ?? previous.query.term;
      return {
        ...previous, result: null, status: 'loading', error: null,
        query: { ...previous.query, ...patch, term: term ?? previous.query.term, page: patch.page ?? 0 },
      };
    });
  }

  function retry(): void {
    requestId.current++;
    setState(previous => previous.query ? {
      ...previous, result: null, status: 'loading', error: null, attempt: previous.attempt + 1,
    } : previous);
  }

  function restore(query: WordContextQuery, target: VerseWord): void {
    requestId.current++;
    setState({ query: { ...query, books: [...query.books] }, target: { ...target }, result: null, status: 'loading', error: null, attempt: 0 });
  }

  return { query: state.query, target: state.target, result: state.result, status: state.status, error: state.error, start, update, retry, restore };
}