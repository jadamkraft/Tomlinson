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

      // Detect XML format by checking root tag
      const rootTag = doc.documentElement?.tagName || "";
      console.log(
        "DictionaryService: Detected root tag:",
        rootTag,
        "for path:",
        path
      );

      let entriesAdded = 0;

      if (rootTag === "strongsdictionary") {
        // Greek format: Use existing logic but fix ID attribute reading
        console.log(
          "DictionaryService: Parsing as Greek (strongsdictionary) format"
        );
        const entryNodes = doc.querySelectorAll("entry");
        console.log(
          "DictionaryService: Found",
          entryNodes.length,
          "entry nodes in",
          path
        );

        entryNodes.forEach((node, index) => {
          // Prioritize 'strongs' attribute over 'id'
          const id = node.getAttribute("strongs") || node.getAttribute("id");
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
            console.log(
              `DictionaryService: Entry ${index} - id attribute:`,
              node.getAttribute("id"),
              "strongs attribute:",
              node.getAttribute("strongs")
            );
          }

          if (id) {
            targetMap.set(id, { word, def });
            entriesAdded++;
          } else {
            // Only log for first 5 failures to avoid console flooding
            if (index < 5) {
              console.warn(
                "DictionaryService: Entry node missing both id and strongs attributes at index",
                index
              );
            }
          }
        });
      } else if (rootTag === "osis" || rootTag === "osisText") {
        // Hebrew format: OSIS XML structure
        console.log("DictionaryService: Parsing as Hebrew (OSIS) format");

        // Log the structure to understand it better
        const osisText = doc.querySelector("osisText") || doc.documentElement;
        console.log(
          "DictionaryService: osisText element:",
          osisText?.tagName,
          osisText
        );

        // Log first 5 children to understand structure
        const children = Array.from(osisText?.children || []);
        console.log(
          "DictionaryService: First 5 children of osisText:",
          children.slice(0, 5).map((child) => ({
            tag: child.tagName,
            type: child.getAttribute("type"),
            osisID: child.getAttribute("osisID"),
            id: child.getAttribute("id"),
          }))
        );

        // Try different selectors for OSIS format
        let entryNodes: NodeListOf<Element> | Element[] =
          doc.querySelectorAll('div[type="entry"]');
        console.log(
          "DictionaryService: Found",
          entryNodes.length,
          'div[type="entry"] nodes'
        );

        if (entryNodes.length === 0) {
          entryNodes = Array.from(doc.querySelectorAll('div[type="article"]'));
          console.log(
            "DictionaryService: Found",
            entryNodes.length,
            'div[type="article"] nodes'
          );
        }

        if (entryNodes.length === 0) {
          // Try searching for any div with osisID or id attribute
          const allDivs = doc.querySelectorAll("div");
          console.log(
            "DictionaryService: Total div elements found:",
            allDivs.length
          );
          entryNodes = Array.from(allDivs).filter(
            (div) =>
              div.getAttribute("osisID") ||
              div.getAttribute("id") ||
              div.getAttribute("type")
          );
          console.log(
            "DictionaryService: Filtered divs with attributes:",
            entryNodes.length
          );
        }

        entryNodes.forEach((node, index) => {
          // Try multiple attribute sources for ID (including 'n')
          const id =
            node.getAttribute("osisID") ||
            node.getAttribute("id") ||
            node.getAttribute("strongs") ||
            node.getAttribute("n");

          // Debug: For the very first entry, log all attribute names and values
          if (index === 0) {
            const attributeNames = node.getAttributeNames();
            const attributeMap: Record<string, string> = {};
            attributeNames.forEach((attrName) => {
              attributeMap[attrName] = node.getAttribute(attrName) || "";
            });
            console.log(
              "DictionaryService: First Hebrew entry (index 0) - All attributes:",
              attributeMap
            );
            console.log(
              "DictionaryService: First Hebrew entry (index 0) - Attribute names:",
              attributeNames
            );
          }

          // Try different selectors for word and definition
          const word =
            node.querySelector("w")?.textContent?.trim() ||
            node.querySelector("title")?.textContent?.trim() ||
            node.querySelector("div[type='title']")?.textContent?.trim() ||
            "";

          const def =
            node.querySelector("def")?.textContent?.trim() ||
            node.querySelector("div[type='definition']")?.textContent?.trim() ||
            node.querySelector("p")?.textContent?.trim() ||
            "";

          if (index < 5) {
            console.log(
              `DictionaryService: Hebrew Entry ${index} - id:`,
              id,
              "word:",
              word,
              "def preview:",
              def?.substring(0, 50)
            );
            console.log(
              `DictionaryService: Hebrew Entry ${index} - tag:`,
              node.tagName,
              "type:",
              node.getAttribute("type"),
              "osisID:",
              node.getAttribute("osisID"),
              "id:",
              node.getAttribute("id"),
              "strongs:",
              node.getAttribute("strongs"),
              "n:",
              node.getAttribute("n")
            );
          }

          if (id) {
            targetMap.set(id, { word, def });
            entriesAdded++;
          } else {
            // Only log for first 5 failures to avoid console flooding
            if (index < 5) {
              console.warn(
                "DictionaryService: Hebrew entry node missing id/osisID/strongs/n attributes at index",
                index,
                "tag:",
                node.tagName
              );
            }
          }
        });
      } else {
        console.warn(
          "DictionaryService: Unknown XML format. Root tag:",
          rootTag
        );
        // Fallback: try the original entry selector
        const entryNodes = doc.querySelectorAll("entry");
        console.log(
          "DictionaryService: Fallback - Found",
          entryNodes.length,
          "entry nodes"
        );
        entryNodes.forEach((node, index) => {
          // Prioritize 'strongs' attribute over 'id'
          const id = node.getAttribute("strongs") || node.getAttribute("id");
          const word = node.querySelector("w")?.textContent || "";
          const def = node.querySelector("def")?.textContent || "";

          if (id) {
            targetMap.set(id, { word, def });
            entriesAdded++;
          } else {
            // Only log for first 5 failures to avoid console flooding
            if (index < 5) {
              console.warn(
                "DictionaryService: Fallback entry node missing both id and strongs attributes at index",
                index
              );
            }
          }
        });
      }

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
