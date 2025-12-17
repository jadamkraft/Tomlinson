---
name: formspree_feedback_modal
overview: Add an in-app feedback/bug-report modal wired to Formspree, reachable from the bottom of the Navigation Drawer, and styled to match the existing Tailwind UI (no external navigation).
todos:
  - id: deps-formspree
    content: Install `@formspree/react` and update `package.json`/lockfile.
    status: completed
  - id: add-feedback-modal
    content: Create `components/FeedbackModal.tsx` with Tailwind-styled modal + Formspree submission states.
    status: completed
  - id: drawer-integration
    content: Add bottom “Report a Bug / Feedback” button, modal open/close state, and render `FeedbackModal` as sibling to drawer/backdrop; adjust drawer layout to include sticky footer.
    status: completed
  - id: smoke-check
    content: Confirm modal overlays correctly, submits without navigation, and closes via Escape/backdrop.
    status: completed
---

## Install Formspree client dependency

- Add Formspree’s React helper so submissions happen via XHR (stays in-app, gives loading/success/error state).
- Command (npm repo already uses `package-lock.json`): `npm i @formspree/react`.
- Files: update `package.json` and lockfile.

## Build `FeedbackModal` component

- Create a new component at [`components/FeedbackModal.tsx`](components/FeedbackModal.tsx).
- Behavior
  - Props: `isOpen: boolean`, `onClose: () => void`.
  - Modal UX: backdrop click closes, `Escape` closes, autofocus first input, optional body scroll-lock while open.
  - Formspree integration: `useForm("xnneklro")` (Form ID from `https://formspree.io/f/xnneklro`).
  - Fields (Tailwind-styled, mobile-first):
    - **Type** (select): Bug / Feedback
    - **Email** (optional)
    - **Message** (required)
    - Hidden context (helps triage): `userAgent`, `url` (and optionally `timestamp`)
  - States: disabled submit while `submitting`, success screen when `succeeded`, inline error messaging if `state.errors`.

## Integrate into `NavigationDrawer.tsx`

- Add local state in the drawer: `const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);`
- Add a new button at the **very bottom** of the drawer (separate footer section with top border) labeled **“Report a Bug / Feedback”**.
- Render `FeedbackModal` as a **sibling** to the drawer/backdrop (not inside the transformed drawer element) so the modal’s `fixed` positioning is viewport-based.
- Close behavior: when the drawer closes, also force `setIsFeedbackOpen(false)` in the existing “Reset state when drawer closes” effect.
- Minor layout refactor: replace the current hard-coded content heights (e.g. `h-[calc(100vh-120px)]`) with a `flex flex-col h-full` drawer layout: sticky header, `flex-1 overflow-y-auto` content, sticky footer.

Relevant current structure to adjust:

```199:264:C:\Users\adam.kraft\Desktop\Projects\Tomlinson\components\NavigationDrawer.tsx
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-md z-40"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Book Navigation"
        className={`fixed inset-y-0 left-0 w-80 md:w-96 bg-zinc-900 border-r border-slate-800 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-slate-800 p-4 z-10">
          ...
        </div>

        {/* Content Area */}
        {selectionStep === "books" && renderBooksView()}
        {selectionStep === "chapters" && renderChaptersView()}
        {selectionStep === "verses" && renderVersesView()}
      </div>
    </>
  );
```

## Verify behavior

- Open drawer → bottom button visible.
- Click button → modal opens over entire app.
- Submit → shows success message without leaving app.
- Escape/backdrop closes modal.
- Closing drawer resets/cleans up modal state.

## Files touched

- [`package.json`](package.json) (+ lockfile): add `@formspree/react`
- [`components/FeedbackModal.tsx`](components/FeedbackModal.tsx): new modal component
- [`components/NavigationDrawer.tsx`](components/NavigationDrawer.tsx): add footer button, modal state, and layout tweak