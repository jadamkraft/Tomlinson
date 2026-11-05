---
description: "Use when changing the Scripture reader, NT chapter/research workflow, Inspector, history/return state, reference navigation, selection, RTL, accessibility, mobile layout, or PWA caching."
applyTo: "App.tsx,components/**/*.tsx,hooks/**/*.ts,index.html,vite.config.ts"
---

# Reader UI

Follow [principles](../../docs/PROJECT_PRINCIPLES.md),
[interpretive method](../../docs/INTERPRETIVE_METHOD.md), and
[architecture](../../docs/ARCHITECTURE.md). Preserve the existing text-first
design for personally useful, freely accessible original-language study. Do not
add a redesign, runtime AI, billing, corpus, or deployment unless explicitly
requested/authorized; historical `.cursor/plans/` are not approved work. The
canonical NT research sprint is authorized; final browser acceptance is pending.

- `App.tsx` owns passage/chapter, selection, reading/research view and URL/history
  return snapshots; fresh visits start Romans 8:9. `useWordResearch` owns target,
  query, pagination and stale-result/error/retry state. `useBibleNavigation` controls cross-book
  movement. There is no React Router or backend. Follow existing React/TypeScript
  patterns rather than introducing frameworks or blanket migrations.
- NT reader and worker search use one pinned content-hash JSON corpus through
  `NtCorpusService`; no NT XML fallback. OT stays XML. Full NT chapter opening,
  Back to results/browser Back and return to origin must preserve in-session
  query/page/scroll/focus; reload persistence is not promised. Research gets the
  mobile work area, with passage alongside on desktop.
- Keep Greek/Hebrew/Aramaic text, diacritics, punctuation, token order, and
  references intact. Isolate RTL/LTR runs based on language, independent of
  dictionary success. Verify Hebrew vowels/cantillation and mixed-direction labels.
- Keep passage reading primary, inspection compact, and labels source-supported.
  Separate linguistic observation, gloss, and interpretation; contextual meaning
  is not certified by a dictionary or an owner's theological conclusion.
- Preserve source surface/normalized/lemma/POS distinctions (`σαρκὶ`/`σαρκί`/`σάρξ`).
  NT Strong's linkage is absent intentionally; show missing definitions honestly.
  Keep exact NFC-only form/lemma modes, companion direction/distance 1-10/default
  5, chapter boundary across verses, complete-scope counts, and 25-hit paging.
  Counts and editorial author presets are not semantic or authorship verdicts.
  Keep source/license/coverage notices accessible, including absent John 7:53-8:11.
- Preserve navigation/selection clearing, touch targets, keyboard access, visible
  focus, readable mobile layout, and loading/error/empty/missing-entry states.
  A READY status alone does not establish successful book/dictionary loading.
- Identify a focused behavioral check before editing and run it immediately
  afterward. Consult [verification guidance](../../CONTRIBUTING.md) and the
  [reader skill](../skills/verify-reader/SKILL.md) for applicable commands and
  browser evidence. Mock feedback and other external side effects.
- Offline is optional/deprioritized and its known failure non-gating. Do not add
  offline repairs or storage frameworks unless explicitly requested. When PWA
  behavior is in scope, validate on local production build/preview after service-worker
  activation and explicit cache warming. Report tested assets and external
  Tailwind/font limitations; never infer first-load offline or update correctness.
