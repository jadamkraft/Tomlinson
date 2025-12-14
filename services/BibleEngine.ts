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
  private dictionary: Map<string, string> = new Map();

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
   * Parses dictionary XML for Greek or Hebrew entries.
   * Greek: Parses <entry strongs="0001"> and extracts definition from <strongs_def>.
   * Hebrew: Parses <w ID="H1"> and extracts definition from <note type="explanation">.
   */
  public parseDictionaryXML(xml: string, type: "GREEK" | "HEBREW"): void {
    console.log(`BibleEngine: parseDictionaryXML() called for type: ${type}`);
    try {
      const doc = this.parser.parseFromString(xml, "text/xml");

      // Check for parser errors
      const parserError = doc.querySelector("parsererror");
      if (parserError) {
        console.warn(
          `BibleEngine: XML parser error in dictionary (${type}):`,
          parserError.textContent
        );
        return;
      }

      if (type === "GREEK") {
        // Greek format: <entry strongs="0001">
        const entries = doc.querySelectorAll("entry[strongs]");
        console.log(
          `BibleEngine: Found ${entries.length} Greek dictionary entries`
        );

        entries.forEach((entry, index) => {
          const strongsAttr = entry.getAttribute("strongs");
          if (!strongsAttr) {
            if (index < 5) {
              console.warn(
                `BibleEngine: Greek entry at index ${index} missing strongs attribute`
              );
            }
            return;
          }

          // Convert "0001" -> "G1" (remove leading zeros, add G prefix)
          const numericId = parseInt(strongsAttr, 10).toString();
          const key = `G${numericId}`;

          // Extract definition from <strongs_def>
          const defElement = entry.querySelector("strongs_def");
          const definition = defElement?.textContent?.trim() || "";

          if (definition) {
            this.dictionary.set(key, definition);
          } else {
            if (index < 5) {
              console.warn(
                `BibleEngine: Greek entry ${key} missing definition`
              );
            }
          }
        });

        console.log(
          `BibleEngine: Loaded ${this.dictionary.size} Greek dictionary entries`
        );
      } else {
        // Hebrew format: <w ID="H1">
        const wordElements = doc.querySelectorAll("w[ID]");
        console.log(
          `BibleEngine: Found ${wordElements.length} Hebrew dictionary entries`
        );

        wordElements.forEach((wordEl, index) => {
          const idAttr = wordEl.getAttribute("ID");
          if (!idAttr) {
            if (index < 5) {
              console.warn(
                `BibleEngine: Hebrew entry at index ${index} missing ID attribute`
              );
            }
            return;
          }

          // ID should already be in format "H1", "H2", etc.
          const key = idAttr;

          // Extract definition from <note type="explanation">
          const noteElement = wordEl.querySelector('note[type="explanation"]');
          const definition = noteElement?.textContent?.trim() || "";

          if (definition) {
            this.dictionary.set(key, definition);
          } else {
            if (index < 5) {
              console.warn(
                `BibleEngine: Hebrew entry ${key} missing definition`
              );
            }
          }
        });

        console.log(
          `BibleEngine: Loaded ${this.dictionary.size} Hebrew dictionary entries`
        );
      }
    } catch (error) {
      console.warn(
        `BibleEngine: Error parsing dictionary XML (${type}):`,
        error
      );
    }
  }

  /**
   * Initializes the engine. For now, it just parses the static sample XML.
   */
  async initialize(xmlString: string = BIBLE_SAMPLE_XML): Promise<void> {
    try {
      console.log("BibleEngine: initialize() called");
      console.log("BibleEngine: XML string length:", xmlString?.length || 0);
      console.log(
        "BibleEngine: XML string preview (first 200 chars):",
        xmlString?.substring(0, 200)
      );

      const doc = this.parser.parseFromString(xmlString, "text/xml");
      console.log("BibleEngine: Parser returned document:", doc);
      console.log("BibleEngine: Document type:", doc?.constructor?.name);
      console.log("BibleEngine: Document element:", doc?.documentElement);
      console.log(
        "BibleEngine: Document element tagName:",
        doc?.documentElement?.tagName
      );

      const parserError = doc.querySelector("parsererror");
      if (parserError) {
        console.error(
          "BibleEngine: Parser error found:",
          parserError.textContent
        );
        throw new Error(parserError.textContent || "XML parsing error");
      }

      // Cache initial sample books
      const books = doc.querySelectorAll('div[type="book"]');
      console.log("BibleEngine: Found", books.length, "book nodes");

      books.forEach((bookNode, index) => {
        const bookId = bookNode.getAttribute("osisID");
        console.log(
          `BibleEngine: Processing book ${index + 1}, osisID:`,
          bookId
        );
        if (bookId) {
          // Create a standalone document for this book
          const bookDoc = document.implementation.createDocument(
            null,
            "osis",
            null
          );
          bookDoc.documentElement.appendChild(
            bookDoc.importNode(bookNode, true)
          );
          this.bookDocs.set(bookId, bookDoc);
          console.log(
            `BibleEngine: Cached book ${bookId}, bookDocs size:`,
            this.bookDocs.size
          );
        } else {
          console.warn("BibleEngine: Book node missing osisID attribute");
        }
      });

      console.log(
        "BibleEngine: Initialized with sample data. Total books cached:",
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
    console.log("BibleEngine: loadBook() called with osisBookId:", osisBookId);
    console.log("BibleEngine: Checking if book already cached...");
    if (this.bookDocs.has(osisBookId)) {
      console.log(
        "BibleEngine: Book",
        osisBookId,
        "already cached, returning early"
      );
      return;
    }

    // Normalize the book ID and map to filename
    const normalizedBookId = normalizeBookId(osisBookId);
    const fileName =
      BOOK_FILENAME_MAP[normalizedBookId] ||
      BOOK_FILENAME_MAP[normalizedBookId.toLowerCase()] ||
      BOOK_FILENAME_MAP[
        normalizedBookId.charAt(0).toUpperCase() +
          normalizedBookId.slice(1).toLowerCase()
      ] ||
      `${normalizedBookId}.xml`;
    console.log(
      "BibleEngine: Mapped osisBookId:",
      osisBookId,
      "(normalized:",
      normalizedBookId,
      ") to filename:",
      fileName
    );

    const path = `/assets/${fileName}`;
    const fullUrl = window.location.origin + path;
    console.log("🌐 BibleEngine: EXACT URL being fetched:", fullUrl);
    console.log("🌐 BibleEngine: Relative path:", path);

    try {
      const response = await fetch(path);
      console.log("🌐 BibleEngine: Fetch completed");
      console.log("🌐 BibleEngine: response.status:", response.status);
      console.log("🌐 BibleEngine: response.statusText:", response.statusText);
      console.log(
        "BibleEngine: Fetch response status:",
        response.status,
        response.statusText
      );
      console.log("BibleEngine: Fetch response ok:", response.ok);
      console.log(
        "BibleEngine: Fetch response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);

      const xmlString = await response.text();
      console.log(
        "BibleEngine: Raw response text length:",
        xmlString?.length || 0
      );
      console.log(
        "🔍 BibleEngine: First 50 characters of response:",
        xmlString?.substring(0, 50)
      );
      console.log(
        "🔍 BibleEngine: Response starts with '<' (XML)?",
        xmlString?.startsWith("<")
      );
      console.log(
        "🔍 BibleEngine: Response starts with '<!DOCTYPE' (HTML)?",
        xmlString?.startsWith("<!DOCTYPE")
      );
      console.log(
        "🔍 BibleEngine: Response starts with '<html' (HTML)?",
        xmlString?.toLowerCase().startsWith("<html")
      );

      // Soft 404 check: throw error if response is HTML (likely a 404 page)
      if (
        xmlString?.startsWith("<!DOCTYPE") ||
        xmlString?.toLowerCase().startsWith("<html")
      ) {
        throw new Error(
          `Soft 404: Received HTML response instead of XML for ${path}. The file may not exist.`
        );
      }
      console.log(
        "BibleEngine: Raw response text preview (first 500 chars):",
        xmlString?.substring(0, 500)
      );
      console.log(
        "BibleEngine: Raw response text is empty?",
        !xmlString || xmlString.length === 0
      );

      const doc = this.parser.parseFromString(xmlString, "text/xml");
      console.log("BibleEngine: Parser returned document:", doc);
      console.log(
        "BibleEngine: Document is null/undefined?",
        doc === null || doc === undefined
      );
      console.log("BibleEngine: Document element:", doc?.documentElement);
      console.log(
        "BibleEngine: Document element tagName:",
        doc?.documentElement?.tagName
      );

      // Check for parser errors
      const parserError = doc.querySelector("parsererror");
      if (parserError) {
        console.error(
          "BibleEngine: XML parser error:",
          parserError.textContent
        );
        throw new Error(`XML parsing error: ${parserError.textContent}`);
      }

      // Log the XML structure to help debug
      console.log(
        "BibleEngine: XML structure preview:",
        doc.documentElement.innerHTML.slice(0, 500)
      );

      // First, try to find any <book> element (ignore ID matching)
      let bookNode = doc.querySelector("book");
      console.log("BibleEngine: Looking for generic <book> element");
      console.log("BibleEngine: bookNode found:", bookNode !== null);
      if (bookNode) {
        console.log(
          "BibleEngine: Found <book> element (ignoring ID match), tag:",
          bookNode.tagName,
          "id:",
          bookNode.getAttribute("id"),
          "osisID:",
          bookNode.getAttribute("osisID")
        );
      }

      // Fallback: Only search by ID if no generic <book> element was found
      if (!bookNode) {
        console.log(
          "BibleEngine: No generic <book> element found, trying ID-based search..."
        );
        // Try the more flexible selector (without div constraint)
        bookNode = doc.querySelector(`[osisID="${osisBookId}"]`);
        console.log("BibleEngine: Looking for [osisID='" + osisBookId + "']");
        console.log("BibleEngine: bookNode found:", bookNode !== null);
        console.log("BibleEngine: bookNode:", bookNode);

        // Additional fallback: search for any element with that osisID attribute
        if (!bookNode) {
          console.log(
            "BibleEngine: Primary ID selector failed, trying fallback search..."
          );
          const allElements = doc.querySelectorAll("*");
          for (let i = 0; i < allElements.length; i++) {
            const element = allElements[i];
            if (element.getAttribute("osisID") === osisBookId) {
              bookNode = element;
              console.log(
                "BibleEngine: Found book node via fallback search:",
                element.tagName,
                element
              );
              break;
            }
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
        console.log(
          `BibleEngine: Loaded full book ${osisBookId} from assets. bookDocs size:`,
          this.bookDocs.size
        );
      } else {
        console.warn(
          "BibleEngine: Book node not found in parsed document for",
          osisBookId
        );
        console.log(
          "BibleEngine: Available div elements:",
          doc.querySelectorAll("div").length
        );
        console.log(
          "BibleEngine: All div[type='book'] elements:",
          Array.from(doc.querySelectorAll('div[type="book"]')).map((d) =>
            d.getAttribute("osisID")
          )
        );
      }
    } catch (e) {
      console.error(
        `BibleEngine: Failed to load book ${osisBookId} from ${path}:`,
        e
      );
      console.warn(`BibleEngine: Using sample if available.`);
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
    // For Greek XML format: lemma attribute contains Strong's ID (e.g., "G1234")
    const lemmaValue = w.getAttribute("lemma") || "";
    const morphValue = w.getAttribute("morph") || "";

    // Determine strongsId from lemma (Greek XML format) or strongs attribute
    let strongsId: string | null = null;
    if (lemmaValue) {
      // Check if lemma is already in Strong's format (G1234, H1234)
      if (/^[GH]\d+/.test(lemmaValue)) {
        strongsId = lemmaValue;
      } else {
        // Try to extract from lemma or use strongs attribute
        const rawStrongs = (w.getAttribute("strongs") || lemmaValue).replace(
          /^strong:/,
          ""
        );
        if (rawStrongs) {
          strongsId = `${this.isOT(bookId) ? "H" : "G"}${rawStrongs}`;
        }
      }
    } else {
      // Fallback to strongs attribute if lemma is empty
      const rawStrongs = w.getAttribute("strongs")?.replace(/^strong:/, "");
      if (rawStrongs) {
        strongsId = `${this.isOT(bookId) ? "H" : "G"}${rawStrongs}`;
      }
    }

    // If mapping failed, log warning but don't crash
    if (!strongsId && index < 5) {
      console.warn(
        `BibleEngine: Word ${index} - lemma mapping failed. lemma: "${lemmaValue}", strongs: "${w.getAttribute(
          "strongs"
        )}"`
      );
    }

    const word: VerseWord = {
      text: w.textContent?.trim() || "",
      lemma: lemmaValue,
      morph: morphValue,
      strongs: strongsId || "", // Return empty string if mapping failed
      id:
        w.getAttribute("id") || `w-${Math.random().toString(36).substr(2, 9)}`,
    };

    if (index < 3) {
      console.log(`BibleEngine: Word ${index}:`, word);
    }

    return word;
  }

  /**
   * Gets a definition from the loaded dictionary by Strong's ID.
   * @param id Strong's ID in format "G1234" or "H1234"
   * @returns Definition text or null if not found
   */
  public getDefinition(id: string): string | null {
    if (!id) {
      console.warn("BibleEngine: getDefinition() called with empty ID");
      return null;
    }

    // Normalize the ID (ensure it starts with G or H)
    const normalizedId = id.trim();
    const definition = this.dictionary.get(normalizedId);

    if (!definition) {
      console.warn(
        `BibleEngine: Definition not found for ID: ${normalizedId} (dictionary size: ${this.dictionary.size})`
      );
      return null;
    }

    return definition;
  }

  /**
   * Retrieves a verse from the cached book documents.
   * Supports both flat XML structure (verse-number siblings) and container format (verse elements).
   */
  public getVerse(osisID: string): ParsedVerse | null {
    console.log("BibleEngine: getVerse() called with osisID:", osisID);
    const bookId = osisID.split(".")[0];
    console.log("BibleEngine: Extracted bookId:", bookId);
    console.log(
      "BibleEngine: Current bookDocs keys:",
      Array.from(this.bookDocs.keys())
    );

    const doc = this.bookDocs.get(bookId);
    console.log(
      "BibleEngine: Document found for bookId:",
      doc !== null && doc !== undefined
    );
    console.log("BibleEngine: Document:", doc);

    if (!doc) {
      console.warn("BibleEngine: No document found for bookId:", bookId);
      return null;
    }

    const parts = osisID.split(".");
    let words: VerseWord[] = [];

    // ============================================
    // Strategy A: Flat/Milestone Format
    // ============================================
    console.log("BibleEngine: Trying Strategy A (Flat/Milestone format)...");

    // Convert OSIS format (e.g., "Mark.1.1") to space-separated format (e.g., "Mark 1:1")
    const spaceSeparatedId = `${parts[0]} ${parts[1]}:${parts[2]}`;
    console.log(
      "BibleEngine: Converted osisID to space-separated format:",
      spaceSeparatedId
    );

    // Find the <verse-number> element using the space-separated ID
    let verseNumberNode: Element | null = null;

    // Try finding by id attribute first
    verseNumberNode = doc.querySelector(
      `verse-number[id="${spaceSeparatedId}"]`
    );
    if (!verseNumberNode) {
      // Try osisID attribute
      verseNumberNode = doc.querySelector(
        `verse-number[osisID="${spaceSeparatedId}"]`
      );
    }
    if (!verseNumberNode) {
      // Try generic selector
      verseNumberNode = doc.querySelector(`verse-number[id="${osisID}"]`);
    }
    if (!verseNumberNode) {
      // Fallback: search all verse-number elements
      const allVerseNumbers = doc.querySelectorAll("verse-number");
      console.log(
        "BibleEngine: Found",
        allVerseNumbers.length,
        "verse-number elements, searching manually..."
      );
      for (let i = 0; i < allVerseNumbers.length; i++) {
        const element = allVerseNumbers[i];
        const elementId = element.getAttribute("id");
        const elementOsisId = element.getAttribute("osisID");
        if (
          elementId === spaceSeparatedId ||
          elementOsisId === spaceSeparatedId ||
          elementId === osisID ||
          elementOsisId === osisID
        ) {
          verseNumberNode = element;
          console.log(
            "BibleEngine: Found verse-number via manual search:",
            elementId,
            elementOsisId
          );
          break;
        }
      }
    }

    if (verseNumberNode) {
      console.log(
        `✅ BibleEngine: Verse-number node found (Strategy A) for osisID:`,
        osisID
      );

      // Collect <w> elements from siblings after the verse-number element
      let currentNode: Element | null = verseNumberNode.nextElementSibling;

      console.log(
        "BibleEngine: Starting to collect word siblings from verse-number..."
      );

      while (currentNode !== null) {
        const tagName = currentNode.tagName.toLowerCase();

        // Stop if we hit the next verse-number, chapter, or end
        if (tagName === "verse-number" || tagName === "chapter") {
          console.log(
            "BibleEngine: Stopping at",
            tagName,
            "tag. Collected",
            words.length,
            "words"
          );
          break;
        }

        // Collect <w> elements
        if (tagName === "w") {
          words.push(this.mapWordElement(currentNode, bookId, words.length));
        }

        currentNode = currentNode.nextElementSibling;
      }

      console.log(
        "BibleEngine: Strategy A collected",
        words.length,
        "word nodes from siblings"
      );
    } else {
      console.log(
        "BibleEngine: Strategy A failed - no verse-number found, trying Strategy B..."
      );
    }

    // ============================================
    // Strategy B: Container/Standard Format (FALLBACK)
    // ============================================
    if (words.length === 0) {
      console.log(
        "BibleEngine: Trying Strategy B (Container/Standard format)..."
      );

      // Use original OSIS format (dot-separated, e.g., "Gen.1.1")
      let verseNode: Element | null = null;

      // Try <verse> element with osisID
      verseNode = doc.querySelector(`verse[osisID="${osisID}"]`);
      if (!verseNode) {
        // Try <div type="verse"> with osisID
        verseNode = doc.querySelector(`div[type="verse"][osisID="${osisID}"]`);
      }
      if (!verseNode) {
        // Try generic selector without tag constraint
        verseNode = doc.querySelector(`[osisID="${osisID}"]`);
      }
      if (!verseNode) {
        // Fallback: search all elements
        const allElements = doc.querySelectorAll("*");
        for (let i = 0; i < allElements.length; i++) {
          const element = allElements[i];
          if (element.getAttribute("osisID") === osisID) {
            verseNode = element;
            console.log(
              "BibleEngine: Found verse node via fallback search:",
              element.tagName,
              element
            );
            break;
          }
        }
      }

      if (verseNode) {
        console.log(
          `✅ BibleEngine: Verse container node found (Strategy B) for osisID:`,
          osisID
        );

        // Collect <w> elements from children
        const wordNodes = verseNode.querySelectorAll("w");
        console.log(
          "BibleEngine: Found",
          wordNodes.length,
          "word nodes in verse container"
        );

        wordNodes.forEach((w, index) => {
          words.push(this.mapWordElement(w, bookId, index));
        });

        console.log(
          "BibleEngine: Strategy B collected",
          words.length,
          "word nodes from container children"
        );
      } else {
        console.error(
          "❌ BibleEngine: Verse node not found for osisID:",
          osisID,
          "- Both Strategy A and Strategy B failed!"
        );
        console.log(
          "BibleEngine: Available elements with osisID attribute:",
          Array.from(doc.querySelectorAll("[osisID]"))
            .slice(0, 5)
            .map((el) => ({
              tag: el.tagName,
              osisID: el.getAttribute("osisID"),
            }))
        );
        return null;
      }
    }

    // ============================================
    // Common Output
    // ============================================
    const parsedVerse = {
      osisID,
      words,
      book: parts[0],
      chapter: parseInt(parts[1]),
      verse: parseInt(parts[2]),
    };

    console.log("BibleEngine: Returning parsed verse:", {
      osisID: parsedVerse.osisID,
      book: parsedVerse.book,
      chapter: parsedVerse.chapter,
      verse: parsedVerse.verse,
      wordCount: parsedVerse.words.length,
    });

    return parsedVerse;
  }
}

export const engine = new BibleEngine();
