---
name: Drill-Down Navigation Drawer
overview: Refactor NavigationDrawer into a 3-step drill-down selector (Book -> Chapter -> Verse) with state management, breadcrumb navigation, and grid-based chapter/verse selection.
todos:
  - id: add-bible-structure
    content: Add BIBLE_STRUCTURE constant to constants.ts with chapter counts for all 66 books
    status: completed
  - id: refactor-drawer-state
    content: Add state management (selectionStep, selectedBook, selectedChapter) to NavigationDrawer.tsx
    status: completed
  - id: update-drawer-props
    content: Change NavigationDrawer props from onSelectBook to onNavigate with (book, chapter, verse) signature
    status: completed
  - id: implement-breadcrumb
    content: Add breadcrumb header with back button functionality in NavigationDrawer.tsx
    status: completed
  - id: implement-chapters-view
    content: Create chapters grid view with buttons 1-N based on BIBLE_STRUCTURE
    status: completed
  - id: implement-verses-view
    content: Create verses grid view with buttons 1-60 (safe default) that calls onNavigate
    status: completed
  - id: update-app-callback
    content: Update App.tsx to use handleNavigate callback instead of handleBookSelect
    status: completed
---

# Drill-Down Navigation Drawer Implementation

## Overview

Transform the NavigationDrawer from a simple book list into a modern 3-step drill-down interface: Book selection → Chapter selection → Verse selection.

## Implementation Steps

### 1. Add Bible Structure Data (`constants.ts`)

Add a `BIBLE_STRUCTURE` constant mapping each book (using full names from `BIBLE_BOOKS`) to its chapter count:

```typescript
export const BIBLE_STRUCTURE: Record<string, { chapters: number }> = {
  "Genesis": { chapters: 50 },
  "Exodus": { chapters: 40 },
  // ... all 66 books
};
```

**Chapter counts for all 66 books:**

- OT: Genesis (50), Exodus (40), Leviticus (27), Numbers (36), Deuteronomy (34), Joshua (24), Judges (21), Ruth (4), 1 Samuel (31), 2 Samuel (24), 1 Kings (22), 2 Kings (25), 1 Chronicles (29), 2 Chronicles (36), Ezra (10), Nehemiah (13), Esther (10), Job (42), Psalms (150), Proverbs (31), Ecclesiastes (12), Song of Solomon (8), Isaiah (66), Jeremiah (52), Lamentations (5), Ezekiel (48), Daniel (12), Hosea (14), Joel (3), Amos (9), Obadiah (1), Jonah (4), Micah (7), Nahum (3), Habakkuk (3), Zephaniah (3), Haggai (2), Zechariah (14), Malachi (4)
- NT: Matthew (28), Mark (16), Luke (24), John (21), Acts (28), Romans (16), 1 Corinthians (16), 2 Corinthians (13), Galatians (6), Ephesians (6), Philippians (4), Colossians (4), 1 Thessalonians (5), 2 Thessalonians (3), 1 Timothy (6), 2 Timothy (4), Titus (3), Philemon (1), Hebrews (13), James (5), 1 Peter (5), 2 Peter (3), 1 John (5), 2 John (1), 3 John (1), Jude (1), Revelation (22)

**Verse counts:** For MVP, use a safe default of 60 verses per chapter when rendering the verse grid. This covers all chapters (Psalm 119 has 176 verses, but we can handle that edge case later if needed).

### 2. Refactor NavigationDrawer Component (`components/NavigationDrawer.tsx`)

#### State Management

Add internal state:

- `selectionStep: 'books' | 'chapters' | 'verses'` - Current view
- `selectedBook: string | null` - Selected book OSIS ID (e.g., "Gen")
- `selectedChapter: number | null` - Selected chapter number

#### Props Update

Change the prop interface:

```typescript
interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (book: string, chapter: number, verse: number) => void; // Changed from onSelectBook
}
```

#### Header Updates

- Show breadcrumb navigation: "Select Book" → "Genesis > Ch 3" → "Genesis > Ch 3 > V 5"
- Add "Back" button (ChevronLeft icon from lucide-react) when `selectionStep !== 'books'`
- Back button should:
  - From 'verses' → go to 'chapters'
  - From 'chapters' → go to 'books'
  - Reset `selectedChapter` or `selectedBook` accordingly

#### View Implementations

**Books View (existing):**

- Keep current search + list functionality
- When book clicked: set `selectedBook`, set `selectionStep` to 'chapters'

**Chapters View:**

- Display breadcrumb: `{BIBLE_BOOKS[selectedBook]} > Ch {selectedChapter || '?'}`
- Render grid of chapter buttons using flexbox/grid:
  ```tsx
  <div className="grid grid-cols-6 gap-2 p-4">
    {Array.from({ length: BIBLE_STRUCTURE[BIBLE_BOOKS[selectedBook]].chapters }, (_, i) => i + 1).map(ch => (
      <button
        key={ch}
        className="w-12 h-12 flex items-center justify-center bg-zinc-800 rounded hover:bg-zinc-700 text-slate-200"
        onClick={() => handleChapterClick(ch)}
      >
        {ch}
      </button>
    ))}
  </div>
  ```

- When chapter clicked: set `selectedChapter`, set `selectionStep` to 'verses'

**Verses View:**

- Display breadcrumb: `{BIBLE_BOOKS[selectedBook]} > Ch {selectedChapter} > V {selectedVerse || '?'}`
- Render similar grid with verse numbers (1-60 as safe default)
- When verse clicked: call `onNavigate(selectedBook, selectedChapter, verse)` and close drawer

#### State Reset

- Reset all state (`selectionStep`, `selectedBook`, `selectedChapter`) when drawer closes (`isOpen` becomes false)

### 3. Update App Component (`App.tsx`)

Update `handleBookSelect` to `handleNavigate`:

```typescript
const handleNavigate = useCallback(
  async (book: string, chapter: number, verse: number) => {
    await handleSearch(`${book} ${chapter}:${verse}`);
    setIsNavOpen(false);
  },
  [handleSearch]
);
```

Update NavigationDrawer usage:

```tsx
<NavigationDrawer
  isOpen={isNavOpen}
  onClose={() => setIsNavOpen(false)}
  onNavigate={handleNavigate}
/>
```

## File Changes Summary

1. **`constants.ts`**: Add `BIBLE_STRUCTURE` constant with chapter counts for all 66 books
2. **`components/NavigationDrawer.tsx`**: Complete refactor with drill-down state, three views, breadcrumb navigation, and back button
3. **`App.tsx`**: Update callback from `onSelectBook` to `onNavigate` with new signature

## Design Notes

- **Grid Layout**: Use `grid-cols-6` for chapters/verses (adjustable for mobile with responsive classes)
- **Button Styling**: Square buttons (`w-12 h-12`) with zinc-800 background, hover to zinc-700
- **Breadcrumb**: Simple text format "Book > Ch X" or "Book > Ch X > V Y"
- **Animation**: Instant view switching (no slide animations for MVP)
- **Verse Count**: Default to 60 verses per chapter for MVP (covers 99% of cases)