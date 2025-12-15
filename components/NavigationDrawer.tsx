import React, { useState, useEffect, useRef } from "react";
import { Book, X } from "lucide-react";
import { BIBLE_BOOKS } from "../constants";

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBook: (bookOsisId: string) => void;
}

const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  onSelectBook,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const drawerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter books based on search query
  const filteredBooks = Object.entries(BIBLE_BOOKS).filter(
    ([id, name]) =>
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      id.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  // Focus search input when drawer opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Reset search query when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  const handleBookClick = (osisId: string) => {
    onSelectBook(osisId);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
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
              <div className="bg-sky-600 p-1.5 rounded text-white">
                <Book size={18} />
              </div>
              <h2 className="font-bold text-slate-200">Select Book</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
              aria-label="Close drawer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search Input */}
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>

        {/* Book List */}
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
      </div>
    </>
  );
};

export default NavigationDrawer;
