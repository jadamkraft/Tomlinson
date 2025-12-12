import React, { useEffect, useState, useCallback } from 'react';
import { engine } from './services/BibleEngine';
import { dictionary } from './services/DictionaryService';
import { ParsedVerse, VerseWord, EngineStatus } from './types';
import Reader from './components/Reader';
import Inspector from './components/Inspector';
import CommandBar from './components/CommandBar';
import { Book, History } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<EngineStatus>(EngineStatus.IDLE);
  const [currentVerse, setCurrentVerse] = useState<ParsedVerse | null>(null);
  const [selectedWord, setSelectedWord] = useState<VerseWord | null>(null);

  const handleSearch = useCallback(async (query: string) => {
    const osisID = engine.parseReference(query);
    const bookId = osisID.split('.')[0];
    
    // Ensure the required book is loaded
    await engine.loadBook(bookId);
    
    const verse = engine.getVerse(osisID);
    if (verse) {
      setCurrentVerse(verse);
      setSelectedWord(null);
    } else {
      alert(`Reference "${query}" not found in current dataset.`);
    }
  }, []);

  // Initialize engine on mount
  useEffect(() => {
    const init = async () => {
      setStatus(EngineStatus.LOADING);
      try {
        // Initialize both core services
        await Promise.all([
          engine.initialize(),
          dictionary.initialize()
        ]);
        
        setStatus(EngineStatus.READY);
        
        // Load initial verse
        await handleSearch("Gen 1:1");
      } catch (err) {
        console.error("App: Boot error:", err);
        setStatus(EngineStatus.ERROR);
      }
    };
    init();
  }, [handleSearch]);

  const handleSelectWord = useCallback((word: VerseWord) => {
    setSelectedWord(word);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
      {/* Top Header */}
      <header className="h-14 border-b border-slate-800 flex items-center justify-between px-4 shrink-0 bg-slate-950/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="bg-sky-600 p-1.5 rounded text-white">
            <Book size={18} />
          </div>
          <span className="font-bold tracking-tight text-slate-200">Tomlinson <span className="text-sky-500">10</span></span>
        </div>
        
        <div className="flex items-center gap-4 text-slate-500">
          <button title="History" className="hover:text-slate-100 transition-colors"><History size={18} /></button>
          <div className="w-px h-6 bg-slate-800 mx-2" />
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${status === EngineStatus.READY ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">{status}</span>
          </div>
        </div>
      </header>

      {/* Main Content Area - Responsive Stack */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Desktop Mini-Sidebar */}
        <aside className="hidden lg:flex w-14 border-r border-slate-800 flex-col items-center py-6 gap-8 bg-slate-950 shrink-0">
          <button className="p-2 text-sky-400 hover:bg-slate-900 rounded-lg transition-colors"><Book size={20} /></button>
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
          />
        </section>
      </main>

      {/* Footer / Command Bar */}
      <CommandBar onSearch={handleSearch} />
    </div>
  );
};

export default App;