# Search Quality v3 Review

Date: 2026-05-30  
Scope: Search-quality improvements only (no architecture changes)

## 1) Before vs after examples

- Before (observed): `phys` could surface fragment/inconsistent options like `Phys` plus duplicate `Physician` entries.
- After: `phys` medium-confidence options are deduplicated and complete titles only (e.g. `Physicist`, `Physician`).
- Before: typo inputs had no deterministic correction helper.
- After: low-confidence typo inputs can show a local `Did you mean?` suggestion when confidence is very high.

## 2) Ranking improvements

- Added deterministic ranking tie-break preference for match type (`canonical_title` > `ilonaa_alias` > `onet_alias`) after confidence and score.
- For short-prefix ambiguity (e.g. `phys`), top visible candidate order now starts with complete profession names from strongest ranked matches.

## 3) Duplicate suppression

- Medium-confidence options are deduplicated by normalized display label before rendering.
- The same visible profession label cannot appear twice.

## 4) Incomplete title suppression

- Fragment-like labels are filtered from rendered suggestions.
- Suppressed examples include incomplete terms such as `Phys`, `Prod`, `Chief`, `Eng`, `Data`.

## 5) Spelling correction examples

- Implemented local Damerau-Levenshtein correction helper (no LLM, no API calls).
- Correction only appears for high-certainty typo candidates.
- User must explicitly tap the suggestion; input is never auto-replaced.

## 6) Validation matrix

| Input | Flow | Suggestions Shown | Top Ranking Snapshot | Duplicates Removed | Incomplete Suppressed | Spelling Correction |
| --- | --- | --- | --- | --- | --- | --- |
| phys | medium | Physicist, Physician | 1) Physicist (0.840); 2) Physician (0.800); 3) Physician (0.800) | Yes | Yes | - |
| physicist | high | - | 1) Physicist (1.000); 2) Medical Physicist (0.636); 3) Medical Physicist (0.636) | Yes | Yes | - |
| physisist | low | - | - | Yes | Yes | Physicist |
| physician | high | - | 1) Physician (0.950); 2) Physician (0.950); 3) Physician (0.950) | Yes | Yes | - |
| product manager | high | - | 1) Product Manager (0.950); 2) Product Line Manager (0.660); 3) Biofuels Product Manager (0.636) | Yes | Yes | - |
| prodcut manager | low | - | - | Yes | Yes | Product Manager |
| chief of staff | high | - | 1) Chief of Staff (0.950) | Yes | Yes | - |
| chief of staf | medium | Chief of Staff | 1) Chief of Staff (0.832) | Yes | Yes | Chief of Staff |
| ux researcher | high | - | 1) UX Researcher (0.950) | Yes | Yes | - |
| ux resercher | low | - | - | Yes | Yes | UX Researcher |

## Remaining known issues

- Some broad/short prefixes can still map to multiple plausible professions; medium-confidence step intentionally asks user selection instead of over-committing.
- Correction helper is intentionally strict, so some misspellings may not trigger suggestions unless confidence is very high.

## Non-goals respected

- No O*NET import changes
- No alias architecture changes
- No RIASEC/risk model/scoring changes
- No confidence-threshold changes in primary search engine
