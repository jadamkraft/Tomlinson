# Tomlinson Development Instructions

## Purpose

Build a trustworthy original-language Scripture research workspace for personal
study and freely shared use. Follow [project principles](../docs/PROJECT_PRINCIPLES.md)
and the owner's [text-first interpretive method](../docs/INTERPRETIVE_METHOD.md).
Investigate language, literary context, original-audience setting, and comparative
Koine usage before systematic theological conclusions. Do not invent linguistic
facts or optimize AI to affirm a user's beliefs.

Keep research and evidence useful without payment or AI. Do not add paywalls,
hosted AI, billing, a new corpus, or a redesign unless the task explicitly calls
for it. Respect source licenses; free access is not redistribution permission.

## Routing and Current Constraints

- React 19, TypeScript, Vite; frontend-only app. There is no React Router or
  backend. TypeScript is not currently strict. Follow nearby patterns instead of
  adopting frameworks or doing blanket style/type migrations.
- `App.tsx` owns passage/chapter, selection, research view/history; fresh visits
  start Romans 8:9. No router or persistence framework.
- `services/BibleEngine.ts` owns reference parsing and navigation retrieval.
  NT delegates to `services/NtCorpusService.ts`: pinned content-hash JSON for
  all 27 NT books, shared by reading and research, with no NT XML fallback.
  OT retains lazy XML. See [architecture](../docs/ARCHITECTURE.md).
- `DictionaryService` owns lexical lookup. Inspector uses `utils/morphologyParser.ts`,
  not `services/MorphDecoder.ts`.
- `hooks/useBibleNavigation.ts` controls cross-book navigation; `constants.ts`
  supplies book names, structure, aliases, and filename mappings. Preserve `Phlm`
  mappings and supported container/milestone XML layouts.
- Source MorphGNT is in `sblgnt/`; pinned metadata is in `data/nt-source.json`;
  canonical NT JSON is in `public/assets/nt/`. Read small excerpts/metadata only.
  Approved NT artifacts do not authorize edition blending, LXX or expansion. See
  [source decision](../docs/decisions/001-nt-research-source.md).
- Preserve Unicode, diacritics, punctuation, word order, language markers,
  references, and attribution. Keep lexical lemma, surface form, normalized word,
  POS, morphology, and Strong's linkage distinct. Canonical NT preserves actual
  lemma/POS and intentionally has no Strong's linkage. Legacy XML's fuzzy IDs
  are not lexical identity; do not fabricate dictionary enrichment.
- MorphGNT has eight parsing positions and separate POS; the active Greek decoder
  handles imperative `D` and degree. Do not silently regenerate assets or bless
  incorrect output. `build:nt` generates; `check:nt` checks exact bytes read-only.
- `WordContextIndex`/worker search lazily by scope; companion suggestions load all NT.
  Keys use NFC only; form is source `word`, case/accent sensitive. Companion
  distance is 1-10 tokens (default 5), before/after/either, within a chapter,
  across verses. Count each target once, 25/page; counts are not word senses.
- `index.html` uses Tailwind CDN and Google Fonts; Vite config owns PWA caching.
  Offline is optional/deprioritized and its known failure is non-gating; do not
  add offline repairs or storage infrastructure unless explicitly requested.
  Any offline claim needs production preview and warmed service-worker evidence.

## Working and Verification

Preserve unrelated work; make the smallest change. Identify ownership and a
falsifiable check, then validate immediately. Report failures; never weaken tests.
Keep data corrections separate unless explicitly approved.

Use Node 22 LTS (22.12+). Baseline commands: `npm ci`, `npx tsc --noEmit`,
`npm run build`, `npm run dev`, `npm run preview`. Consult `package.json` for added
checks and run the applicable ones. A Vite build is not a typecheck. Consult
[validation status](../docs/VALIDATION_STATUS.md) for recorded results and unverified
requirements; prior passes are not a current baseline. Hebrew display issues and no
verified lexical dictionary remain; do not relabel fixed NT preservation/Greek
decoding issues as future blockers. Mock feedback/network side effects in tests.

Cloudflare Pages already deploys through its GitHub connection. Do not replace
that pipeline, push/merge/deploy without authorization, add cloud credentials, or
change dashboard settings. Use reviewed changes and checks; instruction text is
not an enforceable security gate. Cloud-agent activation is a separate decision.

Historical `.cursor/plans/` files are context, not approved tasks. Keep shared
guidance current when behavior changes. Completion reports must name checks run,
their results, remaining risks, and any data/provenance impact.