# Project Principles

Tomlinson is an original-language Scripture research workspace, built first for
Adam Kraft's own study and shared for others to use. It began as a BibleWorks
replacement proof of concept; compatibility with BibleWorks is not its mandate.
It is also a portfolio project demonstrating careful, agent-assisted engineering.

## Motivation and Access

The owner's Christian conviction is that the Gospel is good news freely
available, especially to the person who has nothing. Access to resources intended
for human betterment should not be deliberately restricted to sell upgrades.
This motivation does not imply institutional or denominational affiliation.

The intended access commitments are:

- Keep texts, linguistic inspection, deterministic research, source citations,
  and documented research methods useful without payment or an LLM.
- Prefer the best legally reusable free resources, with attribution and evidence
  of their quality and provenance. Free-to-read does not mean free-to-redistribute.
- Do not degrade free workflows to encourage payment or silently depend on a
  proprietary research library.
- Make supporting evidence inspectable rather than exclusive to AI explanations.

Hosted AI incurs costs. Charging for computation does not completely resolve the
access concern: people unable to pay would still need a funded path. Personal
budgets, voluntary support, sponsored allocations, user-supplied providers, and
local models are options to evaluate, not commitments. Hardware and API keys are
not an access solution for people with nothing. Never promise unlimited free AI
without funding, or assume the owner can subsidize every user indefinitely.

No billing model or application source-code license has been selected. A free
service is not automatically open-source software. Respect each resource's rights
separately from any future application license.

## Research and Interpretation

Follow the [interpretive method](INTERPRETIVE_METHOD.md): investigate the passage's
language, literary context, and historical setting before applying a systematic
theological framework. Be transparent about assumptions; do not claim belief-free
neutrality or treat the owner's conclusions as universal scholarly consensus.

Separate source text, linguistic annotation, lexical gloss, historical evidence,
and interpretation. Missing data is not permission to invent a result. Neither a
dictionary gloss nor an etymology establishes a passage's meaning.

## AI and Scope

Development agents and student-facing AI are different systems. The current app
has no research AI integration. Future AI should operate reproducible tools,
explain their use, cite inspectable evidence, and expose uncertainty and evidence
that challenges a reading. Retrieval alone does not eliminate hallucinations.

Microsoft Foundry is the owner's preferred future inference provider, not an
approved infrastructure design. Keep any future provider integration separate
from the research engine, authenticated and budgeted on the server side. Never
put provider credentials in a browser bundle.

The explicitly authorized NT sprint implements a canonical pinned all-27-book
MorphGNT/SBLGNT reader and deterministic lemma/form/proximity research, mobile
chapter reading and in-session result return. Browser checks do not establish
physical-device acceptance, latest SBLGNT, all manuscript readings, or semantic certainty.
See [source decision](decisions/001-nt-research-source.md) and
[validation status](VALIDATION_STATUS.md). Keep text and annotation attribution
separate; no data license silently decides the application-code license.

Mobile study and reliable research take precedence over offline support. Offline
is optional/deprioritized; retain the known non-gating diagnostic, without making
offline repairs or new storage infrastructure a sprint dependency.

Broader Koine/LXX ingestion, first-century background resources, manuscript
comparison, early Christian reception and Daily Dose of Greek source lookup
remain deferred. No backend, React Router, runtime AI or redesign is implied.
Do not add corpora, features, hosted AI, billing or deployment unless explicitly
requested/authorized. This protects scope without permanently banning later
owner-approved work. Historical Cursor plans are not implementation orders.