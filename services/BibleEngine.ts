import { ParsedVerse, VerseWord } from "../types";
import { BIBLE_SAMPLE_XML, SHORT_TO_OSIS } from "../constants";

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

    // Map OSIS ID to filename (e.g., Gen -> Genesis.xml, John -> John.xml)
    let fileName = `${osisBookId}.xml`;
    if (osisBookId === "Gen") fileName = "Gen.xml";
    if (osisBookId === "John") fileName = "John.xml";

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
   * Retrieves a verse from the cached book documents.
   * Handles flat XML structure where <verse-number> is a sibling of words.
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

    // Convert OSIS format (e.g., "Mark.1.1") to space-separated format (e.g., "Mark 1:1")
    const parts = osisID.split(".");
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

    if (!verseNumberNode) {
      console.error(
        "❌ BibleEngine: Verse-number node not found for osisID:",
        osisID,
        "or space-separated ID:",
        spaceSeparatedId
      );
      console.log(
        "BibleEngine: Available verse-number elements:",
        Array.from(doc.querySelectorAll("verse-number"))
          .slice(0, 5)
          .map((el) => ({
            tag: el.tagName,
            id: el.getAttribute("id"),
            osisID: el.getAttribute("osisID"),
          }))
      );
      return null;
    }

    console.log(`✅ BibleEngine: Verse-number node found for osisID:`, osisID);

    // Collect <w> elements from siblings after the verse-number element
    const words: VerseWord[] = [];
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
        const lemmaValue = currentNode.getAttribute("lemma") || "";
        // Strip common OSIS prefixes like 'strong:' if they exist, then prepend our internal H/G
        const rawStrongs = (
          currentNode.getAttribute("strongs") || lemmaValue
        ).replace(/^strong:/, "");

        const word = {
          text: currentNode.textContent?.trim() || "",
          lemma: lemmaValue,
          morph: currentNode.getAttribute("morph") || "",
          strongs: `${this.isOT(bookId) ? "H" : "G"}${rawStrongs}`,
          id:
            currentNode.getAttribute("id") ||
            `w-${Math.random().toString(36).substr(2, 9)}`,
        };

        if (words.length < 3) {
          console.log(`BibleEngine: Word ${words.length}:`, word);
        }

        words.push(word);
      }

      currentNode = currentNode.nextElementSibling;
    }

    console.log(
      "BibleEngine: Collected",
      words.length,
      "word nodes from siblings"
    );

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
