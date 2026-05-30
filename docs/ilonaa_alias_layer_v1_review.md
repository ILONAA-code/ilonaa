# ILONAA Alias Layer v1 Review

Date: 2026-05-30
Branch: `reset-profession-search`

## Goal

Validate a tiny ILONAA-curated alias layer on top of:

- O*NET occupations
- O*NET aliases

No market-title layer, no LLM, no search redesign.

## Implemented curated aliases (only)

1. `Product Owner` -> `Project Management Specialists` (`13-1082.00`)
2. `Chief of Staff` -> `General and Operations Managers` (`11-1021.00`)
3. `UX Researcher` -> `Market Research Analysts and Marketing Specialists` (`13-1161.00`)
4. `Design Researcher` -> `Market Research Analysts and Marketing Specialists` (`13-1161.00`)

File added:

- `src/data/ilonaaOccupationAliases.json`

## Search order

Search order in runtime now:

1. O*NET canonical titles
2. O*NET aliases
3. ILONAA curated aliases

Curated aliases are matched with the same alias behavior and scoring as O*NET aliases, but are surfaced as:

- `matchType: ilonaa_alias`

## Before vs After

Before (all four queries):

- `Product Owner` -> `no_match`
- `Chief of Staff` -> `no_match`
- `UX Researcher` -> `no_match`
- `Design Researcher` -> `no_match`

After:

- `Product Owner` -> `Project Management Specialists` (`13-1082.00`)
- `Chief of Staff` -> `General and Operations Managers` (`11-1021.00`)
- `UX Researcher` -> `Market Research Analysts and Marketing Specialists` (`13-1161.00`)
- `Design Researcher` -> `Market Research Analysts and Marketing Specialists` (`13-1161.00`)

## Required test output

| Input | Best Match | O*NET Code | Match Type | Matched Alias | Confidence |
| --- | --- | --- | --- | --- | ---: |
| Product Owner | Project Management Specialists | 13-1082.00 | ilonaa_alias | Product Owner | 0.95 |
| Chief of Staff | General and Operations Managers | 11-1021.00 | ilonaa_alias | Chief of Staff | 0.95 |
| UX Researcher | Market Research Analysts and Marketing Specialists | 13-1161.00 | ilonaa_alias | UX Researcher | 0.95 |
| Design Researcher | Market Research Analysts and Marketing Specialists | 13-1161.00 | ilonaa_alias | Design Researcher | 0.95 |

## Scope confirmation

- No other mappings were changed.
- No additional aliases were added.
- Search architecture remains ONET-first with a minimal ILONAA alias extension.
