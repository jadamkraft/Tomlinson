import { useMemo } from "react";
import { BIBLE_BOOKS, BIBLE_STRUCTURE } from "../constants";
import { engine } from "../services/BibleEngine";

/**
 * Ordered list of all Bible books in canonical order (OSIS IDs)
 */
const ORDERED_BOOKS: string[] = [
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
  "Matt",
  "Mark",
  "Luke",
  "John",
  "Acts",
  "Rom",
  "1Cor",
  "2Cor",
  "Gal",
  "Eph",
  "Phil",
  "Col",
  "1Thess",
  "2Thess",
  "1Tim",
  "2Tim",
  "Titus",
  "Phlm",
  "Heb",
  "Jas",
  "1Pet",
  "2Pet",
  "1John",
  "2John",
  "3John",
  "Jude",
  "Rev",
];

interface BibleReference {
  book: string;
  chapter: number;
  verse: number;
}

interface UseBibleNavigationOptions {
  book: string;
  chapter: number;
  verse: number;
}

export const useBibleNavigation = ({
  book,
  chapter,
  verse,
}: UseBibleNavigationOptions) => {
  const currentOsisId = useMemo(
    () => `${book}.${chapter}.${verse}`,
    [book, chapter, verse]
  );

  const getBookIndex = (osisBookId: string): number => {
    return ORDERED_BOOKS.indexOf(osisBookId);
  };

  const getNextBook = (currentBook: string): string | null => {
    const currentIndex = getBookIndex(currentBook);
    if (currentIndex === -1 || currentIndex === ORDERED_BOOKS.length - 1) {
      return null;
    }
    return ORDERED_BOOKS[currentIndex + 1];
  };

  const getPrevBook = (currentBook: string): string | null => {
    const currentIndex = getBookIndex(currentBook);
    if (currentIndex === -1 || currentIndex === 0) {
      return null;
    }
    return ORDERED_BOOKS[currentIndex - 1];
  };

  const getMaxChapters = (osisBookId: string): number => {
    const fullName = BIBLE_BOOKS[osisBookId];
    if (!fullName) return 0;
    return BIBLE_STRUCTURE[fullName]?.chapters || 0;
  };

  const goToNextVerse = (): BibleReference | null => {
    // First, try using engine.getAdjacentVerse for verse-level navigation
    const nextOsisId = engine.getAdjacentVerse(currentOsisId, 1);

    if (nextOsisId) {
      const parts = nextOsisId.split(".");
      if (parts.length === 3) {
        return {
          book: parts[0],
          chapter: parseInt(parts[1]),
          verse: parseInt(parts[2]),
        };
      }
    }

    // If engine.getAdjacentVerse returned null, we're at the end of the current book
    // Try to move to the next book (first chapter, first verse)
    const nextBook = getNextBook(book);
    if (nextBook) {
      return {
        book: nextBook,
        chapter: 1,
        verse: 1,
      };
    }

    // At the last verse of the last book (Revelation)
    return null;
  };

  const goToPrevVerse = (): BibleReference | null => {
    // First, try using engine.getAdjacentVerse for verse-level navigation
    const prevOsisId = engine.getAdjacentVerse(currentOsisId, -1);

    if (prevOsisId) {
      const parts = prevOsisId.split(".");
      if (parts.length === 3) {
        return {
          book: parts[0],
          chapter: parseInt(parts[1]),
          verse: parseInt(parts[2]),
        };
      }
    }

    // If engine.getAdjacentVerse returned null, we're at the beginning of the current book
    // Try to move to the previous book (last chapter, last verse)
    const prevBook = getPrevBook(book);
    if (prevBook) {
      // Try to get the actual last verse of the previous book
      const lastVerse = engine.getLastVerseOfBook(prevBook);
      if (lastVerse) {
        return {
          book: prevBook,
          chapter: lastVerse.chapter,
          verse: lastVerse.verse,
        };
      }

      // Fallback: use max chapters and verse 1 (will be corrected when book loads)
      const maxChapters = getMaxChapters(prevBook);
      return {
        book: prevBook,
        chapter: maxChapters,
        verse: 1,
      };
    }

    // At the first verse of the first book (Gen 1:1)
    return null;
  };

  const canGoNext = (): boolean => {
    const next = goToNextVerse();
    return next !== null;
  };

  const canGoPrev = (): boolean => {
    const prev = goToPrevVerse();
    return prev !== null;
  };

  return {
    goToNextVerse,
    goToPrevVerse,
    canGoNext,
    canGoPrev,
  };
};
