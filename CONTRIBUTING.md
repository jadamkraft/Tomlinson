# Contributing and Agent Workflow

Read [project principles](docs/PROJECT_PRINCIPLES.md),
[interpretive method](docs/INTERPRETIVE_METHOD.md),
[architecture](docs/ARCHITECTURE.md), and [data contracts](docs/DATA_SOURCES.md).
The owner's study needs drive development; prior feature discussions and
`.cursor/plans/` are historical context, not approved implementation orders.

## Setup and Checks

Run commands from the repository root. Use Node 22.12 or newer within Node 22 LTS
for a consistent baseline; the locked React Vite plugin requires Node 20.19+ or
22.12+. Match CI's runtime rather than assuming any installed Node is supported.

| Command | Purpose |
| --- | --- |
| `npm ci` | Install the committed lockfile without selecting new dependency versions. |
| `npm run typecheck` | Typecheck (`npx tsc --noEmit` equivalent); Vite does not do this. |
| `npm run check:guidance` | Check customization YAML, representative globs, names, and relative links. |
| `npm run check:data` | Read-only mapped XML, canonical references, and authentic fixture checks. |
| `npm run build:nt` | Generate the approved canonical NT manifest/content-hash JSON from pinned local inputs; review artifact changes separately. |
| `npm run check:nt` | Generator `--check`: exact output bytes/inventory and pinned source hashes, read-only; no upstream fetch or regeneration on disk. |
| `npm run test` | Non-watch regression suite; `npm run test:watch` is for development. |
| `npm run build` | Produce `dist/` and the PWA service worker. |
| `npm run check` | Run guidance/data/NT checks, typecheck, unit tests, and build. |
| `npm run test:e2e` | Production-preview reader/research tests (Chromium/WebKit installation required). |
| `npm run test:e2e:offline` | Separate, currently failing warmed-cache offline acceptance diagnostic. |
| `npm run dev` | Development server (default port 3000). |
| `npm run preview -- --host 127.0.0.1` | Serve the built app for PWA/browser checks. |

Initial implementation baseline (2026-11-01, local Node 23.11): install and build
passed. Typecheck failed in `FeedbackModal.tsx` because Formspree errors are an
object, not an array (`length`/`map`). The foundation repairs that API use and the
canonical casing of numbered John references; current typecheck passes. npm
reported 23 vulnerabilities, unchanged in count after the final tooling install.
See [validation status](docs/VALIDATION_STATUS.md). Recheck current results instead
of ignoring failures because an earlier baseline passed.

`build:nt` generates approved derived files; `check:nt` is read-only and included
in the aggregate `check` script. With a different local default Node, use
`npm exec --yes --package=node@22 -- npm run check:guidance` (or the applicable
check). Current evidence is in validation status; the normal Vite build/Cloudflare
command remains unchanged.

Do not run `npm audit fix --force` or upgrade unrelated dependencies as part of a
feature. Security findings need a scoped assessment and regression checks. Do not
hide preexisting failures, silently skip correct tests, or bless erroneous output
in a snapshot. Report exactly what ran and what remains unverified.

## Task to Review

1. Specify the study need, representative passage, expected behavior, non-goals,
   and data impacts. Clarify ambiguous linguistic expectations before editing.
2. Inspect user changes and the owning implementation; identify a focused test
   that can disprove the proposed behavior.
3. Make a small change; run that check immediately. Keep corpus repairs and
   generated changes separately reviewable.
4. Run applicable automated checks and the manual browser matrix below. Report
   source/citation changes and remaining uncertainty.
5. Submit reviewed changes through a pull request. The owner decides whether to
   merge; never push/merge/deploy or change repository rules without authorization.

The approved NT sprint permits deterministic new NT JSON from the existing pinned
MorphGNT/SBLGNT inputs, not an edition switch, inferred Strong's links, manual
annotation blending, or LXX import. Follow the
[source decision](docs/decisions/001-nt-research-source.md). Use read-only
`check:nt` for validation; never run either old XML converter as a test. Keep source
rights/attribution, annotation share-alike and application-code licensing separate.
Future corpora/features require explicit authorization, not a permanent ban.

