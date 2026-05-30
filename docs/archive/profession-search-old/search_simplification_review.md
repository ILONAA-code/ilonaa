# Search Simplification Review

Date: 2026-05-29

## Scope

Goal: simplify profession search UX so it feels obvious and trustworthy.

Implemented constraints:

- Visible dropdown results show **market-facing profession title only**.
- Hidden from dropdown: O*NET titles, descriptions, codes, baseline copy, and explanatory noise.
- O*NET alias corpus remains internal for matching/mapping only.
- Strict relevance and confidence filtering: weak matches are dropped.
- No alphabetical fallback for weak candidates.

---

## Before (noisy behavior)

Observed before cleanup:

- `CTO` returned unrelated roles such as `Customer Success Director`, `Academic Affairs Director`, `Account Director`, `Ad Director`.
- `phys` returned unrelated/specialized variants like `Animal Physiology Teacher`, `Astrophysics Teacher`, `Biophysics Scientist`, `Consultant Physician`.
- `Physicist` returned no result.
- Dropdown cards exposed extra context under each result (description + RIASEC labels), which reduced clarity.

---

## After (simplified behavior)

### UX behavior

- Dropdown cards now render title only (example: `Product Manager`).
- Query with low-confidence candidates now returns no result rather than noisy fallback.
- Duplicate visible titles are deduplicated by normalized market title.

### Ranking behavior

Matching order now prioritizes:

1. exact market-title match
2. exact acronym match (for short acronym queries, e.g. `CTO`)
3. title prefix match
4. token-prefix match (only if confidence remains above threshold)

Confidence gate:

- `MIN_SEARCH_CONFIDENCE = 0.80`
- Candidates below threshold are hidden.

---

## Query Examples (Before vs After)

### CTO

- **Before (visible):** `CTO`, `Chief Technology Officer`, `Chief Technical Officer`, plus unrelated director titles.
- **After (visible):**
  - `CTO` (confidence `1.000`, match `exact`)
  - `Chief Technology Officer` (confidence `0.995`, match `acronym`)
  - `Chief Technical Officer` (confidence `0.953`, match `acronym`)
- **Result:** unrelated occupations removed.

### Chief of Staff

- **Before (visible):** `Chief of Staff`
- **After (visible):**
  - `Chief of Staff` (confidence `1.000`, match `exact`)

### Product Manager

- **Before (visible):** `Product Manager`
- **After (visible):**
  - `Product Manager` (confidence `1.000`, match `exact`)

### Product Owner

- **Before (visible):** `Product Owner`
- **After (visible):**
  - `Product Owner` (confidence `1.000`, match `exact`)

### Physicist

- **Before (visible):** no results
- **After (visible):**
  - `Physicist` (confidence `1.000`, match `exact`)

### phys

- **Before (visible):** specialized and noisy physics/physiology variants
- **After (visible):**
  - `Physicist` (confidence `1.000`, match `prefix`)
- **Result:** generic profession now ranks above (and filters out) weak variants.

### Software Engineer

- **Before (visible):** `Software Engineer`, `Software Engineering Director`, and related variants.
- **After (visible):**
  - `Software Engineer` (confidence `1.000`, match `exact`)
  - `Software Engineering Director` (confidence `0.942`, match `prefix`)
- **Result:** high-relevance variants remain; weak matches removed.

### Teacher

- **Before (visible):** `Teacher` + many teaching variants.
- **After (visible):**
  - `Teacher` (confidence `1.000`, match `exact`)

### Lawyer

- **Before (visible):** `Lawyer`
- **After (visible):**
  - `Lawyer` (confidence `1.000`, match `exact`)

---

## Internal Alias Strategy Recommendation (58k O*NET aliases)

Keep aliases fully internal. Use them only for:

1. **Recall layer**  
   Expand candidate occupation codes from alias hits.

2. **Mapping layer**  
   Resolve alias hits to canonical market titles (Top 2000 only).

3. **Confidence layer**  
   Combine lexical match quality + mapping confidence + priority, then threshold.

4. **Display layer (strict)**  
   Render only canonical market titles from `marketTitles.json`.

Operational rule:

- If alias match does not map to a high-confidence canonical market title, return no result.
- Prefer no result over wrong result.

---

## Files Updated

- `src/lib/assessment/occupations.ts`
  - strict relevance model
  - confidence threshold
  - title dedupe
  - internal confidence metadata on hits
- `src/components/assessment/ProfessionSelect.tsx`
  - title-only dropdown rendering
  - removed noisy per-result explanatory text
  - clearer empty-state message for low-confidence/no-match cases
- `src/data/marketTitles.json`
  - added `Physicist` canonical market title mapping (`19-2012.00`)

