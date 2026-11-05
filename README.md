# Tomlin\son

**A text-first original-language Scripture research workspace for personal study
and freely shared use.**

_Built with React 19, TypeScript, Vite, and Cloudflare Pages._

---

## 📖 The Story Behind the Name

This project is a digital homage to two giants of biblical scholarship who shaped my understanding of the text at Midwestern Baptist Theological Seminary (MBTS):

- **Dr. Alan Tomlinson** (New Testament / Greek)
- **Dr. Blake Hearson** (Old Testament / Hebrew)

The name **Tomlin\son** is a playful portmanteau. The backslash represents the "cutting" of the text (exegesis) or perhaps a file path, but it serves a dual purpose: it pays tribute to Dr. Tomlinson while jokingly "subsuming" Dr. Hearson into the suffix.

It is a fitting metaphor for how the Old Testament is often (unjustly!) tucked behind the New in modern study—sorry, Dr. Hearson!

### In Memoriam & Tribute

Dr. Tomlinson was a humble, genuine man who taught that you must determine meaning from within the document and its intended purpose. His students will remember the mantra:

> _"Trunk of a tree, trunk of an elephant, trunk of a car. Context determines meaning."_

I kept attendance for him every semester I could—ostensibly for a free book from his library, but mostly just to get extra time to talk to him. This tool is built in that spirit of digging into the context.

---

## 🚀 Mission & Vision

**Goal:** Build a personally useful research tool centered on the text, its
literary context, and its original audience's historical setting. BibleWorks was
the starting inspiration, not a feature-parity requirement.

The owner's Christian motivation is that the Gospel is freely available,
especially to people with nothing. The intended research core and supporting
evidence should remain useful without payment or AI. There is no institutional
denominational affiliation. Hosted AI costs and access models remain unresolved;
no billing or research LLM integration is implemented.

See [project principles](docs/PROJECT_PRINCIPLES.md) and the
[non-systematic, text-first interpretive method](docs/INTERPRETIVE_METHOD.md).

**Key Features:**

- **NT Reading:** Fresh visits open Romans 8:9 in its full chapter. Reading and
	research use one pinned MorphGNT/SBLGNT JSON corpus across all 27 NT books;
	OT reading retains XML. No NT XML fallback silently changes the source.
- **Word Inspection:** Select Greek or Hebrew words for supplied linguistic
	information. NT retains actual lexical lemma, source POS, surface and
	normalized forms; Strong's linkage is intentionally absent. The Inspector
	uses exact NFC Greek lemma matches against the attributed historical lexicon;
	missing/ambiguous entries remain explicit, and Hebrew limitations remain.
- **Word Research:** Lemma/form concordance, optional companion-lemma proximity,
	explicit book/comparison scopes, 25-hit pages, and full-chapter result
	opening with in-session return state. Mobile/desktop browser checks cover the
	Romans study workflow; physical-device testing remains unverified.
- **PWA:** Caching is configured, but the historical offline diagnostic fails.
	Offline is optional/deprioritized and non-gating, not promised first-load
	availability or a prerequisite for this research sprint.
- **Contextual Navigation:** "Canon-aware" navigation that flows seamlessly across book boundaries.

**Historical Ideas, Not Approved Tasks:**

- **"Legendary Notes" Integration:** Digitizing Dr. Tomlinson's breakdown notes directly into the reader.
- **Student Collaboration:** Adapting the tool to serve the specific needs of current MBTS students.

The authorized NT sprint implements bounded word-context research without runtime
AI. Lemma keys use NFC; form keys use the source unpunctuated word, NFC and
case/accent sensitive (`σαρκὶ` surface is not normalized `σαρκί`). Companion
direction is before/after/either, distance 1-10 tokens (default 5), within chapter
but across verses; each target counts once. Complete-scope counts describe source
occurrences, not theological senses. Pauline comparison presets do not settle
authorship; Other NT books excludes the thirteen Pauline-name letters.

Verified generator output: 137,554 tokens, 7,927 source verse references, 3.64 MiB
gzip book shards. This pinned stream is not latest SBLGNT; John 7:53-8:11 is
absent, and all 27 books does not mean all manuscript readings. Text is CC BY 4.0;
MorphGNT annotations are separately CC BY-SA 3.0. See
[data contracts](docs/DATA_SOURCES.md), [source decision](docs/decisions/001-nt-research-source.md),
and [validation status](docs/VALIDATION_STATUS.md). LXX, manuscript
comparison, statistical collocation and Daily Dose of Greek source lookup remain
deferred. No application-code license is selected by these data licenses.

## 🛠️ Tech Stack

- **Core:** React 19, TypeScript, Tailwind CSS
- **Data:** Canonical pinned MorphGNT/SBLGNT NT JSON; OT OSIS XML with OSHB parsing
- **Infrastructure:** Cloudflare Pages (CI/CD)

## Development

Production: [tomlinson.jadamkraft.com](https://tomlinson.jadamkraft.com/).
Cloudflare Pages deploys through its existing GitHub connection; this repository's
new GitHub Actions workflow validates changes, not deploys them.

Use Node 22 LTS (22.12+) as specified by `.nvmrc`. If nvm is installed, run
`nvm install` and `nvm use`. The foundation was checked using Node 22 through
`npm exec --yes --package=node@22 -- <command>` on this machine, whose default
Node 23 is outside the current test-tool support range.

```sh
npm ci
npm run check
npx playwright install chromium webkit
npm run test:e2e
npm run dev
```

Sprint commands: `npm run build:nt` generates canonical NT artifacts;
`npm run check:nt` uses the generator's read-only `--check` to compare exact bytes
and inventory against pinned local sources. `npm run check` includes `check:nt`.
Normal `npm run build` remains
Vite's build and does not download upstream text or regenerate the corpus.

`npm run check` runs guidance/data/NT checks, TypeScript, unit tests, and the production
build. `npm run test:e2e` exercises reader/research
against a build
and preview; it requires access to the existing external Tailwind/fonts. Browser
evidence is written to ignored `test-results/`.

`npm run test:e2e:offline` is a separate acceptance diagnostic that currently
failed in the foundation run; it is not skipped and is not included in the PR gate.
Offline repairs and new storage infrastructure are outside this sprint. A passing
smoke suite must not be reported as offline or full linguistic acceptance.

For manual inspection: `npm run build`, then
`npm run preview -- --host 127.0.0.1`. See
[CONTRIBUTING](CONTRIBUTING.md) for the check matrix and cloud-agent boundaries,
[architecture](docs/ARCHITECTURE.md) for code ownership, and
[validation status](docs/VALIDATION_STATUS.md) for current evidence and follow-ups.

## Agent Guidance

[Copilot instructions](.github/copilot-instructions.md) are the single always-on
policy, supported by scoped instructions, two task skills, a read-only
text-integrity reviewer, and issue/PR templates under `.github/`. Cursor plans
remain historical; conflicting Cursor rules are retired. The canonical NT sprint
is explicitly authorized; further features/corpora, cloud-agent activation,
hosted AI, billing or deployment require explicit authorization. Existing hosted
templates and the Cloudflare pipeline remain unchanged.
