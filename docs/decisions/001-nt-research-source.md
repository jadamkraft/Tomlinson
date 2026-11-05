# NT Research Source Decision

Date: 2026-11-05. Decision: retain the bundled MorphGNT/SBLGNT source for the
first Greek research corpus; replace the lossy derived NT data path, not the text
edition. This decision does not designate one edition universally authoritative.

## Evidence and Alternatives

| Candidate | Strength | Constraint / decision |
| --- | --- | --- |
| MorphGNT/SBLGNT | Critically edited text, separate lemma/POS/eight-position parsing, already bundled | Selected. Preserve source distinctions and record version-specific omissions. Correct our field loss, not source readings. |
| Macula core Greek | SBLGNT/Nestle1904, morphology and richer linguistic structure | Credible future annotation candidate. Component rights differ; MARBLE permission cannot be generalized to all reuse. No syntax/semantic layer needed this sprint. |
| STEP TAGNT | Edition membership, lexical/morphological tags and comparison potential | Amalgamated variant rows require a coherent edition selection. Do not count variants as one continuous NT. Not a reason to introduce alignment complexity now. |
| Nestle1904 | Historical critical edition with available annotations | Component licenses differ; age or availability does not establish superior authority. Not selected as a replacement. |

All 27 bundled text files were compared by SHA-256 with MorphGNT commit
`aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d` and matched byte-for-byte on the
decision date. The importer records each source hash; the README's 6.12 citation
alone is not our version identity. Builds use local pinned files, not network
downloads. Derived version identity changes when source or importer schema changes.

The seven source fields are reference, POS, parsing code, punctuated text,
unpunctuated word, normalized word, and lexical lemma. Romans 8:9 has surface
`σαρκὶ`, normalized `σαρκί`, lemma `σάρξ`, POS `N-`, parsing `----DSF-`.
Romans 8:1 also retains editorial marks in `⸀Ἰησοῦ·`. Do not strip such marks
from display or treat normalized surface text as a lexical lemma.

## Rights and Coverage

[Official SBLGNT sources](https://github.com/Faithlife/SBLGNT) and the
[official license](https://sblgnt.com/license/) publish text under CC BY 4.0,
copyright Society of Biblical Literature and Logos Bible Software (2010).
[MorphGNT](https://github.com/morphgnt/sblgnt) separately publishes parsing and
lemmatization under CC BY-SA 3.0; retain its Tauber 2017 / MorphGNT 6.12 citation
and identify modifications. Derived corpus annotations retain those obligations;
they do not set the application-code license. Attribution and license links must
accompany distributed artifacts and be accessible in the reader.

The official SBLGNT repository records v1.2's addition of John 7:53-8:11 in July
2023. Our pinned MorphGNT stream predates that addition. It is not the latest
SBLGNT text and does not contain every traditional verse or manuscript reading.
Generate a coverage inventory of source references/gaps; do not insert newer
unannotated verses or infer missing annotations by aligning token positions.
For absent references, explain source coverage rather than imply text loss.

Morphological/lemma annotation is scholarly analysis, not infallible evidence of
contextual meaning. Preserve raw codes; correct our imperative D decoding, not
the underlying tags. Strong's matches from old XML are fuzzy derivatives and
are neither canonical lemma identity nor a prerequisite for research.

## Future Corpora

[Macula](https://github.com/Clear-Bible/macula-greek) and its
[component license inventory](https://github.com/Clear-Bible/macula-greek/blob/main/LICENSE.md),
[STEPBible](https://github.com/STEPBible/STEPBible-Data), and
[Nestle1904](https://github.com/biblicalhumanities/Nestle1904) remain separately
identifiable sources, not layers to merge implicitly.

[CCAT/CATSS LXX terms](https://ccat.sas.upenn.edu/gopher/text/religion/biblical/lxxmorph/0-readme.txt)
restrict commercial use without consent and impose redistribution conditions.
Public availability is not unrestricted product reuse. LXX ingestion and
cross-corpus lemma alignment require a later decision, not an NT sprint dependency.

## Consequences

Generate new deterministic, content-addressed NT JSON assets without changing the
bundled source or legacy XML. Reader and searches use the same canonical stream.
Keep OT XML loading intact. No silent fallback to lossy NT XML, inferred Strong's
identity, or edition blending. A source change requires a new corpus identity and
review of data differences and rights, not just a filename replacement.