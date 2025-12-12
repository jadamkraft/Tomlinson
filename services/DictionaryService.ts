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
    if (this.initialized) return;
    
    try {
      await Promise.all([
        this.loadDictionary('/assets/strongs_greek.xml', this.greekEntries),
        this.loadDictionary('/assets/strongs_hebrew.xml', this.hebrewEntries)
      ]);
      
      this.initialized = true;
      console.log(`DictionaryService: Loaded ${this.greekEntries.size} Greek and ${this.hebrewEntries.size} Hebrew entries.`);
    } catch (error) {
      console.error("DictionaryService: Initialization failed:", error);
      throw error;
    }
  }

  private async loadDictionary(path: string, targetMap: Map<string, DictionaryEntry>): Promise<void> {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        console.warn(`DictionaryService: Failed to load ${path}`);
        return;
      }
      
      const xmlString = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlString, "text/xml");
      
      const entryNodes = doc.querySelectorAll('entry');
      entryNodes.forEach(node => {
        const id = node.getAttribute('id');
        const word = node.querySelector('w')?.textContent || '';
        const def = node.querySelector('def')?.textContent || '';
        
        if (id) {
          targetMap.set(id, { word, def });
        }
      });
    } catch (e) {
      console.error(`DictionaryService: Error parsing ${path}`, e);
    }
  }

  /**
   * Returns definition for a given Strong's ID.
   * Routes to the correct dictionary based on the prefix 'H' or 'G'.
   * Normalizes compound IDs (like Hb/7225) to extract the root numeric ID.
   */
  public getDefinition(strongsId: string): DictionaryEntry | null {
    if (!strongsId) return null;

    const isHebrew = strongsId.startsWith('H');
    const isGreek = strongsId.startsWith('G');
    
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
    return this.greekEntries.get(numericId) || this.hebrewEntries.get(numericId) || null;
  }
}

export const dictionary = new DictionaryService();