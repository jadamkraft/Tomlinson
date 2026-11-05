---
description: "Use when changing canonical NT JSON, source manifests, worker research, morphology, lexical lookup, Strong's mappings, XML, corpus transformations, references, or word types."
applyTo: "services/**/*.ts,utils/**/*.ts,workers/**/*.ts,scripts/**/*.cjs,convert_greek.cjs,constants.ts,types.ts,data/**/*.json,public/assets/nt/**/*.json,public/assets/**/*.xml,sblgnt/**"
---

# Text and Data Integrity

Follow the shared [principles](../../docs/PROJECT_PRINCIPLES.md),
[interpretive method](../../docs/INTERPRETIVE_METHOD.md),
[data contracts](../../docs/DATA_SOURCES.md), and
[ownership map](../../docs/ARCHITECTURE.md). Keep original-language study useful
without payment or AI; do not add a corpus, runtime AI, billing, or deployment
unless explicitly requested/authorized. The canonical NT sprint is authorized;
edition switching, annotation blending and LXX ingestion are not.
Historical `.cursor/plans/` are context, not authorization.

- Read small authentic source excerpts before changing a field mapping. Trace
  source -> canonical JSON importer -> NtCorpusService -> BibleEngine -> Reader
  selection -> Inspector, and the same corpus -> worker/WordContextIndex;
  retain the separate OT XML path. No NT XML fallback on failure is allowed;
  displayed morphology uses `utils/morphologyParser.ts`, not `MorphDecoder.ts`.
- Keep surface form, normalized lookup copy, lexical lemma, separate POS,
  morphology, and Strong's linkage distinct. Canonical NT preserves lexical
  lemma/POS/normalized word and intentionally leaves legacy `lemma`/`strongs`
  empty. Only legacy XML overloads `lemma` with IDs. Fuzzy/accent-stripped matches are not
  canonical identity; report collisions and leave missing/ambiguous links unresolved.
- Verify MorphGNT's seven columns and eight parsing positions against its source
  contract. Imperative `D`, separate POS and degree are handled by the active
  Greek decoder; preserve raw codes and source-backed expectations. Hebrew
  tables remain partial. Do not silently repair source annotations.
- Preserve Unicode, diacritics, Hebrew vowels/cantillation, slash segmentation,
  punctuation, token order, `H`/`A` language markers, OSIS references/namespaces,
  edition-specific numbering, and attribution. Normalize lookup copies only under
  a documented policy; do not replace source spelling.
- Preserve `Phlm`/`Philem` filename routing and supported container/milestone XML
  layouts. Use structured XML parsing, not regex schema validation.
- Source pin/rights/coverage live in `data/nt-source.json` and the
  [source decision](../../docs/decisions/001-nt-research-source.md). All 27 source
  files match pinned revision; John 7:53-8:11 is absent. Do not claim latest
  SBLGNT/all manuscripts. Keep CC BY 4.0 text and CC BY-SA 3.0 annotations separate
  with source URLs; neither assigns an app-code license.
- `build:nt` generates; `check:nt` uses `--check` to compare exact bytes and file
  inventory read-only, with pinned source hashes and no upstream fetch. Review
  importer/artifact changes separately. Do not use old XML converters for NT.
- Search keys use NFC only: lexical lemma or unpunctuated `word`, case/accent
  sensitive (`σαρκὶ` differs from normalized `σαρκί`). Companion before/after/either,
  distance 1-10/default 5, same chapter across verses; self excluded, each target
  once, 25/page. Complete scope counts are source observations, not sense claims.
- Author-group presets are explicit editorial memberships; their Wikipedia
  citation is introductory, not definitive scholarship. Do not assign Hebrews
  to Paul or equate Other NT with one author. Inspector dictionary lookup uses
  exact NFC canonical Greek lemma to bundled Strong's XML headword matches; this
  does not add Strong's linkage or certify lexical accuracy/contextual meaning.
  Preserve missing, ambiguous, and unavailable states; never use fuzzy matches.
- No full corpus regeneration, bulk corpus patching, or conversion-script execution
  without explicit data-change approval, a selected canonical generator, and
  separately reviewed output differences. Free-to-read is not redistribution permission.
- Before editing, choose one source-supported expectation and a focused check
  that can falsify it. Run the check immediately after the change using authentic
  small fixtures; report exact results, provenance impacts, and uncertainty via
  the [contribution workflow](../../CONTRIBUTING.md). Never bless known wrong
  output in snapshots or invent linguistic certainty.
