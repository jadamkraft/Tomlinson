export interface DictionaryEntry {
  word: string;
  def: string;
}

export class DictionaryService {
  private greekEntries: Map<string, DictionaryEntry> = new Map();
  private hebrewEntries: Map<string, DictionaryEntry> = new Map();
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await Promise.all([
        this.loadDictionary(
          "/assets/strongs_greek.xml",
          this.greekEntries,
          "G"
        ),
        this.loadDictionary(
          "/assets/strongs_hebrew.xml",
          this.hebrewEntries,
          "H"
        ),
      ]);
      this.initialized = true;
      console.log(
        `Dictionary: Loaded ${this.greekEntries.size} G, ${this.hebrewEntries.size} H`
      );
    } catch (error) {
      console.error("DictionaryService: Init failed", error);
    }
  }

  private async loadDictionary(
    path: string,
    targetMap: Map<string, DictionaryEntry>,
    prefix: "G" | "H"
  ): Promise<void> {
    try {
      const response = await fetch(path);
      if (!response.ok) return;
      const xml = await response.text();
      const doc = new DOMParser().parseFromString(xml, "text/xml");

      const rootTag = doc.documentElement?.tagName || "";

      // STRATEGY: Find all potential entry nodes
      // Greek usually: <entry strongs="1234"> or <entry id="1234">
      // Hebrew usually: <div type="entry" n="1234"> or <w id="1234">

      let nodes: Element[] = [];
      if (rootTag === "strongsdictionary") {
        nodes = Array.from(doc.querySelectorAll("entry"));
      } else {
        // OSIS / Hebrew fallback
        nodes = Array.from(doc.querySelectorAll('div[type="entry"]'));
        if (nodes.length === 0)
          nodes = Array.from(doc.querySelectorAll('div[type="article"]'));
        if (nodes.length === 0) nodes = Array.from(doc.querySelectorAll("w")); // Some formats use <w>
      }

      let entryCount = 0;
      nodes.forEach((node) => {
        // 1. EXTRACT ID
        // Check 'strongs', 'id', 'n', 'osisID'
        const rawId =
          node.getAttribute("strongs") ||
          node.getAttribute("id") ||
          node.getAttribute("n") ||
          node.getAttribute("osisID");

        if (!rawId) return;

        // Normalize ID: Remove existing prefixes, get purely the number
        const numericId = rawId.match(/\d+/)?.[0]; // "01234" -> "01234"
        if (!numericId) return;

        // Store KEY as just the number (parsed to int to remove leading zeros, then string)
        // e.g. "0001" -> "1"
        const key = parseInt(numericId, 10).toString();

        // 2. EXTRACT WORD
        const word =
          node.querySelector("w")?.textContent ||
          node.querySelector("title")?.textContent ||
          node.querySelector("div[type='title']")?.textContent ||
          "";

        // 3. EXTRACT DEF
        const def =
          node.querySelector("strongs_def")?.textContent || // Greek specific
          node.querySelector("def")?.textContent ||
          node.querySelector("div[type='definition']")?.textContent ||
          node.querySelector("note[type='explanation']")?.textContent ||
          "";

        if (key) {
          targetMap.set(key, { word: word.trim(), def: def.trim() });

          // Debug logging for Greek: log first 3 entries
          if (prefix === "G" && entryCount < 3) {
            console.log(
              `📚 DictionaryService: Greek entry ${entryCount + 1} parsed:`,
              {
                rawId: rawId,
                numericId: numericId,
                key: key,
                word: word.trim(),
                defPreview: def.trim().substring(0, 100),
              }
            );
            entryCount++;
          }
        }
      });
    } catch (e) {
      console.error(`DictionaryService: Error loading ${path}`, e);
    }
  }

  public getDefinition(strongsId: string): DictionaryEntry | null {
    if (!strongsId) return null;

    // Input might be "G1234", "H0123", "1234", "strong:G5"
    const isHebrew = strongsId.startsWith("H") || strongsId.includes("H");

    // Extract the numeric part only
    const match = strongsId.match(/\d+/);
    if (!match) return null;

    // "0012" -> "12" to match our storage key
    const numericKey = parseInt(match[0], 10).toString();

    let result: DictionaryEntry | null = null;
    if (isHebrew) {
      result = this.hebrewEntries.get(numericKey) || null;
    } else {
      // Default to Greek if not explicitly Hebrew (or if G prefix)
      result = this.greekEntries.get(numericKey) || null;
    }

    // Debug logging when lookup fails
    if (!result) {
      console.warn(
        `❌ DictionaryService: Dictionary lookup failed for key: "${strongsId}" (Normalized numeric: "${numericKey}")`,
        {
          isHebrew: isHebrew,
          greekEntriesSize: this.greekEntries.size,
          hebrewEntriesSize: this.hebrewEntries.size,
          checkingMap: isHebrew ? "hebrewEntries" : "greekEntries",
        }
      );
    }

    return result;
  }
}

export const dictionary = new DictionaryService();
