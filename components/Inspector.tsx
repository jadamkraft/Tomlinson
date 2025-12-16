import React from "react";
import { VerseWord, ParsedVerse } from "../types";
import { dictionary } from "../services/DictionaryService";
import { parseGreekMorphology } from "../utils/morphologyParser";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

interface InspectorProps {
  selectedWord: VerseWord | null;
  currentVerse: ParsedVerse | null;
  onNavigate?: (offset: number) => void;
}

const Inspector: React.FC<InspectorProps> = ({
  selectedWord,
  currentVerse,
  onNavigate,
}) => {
  if (!currentVerse) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-slate-500 italic">
        <p>No verse loaded</p>
      </div>
    );
  }

  if (!selectedWord) {
    return (
      <div className="h-full p-6 flex flex-col space-y-6 overflow-y-auto">
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              {onNavigate && (
                <button
                  onClick={() => onNavigate(-1)}
                  className="p-1.5 text-slate-400 hover:text-sky-400 transition-colors rounded hover:bg-slate-900"
                  title="Previous verse"
                >
                  <ChevronLeft size={18} />
                </button>
              )}
              <h2 className="text-xl font-bold text-sky-400">
                {currentVerse.book} {currentVerse.chapter}:{currentVerse.verse}
              </h2>
              {onNavigate && (
                <button
                  onClick={() => onNavigate(1)}
                  className="p-1.5 text-slate-400 hover:text-sky-400 transition-colors rounded hover:bg-slate-900"
                  title="Next verse"
                >
                  <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
          <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest">
            Verse Summary
          </p>
        </div>
        <div className="space-y-4">
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
            <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">
              Word Count
            </h3>
            <p className="text-2xl font-light text-slate-200">
              {currentVerse.words.length}
            </p>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Click any word in the reader to see its full morphological
            breakdown, Strong's number, and lexical data.
          </p>
        </div>
      </div>
    );
  }

  const morphLabels = parseGreekMorphology(selectedWord.morph);
  const lexEntry = dictionary.getDefinition(selectedWord.strongs);

  return (
    <div className="h-full p-6 flex flex-col space-y-8 overflow-y-auto">
      <div className="border-b border-slate-800 pb-4">
        <h2
          className={`text-4xl serif-font font-bold text-slate-100 mb-2 ${
            selectedWord.strongs.startsWith("H") ? "text-right" : "text-left"
          }`}
        >
          {selectedWord.text}
        </h2>
        <p className="text-sky-400 font-medium tracking-wide uppercase text-xs">
          Lemma: {selectedWord.lemma}
        </p>
      </div>

      <div className="grid gap-6">
        {/* Dictionary Section */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={14} className="text-sky-500" />
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
              Lexicon
            </label>
          </div>
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 shadow-inner">
            {lexEntry ? (
              <>
                <p
                  className={`text-xl serif-font text-sky-300 font-bold mb-2 ${
                    selectedWord.strongs.startsWith("H")
                      ? "text-right"
                      : "text-left"
                  }`}
                >
                  {lexEntry.word}
                </p>
                <p className="text-slate-300 text-sm leading-relaxed serif-font italic">
                  {lexEntry.def}
                </p>
              </>
            ) : (
              <p className="text-slate-500 text-sm italic">
                Lexical entry not found for {selectedWord.strongs}.
              </p>
            )}
          </div>
        </section>

        {/* Morphology Section */}
        <section>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
            Morphology
          </label>
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 shadow-inner">
            {morphLabels.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {morphLabels.map((label, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-sky-900/50 text-sky-300 text-xs rounded border border-sky-800"
                  >
                    {label}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm italic">
                No morphology data
              </p>
            )}
            <p className="text-slate-500 text-xs mt-2 mono-font uppercase tracking-tighter">
              {selectedWord.morph}
            </p>
          </div>
        </section>

        {/* Strong's Info */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
              Strong's
            </label>
            <p className="text-lg font-semibold text-slate-200">
              #{selectedWord.strongs || "N/A"}
            </p>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
              OSIS Ref
            </label>
            <p className="text-lg font-semibold text-slate-200">
              {currentVerse.osisID}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Inspector;
