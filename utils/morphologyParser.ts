/**
 * Parses morphology codes into human-readable labels.
 * Supports both Greek (Robinson-Pierpont) and Hebrew (OSHM) codes.
 */

// Greek parsing constants
const PERSON_MAP: Record<string, string> = {
  "1": "1st Person",
  "2": "2nd Person",
  "3": "3rd Person",
};

const TENSE_MAP: Record<string, string> = {
  P: "Present",
  I: "Imperfect",
  F: "Future",
  A: "Aorist",
  X: "Perfect",
  Y: "Pluperfect",
};

const VOICE_MAP: Record<string, string> = {
  A: "Active",
  M: "Middle",
  P: "Passive",
};

const MOOD_MAP: Record<string, string> = {
  I: "Indicative",
  S: "Subjunctive",
  O: "Optative",
  M: "Imperative",
  N: "Infinitive",
  P: "Participle",
};

const CASE_MAP: Record<string, string> = {
  N: "Nominative",
  G: "Genitive",
  D: "Dative",
  A: "Accusative",
  V: "Vocative",
};

const NUMBER_MAP: Record<string, string> = {
  S: "Singular",
  P: "Plural",
};

const GENDER_MAP: Record<string, string> = {
  M: "Masculine",
  F: "Feminine",
  N: "Neuter",
};

// Hebrew parsing constants
const HEBREW_STEM_MAP: Record<string, string> = {
  q: "Qal",
  N: "Niphal",
  p: "Piel",
  P: "Pual",
  h: "Hiphil",
  H: "Hophal",
  t: "Hithpael",
};

const HEBREW_ASPECT_MAP: Record<string, string> = {
  p: "Perfect",
  i: "Imperfect",
  v: "Imperative",
  a: "Infinitive Absolute",
  c: "Infinitive Construct",
  P: "Participle",
  w: "Wayyiqtol",
  j: "Jussive",
  o: "Cohortative",
};

const HEBREW_PERSON_MAP: Record<string, string> = {
  "1": "1st Person",
  "2": "2nd Person",
  "3": "3rd Person",
};

const HEBREW_GENDER_MAP: Record<string, string> = {
  m: "Masculine",
  f: "Feminine",
  c: "Common",
  b: "Both",
};

const HEBREW_NUMBER_MAP: Record<string, string> = {
  s: "Singular",
  p: "Plural",
  d: "Dual",
};

const HEBREW_NOUN_TYPE_MAP: Record<string, string> = {
  c: "Common",
  p: "Proper",
};

const HEBREW_STATE_MAP: Record<string, string> = {
  a: "Absolute",
  c: "Construct",
  d: "Determined",
};

const HEBREW_POS_MAP: Record<string, string> = {
  V: "Verb",
  N: "Noun",
  A: "Adjective",
  T: "Article",
  C: "Conjunction",
  R: "Preposition",
};

/**
 * Parses a Robinson-Pierpont morphology code into an array of human-readable labels.
 *
 * @param code - The morphology code (e.g., "3IAI-S--", "----DSF-")
 * @returns Array of human-readable labels (e.g., ["3rd Person", "Imperfect", "Active", "Indicative", "Singular"])
 */
export function parseGreekMorphology(code: string): string[] {
  if (!code || code.trim().length === 0) {
    return [];
  }

  const trimmed = code.trim();
  const labels: string[] = [];

  // Check if it's all dashes (no morphology data)
  if (trimmed.replace(/-/g, "").length === 0) {
    return [];
  }

  // Detect if code is a verb (starts with 1, 2, 3, or - followed by tense letter)
  // or noun/adjective (starts with dashes)
  const isVerb = /^[123-][PIFAXY]/.test(trimmed) || /^-[PIFAXY]/.test(trimmed);

  if (isVerb) {
    // Parse verb format: positions 1-7
    // Position 1: Person (1, 2, 3, or -)
    if (trimmed[0] && trimmed[0] !== "-") {
      const person = PERSON_MAP[trimmed[0]];
      if (person) {
        labels.push(person);
      }
    }

    // Position 2: Tense (P, I, F, A, X, Y, or -)
    if (trimmed[1] && trimmed[1] !== "-") {
      const tense = TENSE_MAP[trimmed[1]];
      if (tense) {
        labels.push(tense);
      }
    }

    // Position 3: Voice (A, M, P, or -)
    if (trimmed[2] && trimmed[2] !== "-") {
      const voice = VOICE_MAP[trimmed[2]];
      if (voice) {
        labels.push(voice);
      }
    }

    // Position 4: Mood (I, S, O, M, N, P, or -)
    if (trimmed[3] && trimmed[3] !== "-") {
      const mood = MOOD_MAP[trimmed[3]];
      if (mood) {
        labels.push(mood);
      }
    }

    // Position 5: Case (N, G, D, A, V, or -) - only for participles
    if (trimmed[4] && trimmed[4] !== "-") {
      const caseValue = CASE_MAP[trimmed[4]];
      if (caseValue) {
        labels.push(caseValue);
      }
    }

    // Position 6: Number (S, P, or -)
    if (trimmed[5] && trimmed[5] !== "-") {
      const number = NUMBER_MAP[trimmed[5]];
      if (number) {
        labels.push(number);
      }
    }

    // Position 7: Gender (M, F, N, or -) - only for participles
    if (trimmed[6] && trimmed[6] !== "-") {
      const gender = GENDER_MAP[trimmed[6]];
      if (gender) {
        labels.push(gender);
      }
    }
  } else {
    // Parse noun/adjective format: positions 5-7 (case, number, gender)
    // Position 5: Case (N, G, D, A, V, or -)
    if (trimmed[4] && trimmed[4] !== "-") {
      const caseValue = CASE_MAP[trimmed[4]];
      if (caseValue) {
        labels.push(caseValue);
      }
    }

    // Position 6: Number (S, P, or -)
    if (trimmed[5] && trimmed[5] !== "-") {
      const number = NUMBER_MAP[trimmed[5]];
      if (number) {
        labels.push(number);
      }
    }

    // Position 7: Gender (M, F, N, or -)
    if (trimmed[6] && trimmed[6] !== "-") {
      const gender = GENDER_MAP[trimmed[6]];
      if (gender) {
        labels.push(gender);
      }
    }
  }

  return labels;
}

