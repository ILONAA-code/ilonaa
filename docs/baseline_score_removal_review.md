# Baseline Score Removal Review

Date: 2026-05-29

## Objective

Remove all user-facing baseline score displays so users interpret one primary risk metric only: **AI Replacement Risk**.

## Where Baseline Scores Were Removed

- `src/components/assessment/ProfessionSelect.tsx`
  - Removed display line: baseline risk index numeric value.
  - Updated confirmation card label from "Selected profession baseline" to "Selected Profession".
  - Kept profession name and RIASEC context only.
  - Added helper copy: "This profession provides the occupational baseline used by ILONAA."

- `src/app/methodology/page.tsx`
  - Updated profession selection wording to:
    - "The selected profession provides the occupational baseline used by the model."
  - No baseline scores or baseline calculations are shown publicly.

- `docs/public_methodology_export.md`
  - Synced the profession-baseline wording with the updated methodology page.
  - No baseline scores exposed in public export text.

## Components / Pages Affected

- Profession selection page
  - Selected profession confirmation card
- Public methodology page
  - Profession Selection section
- Public methodology export document

## Internal Model Integrity Check

Baseline model inputs remain intact and unchanged:

- `baselineAiExposure`
- `baselineCareerResilience`
- `baselineRiskIndex`

These values are still used internally in scoring logic and data types; only UI exposure was removed.

## Product-wide Consistency Check

Search review covered user-facing source files for:

- baseline risk
- baseline exposure
- baseline resilience
- baseline score
- Baseline Risk Index

Result:

- No baseline score labels or baseline numeric score outputs remain in user-facing `src` UI.
- Internal/strategy documentation may still reference baseline components where appropriate (e.g. founder/internal review docs).

## Single-Score Confirmation

User-facing risk communication remains centered on **AI Replacement Risk** as the single primary risk metric.

Supporting context shown to users:

- Profession
- RIASEC Type
- Human Advantage Factors
- Risk Drivers
- Recommendations

Baseline scores are no longer shown to users.
