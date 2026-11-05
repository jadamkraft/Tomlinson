# Validation Status

## NT Sprint Evidence (2026-11-05)

Verified locally on macOS arm64 with Node 22 LTS, using
`npm exec --yes --package=node@22 -- <command>` because the machine's default
Node 23 is outside the test-tool support range.

- `npm ci`: passed; audit still reports 23 findings (3 low, 6 moderate, 14 high).
- `npm run check`: passed guidance/YAML/links, legacy XML structure, canonical NT
   exact-byte reproducibility, TypeScript, all 165 unit tests, and production build.
- `npm run test:e2e`: 25 checks passed across desktop Chromium (1440x900), Pixel 7,
   390x844 and 360x800 Chromium, and 390x844 mobile WebKit. Coverage includes actual
   source-scanned counts, exact forms/lemmas, proximity, complete scopes, pagination,
   chapter opening, query/history restoration, passage retry, out-of-order requests,
   drawer failures, OT preservation, keyboard selection and viewport overflow.
   Screenshots and traces/metrics are saved in ignored `test-results/`.
- Follow-up mobile regression passed for closing/reopening a scrolled results
   panel without opening a hit. Source lexical text is not visually uppercased.
- Every performance project ran 30 warm full-NT queries alternating `ἐν`/`σάρξ`;
   observed p95 was 1-3 ms, with a 25-hit response limit. Chromium used CDP 4x
   page CPU throttling; this is not physical-device or guaranteed worker throttling.
   First full-scope worker loading was about 1.36-1.38 seconds on local Chromium
   preview, 367 ms on WebKit. These are localhost samples, not mobile-network claims.
- Generator output: 27 books, 137,554 tokens, 7,927 source verse references and
   26 numeric coverage gaps. Shards total 58,060,538 raw bytes / 3,837,541 gzip
   bytes (3.64 MiB); largest shard 8,237,518 bytes, manifest 120,286 bytes. Actual
   hosted compression, physical-device memory, and mobile-network transfer remain
   unmeasured. The corpus passes the proposed 5 MiB gzip target.
- All 27 bundled inputs were compared with pinned upstream commit
   `aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d` and matched byte-for-byte.
   Source files, old XML and legacy converters are unchanged. `check:nt` verifies
   new JSON reproduction read-only; it does not fetch upstream data.

Canonical NT lemma/POS/normalized fields now survive generation and reading;
Strong's linkage is intentionally absent. Active Greek imperative `D`, source
POS and degree decoding are fixed on the Inspector path. These old NT defects
are no longer future prerequisites. No verified lexical dictionary enrichment
has been established. Annotation accuracy and contextual meaning remain distinct.

Real iPhone/Android testing is unverified; browser emulation is not an actual
phone. Research uses no hosted AI or backend. New manifest requests are network-only
through the new worker policy and HTTP-revalidated; hashed shards are checked for
SHA-256/schema/corpus identity. Old service-worker versions and offline diagnostics
were not re-certified. No deployment or repository settings were changed.

## Historical Foundation Evidence (2026-11-01)

Evidence below is from foundation implementation on macOS arm64. Commands were
run under Node 22 LTS via `npm exec --yes --package=node@22 -- <command>` where
the local default Node 23 is outside Vitest's support range. These are observations,
not permanent exemptions from checking future changes.

### Passing Checks at That Time

- Lockfile installation, TypeScript, and Vite/PWA production build.
- 56 tests across morphology, BibleEngine, DictionaryService, navigation hook,
  and mocked feedback error rendering. Small samples are not full language coverage.
- Guidance frontmatter/YAML, descriptions, skill names, reviewer tool restrictions,
  representative positive/negative globs, and relative links.
- All 66 mapped XML book files validate; canonical book IDs and two bounded
  authentic verse fixtures match bundled data. A MorphGNT source sample verifies
  seven columns and eight parsing positions. Unmapped legacy masters and comprehensive
  lemma/morphology correctness are outside this structural check.
- Four Chromium smoke checks across 1440x900 desktop and Pixel 7 emulation:
  Hebrew/Greek selection, keyboard activation, references, Jude-to-Revelation
  movement, missing lexical linkage, and controlled HTML book-load failure.
  Screenshots are captured in `test-results/`; external Tailwind/fonts are required.

Two small runtime repairs were necessary for these gates: Formspree SubmissionError
API access, and canonical OSIS casing for `1 John` reference parsing. No biblical
corpus, conversion script, or morphology table was changed.

## Remaining Findings and Historical Context

1. **Offline acceptance failed.** Both desktop/mobile tests found an active service
   worker but empty caches; an independent browser probe also failed to reload while
   offline. Cause remains unresolved. `npm run test:e2e:offline` retains the original
   acceptance assertions as a separate failing diagnostic. Offline is explicitly
   optional/deprioritized by the latest owner decision and remains non-gating;
   no repair or storage framework is required for this sprint. The PR smoke gate does
   not establish offline support. Worker update behavior is also unverified.
2. **Hebrew visual token order needs correction.** Desktop screenshot shows source
   token zero at the left of the first row, despite RTL markup. Reader combines
   `dir="rtl"` with `flex-row-reverse`; attribute checks alone do not verify readable
   order. A source-order/layout regression test should precede a focused repair.
3. **No verified lexical dictionary enrichment.** The historical Matt 1:1 selected
   word has a blank lexicon panel. Dictionary format extraction/availability needs
   investigation; synthetic dictionary tests are not full real-corpus tests. The
   new NT path provides actual lemma/POS and an explicit missing-definition state,
   not a fabricated Strong's lookup or a certified dictionary repair.
4. **Source and Hebrew limitations remain.** Partial Hebrew tables/display,
   annotation uncertainty and edition coverage remain in
   [data contracts](DATA_SOURCES.md). The old NT field loss and active Greek
   D/degree/POS issues were addressed; do not retain them as unresolved blockers.
5. **PWA metadata and weight.** Declared icon files are absent. The build reports
   roughly 43 MiB precache, including legacy assets; first-visit download/storage
   and update behavior need measurement.
6. **Dependency security.** Historical foundation audit reported 23 findings: 3 low, 6 moderate,
   14 high, no critical. Existing build-tool dependency remediation needs a separate
   scoped task. Newly selected Vitest 5 avoids the critical advisories encountered
   in the trial Vitest 3 install. This is not a security certification.

## Checks Still Required Elsewhere

The GitHub Actions job has been structurally checked, not executed on GitHub or
Ubuntu. Repository protections and Cloudflare dashboard settings are not changed
or verified. Actual Copilot client discovery/skill invocation/reviewer tool access
need a fresh VS Code session and later an approved cloud pilot. No cloud-agent
setup, provider credentials, runtime AI, billing, or deployment has been enabled.

Run the current commands in [CONTRIBUTING](../CONTRIBUTING.md) and report failures
honestly. Preserve Hebrew/offline/security findings without expanding this sprint
into unrelated repairs. Passing source-fidelity/search tests is not a certificate
that scholarly annotations or an interpretation are infallible.