/**
 * Parses a Hebrew OSHM morphology code into an array of human-readable labels.
 * Handles verbs, nouns, adjectives, articles, conjunctions, prepositions, and compound codes.
 *
 * @param code - The Hebrew morphology code (e.g., "HVqp3ms", "HNcmpa", "HC/Vqw3ms")
 * @returns Array of human-readable labels
 */
function parseHebrewMorphology(code: string): string[] {
  if (!code || code.trim().length === 0) {
    return [];
  }

  const trimmed = code.trim();
  const labels: string[] = [];

  // Remove H (Hebrew) or A (Aramaic) prefix
  const withoutPrefix =
    trimmed.startsWith("H") || trimmed.startsWith("A")
      ? trimmed.substring(1)
      : trimmed;

  if (withoutPrefix.length === 0) {
    return [];
  }

  // Handle compound codes (separated by /)
  const parts = withoutPrefix.split("/");
  const allLabels: string[] = [];

  for (const part of parts) {
    if (part.length === 0) continue;

    const partLabels = parseHebrewMorphologyPart(part);
    allLabels.push(...partLabels);
  }

  return allLabels;
}

/**
 * Parses a single Hebrew morphology code part (without prefix and without / separators).
 */
function parseHebrewMorphologyPart(part: string): string[] {
  const labels: string[] = [];

  if (part.length === 0) return labels;

  // Determine part of speech from first character
  const pos = part[0];
  const posLabel = HEBREW_POS_MAP[pos];
  if (posLabel) {
    labels.push(posLabel);
  }

  // Parse based on part of speech
  if (pos === "V") {
    // Verb: V + stem + aspect + person + gender + number
    // Example: Vqp3ms = Verb, Qal, Perfect, 3rd person, masculine, singular
    if (part.length >= 2) {
      const stem = HEBREW_STEM_MAP[part[1]];
      if (stem) labels.push(stem);
    }
    if (part.length >= 3) {
      const aspect = HEBREW_ASPECT_MAP[part[2]];
      if (aspect) labels.push(aspect);
    }
    if (part.length >= 4) {
      const person = HEBREW_PERSON_MAP[part[3]];
      if (person) labels.push(person);
    }
    if (part.length >= 5) {
      const gender = HEBREW_GENDER_MAP[part[4]];
      if (gender) labels.push(gender);
    }
    if (part.length >= 6) {
      const number = HEBREW_NUMBER_MAP[part[5]];
      if (number) labels.push(number);
    }
  } else if (pos === "N") {
    // Noun: N + type + gender + number + state
    // Example: Ncmpa = Noun, common, masculine, plural, absolute
    if (part.length >= 2) {
      const type = HEBREW_NOUN_TYPE_MAP[part[1]];
      if (type) labels.push(type);
    }
    if (part.length >= 3) {
      const gender = HEBREW_GENDER_MAP[part[2]];
      if (gender) labels.push(gender);
    }
    if (part.length >= 4) {
      const number = HEBREW_NUMBER_MAP[part[3]];
      if (number) labels.push(number);
    }
    if (part.length >= 5) {
      const state = HEBREW_STATE_MAP[part[4]];
      if (state) labels.push(state);
    }
  } else if (pos === "A") {
    // Adjective: A + gender + number + state
    // Example: Aamsa = Adjective, masculine, singular, absolute
    if (part.length >= 2) {
      const gender = HEBREW_GENDER_MAP[part[1]];
      if (gender) labels.push(gender);
    }
    if (part.length >= 3) {
      const number = HEBREW_NUMBER_MAP[part[2]];
      if (number) labels.push(number);
    }
    if (part.length >= 4) {
      const state = HEBREW_STATE_MAP[part[3]];
      if (state) labels.push(state);
    }
  } else if (pos === "T") {
    // Article: T + features
    // Example: To = Article, object marker
    // Example: Td = Article, definite
    if (part.length >= 2) {
      if (part[1] === "d") {
        labels.push("Definite");
      } else if (part[1] === "o") {
        labels.push("Object Marker");
      }
    }
  } else if (pos === "C") {
    // Conjunction: C (may be followed by other parts in compound codes)
    // Just the POS label is enough, already added above
  } else if (pos === "R") {
    // Preposition: R + optional modifiers
    // Example: Rd = Preposition, Definite
    if (part.length >= 2) {
      if (part[1] === "d") {
        labels.push("Definite");
      }
    }
  }

  return labels;
}

/**
 * Parses a morphology code (Hebrew or Greek) into an array of human-readable labels.
 * Automatically detects the language based on the code format.
 *
 * @param code - The morphology code (e.g., "HVqp3ms" for Hebrew, "3IAI-S--" for Greek)
 * @returns Array of human-readable labels
 */
export function parseMorphology(code: string): string[] {
  if (!code || code.trim().length === 0) {
    return [];
  }

  const trimmed = code.trim();

  // Detect Hebrew/Aramaic: codes start with H or A
  if (trimmed.startsWith("H") || trimmed.startsWith("A")) {
    return parseHebrewMorphology(trimmed);
  }

  // Otherwise, treat as Greek (Robinson-Pierpont format)
  return parseGreekMorphology(trimmed);
}
