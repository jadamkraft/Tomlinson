
export class MorphDecoder {
  /**
   * Decodes Hebrew or Greek morphology codes into human-readable strings.
   * Handles compound codes separated by slashes (e.g., HTd/Ncmpa).
   */
  static decode(code: string): string {
    if (!code) return "Unknown";

    // Handle Hebrew (usually starts with H)
    if (code.startsWith('H')) {
      const parts = code.substring(1).split('/');
      return parts.map(p => this.decodeHebrewSegment(p)).join(' + ');
    }

    // Handle Greek or others (split by slash if present)
    const segments = code.split('/');
    return segments.map(s => this.decodeGreek(s)).join(' + ');
  }

  private static decodeHebrewSegment(seg: string): string {
    if (!seg) return "";

    const posMap: Record<string, string> = {
      'N': 'Noun',
      'V': 'Verb',
      'A': 'Adjective',
      'R': 'Preposition',
      'T': 'Particle',
      'C': 'Conjunction',
      'P': 'Pronoun',
      'D': 'Adverb',
      'S': 'Suffix'
    };

    const posChar = seg[0];
    let result = posMap[posChar] || posChar;
    const details = seg.substring(1);

    // Particle/Article Subtypes
    if (posChar === 'T') {
      const tMap: Record<string, string> = {
        'd': 'Article',
        'o': 'Direct Object Marker',
        'r': 'Relative Particle',
        'i': 'Interrogative Particle',
        'm': 'Exclamatory Particle'
      };
      if (details[0] && tMap[details[0]]) {
        result = tMap[details[0]];
      }
    }
    // Noun / Adjective Positional Attributes
    else if (posChar === 'N' || posChar === 'A') {
      const typeMap: Record<string, string> = { 'c': 'Common', 'p': 'Proper', 'g': 'Gentilic' };
      const genMap: Record<string, string> = { 'm': 'Masculine', 'f': 'Feminine', 'c': 'Common' };
      const numMap: Record<string, string> = { 's': 'Singular', 'p': 'Plural', 'd': 'Dual' };
      const stateMap: Record<string, string> = { 'a': 'Absolute', 'c': 'Construct' };
      
      const parts: string[] = [];
      if (details[0]) parts.push(typeMap[details[0]] || details[0]);
      if (details[1]) parts.push(genMap[details[1]] || details[1]);
      if (details[2]) parts.push(numMap[details[2]] || details[2]);
      if (details[3]) parts.push(stateMap[details[3]] || details[3]);
      
      if (parts.length > 0) result += ` ${parts.join(' ')}`;
    } 
    // Verb Positional Attributes
    else if (posChar === 'V') {
      const stemMap: Record<string, string> = { 
        'q': 'Qal', 'n': 'Niphal', 'p': 'Piel', 'P': 'Pual', 
        'h': 'Hiphil', 'H': 'Hophal', 't': 'Hithpael' 
      };
      const aspectMap: Record<string, string> = { 
        'p': 'Perfect', 'i': 'Imperfect', 'w': 'Waw-Consecutive', 
        'v': 'Imperative', 'r': 'Participle', 'a': 'Infinitive Absolute', 
        'c': 'Infinitive Construct' 
      };
      const perMap: Record<string, string> = { '1': '1st', '2': '2nd', '3': '3rd' };
      const genMap: Record<string, string> = { 'm': 'Masculine', 'f': 'Feminine', 'c': 'Common' };
      const numMap: Record<string, string> = { 's': 'Singular', 'p': 'Plural', 'd': 'Dual' };

      const parts: string[] = [];
      if (details[0]) parts.push(stemMap[details[0]] || details[0]);
      if (details[1]) parts.push(aspectMap[details[1]] || details[1]);
      if (details[2]) parts.push(perMap[details[2]] || details[2]);
      if (details[3]) parts.push(genMap[details[3]] || details[3]);
      if (details[4]) parts.push(numMap[details[4]] || details[4]);

      if (parts.length > 0) result += ` ${parts.join(' ')}`;
    }

    return result;
  }

  private static decodeGreek(code: string): string {
    const parts = code.split('-');
    const pos = parts[0];
    // Fix: Join all parts after the first dash to correctly capture details like 'IAI-3S'
    const details = parts.slice(1).join("");

    const posMap: Record<string, string> = {
      'V': 'Verb', 
      'N': 'Noun', 
      'A': 'Adjective', 
      'T': 'Article', 
      'P': 'Personal Pronoun',
      'D': 'Demonstrative Pronoun',
      'R': 'Relative Pronoun',
      'PREP': 'Preposition', 
      'CONJ': 'Conjunction', 
      'PRON': 'Pronoun', 
      'ADJ': 'Adjective',
      'ADV': 'Adverb',
      'PRT': 'Particle'
    };

    let result = posMap[pos] || pos;

    if (details) {
      const tMap: Record<string, string> = { 'P': 'Present', 'I': 'Imperfect', 'F': 'Future', 'A': 'Aorist', 'R': 'Perfect', 'L': 'Pluperfect' };
      const vMap: Record<string, string> = { 'A': 'Active', 'M': 'Middle', 'P': 'Passive', 'D': 'Middle/Passive' };
      const mMap: Record<string, string> = { 'I': 'Indicative', 'S': 'Subjunctive', 'O': 'Optative', 'N': 'Infinitive', 'P': 'Participle', 'M': 'Imperative' };
      const pMap: Record<string, string> = { '1': '1st Person', '2': '2nd Person', '3': '3rd Person' };
      const nMap: Record<string, string> = { 'S': 'Singular', 'P': 'Plural', 'D': 'Dual' };
      const gMap: Record<string, string> = { 'M': 'Masculine', 'F': 'Feminine', 'N': 'Neuter' };
      const cMap: Record<string, string> = { 'N': 'Nominative', 'G': 'Genitive', 'D': 'Dative', 'A': 'Accusative', 'V': 'Vocative' };
      
      const decodedParts: string[] = [];
      
      if (pos === 'V') {
        if (details[0]) decodedParts.push(tMap[details[0]] || details[0]);
        if (details[1]) decodedParts.push(vMap[details[1]] || details[1]);
        if (details[2]) decodedParts.push(mMap[details[2]] || details[2]);
        if (details[3]) decodedParts.push(pMap[details[3]] || details[3]);
        if (details[4]) decodedParts.push(nMap[details[4]] || details[4]);
        if (details[5]) decodedParts.push(gMap[details[5]] || details[5]);
      } else {
        if (details[0]) decodedParts.push(cMap[details[0]] || details[0]);
        if (details[1]) decodedParts.push(nMap[details[1]] || details[1]);
        if (details[2]) decodedParts.push(gMap[details[2]] || details[2]);
      }

      if (decodedParts.length > 0) {
        result += ` - ${decodedParts.join(' ')}`;
      }
    }

    return result;
  }
}
