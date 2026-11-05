---
name: "verify-reader"
description: "Use when verifying NT chapter reading, lemma/form/proximity research, mobile result/history return, Inspector, reference navigation, RTL, accessibility, loading/errors, screenshots, or explicitly scoped PWA/offline changes."
---

# Verify Reader

Use the [reader checklist](./references/checklist.md) for evidence, guided by
[architecture](../../../docs/ARCHITECTURE.md),
[CONTRIBUTING](../../../CONTRIBUTING.md),
[principles](../../../docs/PROJECT_PRINCIPLES.md), and
[interpretive method](../../../docs/INTERPRETIVE_METHOD.md). Verify current
behavior; do not add features, corpora, runtime AI, billing, or deployment unless
explicitly requested/authorized. The canonical NT sprint is authorized, not a
permanent boundary on future approved work. Offline is optional/deprioritized;
its known failure is non-gating, with no offline repair/storage framework implied.

## Workflow

1. Define the touched workflow, passage, expected result, and a focused check that
   can falsify it. Inspect existing changes. Consult current `package.json` and
   CONTRIBUTING for commands; never assume a test script exists or a historical
   baseline still passes. Record available execution/browser capabilities.
2. The developer runs the focused check immediately after an edit, then applicable
   tests, typecheck, and production build. A Vite build is not a typecheck. Use
   documented commands, including `npx tsc --noEmit` and `npm run build` where
   applicable; report actual failures without weakening expectations. Do not
   install new tooling as a verification fallback.
3. Serve the built app locally with the documented production preview command
   (`npm run preview -- --host 127.0.0.1` when still supported). Use an available
   port and record its URL. A dev-server session is not a PWA acceptance test.
4. Use available local Playwright tooling for interactions and desktop/mobile
   screenshots. Mock feedback submissions and other external side effects before
   interacting; do not send real Formspree messages. Preserve explicit handling
   of required fonts/CSS/assets and report network restrictions. If service-worker
   requests bypass interception, use existing safe mocks or abstain from submission.
5. Exercise fresh-default Rom 8:9, plus Gen 1:1 and Matt 1:1 regressions,
   selection/deselection and Inspector, references,
   chapter/book boundaries including `Phlm`, keyboard focus, touch/mobile layout,
   mixed RTL/LTR, missing lexical data, and failed book loading. Inspect screenshots
   for diacritics, direction, overlap, clipping, and actual rendered text; text
   assertions alone do not verify visual fidelity. Use controlled local failures.
   Verify canonical NT full-chapter reading, actual source lemma/POS/normalized
   fields and missing dictionary state, exact lemma/form search, companion,
   scope/group membership, pagination, complete counts and result opening.
   Check Back to results/browser Back and return to origin preserve in-session
   query/page/scroll/focus. Passage hash/history is not persisted research state.
   NT load errors must never fall back to XML; OT remains XML.
6. Only when offline/cache behavior is in the requested scope: on production
   preview, wait for an active service worker controlling the page,
   warm explicitly listed books/dictionaries/UI resources, then disconnect and
   reload/navigate within that tested scope. Record cached resources and external
   Tailwind/font dependencies. Test service-worker updates separately when relevant;
   registration alone proves neither updates nor first-visit offline support.
   Do not make this optional diagnostic an NT sprint acceptance gate or weaken
   its assertions to hide the historical failure.
7. Report exact commands/results, browser/viewports, interaction assertions,
   screenshot locations, offline scope, side-effect mocks, and remaining risks.
   State actual client limitations: missing Playwright, execution, screenshots,
   interception, or service-worker/offline controls mean those checks are unverified.
   A read-only reviewer consumes developer evidence rather than executing checks.

## Completion

Mark each relevant checklist item passed, failed, blocked, or not applicable with
evidence. Do not claim client discovery or browser acceptance from structural
checks alone. Keep the personally useful free reader and source-supported labels
primary. The NT research implementation has provisional unit evidence; final
integrated/browser rerun is pending. Do not claim browser success from code
inspection or interim unit counts. Wider Koine/LXX, collocation statistics,
manuscript comparisons and Daily Dose of Greek source lookup remain deferred.
