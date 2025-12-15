---
name: Navigation Drawer Implementation
overview: Create a responsive slide-out navigation drawer component for book selection, integrate it into App.tsx, and connect it to the existing BibleEngine navigation system.
todos:
  - id: create-drawer-component
    content: Create NavigationDrawer.tsx component with slide animation, backdrop, search input, and book list rendering
    status: completed
  - id: add-state-app
    content: Add isNavOpen state to App.tsx and create handleBookSelect callback
    status: completed
  - id: connect-book-icon
    content: Make Book icon button in header clickable to open drawer
    status: completed
  - id: integrate-drawer
    content: Render NavigationDrawer component in App.tsx with proper props and positioning
    status: completed
---

# Navigation Drawer Implementation

## Overview

Create a slide-out navigation drawer that allows users to select Bible books visually. The drawer will slide in from the left with a backdrop overlay, include a search filter, and display all books from `constants.ts`.

## Files to Create/Modify

### 1. New Component: `components/NavigationDrawer.tsx`

- **Props Interface:**
  - `isOpen: boolean` - Controls drawer visibility
  - `onClose: () => void` - Callback to close drawer
  - `onSelectBook: (bookOsisId: string) => void` - Callback when book is selected
- **Features:**
  - Slide-in animation using Tailwind `transition-transform` (translate from `-100%` to `0`)
  - Backdrop overlay with `backdrop-blur-md` and dark background
  - Sticky search input at top with book icon button. clean up unused buttons.
  - Real-time filtering of book list as user types
  - Dark mode optimized styling (`bg-zinc-900`, `border-slate-800`)
  - Click outside to close (backdrop click)
  - Escape key to close
- **Book List:**
  - Import `BIBLE_BOOKS` from `constants.ts`
  - Map over `Object.entries(BIBLE_BOOKS)` to get `[osisId, fullName]` pairs
  - Display full names (e.g., "Genesis", "Exodus") but pass OSIS IDs (e.g., "Gen", "Exod") to `onSelectBook`
  - Filter by both OSIS ID and full name (case-insensitive)

### 2. Modify: `App.tsx`

- **State Management:**
  - Add `const [isNavOpen, setIsNavOpen] = useState(false);`
- **Book Icon Button:**
  - Wrap the Book icon div (lines 167-169) in a `<button>` element
  - Add `onClick={() => setIsNavOpen(true)}` handler
  - Add `cursor-pointer` and hover styles for better UX
- **NavigationDrawer Integration:**
  - Import `NavigationDrawer` component
  - Render `<NavigationDrawer />` at root level (after main content, before closing div)
  - Pass props:
    - `isOpen={isNavOpen}`
    - `onClose={() => setIsNavOpen(false)}`
    - `onSelectBook={handleBookSelect}`
- **Book Selection Handler:**
  - Create `handleBookSelect` callback that:

    1. Calls `handleSearch` with format `"{fullName} 1:1"` (e.g., "Genesis 1:1")
    2. Closes drawer: `setIsNavOpen(false)`

  - Alternative: Use OSIS ID directly by calling `handleSearch` with `"{osisId} 1:1"` (e.g., "Gen 1:1")

### 3. Implementation Details

**Drawer Animation:**

- Use conditional classes: `transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
- Add `transition-transform duration-300 ease-in-out`
- Fixed positioning with `fixed inset-y-0 left-0`

**Backdrop:**

- Separate backdrop div with `fixed inset-0 bg-black/50 backdrop-blur-md`
- Conditional rendering: only show when `isOpen` is true
- `z-index` management: backdrop at `z-40`, drawer at `z-50`

**Search Functionality:**

- Use `useState` for search query
- Filter books: `books.filter(([id, name]) => name.toLowerCase().includes(query.toLowerCase()) || id.toLowerCase().includes(query.toLowerCase()))`
- Empty state message when no matches

**Accessibility:**

- Focus trap when drawer is open
- Escape key handler using `useEffect` with keydown listener
- ARIA attributes: `role="dialog"`, `aria-modal="true"`, `aria-label`

## Data Flow

```
User clicks Book icon
  → setIsNavOpen(true)
  → NavigationDrawer renders with isOpen=true
  → User searches/filters books
  → User clicks a book
  → onSelectBook("Gen") called
  → handleBookSelect("Gen") executes
  → handleSearch("Gen 1:1") called
  → BibleEngine loads book and navigates
  → setIsNavOpen(false)
  → Drawer closes
```

## Styling Notes

- Drawer width: `w-80` (320px) on mobile, `w-96` (384px) on desktop
- Use existing color scheme: `slate-950`, `slate-800`, `sky-500/600` for accents
- Book list items: hover state with `hover:bg-slate-800`
- Active/current book highlighting (optional enhancement): compare with `currentVerse?.book`