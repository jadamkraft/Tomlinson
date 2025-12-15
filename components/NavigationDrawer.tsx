import React, { useState, useEffect, useRef } from "react";
import { Book, X, ChevronLeft } from "lucide-react";
import { BIBLE_BOOKS, BIBLE_STRUCTURE } from "../constants";

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (book: string, chapter: number, verse: number) => void;
}

type SelectionStep = "books" | "chapters" | "verses";

const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectionStep, setSelectionStep] = useState<SelectionStep>("books");
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter books based on search query
  const filteredBooks = Object.entries(BIBLE_BOOKS).filter(
    ([id, name]) =>
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset state when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSelectionStep("books");
      setSelectedBook(null);
      setSelectedChapter(null);
    }
  }, [isOpen]);

  // Handle escape key to close drawer
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Focus search input when drawer opens and we're on books view
  useEffect(() => {
    if (isOpen && selectionStep === "books" && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, selectionStep]);

  const handleBookClick = (osisId: string) => {
    setSelectedBook(osisId);
    setSelectionStep("chapters");
  };

  const handleChapterClick = (chapter: number) => {
    setSelectedChapter(chapter);
    setSelectionStep("verses");
  };

  const handleVerseClick = (verse: number) => {
    if (selectedBook && selectedChapter) {
      onNavigate(selectedBook, selectedChapter, verse);
      onClose();
    }
  };

  const handleBackClick = () => {
    if (selectionStep === "verses") {
      setSelectedChapter(null);
      setSelectionStep("chapters");
    } else if (selectionStep === "chapters") {
      setSelectedBook(null);
      setSelectionStep("books");
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getBreadcrumb = (): string => {
    if (selectionStep === "books") {
      return "Select Book";
    } else if (selectionStep === "chapters" && selectedBook) {
      return `${BIBLE_BOOKS[selectedBook]}`;
    } else if (selectionStep === "verses" && selectedBook && selectedChapter) {
      return `${BIBLE_BOOKS[selectedBook]} > Ch ${selectedChapter}`;
    }
    return "Select Book";
  };

  const renderBooksView = () => (
    <div className="overflow-y-auto h-[calc(100vh-120px)]">
      {filteredBooks.length > 0 ? (
        <ul className="p-2">
          {filteredBooks.map(([osisId, fullName]) => (
            <li key={osisId}>
              <button
                onClick={() => handleBookClick(osisId)}
                className="w-full text-left px-4 py-3 rounded text-slate-200 hover:bg-slate-800 transition-colors"
              >
                {fullName}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="p-8 text-center text-slate-500">
          <p>No books found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );

  const renderChaptersView = () => {
    if (!selectedBook) return null;

    const bookName = BIBLE_BOOKS[selectedBook];
    const chapterCount = BIBLE_STRUCTURE[bookName]?.chapters || 0;

    return (
      <div className="overflow-y-auto h-[calc(100vh-120px)]">
        <div className="grid grid-cols-6 gap-2 p-4">
          {Array.from({ length: chapterCount }, (_, i) => i + 1).map((ch) => (
            <button
              key={ch}
              onClick={() => handleChapterClick(ch)}
              className="w-12 h-12 flex items-center justify-center bg-zinc-800 rounded hover:bg-zinc-700 text-slate-200 transition-colors"
            >
              {ch}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderVersesView = () => {
    if (!selectedBook || !selectedChapter) return null;

    // Safe default of 60 verses per chapter
    const verseCount = 60;

    return (
      <div className="overflow-y-auto h-[calc(100vh-120px)]">
        <div className="grid grid-cols-6 gap-2 p-4">
          {Array.from({ length: verseCount }, (_, i) => i + 1).map((verse) => (
            <button
              key={verse}
              onClick={() => handleVerseClick(verse)}
              className="w-12 h-12 flex items-center justify-center bg-zinc-800 rounded hover:bg-zinc-700 text-slate-200 transition-colors"
            >
              {verse}
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-md z-40"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Book Navigation"
        className={`fixed inset-y-0 left-0 w-80 md:w-96 bg-zinc-900 border-r border-slate-800 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-slate-800 p-4 z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {selectionStep !== "books" && (
                <button
                  onClick={handleBackClick}
                  className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors mr-1"
                  aria-label="Go back"
                >
                  <ChevronLeft size={18} />
                </button>
              )}
              <div className="bg-sky-600 p-1.5 rounded text-white">
                <Book size={18} />
              </div>
              <h2 className="font-bold text-slate-200">{getBreadcrumb()}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
              aria-label="Close drawer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search Input - Only shown in books view */}
          {selectionStep === "books" && (
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          )}
        </div>

        {/* Content Area */}
        {selectionStep === "books" && renderBooksView()}
        {selectionStep === "chapters" && renderChaptersView()}
        {selectionStep === "verses" && renderVersesView()}
      </div>
    </>
  );
};

export default NavigationDrawer;
