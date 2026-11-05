---
name: "validate-original-text"
description: "Use when validating canonical NT JSON and source pins, original Greek/Hebrew/Aramaic, MorphGNT/OSHM, lemma/POS, exact search semantics, Strong's linkage, XML, provenance, rights, and Unicode fidelity."
---

# Validate Original Text

Validate a specific data claim with inspectable source evidence, not confidence
in the current display. Read [data contracts](../../../docs/DATA_SOURCES.md),
[architecture](../../../docs/ARCHITECTURE.md),
[principles](../../../docs/PROJECT_PRINCIPLES.md), and the
[text-first method](../../../docs/INTERPRETIVE_METHOD.md).

## Workflow

1. Define the passage, claimed behavior, affected fields, and non-goals. Inspect
   existing changes. Separate data correction from UI/infrastructure work; no
   corpus regeneration or conversion-script execution without explicit approval.
   The approved NT sprint uses the pinned canonical importer, not legacy XML
   converters. Further edition/corpus changes need separate authorization.
2. Trace a small sample from the [MorphGNT source contract](../../../sblgnt/README.md)
   or bundled Hebrew source/header through the selected transform. For NT trace
   `data/nt-source.json` -> `scripts/build_nt_corpus.cjs` -> manifest/hashed JSON
   -> `NtCorpusService` -> BibleEngine chapter/verse/navigation -> Reader/Inspector
   and the same corpus -> worker/WordContextIndex. For OT retain the XML trace.
   Check Inspector's
   dictionary lookup and `utils/morphologyParser.ts`. Read only relevant excerpts;
   do not dump whole corpora. Record source/version, reference, and each mapping.
3. Choose authentic small fixtures and one check that could disprove the claim.
   Preserve the exact source row or XML excerpt and its attribution. For Greek,
   distinguish all seven columns, separate POS, and eight parsing positions;
   imperative `D`, separate POS and degree are now handled in the active decoder.
   Do not restore the old D/M defect as an expected result. For Hebrew and
   Aramaic, retain `H`/`A`, segmentation, vowels, cantillation, and namespaces.
4. Compare Unicode/spelling, punctuation, token counts/order, references and
   versification, surface/normalized forms, lexical lemma, POS, and morphology
   across the trace. Canonical NT retains lexical lemma/POS and normalized word;
   legacy `lemma`/`strongs` fields are intentionally empty. Only old Greek XML
   overloads `lemma` with IDs; fuzzy IDs/normalized forms cannot replace lexical
   identity. No verified NT dictionary enrichment is claimed. Record missing
   links, collisions, and uncertainty; never fabricate linkage.
5. The developer consults `package.json` and
   [CONTRIBUTING](../../../CONTRIBUTING.md) for available read-only data checks and
   focused tests. Use structured XML parsing and mocked fetches. After an approved
   small edit, run the focused check immediately, then applicable wider checks.
   Do not install tooling or run existing converters merely to validate. If no
   check exists, report that gap and propose a separately scoped fixture/test.
   Run `npm run check:nt` under Node 22 for read-only exact-byte/inventory and
   pinned-source reproducibility; it must not write artifacts or download sources.
6. For an explicitly approved corpus change, confirm source rights/version and a
   canonical transform before generating anything. Review derived differences
   separately, including headers/attribution and unresolved mappings. A structurally
   valid file is not proof of linguistic correctness or permission to redistribute.

## NT-Specific Evidence

- Consult the [source decision](../../../docs/decisions/001-nt-research-source.md):
   all 27 inputs match MorphGNT commit `aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d`.
   Preserve CC BY 4.0 text and CC BY-SA 3.0 annotation notices/source URLs separately;
   they do not choose an app-code license. No latest SBLGNT/all-manuscripts claim:
   John 7:53-8:11 is absent, numbering/coverage is source-specific.
- Rom 8:9: surface `σαρκὶ`, normalized `σαρκί`, lemma `σάρξ`, POS `N-`, raw
   `----DSF-`. NFC-only keys use lexical lemma or source `word`; form remains
   case/accent sensitive. Preserve punctuated display/editorial marks unchanged.
- Independently check companion before/after/either, distance 1-10/default 5,
   chapter-boundary cross-verse behavior, self-exclusion, one target count despite
   multiple companions, complete selected-scope denominator and 25-hit paging.
   Synthetic fixtures must be labeled; compare real-source results with an
   independent source scan, not just generated snapshots or the same query code.
- Reader/worker corpus IDs must agree; HTML/schema/hash/version errors must fail
   explicitly, never fall back to NT XML. Preset membership is not authorship
   proof; Wikipedia is introductory, not primary scholarly authority.

## Report

State the source-supported expectation, trace locations, authentic fixture,
commands and exact results, missing/ambiguous data, attribution/license impacts,
and unverified claims. Keep known defects visible; do not weaken tests or snapshot
incorrect output to obtain a pass. Separate source observations from contextual
interpretation, first-century reconstruction, and uncertainty. Report provisional
unit evidence separately from pending final browser acceptance. Offline is
optional/deprioritized, not a data-validation gate. No further corpus, runtime
AI, billing, or deployment is implied without explicit authorization. Future
LXX terms review and Daily Dose of Greek source lookup remain deferred.
