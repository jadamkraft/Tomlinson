import { ParsedVerse, VerseWord } from "../types";
import { BIBLE_SAMPLE_XML, SHORT_TO_OSIS } from "../constants";

/**
 * Maps OSIS book IDs to their actual filenames in the assets folder.
 */
const BOOK_FILENAME_MAP: Record<string, string> = {
  // Old Testament
  Genesis: "Gen.xml",
  Gen: "Gen.xml",
  Exodus: "Exod.xml",
  Exod: "Exod.xml",
  Leviticus: "Lev.xml",
  Lev: "Lev.xml",
  Numbers: "Num.xml",
  Num: "Num.xml",
  Deuteronomy: "Deut.xml",
  Deut: "Deut.xml",
  Joshua: "Josh.xml",
  Josh: "Josh.xml",
  Judges: "Judg.xml",
  Judg: "Judg.xml",
  Ruth: "Ruth.xml",
  "1Samuel": "1Sam.xml",
  "1Sam": "1Sam.xml",
  "2Samuel": "2Sam.xml",
  "2Sam": "2Sam.xml",
  "1Kings": "1Kgs.xml",
  "1Kgs": "1Kgs.xml",
  "2Kings": "2Kgs.xml",
  "2Kgs": "2Kgs.xml",
  "1Chronicles": "1Chr.xml",
  "1Chr": "1Chr.xml",
  "2Chronicles": "2Chr.xml",
  "2Chr": "2Chr.xml",
  Ezra: "Ezra.xml",
  Nehemiah: "Neh.xml",
  Neh: "Neh.xml",
  Esther: "Esth.xml",
  Esth: "Esth.xml",
  Job: "Job.xml",
  Psalms: "Ps.xml",
  Ps: "Ps.xml",
  Proverbs: "Prov.xml",
  Prov: "Prov.xml",
  Ecclesiastes: "Eccl.xml",
  Eccl: "Eccl.xml",
  "Song of Solomon": "Song.xml",
  Song: "Song.xml",
  Isaiah: "Isa.xml",
  Isa: "Isa.xml",
  Jeremiah: "Jer.xml",
  Jer: "Jer.xml",
  Lamentations: "Lam.xml",
  Lam: "Lam.xml",
  Ezekiel: "Ezek.xml",
  Ezek: "Ezek.xml",
  Daniel: "Dan.xml",
  Dan: "Dan.xml",
  Hosea: "Hos.xml",
  Hos: "Hos.xml",
  Joel: "Joel.xml",
  Amos: "Amos.xml",
  Obadiah: "Obad.xml",
  Obad: "Obad.xml",
  Jonah: "Jonah.xml",
  Micah: "Mic.xml",
  Mic: "Mic.xml",
  Nahum: "Nah.xml",
  Nah: "Nah.xml",
  Habakkuk: "Hab.xml",
  Hab: "Hab.xml",
  Zephaniah: "Zeph.xml",
  Zeph: "Zeph.xml",
  Haggai: "Hag.xml",
  Hag: "Hag.xml",
  Zechariah: "Zech.xml",
  Zech: "Zech.xml",
  Malachi: "Mal.xml",
  Mal: "Mal.xml",
  // New Testament
  Matthew: "Matt.xml",
  Matt: "Matt.xml",
  Mt: "Matt.xml", // Additional abbreviation
  Mark: "Mark.xml",
  Mk: "Mark.xml", // Additional abbreviation
  Luke: "Luke.xml",
  Lk: "Luke.xml", // Additional abbreviation
  John: "John.xml",
  Jn: "John.xml", // Additional abbreviation
  Acts: "Acts.xml",
  Romans: "Rom.xml",
  Rom: "Rom.xml",
  "1Corinthians": "1Cor.xml",
  "1Cor": "1Cor.xml",
  "2Corinthians": "2Cor.xml",
  "2Cor": "2Cor.xml",
  Galatians: "Gal.xml",
  Gal: "Gal.xml",
  Ephesians: "Eph.xml",
  Eph: "Eph.xml",
  Philippians: "Phil.xml",
  Phil: "Phil.xml",
  Colossians: "Col.xml",
  Col: "Col.xml",
  "1Thessalonians": "1Thess.xml",
  "1Thess": "1Thess.xml",
  "2Thessalonians": "2Thess.xml",
  "2Thess": "2Thess.xml",
  "1Timothy": "1Tim.xml",
  "1Tim": "1Tim.xml",
  "2Timothy": "2Tim.xml",
  "2Tim": "2Tim.xml",
  Titus: "Titus.xml",
  Philemon: "Phlm.xml",
  Phlm: "Phlm.xml",
  Philem: "Phlm.xml", // Additional abbreviation
  Hebrews: "Heb.xml",
  Heb: "Heb.xml",
  James: "Jas.xml",
  Jas: "Jas.xml",
  "1Peter": "1Pet.xml",
  "1Pet": "1Pet.xml",
  "2Peter": "2Pet.xml",
  "2Pet": "2Pet.xml",
  "1John": "1John.xml",
  "2John": "2John.xml",
  "3John": "3John.xml",
  Jude: "Jude.xml",
  Revelation: "Rev.xml",
  Rev: "Rev.xml",
};

