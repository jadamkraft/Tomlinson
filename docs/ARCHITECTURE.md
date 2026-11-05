# Architecture

## Runtime

Tomlinson is a React 19 / TypeScript / Vite frontend. `index.tsx` mounts `App.tsx`.
There is no router, backend, research LLM, account system, or billing service.
Tailwind is loaded through a CDN in `index.html`; Google Fonts are external too.
The root alias `@/` resolves to the repository root. TypeScript is not strict.

## Ownership

| Surface | Owner and contract |
| --- | --- |
| Passage, selection, history | `App.tsx` defaults to Rom 8:9 unless the URL specifies a passage. Owns full NT chapter, selected token, reading/research view, origin and return scroll/focus. Hash/history records reference, token and view; query state is in memory, not persisted across reloads. |
| References and retrieval | `services/BibleEngine.ts`: `parseReference`, `loadBook`, `getVerse`, `getChapter`, adjacency and last-reference methods. NT delegates to `NtCorpusService`; OT retains XML DOM retrieval. |
| Canonical NT | `services/NtCorpusService.ts` lazily loads the manifest and content-hash book JSON, coalesces requests, verifies SHA-256/schema/source/corpus identity, and indexes references/chapters. No NT XML fallback. |
| Research computation | `services/WordContextIndex.ts` owns pure lemma/form postings and bounded proximity queries. `workers/ntResearch.worker.ts` loads selected books lazily; `services/WordContextService.ts` bridges worker requests. |
| Research state and controls | `hooks/useWordResearch.ts` owns query, target, paging, loading/error/retry and stale-response suppression; rejects results from another corpus. `components/WordResearchPanel.tsx` owns controls and results. |
| Dictionary | `services/DictionaryService.ts`: loads the Greek Strong's XML and supports exact NFC headword lookup by canonical NT lemma, alongside legacy Strong's-ID lookup and Hebrew XML lookup. |
| Displayed morphology | `utils/morphologyParser.ts`: `parseMorphology` is called by `components/Inspector.tsx`. `services/MorphDecoder.ts` is an alternate decoder, not this display path. |
| Cross-book movement | `hooks/useBibleNavigation.ts` sits above engine-local adjacency and uses book order/chapter metadata. |
| Text and inspection | `components/Reader.tsx` renders selectable tokens; `Inspector.tsx` displays lexical and morphological information. |
| Book choice and input | `NavigationDrawer.tsx` and `CommandBar.tsx` forward navigation/reference requests to App. |
| Book metadata | `constants.ts`: names, chapter counts, reference aliases, filenames. Some consumers duplicate book lists. |
| Word contract | `types.ts`: verse, canonical corpus, source token, manifest and research query/result contracts. NT lexical lemma, source POS and normalization remain distinct from optional legacy fields. |
| Feedback | `FeedbackModal.tsx` uses Formspree; its form ID is public, not a secret. Tests must not submit real feedback. |

## Data Flow

NT: pinned `sblgnt/` source + `data/nt-source.json` ->
`scripts/build_nt_corpus.cjs` -> `public/assets/nt/manifest.json` and hashed book
JSON -> `NtCorpusService` -> BibleEngine -> chapter Reader/Inspector.
The worker consumes the same canonical corpus for research, not a second edition.
OT: `public/assets/<book>.xml` -> BibleEngine DOM mapping -> Reader/Inspector.

The manifest is requested with `no-cache`; hashed shards use `force-cache` and
are checked against their declared digest before use. Failed loads can retry;
HTML responses, malformed data and mismatched versions are errors, never grounds
for falling back to legacy NT XML. Stable NT IDs contain corpus ID, reference
and verse token ordinal; they do not assert identity across editions.

Book loading uses the explicit filename map and absolute `/assets/` paths.
`Phlm` is canonical; `Philem` filename aliases route to `Phlm.xml`. Preserve this
mapping when changing filenames or reference parsing. For OT, container verses and some
flat/milestone layouts have separate retrieval strategies; test both before
changing the parser. Unknown aliases can throw; retained OT XML load errors can
leave retrieval null. Do not generalize that legacy behavior to NT load failures.

