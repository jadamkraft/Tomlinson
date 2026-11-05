import React, { useEffect, useRef, useState } from "react";
import { engine } from "./services/BibleEngine";
import { dictionary } from "./services/DictionaryService";
import { ParsedVerse, VerseWord, NtManifest, WordContextHit, WordContextQuery } from "./types";
import Reader from "./components/Reader";
import Inspector from "./components/Inspector";
import CommandBar from "./components/CommandBar";
import NavigationDrawer from "./components/NavigationDrawer";
import WordResearchPanel from "./components/WordResearchPanel";
import { useBibleNavigation } from "./hooks/useBibleNavigation";
import { useWordResearch } from "./hooks/useWordResearch";
import { ArrowLeft, Book } from "lucide-react";

type ResearchSnapshot = { query: WordContextQuery; target: VerseWord; origin: { reference: string; token?: string; scroll: number }; scroll: number; focus: string | null };
type LocationState = { view: "reading" | "research"; reference: string; token?: string; lastOfBook?: boolean; readingScroll?: number; investigation?: ResearchSnapshot };

function readLocation(): LocationState {
  const params = new URLSearchParams(location.hash.slice(1));
  return {
    reference: params.get("ref") || "Rom.8.9",
    token: params.get("token") || undefined,
    view: params.get("view") === "research" ? "research" : "reading",
    readingScroll: history.state?.readingScroll,
    investigation: history.state?.investigation,
  };
}

