---
name: Fix verb morphology display
overview: Create a new utility to parse Robinson-Pierpont morphology codes into human-readable labels and update Inspector.tsx to display them as a clean list of badges/spans instead of raw text.
todos: []
---

# Fix Verb Morphology Display in Inspector Component

## Current State

- `Inspector.tsx` uses `MorphDecoder.decode()` which doesn't properly handle Robinson-Pierpont format
- Raw codes like `3IAI-S--` or `3PAI-S--` are being displayed directly
- The actual XML data uses Robinson-Pierpont format (e.g., `morph="3IAI-S--"`, `morph="----DSF-"`)

## Implementation Plan

### 1. Create `src/utils/morphologyParser.ts`

Create a new utility file with a pure function `parseGreekMorphology(code: string): string[]` that:

- Parses Robinson-Pierpont format codes
- Returns an array of human-readable labels
- Handles both verb and noun/adjective formats

**Robinson-Pierpont Format Structure:**

- **Verbs** (e.g., `3IAI-S--`):
  - Position 1: Person (1, 2, 3, or `-`)
  - Position 2: Tense (P=Present, I=Imperfect, F=Future, A=Aorist, X=Perfect, Y=Pluperfect, or `-`)
  - Position 3: Voice (A=Active, M=Middle, P=Passive, or `-`)
  - Position 4: Mood (I=Indicative, S=Subjunctive, O=Optative, M=Imperative, N=Infinitive, P=Participle, or `-`)
  - Position 5: Case (N, G, D, A, V, or `-`) - only for participles
  - Position 6: Number (S=Singular, P=Plural, or `-`)
  - Position 7: Gender (M, F, N, or `-`) - only for participles

- **Nouns/Adjectives** (e.g., `----DSF-`):
  - Position 1-4: Usually dashes (part of speech handled elsewhere)
  - Position 5: Case (N, G, D, A, V, or `-`)
  - Position 6: Number (S, P, or `-`)
  - Position 7: Gender (M, F, N, or `-`)

**Lookup Maps:**

```typescript
const PERSON_MAP: Record<string, string> = {
  '1': '1st Person',
  '2': '2nd Person',
  '3': '3rd Person'
};

const TENSE_MAP: Record<string, string> = {
  'P': 'Present',
  'I': 'Imperfect',
  'F': 'Future',
  'A': 'Aorist',
  'X': 'Perfect',
  'Y': 'Pluperfect'
};

const VOICE_MAP: Record<string, string> = {
  'A': 'Active',
  'M': 'Middle',
  'P': 'Passive'
};

const MOOD_MAP: Record<string, string> = {
  'I': 'Indicative',
  'S': 'Subjunctive',
  'O': 'Optative',
  'M': 'Imperative',
  'N': 'Infinitive',
  'P': 'Participle'
};

const CASE_MAP: Record<string, string> = {
  'N': 'Nominative',
  'G': 'Genitive',
  'D': 'Dative',
  'A': 'Accusative',
  'V': 'Vocative'
};

const NUMBER_MAP: Record<string, string> = {
  'S': 'Singular',
  'P': 'Plural'
};

const GENDER_MAP: Record<string, string> = {
  'M': 'Masculine',
  'F': 'Feminine',
  'N': 'Neuter'
};
```

**Parsing Logic:**

- Detect if code is a verb (starts with 1, 2, 3, or `-` followed by tense letter) or noun/adjective (starts with dashes)
- For verbs: parse positions 1-7, building array of labels
- For nouns/adjectives: parse positions 5-7 (case, number, gender)
- Filter out empty/unknown values
- Return array of human-readable strings

### 2. Update `components/Inspector.tsx`

- Import `parseGreekMorphology` from the new utility
- Replace the single `decodedMorph` string with parsed array
- Update the Morphology section to display labels as badges/spans:
  ```tsx
  const morphLabels = parseGreekMorphology(selectedWord.morph);
  
  // In JSX:
  <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 shadow-inner">
    {morphLabels.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {morphLabels.map((label, idx) => (
          <span 
            key={idx}
            className="px-2 py-1 bg-sky-900/50 text-sky-300 text-xs rounded border border-sky-800"
          >
            {label}
          </span>
        ))}
      </div>
    ) : (
      <p className="text-slate-500 text-sm italic">No morphology data</p>
    )}
    <p className="text-slate-500 text-xs mt-2 mono-font uppercase tracking-tighter">
      {selectedWord.morph}
    </p>
  </div>
  ```


### 3. File Structure

- Create: `src/utils/morphologyParser.ts`
- Modify: `components/Inspector.tsx`

### 4. Type Safety

- Use strict TypeScript typing (no `any`)
- Define interfaces if needed for return types
- Ensure all string lookups are type-safe

### 5. Edge Cases

- Handle empty strings
- Handle codes with all dashes (`--------`)
- Handle malformed codes gracefully
- Handle codes that don't match expected patterns

## Testing Considerations

- Test with various verb codes: `3IAI-S--`, `3PAI-S--`, `1AAI-P--`, `-PAPNSM-`
- Test with noun/adjective codes: `----DSF-`, `----NSM-`
- Test with empty/invalid codes
- Verify UI displays correctly with multiple labels