The canonical NT Inspector loads the Greek dictionary on selection and displays
load failures, missing exact lemmas, and ambiguous headwords separately; retry
is available after a failed request. The legacy `initialize()` path for other
dictionary consumers still catches initialization errors. An app READY status is
not proof that every dictionary/book request succeeded. Reference parsing has
permissive fallbacks; navigation sometimes uses metadata for unloaded books.
Existing behavior is a baseline to test, not automatically correct.

The old Greek XML converters are not the canonical NT path or routine validation.
`build:nt` generates the approved JSON corpus; `check:nt` runs the generator with
`--check`, reconstructs expected bytes in memory, and reads/compares the exact
output inventory without writes. Source hashes are checked against the pin; no
upstream downloads occur. See [data contracts](DATA_SOURCES.md) and the
[source decision](decisions/001-nt-research-source.md).

## Research Contract

Lemma keys use source lexical lemma, NFC only. Form keys use source unpunctuated
`word`, NFC only, case/accent sensitive: surface `σαρκὶ` is not normalized
`σαρκί`. Source fields themselves are not rewritten. Optional companion lemma
uses before/after/either distance 1-10 lexical tokens, default 5/either. Distance
1 is adjacency; all lexical tokens count, punctuation is not a separate token.
Windows may cross verses but never chapters/books; target cannot be its own
companion. Count each target once regardless of qualifying companion count.

Results are canonical-order target hits, 25/page, with exact total and selected
scope token denominator only after the whole scope loads. Context includes up to
eight tokens each side, clipped to chapter. Incomplete/error scope is not a whole-NT
count. No ranking, word-sense inference, syntax parsing or collocation statistics.
Current book is default; explicit books, all NT, Pauline 7/additional 6/all 13,
and other NT outside those 13 are available. Hebrews is outside the Pauline set.
Group membership is editorial metadata, not an authorship verdict.
Additional-companion lemma suggestions currently load all 27 books on demand;
this differs from search requests, which load only their selected scope. Neither
is required to show the first passage. Do not promise scope-only loading for the
suggestion lookup or treat all-book lookup costs as measured performance.

On mobile research occupies the work area; desktop keeps passage alongside it.
Opening a hit loads its full chapter. App retains query/page and origin snapshots
for Back to results/browser Back and return to origin within the current session.
Browser acceptance covers these transitions, including independent investigations,
focus, and result scroll restoration; physical-device testing remains unverified.
No React Router, backend or storage framework is added.

## Build, Offline, and Deployment

Vite outputs `dist/`. `vite.config.ts` uses `vite-plugin-pwa` with automatic
updates, XML precaching, and runtime caching. The foundation build reported roughly
43 MiB precache; that historical measurement is not a current transfer benchmark.
The NT generator reports 3.64 MiB gzip for book shards, not total PWA/network cost.
Manifest icons were declared but absent in the foundation review.

External fonts and Tailwind affect first-visit availability. Test offline behavior
against a production preview, after service-worker activation/cache warming.
Offline is optional and explicitly deprioritized; its known failure remains a
non-gating diagnostic, not a dependency of research delivery. Do not add offline
repairs, IndexedDB or another storage system unless explicitly requested.
Development mode is not a PWA acceptance test. Service-worker updates also need
verification; do not infer update correctness from successful registration.

Cloudflare Pages already builds/deploys through its GitHub connection. GitHub
Actions validation is separate, not a replacement deployment mechanism. Dashboard
production branch, Node version, preview behavior, and rollback settings require
owner confirmation; they cannot be inferred from local configuration.

Vite contains unused Gemini environment substitutions. No inference integration
was found. Any referenced browser substitution would be public; never introduce
provider secrets through Vite `define` or client environment variables.

## Future Boundaries

The [word-context workflow](INTERPRETIVE_METHOD.md) now has a canonical NT path;
see [validation evidence](VALIDATION_STATUS.md). Future AI should call deterministic research tools through a
separate, secure, budgeted service. Do not preemptively rewrite the app for an
unapproved backend, provider, or external corpus. Wider Koine/LXX ingestion,
manuscript comparisons and Daily Dose of Greek source lookup remain deferred.