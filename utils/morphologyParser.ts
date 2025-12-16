/**
 * Parses Robinson-Pierpont morphology codes into human-readable labels.
 * Handles both verb and noun/adjective formats.
 */

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
