import React from "react";
import { ParsedVerse, VerseWord } from "../types";

interface ReaderProps {
  verse: ParsedVerse | null;
  selectedWord: VerseWord | null;
  onSelectWord: (word: VerseWord) => void;
  onDeselectWord?: () => void;
}

const Reader: React.FC<ReaderProps> = ({
  verse,
  selectedWord,
  onSelectWord,
  onDeselectWord,
}) => {
  if (!verse) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-600">
        <p className="animate-pulse">Initializing Tomlinson 10 Engine...</p>
      </div>
    );
  }

  // Detect Hebrew to set RTL direction and specific styling
  const HEBREW_BOOKS = [
    "Gen",
    "Exod",
    "Lev",
    "Num",
    "Deut",
    "Josh",
    "Judg",
    "Ruth",
    "1Sam",
    "2Sam",
    "1Kgs",
    "2Kgs",
    "1Chr",
    "2Chr",
    "Ezra",
    "Neh",
    "Esth",
    "Job",
    "Ps",
    "Prov",
    "Eccl",
    "Song",
    "Isa",
    "Jer",
    "Lam",
    "Ezek",
    "Dan",
    "Hos",
    "Joel",
    "Amos",
    "Obad",
    "Jonah",
    "Mic",
    "Nah",
    "Hab",
    "Zeph",
    "Hag",
    "Zech",
    "Mal",
  ];
  const isHebrew = HEBREW_BOOKS.includes(verse.book);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If the click reached this handler, it means it didn't come from a word button
    // (because word buttons use stopPropagation). So we can safely deselect.
    onDeselectWord?.();
  };

  return (
    <div
      className={`flex-1 p-4 sm:p-8 lg:p-12 overflow-y-auto flex flex-col items-center ${
        isHebrew ? "rtl" : "ltr"
      }`}
      onClick={handleContainerClick}
    >
      <div className="max-w-4xl w-full">
        <header className="mb-8 lg:mb-12 border-b border-slate-800 pb-4">
          <h1 className="text-slate-500 text-sm tracking-[0.2em] font-semibold uppercase">
            {verse.book} {verse.chapter}:{verse.verse}
          </h1>
        </header>

        <div
          className={`flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-4 sm:gap-y-6 leading-relaxed ${
            isHebrew ? "flex-row-reverse text-right" : "flex-row text-left"
          }`}
          dir={isHebrew ? "rtl" : "ltr"}
        >
          {verse.words.map((word) => (
            <button
              key={word.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectWord(word);
              }}
              className={`
                group relative transition-all duration-200 outline-none
                ${isHebrew ? "text-3xl sm:text-5xl" : "text-2xl sm:text-4xl"}
                serif-font p-1 rounded-md
                ${
                  selectedWord?.id === word.id
                    ? "bg-sky-500/20 text-sky-300 ring-2 ring-sky-500/50"
                    : "text-slate-100 hover:text-sky-400 hover:bg-slate-800/50"
                }
              `}
            >
              {word.text}

              {/* Tooltip hint on hover (Desktop only for better mobile feel) */}
              <span className="hidden lg:block absolute -top-8 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-slate-800 text-slate-300 text-[10px] px-2 py-1 rounded border border-slate-700 pointer-events-none z-10 whitespace-nowrap">
                {word.morph}
              </span>
            </button>
          ))}
        </div>

        {/* Decorative footer */}
        <div className="mt-16 lg:mt-24 pt-8 border-t border-slate-900 flex justify-between items-center text-[10px] uppercase tracking-widest text-slate-600">
          <span>Tomlinson 10 V1.0.0</span>
          <span className="hidden sm:inline">SBLGNT / OSHB Dataset</span>
        </div>
      </div>
    </div>
  );
};

export default Reader;