const App: React.FC = () => {
  const [currentVerse, setCurrentVerse] = useState<ParsedVerse | null>(null);
  const [chapter, setChapter] = useState<ParsedVerse[]>([]);
  const [selectedWord, setSelectedWord] = useState<VerseWord | null>(null);
  const [manifest, setManifest] = useState<NtManifest | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"reading" | "research">("reading");
  const [isNavOpen, setIsNavOpen] = useState(false);
  const requestId = useRef(0);
  const pendingLocation = useRef<LocationState>(readLocation());
  const pendingHistoryMode = useRef<"push" | "replace" | "none">("replace");
  const origin = useRef<{ reference: string; token?: string; scroll: number } | null>(null);
  const readerContainer = useRef<HTMLDivElement>(null);
  const researchContainer = useRef<HTMLDivElement>(null);
  const researchScroll = useRef(0);
  const resultFocus = useRef<string | null>(null);
  const research = useWordResearch();
  const navigation = useBibleNavigation({
    book: currentVerse?.book || "Rom",
    chapter: currentVerse?.chapter || 8,
    verse: currentVerse?.verse || 9,
  });

  const navigate = async (target: LocationState, historyMode: "push" | "replace" | "none" = "push") => {
    const request = ++requestId.current;
    pendingLocation.current = target;
    pendingHistoryMode.current = historyMode;
    setStatus("loading");
    setError(null);
    try {
      if (!/^[1-3]?[A-Za-z]+\.\d+\.\d+$/.test(target.reference)) {
        throw new Error("Enter a valid book, chapter, and verse.");
      }
      const book = target.reference.split(".")[0];
      await engine.loadBook(book);
      const last = target.lastOfBook ? engine.getLastVerseOfBook(book) : null;
      const reference = last ? `${book}.${last.chapter}.${last.verse}` : target.reference;
      const verse = engine.getVerse(reference);
      if (!verse) throw new Error(`Reference ${target.reference} is not present in this source edition.`);
      const isGreek = verse.words[0]?.language === "grc";
      const source = isGreek ? await engine.getNtManifest() : null;
      if (request !== requestId.current) return;
      setManifest(source);
      setCurrentVerse(verse);
      setChapter(isGreek ? engine.getChapter(book, verse.chapter) : [verse]);
      setSelectedWord(target.token ? verse.words.find(word => word.id === target.token) || null : null);
      setView(target.view);
      setStatus("ready");
      setIsNavOpen(false);
      if (historyMode !== "none") {
        const hash = new URLSearchParams({ ref: verse.osisID });
        if (target.token) hash.set("token", target.token);
        if (target.view === "research") hash.set("view", "research");
        window.history[historyMode === "push" ? "pushState" : "replaceState"](target, "", `#${hash}`);
      }
      if (!isGreek) void dictionary.initialize();
      requestAnimationFrame(() => {
        if (request !== requestId.current || target.view !== "reading") return;
        const root = readerContainer.current;
        const token = target.token && root?.querySelector<HTMLButtonElement>(`[data-token-id="${CSS.escape(target.token)}"]`);
        const anchor = token || root?.querySelector(`[data-reference="${verse.osisID}"]`);
        anchor?.scrollIntoView({ block: "center" });
        if (token) token.focus({ preventScroll: true });
        if (root && target.readingScroll !== undefined) root.scrollTop = target.readingScroll;
      });
    } catch (failure) {
      if (request !== requestId.current) return;
      setStatus("error");
      setError(failure instanceof Error ? failure.message : "Unable to load passage.");
    }
  };

  useEffect(() => {
    const restoreLocation = (mode: "replace" | "none") => {
      const target = readLocation();
      if (target.investigation) {
        const saved = target.investigation;
        research.restore(saved.query, saved.target);
        origin.current = saved.origin;
        researchScroll.current = saved.scroll;
        resultFocus.current = saved.focus;
      } else if (target.view === "research") target.view = "reading";
      void navigate(target, mode);
    };
    restoreLocation("replace");
    const onPopState = () => { restoreLocation("none"); };
    window.addEventListener("popstate", onPopState);
    return () => { ++requestId.current; window.removeEventListener("popstate", onPopState); };
  }, []);

  useEffect(() => {
    if (view !== "research") return;
    requestAnimationFrame(() => {
      if (researchContainer.current) researchContainer.current.scrollTop = researchScroll.current;
      const focused = resultFocus.current && researchContainer.current?.querySelector<HTMLButtonElement>(`[data-result-id="${CSS.escape(resultFocus.current)}"]`);
      focused?.focus({ preventScroll: true });
    });
  }, [view, research.status]);

  const snapshot = (): ResearchSnapshot | undefined => research.query && research.target && origin.current
    ? { query: research.query, target: research.target, origin: origin.current, scroll: researchContainer.current?.scrollTop ?? researchScroll.current, focus: resultFocus.current }
    : undefined;

  useEffect(() => {
    if (view === "research" && research.query) history.replaceState({ ...history.state, investigation: snapshot() }, "");
  }, [research.query, view]);

  const startResearch = () => {
    if (!selectedWord?.lexicalLemma || !currentVerse) return;
    const previousInvestigation = snapshot();
    origin.current = { reference: currentVerse.osisID, token: selectedWord.id, scroll: readerContainer.current?.scrollTop || 0 };
    const readingHash = new URLSearchParams({ ref: currentVerse.osisID, token: selectedWord.id });
    history.replaceState({ view: "reading", reference: currentVerse.osisID, token: selectedWord.id, readingScroll: origin.current.scroll, investigation: previousInvestigation }, "", `#${readingHash}`);
    researchScroll.current = 0;
    resultFocus.current = null;
    research.start(selectedWord, currentVerse.book);
    setView("research");
    const target: LocationState = { view: "research", reference: currentVerse.osisID, token: selectedWord.id };
    const hash = new URLSearchParams({ ref: target.reference, token: selectedWord.id, view: "research" });
    history.pushState(target, "", `#${hash}`);
  };

  const openHit = (hit: WordContextHit) => {
    researchScroll.current = researchContainer.current?.scrollTop || 0;
    resultFocus.current = hit.target.id;
    const saved = snapshot();
    history.replaceState({ ...history.state, investigation: saved }, "");
    void navigate({ view: "reading", reference: hit.target.reference, token: hit.target.id, investigation: saved });
  };

  const returnToOrigin = async () => {
    const saved = origin.current;
    if (!saved) { setView("reading"); return; }
    researchScroll.current = researchContainer.current?.scrollTop ?? researchScroll.current;
    const savedInvestigation = snapshot();
    history.replaceState({ ...history.state, investigation: savedInvestigation }, "");
    await navigate({ view: "reading", reference: saved.reference, token: saved.token, investigation: savedInvestigation });
    requestAnimationFrame(() => { if (readerContainer.current) readerContainer.current.scrollTop = saved.scroll; });
  };

  const moveVerse = (offset: number) => {
    const next = offset > 0 ? navigation.goToNextVerse() : navigation.goToPrevVerse();
    if (!next) return;
    const previousBook = offset < 0 && currentVerse?.book !== next.book;
    void navigate({ view: "reading", reference: `${next.book}.${next.chapter}.${next.verse}`, lastOfBook: previousBook });
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-950 text-slate-100 overflow-hidden">
      <header className="h-14 border-b border-slate-800 flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => setIsNavOpen(true)} className="p-3 text-sky-400" aria-label="Open book navigation" title="Open book navigation"><Book size={20} /></button>
          <span className="font-bold">Tomlinson <span className="text-sky-400">Research</span></span>
        </div>
        <span className="text-xs text-slate-400" role="status">{status === "loading" ? "Loading passage…" : status === "error" ? "Load failed" : "Ready"}</span>
      </header>
      {error && <div role="alert" className="p-3 border-b border-rose-900 bg-rose-950/30 text-sm flex gap-2 items-center"><span className="flex-1">{error}</span><button className="min-h-11 px-3 underline" onClick={() => void navigate(pendingLocation.current, pendingHistoryMode.current)}>Retry passage</button></div>}
      {research.query && view === "reading" && <div className="border-b border-slate-800 px-3 flex shrink-0"><button className="min-h-11 flex items-center gap-2 text-sm text-sky-300" onClick={() => {
        setView("research");
        const target: LocationState = { view: "research", reference: currentVerse?.osisID || "Rom.8.9", investigation: snapshot() };
        history.pushState(target, "", `#${new URLSearchParams({ ref: target.reference, view: "research" })}`);
      }}><ArrowLeft size={16} />Back to results</button></div>}
      <main className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        <div ref={readerContainer} className={`${view === "research" ? "hidden lg:block" : "block"} flex-1 min-h-0 min-w-0 overflow-y-auto`}>
          {currentVerse ? <Reader verse={currentVerse} verses={chapter} selectedWord={selectedWord} onSelectWord={(word, verse) => { setSelectedWord(word); if (verse) setCurrentVerse(verse); }} onDeselectWord={() => setSelectedWord(null)} /> : <p className="p-6 text-slate-400">{status === "loading" ? "Loading Greek text…" : "No passage loaded."}</p>}
        </div>
        {view === "research" && research.query ? <div ref={researchContainer} className="flex-1 lg:flex-none lg:w-[32rem] min-h-0 min-w-0 overflow-y-auto border-l border-slate-800">
          <WordResearchPanel research={research} book={origin.current?.reference.split(".")[0] || "Rom"} onOpen={openHit} onClose={() => void returnToOrigin()} />
        </div> : <section className={`${selectedWord ? "max-h-[45dvh] lg:max-h-none" : "hidden lg:flex"} lg:w-80 shrink-0 min-h-0 overflow-y-auto border-t lg:border-t-0 lg:border-l border-slate-800`}>
          <Inspector selectedWord={selectedWord} currentVerse={currentVerse} onResearch={startResearch} onNavigate={offset => void moveVerse(offset)} canGoNext={navigation.canGoNext()} canGoPrev={navigation.canGoPrev()} />
        </section>}
      </main>
      {view === "reading" && currentVerse && <nav aria-label="Passage navigation" className="shrink-0 flex justify-between border-t border-slate-800 px-3 text-sm">
        <button className="min-h-11 px-3 disabled:opacity-30" disabled={!navigation.canGoPrev()} onClick={() => void moveVerse(-1)} aria-label="Previous verse">Previous</button>
        <span className="self-center text-slate-400">{currentVerse.book} {currentVerse.chapter}:{currentVerse.verse}</span>
        <button className="min-h-11 px-3 disabled:opacity-30" disabled={!navigation.canGoNext()} onClick={() => void moveVerse(1)} aria-label="Next verse">Next</button>
      </nav>}
      {view === "reading" && <CommandBar onSearch={query => void navigate({ view: "reading", reference: engine.parseReference(query) })} />}
      {manifest && <footer className="shrink-0 border-t border-slate-800 text-[11px] text-slate-400 px-3 py-1"><details><summary className="cursor-pointer min-h-6">SBLGNT · MorphGNT · Source and coverage</summary><div className="max-h-32 overflow-y-auto py-2 space-y-1">{manifest.notices.map(notice => <p key={notice.url}><a href={notice.url} target="_blank" rel="noreferrer" className="underline">{notice.label}</a></p>)}{manifest.coverageNotes.map(note => <p key={note}>{note}</p>)}<p className="break-all">{manifest.corpusId}</p></div></details></footer>}
      <NavigationDrawer isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} onNavigate={(book, chapterNumber, verse) => void navigate({ view: "reading", reference: `${book}.${chapterNumber}.${verse}` })} />
    </div>
  );
};

export default App;