## Reader Verification

Use Rom 8:9 as the new default, plus Gen 1:1 and Matt 1:1 regressions; include a chapter/book
transition, selecting/deselecting a word, missing dictionary information, failed
book loading, keyboard focus, and desktop/mobile layout. Check diacritics and
direction visually, not only text presence. Mock feedback submissions and external
service side effects. Browser checks are not a license to send real messages.

Verify `σαρκὶ` surface / `σαρκί` normalized / `σάρξ` lemma separately; active Greek
imperative `D`, source POS and degree; honest missing dictionary/Strong's state.
Exercise lemma/form NFC-only keys, chapter-bounded cross-verse proximity,
direction/distance 1-10 (default 5), self-exclusion and one count per target,
complete selected-scope counts and 25-hit paging. Verify explicit Pauline group
membership/Other NT exclusion rather than treating presets as settled authorship.
Open full chapters, then check Back to results/browser Back and origin restoration
with query/page/scroll/focus retained in-session. Reload persistence is not promised.

Capture desktop and 360/390px mobile evidence for readable Greek, controls, focus,
no horizontal overflow, loading/error/retry and source omission states. Measure
worker/scope responsiveness separately from generator gzip size; 3.64 MiB book
gzip is not a browser performance certificate. Real-device/WebKit acceptance
must be recorded separately; do not claim it from Chromium emulation.

Offline is optional and explicitly deprioritized; its historical failure is a
non-gating diagnostic, not a requirement to add repairs/storage infrastructure.
For explicitly requested offline work: build, preview, wait for service-worker activation, warm the
tested routes/assets, then disconnect and reload. Report exactly which resources
were cached; first-visit offline and service-worker update behavior require their
own tests. Tailwind/fonts are external dependencies, not guaranteed local assets.
Do not call a dev-server test an offline acceptance check.

Install browsers with `npx playwright install chromium webkit` (Linux CI uses
`--with-deps`). Smoke tests start their own build/preview on strict port 4175 and
fail if it is occupied. They block service workers for controlled request mocks.
The separate offline suite enables service workers and keeps its acceptance
assertions intact; it remains outside this sprint's acceptance gate.
Do not represent this separation as full PWA acceptance. No `skip` or `xfail`
exceptions are used.

## Deployment and Cloud Agents

Production: https://tomlinson.jadamkraft.com/ . Cloudflare Pages' existing GitHub
connection handles deployment. A validation workflow must not duplicate it or
need Cloudflare credentials. Production branch, dashboard build/output/Node
settings, preview behavior, and rollback procedure still need owner confirmation.

Cloud handoff: clarified issue -> approved acceptance criteria -> agent branch /
draft PR -> checks -> source/UI review -> owner merge -> existing Pages deployment.
The cloud agent must not receive production admin credentials or auto-merge rights.
Repository rulesets/required checks are recommendations until the owner configures
them; instruction prose does not enforce access control.

Cloud activation is deferred. Decide whether it runs in a cloud sandbox, GitHub
Actions, or another supported environment before adding bootstrap machinery.
`.github/workflows/copilot-setup-steps.yml` with job `copilot-setup-steps` configures
Actions-hosted sessions only, not cloud sandboxes. It would install dependencies
with read-only checkout permissions; browser setup depends on the approved task.
Do not disable firewalls or add broad MCP access to work around missing setup.

## Customization Acceptance

Use one `.github/copilot-instructions.md`, scoped instructions, task skills, and a
read-only reviewer. Avoid duplicated root `AGENTS.md` policies and model-specific
copies. Retired Cursor rules must not be reintroduced as conflicting guidance.

Structural checks can validate locations, frontmatter, names, globs, and links.
Client discovery still needs a fresh VS Code chat and later a cloud pilot: inspect
instruction references, try a parser task and reader task, invoke the skills,
and confirm the reviewer has no edit access. Do not claim client discovery passed
because YAML parses. Keep policies concise and point to shared documents.