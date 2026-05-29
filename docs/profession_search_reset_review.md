# Profession Search Reset Review

Date: 2026-05-29  
Branch: `reset-profession-search`

## Objective

Reset profession search to a clean, controlled, trustworthy baseline before redesigning the data architecture.

This reset intentionally disables the current O*NET/market-title complexity at runtime and replaces it with a strict seed-based search layer.

## What Was Removed/Disabled

Runtime search no longer depends on:

- full imported O*NET occupation dataset
- 58k O*NET aliases
- Top 2000 generated market-title mappings
- generated mapping confidence layers
- fuzzy contains matching
- weak fallback results
- alphabetical fallback behavior

Note: source files remain in the repository for later redesign, but they are not used by runtime profession search in this reset.

## What Remains

- Assessment flow after profession selection remains unchanged.
- RIASEC display and results-page structure remain unchanged.
- ILONAA AI Replacement Risk model remains unchanged.
- Methodology page and landing page copy remain unchanged.
- Profession selection continues to provide a `SelectedProfession` object to the existing scoring pipeline.

## Temporary Seed Dataset

- Seed list size: **127** profession titles (`src/data/professionSeedTitles.ts`)
- Controlled titles only
- One internal placeholder occupation profile template is used for all seed titles
- Allowed acronym alias behavior is restricted to:
  - `CEO`, `CFO`, `CTO`, `CIO`, `COO`, `CMO`, `CHRO`

## Search Behavior (Reset Rules)

Enabled matching:

1. exact title match
2. acronym match (restricted set only)
3. title prefix match
4. token prefix match

Disabled matching:

- fuzzy contains matching
- weak semantic/fallback matching
- unrelated broad role expansion

Confidence threshold:

- `MIN_SEARCH_CONFIDENCE = 0.80`
- Below threshold => result hidden

Dropdown rendering:

- shows **profession title only**
- hides descriptions, O*NET titles, codes, explanations, and baseline text

## Regression Test Coverage

Added executable checks:

- `scripts/testProfessionSearchReset.ts`

Validated requirements:

- CEO returns `CEO` / `Chief Executive Officer` only
- CTO returns `CTO` / `Chief Technology Officer` only
- Product Manager returns `Product Manager` only
- `phys` returns `Physicist` first
- no tested query returns unrelated occupations

## Example Output Snapshot (After Reset)

- `CEO`
  - `CEO` (confidence `0.990`, exact)
  - `Chief Executive Officer` (confidence `0.960`, acronym)
- `CTO`
  - `CTO` (confidence `0.990`, exact)
  - `Chief Technology Officer` (confidence `0.960`, acronym)
- `Chief of Staff`
  - `Chief of Staff` (confidence `0.990`, exact)
- `Product Manager`
  - `Product Manager` (confidence `0.990`, exact)
- `Product Owner`
  - `Product Owner` (confidence `0.990`, exact)
- `Physicist`
  - `Physicist` (confidence `0.990`, exact)
- `Software Engineer`
  - `Software Engineer` (confidence `0.990`, exact)
- `Teacher`
  - `Teacher` (confidence `0.990`, exact)
- `Lawyer`
  - `Lawyer` (confidence `0.990`, exact)
- `phys`
  - `Physicist` (confidence `1.000`, prefix)

## Known Limitations (Intentional for Reset)

- Occupation scoring baseline currently uses a temporary placeholder profile for all seed titles.
- Search coverage is intentionally narrow (seed only).
- No long-tail alias resolution beyond restricted acronym support.
- Not intended as final architecture; this is a trust-first stabilization state.

## Recommendation For Rebuild

Rebuild the profession layer as a strict multi-stage pipeline:

1. **Canonical title layer first**  
   Curated market-facing profession titles as the only UI-visible entities.

2. **Internal mapping layer second**  
   Alias and O*NET data used only as hidden recall candidates, never rendered directly.

3. **Deterministic relevance scoring**  
   Prefer exact/prefix/token-prefix with explicit thresholds and auditable rank reasons.

4. **Hard confidence gate**  
   If candidate confidence is below threshold, return no result.

5. **Automated regression suite**  
   Keep canonical query packs (executive, knowledge work, STEM, education, legal, healthcare) and fail CI on irrelevant output drift.

