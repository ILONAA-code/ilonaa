# ILONAA Model Recalibration Notes

## What Was Changed

1. **Slider granularity increased from 5 to 11 steps** in `src/lib/assessment/questions.ts` for:
   - `repetitive-tasks`
   - `creativity`
   - `trust-relationships`
   - `personal-judgment`

2. **Audit dataset expanded to 200 representative job profiles** in `src/lib/assessment/jobProfiles.ts`.
   - Covers: finance/accounting, legal/compliance, software/technology, AI/data, management/leadership, healthcare, education, skilled trades, engineering/manufacturing, sales/customer success, marketing/creative, HR/people operations, operations/logistics, administration/support, science/research, public sector/social work.

3. **Audit script updated** in `scripts/auditJobProfiles.ts` to:
   - Validate input scale consistency against current question definitions
   - Run all 200 profiles through current `calculateResults`
   - Produce required markdown and CSV reports
   - Generate before/after archetype comparison in the post-recalibration report

4. **Archetype fit scoring recalibrated** in `src/lib/assessment/profile.ts`.
   - No new archetypes were added.
   - Existing six archetypes were retained.
   - Only fit weighting/shape was adjusted to improve differentiation.

## Why Slider Granularity Changed (25-point to 10-point)

- The previous slider setup (0, 25, 50, 75, 100) did not align with the finer-grained synthetic audit assumptions used in calibration.
- The new 11-step slider (0 to 100 in 10-point increments) keeps the same 0–100 score model while improving internal consistency between:
  - selectable user inputs,
  - audit profile inputs,
  - and scoring outputs.
- Default behavior remains unchanged in intent: slider default is still **50**.

## Why Archetype Scoring Was Recalibrated

- The prior audit showed archetype concentration, with one archetype (Human-Centered Strategist) overly dominant.
- Recalibration targeted better separation across the six existing archetypes by strengthening distinct fit signals:
  - **Creative Synthesizer**: increased influence of high creativity
  - **Systems-Oriented Thinker**: stronger weight on expertise + judgment + lower human-interaction
  - **Strategic Integrator**: stronger strategic + judgment + expertise blend
  - **Adaptive Builder**: stronger adaptability + industry-change + AI exposure combination
  - **Human-Centered Strategist**: focused on relationship-heavy profiles rather than broad default capture
  - **Measured Navigator**: re-centered to balanced midpoint profiles

## What Was Not Changed

- No new questions were added.
- No user journey changes were made.
- No product redesign was made.
- No AI/LLM calls were added.
- No result copy, narrative templates, landing copy, or SEO content was changed in this recalibration pass.
- No changes were made to core exposure/resilience score formulas in `scoring.ts`.

## Reports Generated

- `reports/ilonaa_200_job_profile_audit.md`
- `reports/ilonaa_200_job_profile_audit.csv`
- `reports/ilonaa_200_job_profile_audit_after_archetype_recalibration.md`
- `reports/ilonaa_200_job_profile_audit_after_archetype_recalibration.csv`
- `reports/ilonaa_model_recalibration_notes.md`

## What Should Be Tested Next

1. **Input UX sanity check** for 11-step sliders (desktop + mobile) to confirm expected feel.
2. **Regression check** for score ranges and result rendering using real user sessions.
3. **Archetype plausibility review** on edge-case roles and mixed-signal profiles.
4. **Distribution monitoring** on live anonymized sessions to verify calibration behavior beyond synthetic profiles.