/**
 * Normalizes a book ID by stripping spaces and handling case-insensitivity.
 */
function normalizeBookId(bookId: string): string {
  return bookId.trim().replace(/\s+/g, "");
}

export class BibleEngine {
  private parser: DOMParser;
  private bookDocs: Map<string, Document> = new Map();

  constructor() {
    this.parser = new DOMParser();
  }

  private isOT(bookId: string): boolean {
    const OT_BOOKS = [
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
    return OT_BOOKS.includes(bookId);
  }

  /**
   * Initializes the engine. For now, it just parses the static sample XML.
   * NOTE: Dictionary parsing logic removed. We now rely on DictionaryService.ts for all definitions.
   */
  async initialize(xmlString: string = BIBLE_SAMPLE_XML): Promise<void> {
    try {
      console.log("BibleEngine: initialize() called");
      const doc = this.parser.parseFromString(xmlString, "text/xml");

      const parserError = doc.querySelector("parsererror");
      if (parserError)
        throw new Error(parserError.textContent || "XML parsing error");

      const books = doc.querySelectorAll('div[type="book"]');
      books.forEach((bookNode) => {
        const bookId = bookNode.getAttribute("osisID");
        if (bookId) {
          const bookDoc = document.implementation.createDocument(
            null,
            "osis",
            null
          );
          bookDoc.documentElement.appendChild(
            bookDoc.importNode(bookNode, true)
          );
          this.bookDocs.set(bookId, bookDoc);
        }
      });
      console.log(
        "BibleEngine: Initialized. Cached books:",
        this.bookDocs.size
      );
    } catch (error) {
      console.error("BibleEngine: Initialization failed:", error);
      throw error;
    }
  }

  /**
   * Loads a specific book XML from the assets folder.
   */
  public async loadBook(osisBookId: string): Promise<void> {
    if (this.bookDocs.has(osisBookId)) return;

    const normalizedBookId = normalizeBookId(osisBookId);
    // Try explicit map, then casing fallbacks
    const fileName =
      BOOK_FILENAME_MAP[normalizedBookId] ||
      BOOK_FILENAME_MAP[normalizedBookId.toLowerCase()] ||
      BOOK_FILENAME_MAP[
        normalizedBookId.charAt(0).toUpperCase() +
          normalizedBookId.slice(1).toLowerCase()
      ] ||
      `${normalizedBookId}.xml`;

    const path = `/assets/${fileName}`;

    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);

      const xmlString = await response.text();
      // Soft 404 check
      if (
        xmlString.trim().startsWith("<!DOCTYPE") ||
        xmlString.trim().toLowerCase().startsWith("<html")
      ) {
        throw new Error("Soft 404: Received HTML instead of XML");
      }

      const doc = this.parser.parseFromString(xmlString, "text/xml");
      if (doc.querySelector("parsererror")) throw new Error("XML parser error");

      // Locate book node
      let bookNode = doc.querySelector("book");
      if (!bookNode) bookNode = doc.querySelector(`[osisID="${osisBookId}"]`);
      if (!bookNode) {
        // Fallback: search all elements for osisID
        const allElements = doc.querySelectorAll("*");
        for (let i = 0; i < allElements.length; i++) {
          if (allElements[i].getAttribute("osisID") === osisBookId) {
            bookNode = allElements[i];
            break;
          }
        }
      }

      if (bookNode) {
        const bookDoc = document.implementation.createDocument(
          null,
          "osis",
          null
        );
        bookDoc.documentElement.appendChild(bookDoc.importNode(bookNode, true));
        this.bookDocs.set(osisBookId, bookDoc);
        console.log(`BibleEngine: Loaded ${osisBookId}`);
      } else {
        console.warn(`BibleEngine: Could not find book node for ${osisBookId}`);
      }
    } catch (e) {
      console.error(`BibleEngine: Failed to load ${osisBookId}`, e);
    }
  }

  /**
   * Normalizes a reference string like "Jn 1:1" or "Gen 1:1" into an osisID.
   */
  public parseReference(query: string): string {
    const regex = /^([a-zA-Z0-9\s]+)\s+(\d+):(\d+)$/;
    const match = query.trim().match(regex);
    if (!match) return query;

    let bookInput = match[1].trim().toLowerCase();
    const chapter = match[2];
    const verse = match[3];

    // Check strict map first, then title case fallback
    const osisBook =
      SHORT_TO_OSIS[bookInput] ||
      bookInput.charAt(0).toUpperCase() + bookInput.slice(1);

    return `${osisBook}.${chapter}.${verse}`;
  }

  /**
   * Maps a word element to a VerseWord object.
   * Handles both standard OSIS format and new Greek XML format.
   * Common helper for both flat and container formats.
   */
  private mapWordElement(w: Element, bookId: string, index: number): VerseWord {
    const lemmaValue = w.getAttribute("lemma") || "";
    const morphValue = w.getAttribute("morph") || "";
    const rawStrongsAttr = w.getAttribute("strongs") || "";

    // Improved Logic: Don't force prefix if it exists
    let strongsId = "";

    // 1. Try "strongs" attribute directly (cleanest)
    if (rawStrongsAttr) {
      const clean = rawStrongsAttr.replace(/^strong:/, "");
      // If it already starts with H or G, use it. Otherwise append.
      if (/^[HG]\d+/.test(clean)) {
        strongsId = clean;
      } else {
        strongsId = `${this.isOT(bookId) ? "H" : "G"}${clean}`;
      }
    }
    // 2. Try parsing "lemma" (e.g. "strong:G1234" or just "G1234")
    else if (lemmaValue) {
      // Remove "strong:" prefix if present
      const cleanLemma = lemmaValue.replace(/^strong:/, "");

      if (/^[HG]\d+/.test(cleanLemma)) {
        strongsId = cleanLemma; // It's already perfect (e.g. G1234)
      } else {
        // It's likely just a number "1234" or "01234"
        const numericPart = cleanLemma.match(/\d+/)?.[0];
        if (numericPart) {
          strongsId = `${this.isOT(bookId) ? "H" : "G"}${numericPart}`;
        }
      }
    }

    // Debug logging for Greek words specifically
    const isGreek = !this.isOT(bookId);
    if (isGreek) {
      console.log(
        `🔍 BibleEngine: Greek word processing (bookId: ${bookId}, index: ${index}):`,
        {
          rawAttributes: {
            lemma: lemmaValue,
            strongs: rawStrongsAttr,
            morph: morphValue,
          },
          finalStrongsId: strongsId,
          text: w.textContent?.trim() || "",
        }
      );
    }

    const text = w.textContent?.trim() || "";

    // DEBUG: If we failed to find a Strong's ID, dump all available attributes to the console
    if (!strongsId && text.trim().length > 0) {
      // Create a simple object of all attributes on this node
      const allAttributes = w.getAttributeNames().reduce((acc, name) => {
        acc[name] = w.getAttribute(name);
        return acc;
      }, {} as Record<string, string | null>);

      console.warn(`⚠️ MISSING ID for word: "${text}"`);
      console.warn(`   --> Found attributes:`, allAttributes);
    }

    return {
      text: text,
      lemma: lemmaValue,
      morph: morphValue,
      strongs: strongsId,
      id:
        w.getAttribute("id") || `w-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  public getVerse(osisID: string): ParsedVerse | null {
    const bookId = osisID.split(".")[0];
    const doc = this.bookDocs.get(bookId);

    if (!doc) {
      console.warn(`BibleEngine: Book ${bookId} not loaded`);
      return null;
    }

    const parts = osisID.split(".");
    let words: VerseWord[] = [];

    // Strategy A: Flat/Milestone (e.g. <verse-number id="Mark 1:1" /> ... <w>...)
    const spaceSeparatedId = `${parts[0]} ${parts[1]}:${parts[2]}`;
    let verseNumberNode =
      doc.querySelector(`verse-number[id="${spaceSeparatedId}"]`) ||
      doc.querySelector(`verse-number[osisID="${spaceSeparatedId}"]`) ||
      doc.querySelector(`verse-number[id="${osisID}"]`);

    if (verseNumberNode) {
      let currentNode = verseNumberNode.nextElementSibling;
      while (currentNode) {
        const tagName = currentNode.tagName.toLowerCase();
        if (tagName === "verse-number" || tagName === "chapter") break;
        if (tagName === "w") {
          words.push(this.mapWordElement(currentNode, bookId, words.length));
        }
        currentNode = currentNode.nextElementSibling;
      }
    }

    // Strategy B: Container (e.g. <verse osisID="Gen.1.1"><w>...</verse>)
    if (words.length === 0) {
      let verseNode =
        doc.querySelector(`verse[osisID="${osisID}"]`) ||
        doc.querySelector(`div[type="verse"][osisID="${osisID}"]`) ||
        doc.querySelector(`[osisID="${osisID}"]`);

      if (verseNode) {
        const wordNodes = verseNode.querySelectorAll("w");
        wordNodes.forEach((w, i) => {
          words.push(this.mapWordElement(w, bookId, i));
        });
      }
    }

    if (words.length === 0) return null;

    return {
      osisID,
      words,
      book: parts[0],
      chapter: parseInt(parts[1]),
      verse: parseInt(parts[2]),
    };
  }
}

export const engine = new BibleEngine();
