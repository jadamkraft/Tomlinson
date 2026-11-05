# Reader Verification Checklist

Use with the [workflow](../SKILL.md). Shared requirements live in
[CONTRIBUTING](../../../../CONTRIBUTING.md),
[architecture](../../../../docs/ARCHITECTURE.md), and
[data contracts](../../../../docs/DATA_SOURCES.md).
Record pass/fail/blocked/not applicable, evidence, and reason for each relevant item.

## Environment and Checks

- [ ] Record changed workflow, expected behavior, current command availability,
  Node/browser versions, local preview URL, and exact command results.
- [ ] Run focused tests, applicable broader tests, independent typecheck, and
  production build; report preexisting failures and missing tooling honestly.
- [ ] Include read-only `check:nt` and the aggregate `check` after package script
  integration; never run corpus generation or legacy converters as verification.
  Interim unit results are provisional; final integrated/browser rerun is pending.
- [ ] Mock feedback/external side effects; confirm no real submissions. Document
  any service-worker interception limitation and restricted CDN/font access.

## Text and Interaction

- [ ] Fresh visit opens Rom 8:9 unless URL passage overrides it. Gen 1:1 Hebrew
  and Matt 1:1 Greek still render with intact diacritics, punctuation,
  token order, and references. Inspect desktop/mobile screenshots.
- [ ] Hebrew/Aramaic RTL and mixed-direction labels remain correct with missing
  dictionary data. Use an authentic Aramaic sample when that path is affected.
- [ ] Select, change, and deselect a token; verify Inspector and selection clearing
  on navigation. Missing lexical information is not fabricated or mislabeled.
- [ ] Reference input, chapter/book transitions, first/last boundaries, unloaded
  adjacent books, and `Phlm`/`Philem` routing behave as expected for the task.
- [ ] Keyboard traversal/activation and visible focus work; mobile touch controls,
  text, Inspector, and drawers do not overlap, clip, or obscure the passage.
- [ ] Controlled loading, empty, missing-entry, failed book/dictionary fetch, and
  invalid-reference cases produce observed, documented behavior. READY is not proof
  that every resource loaded. Do not assume existing error handling is correct.

## NT Research

- [ ] Reader and research use the same pinned corpus/token identity, not legacy
  NT XML or fuzzy Strong's IDs. OT remains XML. Inspect source notices/URLs:
  CC BY 4.0 text and CC BY-SA 3.0 annotations, edition coverage and absent
  John 7:53-8:11. No latest SBLGNT/all-manuscripts claim or app-code license implied.
- [ ] Rom 8:9 selection distinguishes `σαρκὶ` surface, `σαρκί` normalized,
  `σάρξ` lemma, `N-` and `----DSF-`. Active Greek imperative `D`, source POS and
  degree are preserved. Exact NFC lemma lookup displays bundled Greek lexicon
  headwords with attribution; verify found, missing, ambiguous, failed-load and
  retry states. Strong's linkage remains absent; the historical gloss is not a
  contextual interpretation. Hebrew table/display repair is not assumed.
- [ ] Lemma/form keys use NFC only; form uses unpunctuated `word`, case/accent
  sensitive. Verify canonical-equivalent Unicode and surface/normalized distinction.
- [ ] Companion `ἐν` with `σάρξ`/`πνεῦμα` in Rom 8:9 and `Χριστός` in Rom 8:1:
  before/after/either, distance 1/5/10, default 5/either, same chapter across verses,
  no chapter/book crossing or target-self match. All lexical tokens count;
  punctuation does not add tokens. Each target counts once despite many companions.
- [ ] Current-book default, selected books, Pauline 7/additional 6/all 13,
  Other NT outside those 13 (including Hebrews), all NT and current-book exclusion
  expose actual membership. Presets do not settle authorship; metadata's Wikipedia
  reference is introductory, not definitive scholarly evidence.
- [ ] Canonical-order results, 25/page, complete-scope exact totals/denominator,
  empty and failed/incomplete scopes, retry and stale-response suppression work.
  Counts remain source observations, not theological meanings. Compare authentic
  expected results independently of the query implementation.
- [ ] Result context shows source punctuation, references, target and companions;
  opens full chapter with stable target anchor. Back to results/browser Back,
  pagination and origin return preserve query/page/scroll/focus in-session;
  no reload/session-storage persistence claim.
- [ ] At 360x800, 390x844, Pixel 7 and 1440x900, inspect Greek, control wrapping,
  no overflow/clipping/overlap, visible keyboard focus and usable touch targets.
  Research uses the mobile work area; desktop keeps passage alongside it.
  Record WebKit and actual iPhone/Android tests separately when available.
- [ ] Record lazy selected-scope loading, worker errors/version mismatch and
  frequent-query responsiveness. Measure transfer/index/query costs separately;
  generator's 3.64 MiB gzip book total is not an end-to-end performance result.

## Optional PWA Evidence

Offline is explicitly optional/deprioritized and its known failure non-gating.
Mark these items not applicable unless offline/cache behavior is in scope. Do not
add repairs or a storage framework merely to complete the NT research sprint.

- [ ] Use production preview, confirm active controlling service worker, and list
  warmed books/dictionaries/UI assets and relevant cache observations.
- [ ] Disconnect, reload, and navigate within the warmed scope; record precisely
  what worked/failed, including external Tailwind/font availability.
- [ ] For cache/update changes, verify a controlled local update lifecycle and
  stale-resource behavior separately. Do not infer success from registration.
- [ ] Do not claim first-visit offline, uncached-book availability, or untested
  browser support. Note missing client offline/service-worker/screenshot controls.

## Report

- [ ] Include screenshot/artifact paths, assertions, exact failures, skipped or
  blocked checks, data/provenance impact, and unresolved risks. No production
  access, deployment, corpus regeneration, or new dependency installation.
- [ ] Distinguish current runs, owner-supplied provisional unit results and
  historical foundation/browser findings. Leave final browser acceptance pending
  until the implementation owner's final rerun/report. Preserve known Hebrew,
  offline and security caveats; do not mark them fixed from new NT unit coverage.
