# Interpretive Method

The owner's approach, learned from Dr. Alan Tomlinson, is non-systematic:
investigate a passage first in its literary and historical setting, seeking how
its original audience would have understood it. Do not begin by forcing the
passage into a systematic theological conclusion.

Tomlinson illustrated the principle with "trunk of a tree, trunk of a car, trunk
of an elephant - context determines meaning." A list of possible definitions is
not the same thing as evidence of a word's meaning in a particular passage.

## Research Order

1. Read the passage and surrounding discourse; examine syntax, genre, speakers,
   audience, and the document's purpose.
2. Examine the word's use in that passage and book.
3. Compare usage in explicitly selected writings attributed to the same author,
   with transparent treatment of disputed or unknown authorship.
4. Compare other New Testament writings and suitable wider Koine evidence.
5. Examine first-century historical backgrounds, identifying direct evidence,
   reconstruction, and uncertainty.

This order guides investigation, not a mechanical ranking that overrides the
evidence. Original-audience understanding is a research aim and inference, not
something the app or an LLM can certify.

## Word-Context Research

The authorized NT sprint implements deterministic lemma/form concordance and
proximity search over one pinned MorphGNT/SBLGNT corpus for reading and research.
It does not implement collocation statistics or inferred word senses. Select a
word, inspect occurrences with surrounding Greek, and open a result's full
chapter. Current integrated/browser verification and remaining limitations are in
[validation status](VALIDATION_STATUS.md).

Romans 8:9 is the fresh-visit starting passage: select surface `σαρκὶ`, inspect
lexical lemma `σάρξ`, normalized word `σαρκί`, source POS and parsing, then compare
occurrences with optional companion `ἐν`. Romans 8:1 `ἐν Χριστῷ` and Romans 8:9
`ἐν πνεύματι` are companion investigations, not preselected theological answers.
Do not equate every occurrence of `σάρξ` with sin or assign a sense from counts.

Word proximity and frequency are evidence, not proof of a shared sense. Preserve
distinctions between inflected forms, lemmas, and Strong's links. Do not import
every possible lexical sense into each occurrence, or equate a root's history
with contextual meaning.

The implemented keys use NFC only: source lexical lemma or unpunctuated `word`,
case/accent sensitive. Surface `σαρκὶ` does not silently match normalized `σαρκί`.
Companion direction is before/after/either, distance 1-10 lexical tokens,
default 5/either; chapter boundaries apply, but windows can cross verses. Each
target counts once even with several qualifying companions; self-companions are
excluded. Results are 25/page, in canonical order, with exact loaded-scope total
and token denominator. Incomplete scope must not masquerade as an all-NT count.
A verse is a reference unit,
not necessarily a sentence. Counts and comparisons need denominators and clear
limits for small samples, different genres, quotations, and annotation coverage.

Comparison presets expose Pauline seven-letter, additional six-letter, and all
thirteen-letter memberships without settling disputed authorship. Hebrews is
not assigned to Paul. Other NT books means outside that thirteen-letter set,
not an author group. The metadata's Wikipedia citation is introductory, not a
primary scholarly authority. Prefer explicit books and inspect group membership;
support substantive authorship claims with appropriate scholarship.

Earlier Septuagint Greek, documentary papyri, literary prose, the New Testament,
and later patristic Greek are not interchangeable first-century evidence. Record
dates, genres, locations where known, editions, and uncertainty; let researchers
choose comparison scopes rather than silently mixing them.
Wider Koine/LXX corpora, sentence/syntax analysis and statistical collocation
remain deferred; their absence does not prevent this bounded NT investigation.

## Historical and Reception Sources

Distinguish autographs (not extant), manuscript witnesses and transcriptions,
critical editions, translations, and annotations. The existing Greek text is
derived from the pinned MorphGNT/SBLGNT stream, not direct access to the biblical
autographs or all manuscript readings. It is not latest SBLGNT; John 7:53-8:11
is absent. See [source decision](decisions/001-nt-research-source.md).

Later Fathers can illuminate reception history. An author's interpretation is not
automatically evidence of the biblical author's intended meaning. Preserve work,
section, date, edition, translator, language, and attribution uncertainty. Hebrew
Bible research should also leave room for Jewish interpretation and historical
context rather than automatically applying later Christian reception.
Future Daily Dose of Greek links/source lookup require identifying the actual
resource, passage, author and reuse terms; they are not implemented this sprint.

## AI Behavior

An assistant may explain parsing, formulate a query, run deterministic tools,
organize inspectable results, and suggest further questions. Separate observations
from interpretations and disclose the selected method. Do not invent counts,
quotations, citations, or backgrounds. Identify alternative readings and
counterevidence without pretending all explanations are equally supported.