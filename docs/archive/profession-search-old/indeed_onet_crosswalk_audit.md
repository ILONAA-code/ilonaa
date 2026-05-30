# Indeed-O*NET Crosswalk Audit

Generated: 2026-05-29T22:02:51.725Z

## Data Source Used

- **Indeed market-title signal layer (proxy + targeted live verification)**
  - Current curated market-title layer (`src/data/marketTitles.json`) used as baseline market evidence.
  - Targeted live Indeed query snapshots used for explicit validation-set checks.
  - Note: direct high-volume automated scraping of Indeed search pages is constrained by anti-bot challenges; this run uses transparent proxy indicators for full-list scoring and explicit live checks for the validation set.
- **O*NET source-of-truth occupation layer**
  - `src/data/onetOccupations.json` used for canonical occupation mapping and one-to-one code assignment.

## Collection Approach

1. Build a candidate pool from O*NET titles, alternate titles, and search terms.
2. Normalize and deduplicate titles using case/spacing/punctuation canonicalization.
3. Enforce one-to-one mapping: titles that map to multiple O*NET occupations are excluded.
4. Attach market-frequency indicator via:
   - current market-title presence (strong market signal), and
   - title-form factors (market keyword density, title compactness).
5. Compute mapping confidence from combined mapping clarity + frequency indicator.

## Filtering Approach

- Removed non-market-facing titles (very long, highly niche, noisy technical labels).
- Removed ambiguous titles mapping to multiple occupations.
- Kept only candidates with deterministic one-to-one O*NET mapping.

## Normalization Approach

- Parenthetical cleanup
- plural-to-singular normalization for common role nouns
- case and punctuation normalization
- canonical key matching to prevent duplicate visible titles

## Matching Approach

- `Existing Market Title` for already curated visible titles
- `Primary O*NET Title Match` for normalized O*NET occupation titles
- `Alias Match` for O*NET alternate titles
- `Search Term Match` for O*NET searchable terms

## Candidate List

Full candidate list with required fields is generated in:
- `docs/indeed_onet_candidate_list.md`

Required fields included per title:
- Market Title
- Frequency Indicator
- O*NET Occupation
- O*NET Code
- Mapping Confidence
- Matching Method
