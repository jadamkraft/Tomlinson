---
name: Book filename mapping fix
overview: Create a comprehensive BOOK_FILENAME_MAPPING in constants.ts and refactor BibleEngine.ts to use it with proper error handling, eliminating soft 404 crashes from invalid file fetches.
todos:
  - id: create-mapping
    content: Create comprehensive BOOK_FILENAME_MAPPING in constants.ts with all 66 books and their variants (OSIS IDs, full names, abbreviations, lowercase variants)
    status: completed
  - id: update-engine
    content: "Refactor BibleEngine.ts: remove local BOOK_FILENAME_MAP, import BOOK_FILENAME_MAPPING from constants, update loadBook with error handling"
    status: completed
---

# Book-to-Filename Resolution Fix

## Problem

The app experiences "Soft 404" crashes when trying to fetch book XML files because the current mapping in `BibleEngine.ts` doesn't handle all variants (lowercase, abbreviations, etc.) and falls back to `${book}.xml`, which may not match actual filenames.

## Solution

1. **Create comprehensive mapping in `constants.ts`**: Export `BOOK_FILENAME_MAPPING` with all book identifiers mapping to exact filenames
2. **Refactor `BibleEngine.ts`**: Remove local `BOOK_FILENAME_MAP`, import from constants, and add error handling

## Implementation Details

### File: `constants.ts`

- Add new export `BOOK_FILENAME_MAPPING: Record<string, string>`
- Map keys should include:
- OSIS IDs: `"Gen"`, `"1Kgs"`, `"Phil"`, `"Phlm"`, etc.
- Full names: `"Genesis"`, `"1 Kings"`, `"Philippians"`, `"Philemon"`, etc.
- Common abbreviations: `"Mt"`, `"Mk"`, `"Php"` (Philippians), `"Philem"`, etc.
- Lowercase variants: `"gen"`, `"1kgs"`, `"phil"`, `"phlm"`, etc.
- Numbered book variants: `"1Samuel"`, `"1Sam"`, `"1Kings"`, `"1Kgs"`, etc.
- All values should be exact filenames as they appear in `public/assets/` (e.g., `"1Kgs.xml"`, `"Phil.xml"`, `"Phlm.xml"`)

**Key mappings to ensure:**

- `"1Kgs"` / `"1kgs"` / `"1Kings"` → `"1Kgs.xml"`
- `"Phil"` / `"phil"` / `"Philippians"` → `"Phil.xml"`
- `"Phlm"` / `"Philem"` / `"phlm"` → `"Phlm.xml"` (canonical OSIS ID)
- All 66 books covered with multiple aliases

### File: `services/BibleEngine.ts`

1. Remove local `BOOK_FILENAME_MAP` constant (lines 7-132)
2. Add import: `import { BOOK_FILENAME_MAPPING, SHORT_TO_OSIS } from "../constants";`
3. Update `loadBook` method (lines 235-296):

- Remove fallback to `${normalizedBookId}.xml`
- Try: `BOOK_FILENAME_MAPPING[normalizedBookId]`
- Then try: `BOOK_FILENAME_MAPPING[normalizedBookId.toLowerCase()]`
- If still undefined, throw clear error: `throw new Error(\`Unknown book alias: ${osisBookId}\`);` **before** the fetch
- This prevents soft 404s by failing fast with a clear error message

## Files to Modify

- `constants.ts` - Add `BOOK_FILENAME_MAPPING` export
- `services/BibleEngine.ts` - Remove local map, import from constants, add error handling

## Benefits

- Single source of truth for book-to-filename mapping
- Comprehensive coverage of book identifier variants
- Clear error messages instead of silent failures or soft 404s
- Easier maintenance (all mappings in one place)