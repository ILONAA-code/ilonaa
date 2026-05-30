# Profession Search ONET Clean Rebuild Review

Date: 2026-05-30
Branch: `reset-profession-search`

## 1) Obsolete files/layers removed or disabled

### Removed runtime data layers

- `src/data/marketTitles.json`
- `src/data/professionLayerFinal.json`
- `src/data/professionLayerDeferred.json`
- `src/data/professionAliasMap.json`
- `src/data/professionSeedTitles.ts`

### Removed old generation/expansion tooling

- `scripts/generateMarketTitleLayer.ts`
- `scripts/generateMarketTitleReports.ts`
- `scripts/generateModernProfessionMappingReview.ts`
- `scripts/generateFinalProfessionLayerValidation.ts`
- `scripts/applyFounderMappingFreeze.ts`
- `scripts/freezeProfessionLayerClassA.ts`
- `scripts/generateIndeedOnetExpansionAudit.ts`
- `scripts/testProfessionSearchReset.ts`

### Archived old profession-search documentation

Moved to:

- `docs/archive/profession-search-old/`

Including deprecated market-title, crosswalk, dedup/simplification, and expansion proposal documents.

## 2) ONET data imported

Clean ONET import was rerun using `scripts/importOnetData.ts`.

Imported fields (internal reference data):

- O*NET occupation code
- canonical title
- alternate titles / aliases
- description
- RIASEC scores + primary/secondary type
- work activities, work styles, skills, abilities, work context
- derived ILONAA baseline factors used by current scoring model

Output dataset:

- `src/data/onetOccupations.json`

## 3) Number of ONET occupations

- **1016**

## 4) Number of ONET aliases

- **58281**

## 5) Search ranking logic

Search is now ONET-only over canonical titles + ONET aliases.

Normalization:

- trim
- lowercase
- punctuation removal
- whitespace collapse
- conservative token singularization

Ranking order:

1. exact canonical ONET title match
2. exact ONET alias match
3. canonical title prefix match
4. alias prefix match
5. token prefix match (strict-safe prefix)
6. strong token overlap only (>= 2 tokens and high overlap ratio)

Explicitly disabled:

- weak contains fallback
- alphabetical fallback when relevance is low

## 6) Confidence scoring logic

- Each candidate starts from a rule tier score (exact/prefix/token level).
- Length-difference penalty reduces confidence for weak near-matches.
- Confidence thresholding suppresses low-quality candidates:
  - global minimum confidence
  - stricter threshold for token-overlap tier
- If no candidate exceeds threshold, result is `no_match`.

## 7) Initial test cases (required set)

| Input | Best Match | O*NET Code | Match Type | Matched Alias | Confidence | Top Source |
| --- | --- | --- | --- | --- | ---: | --- |
| CEO | Chief Executives | 11-1011.00 | onet_alias | CEO | 0.950 | ONET alias |
| Chief Executive Officer | Chief Executives | 11-1011.00 | onet_alias | CEO (Chief Executive Officer) | 0.668 | ONET alias |
| CTO | Chief Executives | 11-1011.00 | onet_alias | CTO | 0.950 | ONET alias |
| Chief Technology Officer | Chief Executives | 11-1011.00 | onet_alias | Chief Technology Officer | 0.950 | ONET alias |
| CFO | Chief Executives | 11-1011.00 | onet_alias | CFO | 0.950 | ONET alias |
| Product Manager | Marketing Managers | 11-2021.00 | onet_alias | Product Manager | 0.950 | ONET alias |
| Product Owner | no_match | - | no_match | - | 0.000 | no_match |
| Physicist | Physicists | 19-2012.00 | canonical_title | - | 1.000 | original ONET title |
| Physiker | no_match | - | no_match | - | 0.000 | no_match |
| Teacher | Adult Basic Education, Adult Secondary Education, and English as a Second Language Instructors | 25-3011.00 | onet_alias | Teacher | 0.950 | ONET alias |
| Lawyer | Lawyers | 23-1011.00 | canonical_title | - | 1.000 | original ONET title |
| Electrician | Electricians | 47-2111.00 | canonical_title | - | 1.000 | original ONET title |
| Software Engineer | Software Developers | 15-1252.00 | onet_alias | Software Engineer | 0.950 | ONET alias |
| Data Scientist | Data Scientists | 15-2051.00 | canonical_title | - | 1.000 | original ONET title |
| Chief of Staff | no_match | - | no_match | - | 0.000 | no_match |
| Customer Success Manager | First-Line Supervisors of Office and Administrative Support Workers | 43-1011.00 | onet_alias | Customer Success Manager | 0.950 | ONET alias |

## 8) Match-source statement per test

- canonical ONET title: Physicist, Lawyer, Electrician, Data Scientist
- ONET alias: CEO, Chief Executive Officer, CTO, Chief Technology Officer, CFO, Product Manager, Teacher, Software Engineer, Customer Success Manager
- no match: Product Owner, Physiker, Chief of Staff

## 9) Known gaps

- ONET alias coverage creates some broad-role ambiguity (example: `Teacher` maps to many aliases).
- Some modern market roles are not present as clean ONET aliases (`Product Owner`, `Chief of Staff`) and currently return `no_match`.
- Alias-heavy executive terms map to canonical ONET occupation labels (for example, several C-level queries mapping to `Chief Executives`), which is expected for ONET-first architecture.
- Non-English terms are not yet supported unless present in ONET aliases.

## 10) Recommendation for next step

Recommended next step: **both**, in phases.

1. Add a small ILONAA-curated alias layer (high precision, transparent, governed) for critical missing market terms.
2. Add optional LLM fallback only after curated aliases, and only as a low-confidence assistive layer with strict guardrails and explicit confidence labeling.

This keeps ONET as source of truth while improving modern-title recall safely.
