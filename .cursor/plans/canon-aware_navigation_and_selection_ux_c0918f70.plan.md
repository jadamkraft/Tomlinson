---
name: Canon-Aware Navigation and Selection UX
overview: Implement Bible structure-aware navigation hook, add canvas deselect functionality to close Inspector on background click, and wire navigation buttons with proper boundary handling.
todos:
  - id: create-navigation-hook
    content: Create src/hooks/useBibleNavigation.ts hook with goToNextVerse, goToPrevVerse, canGoNext, canGoPrev methods using BIBLE_STRUCTURE and engine.getAdjacentVerse()
    status: completed
  - id: add-reader-deselect
    content: Add onDeselectWord prop and container click handler to Reader.tsx to deselect words when clicking background
    status: completed
  - id: wire-app-navigation
    content: Update App.tsx to use useBibleNavigation hook and create handleNavigateByOffset callback for Inspector
    status: completed
  - id: add-app-deselect-handler
    content: Add handleDeselectWord callback in App.tsx and pass it to Reader component
    status: completed
  - id: update-inspector-buttons
    content: Enhance Inspector.tsx navigation buttons with disabled states based on canGoNext/canGoPrev from hook
    status: completed
---

# Canon-Aware Navigation and Selection UX Implementation

## Overview

Implement three main features:

1. **Navigation Hook**: Create `useBibleNavigation` hook that uses `BIBLE_STRUCTURE` for canon-aware verse navigation
2. **Canvas Deselect**: Add click handler to Reader container to close Inspector when clicking background
3. **Wire Navigation**: Connect navigation buttons in Inspector to the new navigation system with proper boundary handling

## Implementation Details

### Task 1: Create Navigation Hook (`src/hooks/useBibleNavigation.ts`)

Create a new custom hook that:

- Accepts current reference (book OSIS ID, chapter, verse)
- Imports `BIBLE_STRUCTURE` and `BIBLE_BOOKS` from `constants.ts`
- Uses `BIBLE_STRUCTURE` to determine chapter boundaries (max chapters per book)
- Exports `goToNextVerse()` and `goToPrevVerse()` methods
- Returns the next/previous reference as `{ book: string, chapter: number, verse: number } | null`

**Navigation Logic:**

- Use `BIBLE_BOOKS` to map OSIS IDs (e.g., "Gen") to full names (e.g., "Genesis") for `BIBLE_STRUCTURE` lookup
- For verse boundaries: Since `BIBLE_STRUCTURE` only has chapter counts, we'll use the `engine.getAdjacentVerse()` method which already handles verse boundaries by querying the DOM
- For chapter boundaries: Use `BIBLE_STRUCTURE` to determine max chapters per book
- For book boundaries: Get ordered list of books from `BIBLE_BOOKS` to determine next/prev book
- Return `null` if at boundaries (Gen 1:1 for prev, Rev 22:21 for next - though exact last verse varies)

**Key Functions:**

```typescript
const goToNextVerse = (): { book: string, chapter: number, verse: number } | null
const goToPrevVerse = (): { book: string, chapter: number, verse: number } | null
const canGoNext = (): boolean
const canGoPrev = (): boolean
```

**Note:** The hook will leverage `engine.getAdjacentVerse()` for verse-level navigation since it already handles verse boundaries correctly. `BIBLE_STRUCTURE` is used primarily for chapter and book boundaries.

### Task 2: Canvas Deselect in Reader Component

In `components/Reader.tsx`:

- Add `onDeselectWord` prop to `ReaderProps` interface (optional callback to clear selection)
- Add click handler to the main container div (line 29)
- In the click handler, check if the event target is NOT a word button
- Word buttons can be identified by checking if the target (or its closest ancestor) has a class indicating it's a word button, or by checking if `event.target.closest('button')` exists within the words container
- If click is on background, call `onDeselectWord()` to set `selectedWord` to `null` in App.tsx

**Implementation approach:**

- Add `onDeselectWord?: () => void` prop
- Add `onClick` handler to the outer container div
- Check `event.target` - if it's the container or not a word button, call `onDeselectWord`
- Use `event.stopPropagation()` on word buttons to prevent bubbling (or check target more carefully)

### Task 3: Wire Navigation in App.tsx and Inspector

**In App.tsx:**

1. Import and use the `useBibleNavigation` hook with current verse reference
2. Create a new `handleNavigateByOffset` callback that:

   - Calls `goToNextVerse()` or `goToPrevVerse()` based on offset
   - If result is not null, calls existing `handleNavigate(book, chapter, verse)`

3. Pass `handleNavigateByOffset` to Inspector as `onNavigate`
4. Pass `handleDeselectWord` callback to Reader as `onDeselectWord`

**In Inspector.tsx:**

- Update `InspectorProps` interface: Keep `onNavigate?: (offset: number) => void` (no changes needed)
- The existing buttons already call `onNavigate(-1)` and `onNavigate(1)`, so they'll work with the new handler
- Add disabled state to buttons when navigation is not possible (using `canGoNext()` and `canGoPrev()` from hook - but these need to be passed down or calculated)

**Button States:**

- Disable "Prev" button if at first verse (Gen 1:1)
- Disable "Next" button if at last verse (Rev 22:21 or engine-determined last verse)

## File Changes

1. **New file**: `src/hooks/useBibleNavigation.ts`

   - Custom hook for canon-aware navigation
   - Uses `BIBLE_STRUCTURE` for boundaries
   - Uses `engine.getAdjacentVerse()` for verse-level navigation

2. **Update**: `components/Reader.tsx`

   - Add `onDeselectWord` prop
   - Add container click handler for background deselection

3. **Update**: `App.tsx`

   - Import and use `useBibleNavigation` hook
   - Create `handleNavigateByOffset` callback
   - Create `handleDeselectWord` callback
   - Pass callbacks to Reader and Inspector

4. **Update**: `components/Inspector.tsx` (optional enhancement)

   - Add disabled state logic to navigation buttons
   - This could be done by passing `canGoNext` and `canGoPrev` flags, or by having the hook return these

## Edge Cases

- Handle boundaries: Gen 1:1 (can't go prev), last verse of Revelation (can't go next)
- Handle book transitions: Matt 28:20 → Mark 1:1, Rev 22:21 → null
- Handle chapter transitions within same book
- Word button clicks should not trigger deselection (stop propagation or check target)

## Dependencies

- `constants.ts`: `BIBLE_STRUCTURE`, `BIBLE_BOOKS`
- `services/BibleEngine.ts`: `engine.getAdjacentVerse()` method
- `types.ts`: `ParsedVerse` interface