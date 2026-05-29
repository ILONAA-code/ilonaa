# Results Page Hierarchy Review

Date: 2026-05-29

## Objective

Refactor the top of the results page so users immediately see:

1. This result belongs to them.
2. Which profession was analyzed.
3. Their AI Replacement Risk.

No model logic, scoring, or calculations were changed.

## Old Structure

Top-level order before refactor:

1. `RIASEC CONTEXT` label
2. AI Replacement Risk card
3. Selected profession + RIASEC type
4. `WHY THIS TYPE FITS`
5. `WHY THIS RISK LEVEL`

Issue:
- The page opened with model framing ("RIASEC context") before user ownership/result anchoring.
- Profession context and risk context were mixed in one block.

## New Structure

Top-level order after refactor:

1. `YOUR RESULT`
2. Profession title (first large, user-specific anchor)
3. AI Replacement Risk hero block (`score / 100`, level, trust sentence)
4. `UNDERSTANDING YOUR PROFESSION`
5. RIASEC Type + Secondary Orientation
6. `WHY THIS TYPE FITS`
7. `WHY THIS RISK LEVEL`
8. Recommendations and remaining sections

## Rationale for Hierarchy Change

- **Result-first orientation:** Users see their profession and risk outcome before explanatory model layers.
- **Clear cognitive flow:** Outcome first, interpretation second.
- **Reduced repetition:** Removed mixed "Selected Profession + RIASEC context" pattern from the hero.
- **Support role for RIASEC:** RIASEC now sits in a dedicated explanatory section where it belongs.

## Components Updated

- `src/components/assessment/results/ResultsSections.tsx`
  - Removed top label `RIASEC context`.
  - Updated hero label to `Your Result`.
  - Moved profession title to top of hero.
  - Kept AI Replacement Risk as dominant hero element.
  - Added new `ProfessionUnderstandingSection`.
  - Kept `Why this type fits` and attached it to profession understanding.
  - Normalized level label to `Very High`.

- `src/components/assessment/ResultsView.tsx`
  - Reordered sections to:
    - `ResultsHero`
    - `ProfessionUnderstandingSection`
    - `RiskWhySection`
    - remaining sections unchanged.

## Screenshot / Visual Review References

Updated screenshots:

- `reports/screenshots/results_page_hierarchy_hero_desktop.png`
  - Shows new top hierarchy: `YOUR RESULT` -> profession -> AI Replacement Risk.

- `reports/screenshots/results_page_hierarchy_full_desktop.png`
  - Shows full section order including:
    - `UNDERSTANDING YOUR PROFESSION`
    - `WHY THIS TYPE FITS`
    - `WHY THIS RISK LEVEL`

## Verification

- Build passes with updated hierarchy.
- No scoring/model logic changes.
- AI Replacement Risk remains the dominant user-facing result element.
