---
name: Remove Hardcoded Sample Data from BibleEngine
overview: Remove hardcoded sample XML data that prevents Genesis and John from loading full XML files, causing pagination to break. The initialize() method currently caches sample data for Gen and John, preventing loadBook() from fetching the actual XML files.
todos:
  - id: remove-sample-import
    content: Remove BIBLE_SAMPLE_XML import from BibleEngine.ts
    status: completed
  - id: refactor-initialize
    content: Remove xmlString parameter and all XML parsing logic from initialize() method - make it a simple no-op or minimal initialization
    status: completed
  - id: verify-constants
    content: Verify BIBLE_STRUCTURE and BOOK_FILENAME_MAPPING are correct for Gen and John
    status: completed
  - id: test-pagination
    content: Verify loadBook() behavior ensures Gen.xml and John.xml are fetched (no changes needed, just verification)
    status: completed
  - id: remove-sample-constant
    content: "Optional: Remove BIBLE_SAMPLE_XML constant from constants.ts if unused elsewhere"
    status: completed
---

# Remove Hardcoded Sample Data from BibleEngine

## Problem Diagnosis

The pagination bug occurs because:

1. **`BibleEngine.initialize()` has a default parameter** that uses `BIBLE_SAMPLE_XML` (line 72)
2. When `engine.initialize()` is called without arguments in `App.tsx`, it parses the sample XML
3. The sample XML only contains `Gen.1.1` and `John.1.1` (partial books)
4. These partial books are cached in `this.bookDocs` Map (lines 81-94)
5. When `loadBook("Gen")` is called later, line 110 checks `if (this.bookDocs.has(osisBookId)) return;` and exits early
6. The full XML files (`Gen.xml`, `John.xml`) are never fetched, so only Gen.1.1 and John.1.1 are accessible

## Solution

### Task 1: Refactor `initialize()` method in `BibleEngine.ts`

**Current implementation** (lines 68-104):

- Accepts optional `xmlString` parameter with default value `BIBLE_SAMPLE_XML`
- Parses sample XML and caches Gen/John books
- This causes the bug

**New implementation**:

- Remove the `xmlString` parameter entirely
- Remove all logic that parses and caches books from XML
- `initialize()` should only initialize the engine state (DOMParser is already initialized in constructor)
- The method can be simplified to just log initialization or be empty, since there's no state to initialize

**Changes needed**:

```typescript
// Remove: async initialize(xmlString: string = BIBLE_SAMPLE_XML): Promise<void>
// Replace with: async initialize(): Promise<void>
// Remove: All XML parsing and book caching logic (lines 75-95)
```

### Task 2: Remove unused imports and constants

**In `BibleEngine.ts`**:

- Remove `BIBLE_SAMPLE_XML` from imports (line 3)
- This constant is no longer needed

**In `constants.ts`** (optional cleanup):

- Consider removing `BIBLE_SAMPLE_XML` constant definition (lines 760-798) if not used elsewhere
- However, verify it's not used in tests or other files first

### Task 3: Verify constants are correct

**Constants verification** (already correct, but verify):

- `BIBLE_STRUCTURE`: Genesis has 50 chapters, John has 21 chapters ✓
- `BOOK_FILENAME_MAPPING`: 'Gen' maps to "Gen.xml", 'John' maps to "John.xml" ✓

### Task 4: Ensure `loadBook()` behavior is correct

**Current `loadBook()` implementation** (lines 109-170):

- Already correctly fetches XML files from `/assets/${fileName}`
- Has proper error handling
- Caches books in `this.bookDocs` after loading
- The early return on line 110 (`if (this.bookDocs.has(osisBookId)) return;`) is correct - it prevents re-loading already loaded books

**No changes needed to `loadBook()`** - it will work correctly once sample data is removed from `initialize()`

## Implementation Steps

1. **Modify `services/BibleEngine.ts`**:

   - Remove `BIBLE_SAMPLE_XML` from imports
   - Change `initialize()` signature: remove `xmlString` parameter
   - Remove all XML parsing logic from `initialize()` (lines 75-95)
   - Simplify `initialize()` to just log or be a no-op

2. **Test the fix**:

   - After changes, `initialize()` should not cache any books
   - When navigating to Gen 1:1, `loadBook("Gen")` should fetch `Gen.xml`
   - All verses in Genesis (including Gen 1:2, Gen 2:1, etc.) should be accessible
   - Same for John

3. **Optional cleanup**:

   - Remove `BIBLE_SAMPLE_XML` constant from `constants.ts` if confirmed unused elsewhere

## Expected Behavior After Fix

- `engine.initialize()` no longer caches any books
- All books (including Gen and John) must be loaded via `loadBook()` which fetches XML files
- Full pagination works: Gen 1:1 -> Gen 1:2 -> ... -> Gen 1:31 -> Gen 2:1, etc.
- Navigation from Gen 50 to Exod 1:1 works correctly
- Navigation from Exod 1:1 back to Gen 50 works correctly

## Files to Modify

1. **`services/BibleEngine.ts`**:

   - Remove `BIBLE_SAMPLE_XML` import
   - Simplify `initialize()` method

2. **`constants.ts`** (optional):

   - Remove `BIBLE_SAMPLE_XML` constant if unused