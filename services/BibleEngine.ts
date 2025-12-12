import { ParsedVerse, VerseWord } from '../types';
import { BIBLE_SAMPLE_XML, SHORT_TO_OSIS } from '../constants';

export class BibleEngine {
  private parser: DOMParser;
  private bookDocs: Map<string, Document> = new Map();

  constructor() {
    this.parser = new DOMParser();
  }

  private isOT(bookId: string): boolean {
    const OT_BOOKS = [
      'Gen', 'Exod', 'Lev', 'Num', 'Deut', 'Josh', 'Judg', 'Ruth', '1Sam', '2Sam', 
      '1Kgs', '2Kgs', '1Chr', '2Chr', 'Ezra', 'Neh', 'Esth', 'Job', 'Ps', 'Prov', 
      'Eccl', 'Song', 'Isa', 'Jer', 'Lam', 'Ezek', 'Dan', 'Hos', 'Joel', 'Amos', 
      'Obad', 'Jonah', 'Mic', 'Nah', 'Hab', 'Zeph', 'Hag', 'Zech', 'Mal'
    ];
    return OT_BOOKS.includes(bookId);
  }

  /**
   * Initializes the engine. For now, it just parses the static sample XML.
   */
  async initialize(xmlString: string = BIBLE_SAMPLE_XML): Promise<void> {
    try {
      const doc = this.parser.parseFromString(xmlString, "text/xml");
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        throw new Error(parserError.textContent || "XML parsing error");
      }
      
      // Cache initial sample books
      const books = doc.querySelectorAll('div[type="book"]');
      books.forEach(bookNode => {
        const bookId = bookNode.getAttribute('osisID');
        if (bookId) {
          // Create a standalone document for this book
          const bookDoc = document.implementation.createDocument(null, 'osis', null);
          bookDoc.documentElement.appendChild(bookDoc.importNode(bookNode, true));
          this.bookDocs.set(bookId, bookDoc);
        }
      });

      console.log("BibleEngine: Initialized with sample data.");
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

    // Map OSIS ID to filename (e.g., Gen -> Genesis.xml, John -> John.xml)
    let fileName = `${osisBookId}.xml`;
    if (osisBookId === 'Gen') fileName = 'Genesis.xml';
    if (osisBookId === 'John') fileName = 'John.xml';

    const path = `/assets/${fileName}`;
    
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
      
      const xmlString = await response.text();
      const doc = this.parser.parseFromString(xmlString, "text/xml");
      
      const bookNode = doc.querySelector(`div[osisID="${osisBookId}"]`);
      if (bookNode) {
        const bookDoc = document.implementation.createDocument(null, 'osis', null);
        bookDoc.documentElement.appendChild(bookDoc.importNode(bookNode, true));
        this.bookDocs.set(osisBookId, bookDoc);
        console.log(`BibleEngine: Loaded full book ${osisBookId} from assets.`);
      }
    } catch (e) {
      console.warn(`BibleEngine: Failed to load book ${osisBookId} from ${path}. Using sample if available.`);
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

    const osisBook = SHORT_TO_OSIS[bookInput] || (bookInput.charAt(0).toUpperCase() + bookInput.slice(1));
    
    return `${osisBook}.${chapter}.${verse}`;
  }

  /**
   * Retrieves a verse from the cached book documents.
   */
  public getVerse(osisID: string): ParsedVerse | null {
    const bookId = osisID.split('.')[0];
    const doc = this.bookDocs.get(bookId);
    
    if (!doc) return null;

    const verseNode = doc.querySelector(`verse[osisID="${osisID}"]`);
    if (!verseNode) return null;

    const words: VerseWord[] = [];
    const wordNodes = verseNode.querySelectorAll('w');
    const prefix = this.isOT(bookId) ? 'H' : 'G';

    wordNodes.forEach((w) => {
      const lemmaValue = w.getAttribute('lemma') || "";
      // Strip common OSIS prefixes like 'strong:' if they exist, then prepend our internal H/G
      const rawStrongs = (w.getAttribute('strongs') || lemmaValue).replace(/^strong:/, '');
      
      words.push({
        text: w.textContent?.trim() || "",
        lemma: lemmaValue,
        morph: w.getAttribute('morph') || "",
        strongs: `${prefix}${rawStrongs}`,
        id: w.getAttribute('id') || `w-${Math.random().toString(36).substr(2, 9)}`
      });
    });

    const parts = osisID.split('.');
    return {
      osisID,
      words,
      book: parts[0],
      chapter: parseInt(parts[1]),
      verse: parseInt(parts[2])
    };
  }
}

export const engine = new BibleEngine();