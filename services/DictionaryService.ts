export interface DictionaryEntry {
  word: string;
  def: string;
}

export class DictionaryService {
  private greekEntries: Map<string, DictionaryEntry> = new Map();
  private hebrewEntries: Map<string, DictionaryEntry> = new Map();
  private initialized = false;

  /**
   * Loads both dictionary XML files and parses them into memory.
   */
  async initialize(): Promise<void> {
    console.log("DictionaryService: initialize() called");
    console.log("DictionaryService: Already initialized?", this.initialized);

    if (this.initialized) {
      console.log("DictionaryService: Already initialized, returning early");
      return;
    }

    try {
      console.log(
        "DictionaryService: Starting parallel load of Greek and Hebrew dictionaries..."
      );
      await Promise.all([
        this.loadDictionary("/assets/strongs_greek.xml", this.greekEntries),
        this.loadDictionary("/assets/strongs_hebrew.xml", this.hebrewEntries),
      ]);

      console.log("DictionaryService: Both dictionaries loaded successfully");
      this.initialized = true;
      console.log(
        `DictionaryService: Loaded ${this.greekEntries.size} Greek and ${this.hebrewEntries.size} Hebrew entries.`
      );
    } catch (error) {
      console.error("DictionaryService: Initialization failed:", error);
      throw error;
    }
  }

  private async loadDictionary(
    path: string,
    targetMap: Map<string, DictionaryEntry>
  ): Promise<void> {
    console.log("DictionaryService: loadDictionary() called for path:", path);
    try {
      console.log("DictionaryService: Fetching from path:", path);
      const response = await fetch(path);
      console.log(
        "DictionaryService: Fetch response status:",
        response.status,
        response.statusText
      );
      console.log("DictionaryService: Fetch response ok:", response.ok);

      if (!response.ok) {
        console.warn(
          `DictionaryService: Failed to load ${path} - Status:`,
          response.status
        );
        return;
      }

      const xmlString = await response.text();
      console.log(
        "DictionaryService: Raw response text length for",
        path,
        ":",
        xmlString?.length || 0
      );
      console.log(
        "DictionaryService: Raw response text preview (first 500 chars):",
        xmlString?.substring(0, 500)
      );
      console.log(
        "DictionaryService: Raw response text is empty?",
        !xmlString || xmlString.length === 0
      );

      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlString, "text/xml");
      console.log(
        "DictionaryService: Parser returned document for",
        path,
        ":",
        doc
      );
      console.log(
        "DictionaryService: Document is null/undefined?",
        doc === null || doc === undefined
      );
      console.log("DictionaryService: Document element:", doc?.documentElement);
      console.log(
        "DictionaryService: Document element tagName:",
        doc?.documentElement?.tagName
      );

      // Check for parser errors
      const parserError = doc.querySelector("parsererror");
      if (parserError) {
        console.error(
          "DictionaryService: XML parser error for",
          path,
          ":",
          parserError.textContent
        );
        throw new Error(`XML parsing error: ${parserError.textContent}`);
      }

      const entryNodes = doc.querySelectorAll("entry");
      console.log(
        "DictionaryService: Found",
        entryNodes.length,
        "entry nodes in",
        path
      );

      let entriesAdded = 0;
      entryNodes.forEach((node, index) => {
        const id = node.getAttribute("id");
        const word = node.querySelector("w")?.textContent || "";
        const def = node.querySelector("def")?.textContent || "";

        if (index < 3) {
          console.log(
            `DictionaryService: Entry ${index} - id:`,
            id,
            "word:",
            word,
            "def preview:",
            def?.substring(0, 50)
          );
        }

        if (id) {
          targetMap.set(id, { word, def });
          entriesAdded++;
        } else {
          console.warn(
            "DictionaryService: Entry node missing id attribute at index",
            index
          );
        }
      });

      console.log(
        "DictionaryService: Added",
        entriesAdded,
        "entries to map for",
        path
      );
      console.log("DictionaryService: Total entries in map:", targetMap.size);
    } catch (e) {
      console.error(`DictionaryService: Error parsing ${path}:`, e);
      throw e;
    }
  }

  /**
   * Returns definition for a given Strong's ID.
   * Routes to the correct dictionary based on the prefix 'H' or 'G'.
   * Normalizes compound IDs (like Hb/7225) to extract the root numeric ID.
   */
  public getDefinition(strongsId: string): DictionaryEntry | null {
    if (!strongsId) return null;

    const isHebrew = strongsId.startsWith("H");
    const isGreek = strongsId.startsWith("G");

    // Normalize: extract the first sequence of digits found in the string.
    // This handles prefixes ("Hb/"), suffixes ("1254 a"), and language tags ("H7225").
    const match = strongsId.match(/\d+/);
    if (!match) return null;

    const numericId = match[0];

    if (isHebrew) {
      return this.hebrewEntries.get(numericId) || null;
    }

    if (isGreek) {
      return this.greekEntries.get(numericId) || null;
    }

    // Default fallback: check Greek then Hebrew
    return (
      this.greekEntries.get(numericId) ||
      this.hebrewEntries.get(numericId) ||
      null
    );
  }
}

export const dictionary = new DictionaryService();
