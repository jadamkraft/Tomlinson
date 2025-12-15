import React, { useEffect, useState, useCallback } from "react";
import { engine } from "./services/BibleEngine";
import { dictionary } from "./services/DictionaryService";
import { ParsedVerse, VerseWord, EngineStatus } from "./types";
import Reader from "./components/Reader";
import Inspector from "./components/Inspector";
import CommandBar from "./components/CommandBar";
import NavigationDrawer from "./components/NavigationDrawer";
import { Book, History } from "lucide-react";

const App: React.FC = () => {
  console.log("🚀 App Mounting");

  const [status, setStatus] = useState<EngineStatus>(EngineStatus.IDLE);
  const [currentVerse, setCurrentVerse] = useState<ParsedVerse | null>(null);
  const [selectedWord, setSelectedWord] = useState<VerseWord | null>(null);
  const [isNavOpen, setIsNavOpen] = useState(false);

  console.log(
    "App: Render - status:",
    status,
    "currentVerse:",
    currentVerse,
    "selectedWord:",
    selectedWord
  );

  const handleSearch = useCallback(async (query: string) => {
    console.log("App: handleSearch called with query:", query);
    const osisID = engine.parseReference(query);
    console.log("App: Parsed OSIS ID:", osisID);
    const bookId = osisID.split(".")[0];
    console.log("App: Extracted book ID:", bookId);

    // Ensure the required book is loaded
    console.log("App: Loading book:", bookId);
    await engine.loadBook(bookId);
    console.log("App: Book load completed for:", bookId);

    console.log("App: Getting verse for OSIS ID:", osisID);
    const verse = engine.getVerse(osisID);
    console.log("App: getVerse returned:", verse);
    console.log(
      "App: Verse is null/undefined?",
      verse === null || verse === undefined
    );

    if (verse) {
      console.log(
        "App: Verse found, currentVerse BEFORE setCurrentVerse:",
        currentVerse
      );
      console.log("App: Verse data:", {
        osisID: verse.osisID,
        book: verse.book,
        chapter: verse.chapter,
        verse: verse.verse,
        wordCount: verse.words?.length || 0,
      });
      setCurrentVerse(verse);
      console.log(
        "App: setCurrentVerse called, currentVerse AFTER (may not update immediately):",
        currentVerse
      );
      setSelectedWord(null);
      console.log("App: setSelectedWord(null) called");
    } else {
      console.warn(
        "App: Verse not found for query:",
        query,
        "OSIS ID:",
        osisID
      );
      alert(`Reference "${query}" not found in current dataset.`);
    }
  }, []);

  // Initialize engine on mount
  useEffect(() => {
    console.log("🔥 App: useEffect FIRED - initialization starting");

    const init = async () => {
      console.log("App: Starting initialization...");
      console.log("App: Setting status to LOADING");
      setStatus(EngineStatus.LOADING);
      console.log(
        "App: Status after setStatus(LOADING):",
        EngineStatus.LOADING
      );

      try {
        console.log("App: Starting engine and dictionary initialization...");
        // Initialize both core services
        await Promise.all([engine.initialize(), dictionary.initialize()]);

        console.log("App: Both services initialized successfully");
        console.log("App: Setting status to READY");
        setStatus(EngineStatus.READY);
        console.log("App: Status after setStatus(READY):", EngineStatus.READY);

        // Load initial verse
        console.log("App: Loading initial verse Gen 1:1...");
        await handleSearch("Gen 1:1");
        console.log("App: Initial verse search completed");
      } catch (err) {
        console.error("App: Boot error:", err);
        console.log("App: Setting status to ERROR");
        setStatus(EngineStatus.ERROR);
        console.log("App: Status after setStatus(ERROR):", EngineStatus.ERROR);
      }
    };
    init();
  }, [handleSearch]);

  const handleSelectWord = useCallback((word: VerseWord) => {
    setSelectedWord(word);
  }, []);

  const handleNavigate = useCallback(
    async (offset: number) => {
      if (!currentVerse) return;

      const targetOsisId = engine.getAdjacentVerse(currentVerse.osisID, offset);
      if (!targetOsisId) {
        console.warn(
          `App: No adjacent verse found for ${currentVerse.osisID} with offset ${offset}`
        );
        return;
      }

      console.log(
        `App: Navigating from ${currentVerse.osisID} to ${targetOsisId}`
      );
      const bookId = targetOsisId.split(".")[0];

      // Ensure the book is loaded
      await engine.loadBook(bookId);

      // Get the verse
      const verse = engine.getVerse(targetOsisId);
      if (verse) {
        setCurrentVerse(verse);
        setSelectedWord(null);
      } else {
        console.warn(`App: Verse not found: ${targetOsisId}`);
      }
    },
    [currentVerse]
  );

  const handleBookSelect = useCallback(
    async (bookOsisId: string) => {
      await handleSearch(`${bookOsisId} 1:1`);
      setIsNavOpen(false);
    },
    [handleSearch]
  );

  // AGGRESSIVE DEBUG: Log state values before JSX render
  console.log(
    "🔍 App: Pre-render state check - status:",
    status,
    "currentVerse:",
    currentVerse
  );
  console.log("🔍 App: status === LOADING?", status === EngineStatus.LOADING);
  console.log("🔍 App: status === READY?", status === EngineStatus.READY);
  console.log("🔍 App: status === ERROR?", status === EngineStatus.ERROR);
  console.log("🔍 App: currentVerse is null?", currentVerse === null);
  console.log("🔍 App: currentVerse is undefined?", currentVerse === undefined);

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
      {/* Top Header */}
      <header className="h-14 border-b border-slate-800 flex items-center justify-between px-4 shrink-0 bg-slate-950/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNavOpen(true)}
            className="bg-sky-600 p-1.5 rounded text-white hover:bg-sky-500 transition-colors cursor-pointer"
            aria-label="Open book navigation"
          >
            <Book size={18} />
          </button>
          <span className="font-bold tracking-tight text-slate-200">
            Tomlinson <span className="text-sky-500">10</span>
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-500">
          <button
            title="History"
            className="hover:text-slate-100 transition-colors"
          >
            <History size={18} />
          </button>
          <div className="w-px h-6 bg-slate-800 mx-2" />
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                status === EngineStatus.READY
                  ? "bg-emerald-500"
                  : "bg-amber-500 animate-pulse"
              }`}
            />
            <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">
              {status}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area - Responsive Stack */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Desktop Mini-Sidebar */}
        <aside className="hidden lg:flex w-14 border-r border-slate-800 flex-col items-center py-6 gap-8 bg-slate-950 shrink-0">
          <button className="p-2 text-sky-400 hover:bg-slate-900 rounded-lg transition-colors">
            <Book size={20} />
          </button>
        </aside>

        {/* Reader Zone (A) */}
        <section className="flex-1 bg-slate-900/20 flex flex-col min-w-0 h-1/2 lg:h-full">
          <Reader
            verse={currentVerse}
            selectedWord={selectedWord}
            onSelectWord={handleSelectWord}
          />
        </section>

        {/* Inspector Zone (B) - Stacks on bottom for mobile */}
        <section className="h-1/2 lg:h-full w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-950 shrink-0 flex flex-col overflow-hidden">
          <Inspector
            selectedWord={selectedWord}
            currentVerse={currentVerse}
            onNavigate={handleNavigate}
          />
        </section>
      </main>

      {/* Footer / Command Bar */}
      <CommandBar onSearch={handleSearch} />

      {/* Navigation Drawer */}
      <NavigationDrawer
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        onSelectBook={handleBookSelect}
      />
    </div>
  );
};

export default App;
