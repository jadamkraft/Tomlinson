---
name: Hebrew Morphology Parsing
overview: Extend the morphology parser to support Hebrew (OSHM) codes in addition to Greek (Robinson-Pierpont) codes, and update the Inspector to automatically detect and parse Hebrew morphology codes.
todos:
  - id: add-hebrew-constants
    content: Add Hebrew morphology parsing constants (stems, aspects, noun types, states, POS) to morphologyParser.ts
    status: completed
  - id: implement-hebrew-parser
    content: Implement parseHebrewMorphology() function to handle OSHM codes (verbs, nouns, adjectives, articles, conjunctions, prepositions, and compound codes)
    status: completed
  - id: create-wrapper-function
    content: Create parseMorphology() wrapper function that detects Hebrew vs Greek and routes to appropriate parser
    status: completed
  - id: update-inspector
    content: Update Inspector.tsx to use parseMorphology() instead of parseGreekMorphology()
    status: completed
---

# Hebrew Morphology Parsing Implementation

## Overview

The current `morphologyParser.ts` only handles Greek Robinson-Pierpont codes. Hebrew words in the Old Testament use OSHM (Open Scriptures Hebrew Morphology) codes that start with "H" and have a different structure. This plan extends the parser to be "bilingual" and automatically detect Hebrew vs Greek codes.

## Current State Analysis

### Files Involved

- **[utils/morphologyParser.ts](utils/morphologyParser.ts)**: Currently only has `parseGreekMorphology()` function
- **[components/Inspector.tsx](components/Inspector.tsx)**: Line 91 calls `parseGreekMorphology()` for all words regardless of language
- **[services/BibleEngine.ts](services/BibleEngine.ts)**: Has `isOT()` method to determine Hebrew books, but morphology codes themselves indicate language

### Hebrew Morphology Code Format (OSHM)

Based on analysis of `Gen.xml`, Hebrew codes follow this structure:

- **Prefix**: `H` (Hebrew) or `A` (Aramaic)
- **Verbs**: `HV` + stem + aspect + person + gender + number
- Example: `HVqp3ms` = Verb, Qal, Perfect, 3rd person, masculine, singular
- **Nouns**: `HN` + type + gender + number + state
- Example: `HNcmpa` = Noun, common, masculine, plural, absolute
- **Adjectives**: `HA` + gender + number + state
- Example: `HAamsa` = Adjective, masculine, singular, absolute
- **Articles**: `HT` + features
- Example: `HTo` = Article, object marker
- **Conjunctions**: `HC` (may be combined with other parts via `/`)
- **Prepositions**: `HR` (may be combined with other parts via `/`)

### Key Differences from Greek

1. Hebrew codes start with `H` or `A` prefix
2. Greek codes use positional format (e.g., `3IAI-S--`)
3. Hebrew uses letter codes for stems/aspects (q, p, h, etc.)
4. Hebrew nouns have "state" (absolute/construct/determined)
5. Hebrew can have compound codes separated by `/` (e.g., `HC/Vqw3ms`)

## Implementation Plan

### Step 1: Extend morphologyParser.ts

**1.1 Add Hebrew parsing constants**

- Stem map: `q` (Qal), `N` (Niphal), `p` (Piel), `P` (Pual), `h` (Hiphil), `H` (Hophal), `t` (Hithpael)
- Aspect map: `p` (Perfect), `i` (Imperfect), `v` (Imperative), `a` (Infinitive Absolute), `c` (Infinitive Construct), `P` (Participle), `w` (Wayyiqtol), `j` (Jussive), `o` (Cohortative)
- Noun type map: `c` (common), `p` (proper)
- State map: `a` (absolute), `c` (construct), `d` (determined)
- Part of Speech map: `V` (Verb), `N` (Noun), `A` (Adjective), `T` (Article), `C` (Conjunction), `R` (Preposition)

**1.2 Create `parseHebrewMorphology()` function**

- Remove `H` or `A` prefix
- Handle compound codes (split by `/` and parse each part)
- Parse verbs: Extract stem, aspect, person, gender, number
- Parse nouns: Extract type, gender, number, state
- Parse adjectives: Extract gender, number, state
- Parse articles: Extract features (definite, object marker)
- Parse conjunctions and prepositions
- Return array of human-readable labels

**1.3 Create `parseMorphology()` wrapper function**

- Detect language: Check if code starts with `H` or `A` (Hebrew) vs Greek pattern
- Route to appropriate parser: `parseHebrewMorphology()` or `parseGreekMorphology()`
- Return labels array

### Step 2: Update Inspector.tsx

**2.1 Replace direct call to `parseGreekMorphology()`**

- Change line 91 from: `const morphLabels = parseGreekMorphology(selectedWord.morph);`
- To: `const morphLabels = parseMorphology(selectedWord.morph);`
- Import the new `parseMorphology` function instead of `parseGreekMorphology`

**2.2 Verify display logic**

- The existing chip-style rendering (lines 149-157) should work for Hebrew labels
- No changes needed to the UI structure

### Step 3: Testing Considerations

**3.1 Test cases to verify**

- Hebrew verbs: `HVqp3ms`, `HVqj3ms`, `HVqw3ms`, `HVprfsa`
- Hebrew nouns: `HNcmpa`, `HNcmsa`, `HNcbsa`, `HNcbpc`
- Hebrew adjectives: `HAamsa`
- Hebrew articles: `HTo`, `HTd`
- Hebrew conjunctions: `HC`, `HC/Vqw3ms`
- Hebrew prepositions: `HR`, `HR/Ncfsa`
- Compound codes: `HTd/Ncmpa`, `HC/To`, `HC/Td/Ncbsa`
- Greek codes should still work: `3IAI-S--`, `----DSF-`
- Empty/invalid codes should return empty array

## Implementation Details

### Hebrew Verb Parsing

Format: `HV` + [stem] + [aspect] + [person] + [gender] + [number]

- Position 2: Stem (q, N, p, P, h, H, t)
- Position 3: Aspect (p, i, v, a, c, P, w, j, o)
- Position 4: Person (1, 2, 3)
- Position 5: Gender (m, f, c)
- Position 6: Number (s, p, d)

### Hebrew Noun Parsing

Format: `HN` + [type] + [gender] + [number] + [state]

- Position 2: Type (c, p)
- Position 3: Gender (m, f, c, b)
- Position 4: Number (s, p, d)
- Position 5: State (a, c, d)

### Hebrew Adjective Parsing

Format: `HA` + [gender] + [number] + [state]

- Position 2: Gender (m, f, c)
- Position 3: Number (s, p, d)
- Position 4: State (a, c, d)

### Compound Code Handling

Codes like `HC/Vqw3ms` or `HTd/Ncmpa` contain multiple parts separated by `/`. Parse each part independently and combine labels.

## Files to Modify

1. **[utils/morphologyParser.ts](utils/morphologyParser.ts)**

- Add Hebrew parsing constants
- Add `parseHebrewMorphology()` function
- Add `parseMorphology()` wrapper function
- Export `parseMorphology` as default

2. **[components/Inspector.tsx](components/Inspector.tsx)**

- Update import to use `parseMorphology`
- Replace `parseGreekMorphology()` call with `parseMorphology()`

## Success Criteria

- Hebrew words in OT display human-readable morphology labels
- Greek words in NT continue to work as before
- Both languages use the same chip-style UI
- Empty or invalid codes return empty arrays gracefully
- Compound Hebrew codes (with `/`) are parsed correctly