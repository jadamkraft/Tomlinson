import React, { useEffect, useId, useRef, useState } from 'react';
import { ArrowLeft, Check, ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import type { WordContextHit } from '../types';
import type { useWordResearch } from '../hooks/useWordResearch';
import { wordContext } from '../services/WordContextService';
import { NT_BOOK_ORDER } from '../services/WordContextIndex';
import { BIBLE_BOOKS } from '../constants';
import authorGroups from '../data/nt-author-groups.json';

interface WordResearchPanelProps {
  research: ReturnType<typeof useWordResearch>;
  book: string;
  onOpen: (hit: WordContextHit) => void;
  onClose: () => void;
}

const control = 'min-h-11 min-w-11 rounded border border-slate-700 bg-slate-900 px-3 text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 disabled:opacity-40';
const paul13 = authorGroups.find(group => group.id === 'paul13')!.books;
const otherBooks = NT_BOOK_ORDER.filter(book => !paul13.includes(book));
const reference = (token: WordContextHit['target']) => `${token.book} ${token.chapter}:${token.verse}`;

export default function WordResearchPanel({ research, book, onOpen, onClose }: WordResearchPanelProps) {
  const { query, target, result, status, error, update } = research;
  const back = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const inferredScope = (() => {
    const books = query?.books ?? [];
    const same = (candidate: string[]) => candidate.length === books.length && candidate.every(item => books.includes(item));
    return same([book]) ? 'current' : authorGroups.find(group => same(group.books))?.id
      ?? (same(NT_BOOK_ORDER) ? 'all' : same(otherBooks) ? 'other' : 'selected');
  })();
  const scope = query?.scopePreset ?? inferredScope;
  const excludeCurrent = query?.excludeCurrent ?? false;
  const [prefix, setPrefix] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const lookupId = useRef(0);
  const common = [...new Set(['ἐν', 'πνεῦμα', 'Χριστός', target?.lexicalLemma].filter(Boolean))] as string[];

  useEffect(() => { back.current?.focus(); }, []);
  useEffect(() => {
    if (!prefix.trim()) return;
    let active = true;
    const id = ++lookupId.current;
    const timer = setTimeout(() => {
      wordContext.getLemmas(prefix.trim().normalize('NFC')).then(lemmas => {
        if (!active || id !== lookupId.current) return;
        setSuggestions(lemmas);
        setLookingUp(false);
      }).catch(failure => {
        if (!active || id !== lookupId.current) return;
        setLookingUp(false);
        setLookupError(failure instanceof Error ? failure.message : String(failure));
      });
    }, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [prefix]);

  if (!query) return null;

  function chooseScope(next: string, excluded = excludeCurrent) {
    const books = next === 'current' ? [book] : next === 'all' ? NT_BOOK_ORDER
      : next === 'other' ? otherBooks : authorGroups.find(group => group.id === next)?.books ?? query.selectedBooks ?? query.books;
    update({ books: books.filter(item => !excluded || item !== book), scopePreset: next, excludeCurrent: excluded,
      ...(next === 'selected' ? { selectedBooks: books } : {}) });
  }

  const group = authorGroups.find(item => item.id === scope);
  const visibleResult = status === 'ready' ? result : null;

  return (
    <section aria-label="Word research" className="min-w-0 p-4 text-slate-200 space-y-4">
      <header className="sticky top-0 z-10 bg-slate-950 flex items-center gap-3 border-b border-slate-800 py-3">
        <button ref={back} type="button" className={control} aria-label="Back" title="Back" onClick={onClose}><ArrowLeft size={18} aria-hidden="true" /></button>
        <h2 className="text-lg font-semibold">Word research</h2>
      </header>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Search mode">
        {(['lemma', 'form'] as const).map(mode => (
          <button key={mode} type="button" className={`${control} ${query.mode === mode ? 'border-sky-500 text-sky-300' : ''}`}
            aria-pressed={query.mode === mode} disabled={mode === 'form' && !target?.word}
            onClick={() => update({ mode, term: mode === 'form' ? target.word : target.lexicalLemma ?? target.lemma })}>
            {mode === 'lemma' ? 'Lemma' : 'Form'}
          </button>
        ))}
        <span lang="grc" dir="ltr" className="serif-font text-xl break-all">{query.term}</span>
      </div>
      <div className="space-y-2">
        <label className="block text-sm">Scope
          <select className={`${control} block w-full mt-1`} value={scope} onChange={event => chooseScope(event.target.value)}>
            <option value="current">Current book</option>
            {authorGroups.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
            <option value="other">Other NT books</option>
            <option value="all">All NT books</option>
            <option value="selected">Selected books</option>
          </select>
        </label>
        <label className="flex items-center gap-2 min-h-11 text-sm">
          <input type="checkbox" checked={excludeCurrent} onChange={event => {
            chooseScope(scope, event.target.checked);
          }} />Exclude current book
        </label>
        {group && <p className="text-xs text-slate-400">{group.description}</p>}
        {scope === 'other' && <p className="text-xs text-slate-400">New Testament books outside the thirteen letters bearing Paul's name; Hebrews is included. This grouping does not assign a common author.</p>}
        <p className="text-xs text-slate-400 break-words">Included books: {query.books.join(', ') || 'None'}</p>
        {scope === 'selected' && <details open>
          <summary className="min-h-11 cursor-pointer py-3 text-sm">Selected books</summary>
          <div className="grid grid-cols-2 gap-x-2">
            {NT_BOOK_ORDER.map(item => <label key={item} className="flex items-center gap-2 min-h-11 text-sm">
              <input type="checkbox" checked={query.books.includes(item)} disabled={excludeCurrent && item === book}
                onChange={event => {
                  const selectedBooks = NT_BOOK_ORDER.filter(candidate => candidate === item ? event.target.checked : (query.selectedBooks ?? query.books).includes(candidate));
                  update({ selectedBooks, books: selectedBooks.filter(candidate => !excludeCurrent || candidate !== book) });
                }} />
              {BIBLE_BOOKS[item]}
            </label>)}
          </div>
        </details>}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">Companion lemma
          <select className={`${control} block w-full mt-1`} value={query.companion ?? ''} onChange={event => update({ companion: event.target.value || undefined })}>
            <option value="">None</option>
            {[...new Set([...common, query.companion].filter(Boolean))].map(lemma => <option key={lemma} value={lemma}>{lemma}</option>)}
          </select>
        </label>
        <label className="text-sm">Direction
          <select className={`${control} block w-full mt-1`} value={query.direction} onChange={event => update({ direction: event.target.value as typeof query.direction })}>
            <option value="either">Either</option><option value="before">Before</option><option value="after">After</option>
          </select>
        </label>
        <label className="text-sm">Distance (tokens)
          <input type="number" min={1} max={10} step={1} className={`${control} block w-full mt-1`} value={query.distance}
            onChange={event => { const distance = Number(event.target.value); if (Number.isInteger(distance) && distance >= 1 && distance <= 10) update({ distance }); }} />
        </label>
      </div>
      <p className="text-xs text-slate-400">Within chapter; may cross verses</p>
      <details>
        <summary className="min-h-11 cursor-pointer py-3 text-sm">Additional companion lemma</summary>
        <form className="space-y-2" onSubmit={event => {
          event.preventDefault();
          const lemma = prefix.trim().normalize('NFC');
          if (!common.includes(lemma) && !suggestions.includes(lemma)) {
            setLookupError('Choose an existing lemma from the verified suggestions.');
            return;
          }
          setLookupError(null);
          update({ companion: lemma });
        }}>
          <div className="flex gap-2 items-end">
            <label className="min-w-0 flex-1 text-sm">Find companion lemma
              <input className={`${control} block w-full mt-1`} lang="grc" dir="ltr" list={listId} value={prefix} onChange={event => {
                lookupId.current++;
                setPrefix(event.target.value);
                setSuggestions([]);
                setLookupError(null);
                setLookingUp(Boolean(event.target.value.trim()));
              }} />
            </label>
            <button type="submit" className={control} aria-label="Use companion lemma" title="Use companion lemma" disabled={lookingUp}><Check size={18} aria-hidden="true" /></button>
          </div>
          <datalist id={listId}>{suggestions.map(lemma => <option key={lemma} value={lemma} />)}</datalist>
          {lookingUp && <p role="status" className="text-xs text-slate-400">Loading lemmas...</p>}
          {lookupError && <p role="alert" className="text-sm text-rose-300">{lookupError}</p>}
        </form>
      </details>
      <div aria-live="polite" aria-busy={status === 'loading'}>
        {status === 'loading' && <p role="status">Searching...</p>}
        {status === 'error' && <div role="alert" className="space-y-2 text-rose-300">
          <p>{error}</p>
          <button type="button" className={`${control} inline-flex items-center gap-2`} onClick={research.retry}><RotateCw size={18} aria-hidden="true" />Retry</button>
        </div>}
        {visibleResult && <>
          <p className="text-sm mb-3">{visibleResult.total} occurrences · {visibleResult.scopeTokens} scope tokens</p>
          {visibleResult.total === 0 && <p className="text-slate-400">No occurrences in the complete selected scope.</p>}
          <ul className="divide-y divide-slate-800">
            {visibleResult.hits.map((hit, index) => <li key={hit.target.id}>
              {(index === 0 || visibleResult.hits[index - 1].target.book !== hit.target.book) && <h3 className="text-sm text-slate-400 py-2">{BIBLE_BOOKS[hit.target.book]}</h3>}
              <button type="button" data-result-id={hit.target.id} aria-label={`Open ${reference(hit.target)}`} onClick={() => onOpen(hit)}
                className="w-full min-h-11 text-left py-3 px-1 hover:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400">
                <span className="block text-sm text-sky-300 mb-1">{reference(hit.target)}</span>
                <span lang="grc" dir="ltr" className="block serif-font text-lg leading-relaxed break-words" title={`Source: ${visibleResult.corpusId}`}>
                  {hit.context.map((token, position) => <React.Fragment key={token.id}>
                    {(position === 0 || hit.context[position - 1].reference !== token.reference) && <span lang="en" className="text-xs text-slate-400">{reference(token)}{' '}</span>}
                    {token.id === hit.target.id ? <mark className="bg-sky-900 text-sky-100">{token.text}</mark>
                      : hit.companions.includes(token.id) ? <mark className="bg-amber-900 text-amber-100">{token.text}</mark> : token.text}{' '}
                  </React.Fragment>)}
                </span>
              </button>
            </li>)}
          </ul>
          <nav aria-label="Results pagination" className="flex items-center justify-between gap-2 mt-3">
            <button type="button" className={control} aria-label="Previous results" title="Previous results" disabled={visibleResult.page === 0} onClick={() => update({ page: visibleResult.page - 1 })}><ChevronLeft size={18} aria-hidden="true" /></button>
            <span className="text-sm">Page {visibleResult.page + 1} of {Math.max(1, Math.ceil(visibleResult.total / 25))}</span>
            <button type="button" className={control} aria-label="Next results" title="Next results" disabled={(visibleResult.page + 1) * 25 >= visibleResult.total} onClick={() => update({ page: visibleResult.page + 1 })}><ChevronRight size={18} aria-hidden="true" /></button>
          </nav>
          <details className="text-xs text-slate-400 mt-3"><summary className="min-h-11 cursor-pointer py-3">Source corpus</summary><p className="break-all">{visibleResult.corpusId}</p></details>
        </>}
      </div>
    </section>
  );
}