# Profession Input UX Redesign Review

Date: 2026-05-30  
Version context: `9.8.0` working tree (uncommitted UX update)

## Objective

Redesign profession input for maximum simplicity and trust while keeping search quality fully intact.

No changes were made to:

- O*NET occupations
- O*NET aliases
- ILONAA alias scoring/ranking logic
- confidence thresholds inside search engine
- scoring/RIASEC logic
- debug tooling (`/debug/profession-search`)

## Old flow

1. User starts typing in profession field.
2. Live dropdown appears after 2 characters.
3. User sees a long suggestion list immediately.
4. User manually selects a row from that list.
5. Continue button becomes enabled.

Observed UX risk in old flow:

- exposed internal matching behavior too early
- surfaced canonical O*NET titles in visible UI
- shifted user attention from assessment completion to search evaluation

## New flow

1. User sees only:
   - "What is your profession?"
   - single input field
   - Continue button
2. While typing, no suggestions/panels/dropdowns appear.
3. User clicks Continue, then matching runs internally.
4. UI branches by confidence:
   - High (`>= 0.85`): auto-accept and proceed directly
   - Medium (`0.65` to `0.84`): show up to 3 user-friendly choices
   - Low (`< 0.65`): show retry guidance (no weak fallback list)

## Components changed

- `src/components/assessment/ProfessionSelect.tsx`
  - removed live search + debounced dropdown
  - added submit-driven internal matching on Continue
  - added confidence-gated UX states (`idle`, `medium`, `low`)
  - added user-facing label normalization (alias-first display)
- `src/components/assessment/AssessmentFlow.tsx`
  - profession step now resolves directly via `onResolved`
  - question-footer Back/Continue controls now render only from question steps onward

## Confidence decision tree

Input submitted -> `searchOccupations(query, 6)` -> inspect top match confidence:

1. `no match` OR top `< 0.65`
   - show: "We couldn't confidently identify this profession."
   - show retry guidance only
2. top `>= 0.85`
   - auto-resolve profession
   - continue directly to question 1
3. otherwise (`0.65 <= top < 0.85`)
   - show max 3 curated options from strong candidates
   - user must select one to continue

## O*NET leakage prevention

Visible profession labels are now alias-first:

- prefer `matchedAlias` from O*NET/ILONAA alias match
- fallback to title-cased user input

This prevents user-facing canonical mappings such as:

- `Product Manager` -> `Marketing Managers` (internal only)
- `CTO` -> `Chief Executives` (internal only)
- `Chief of Staff` -> `General and Operations Managers` (internal only)

## Validation examples

Validation run with the requested cases and current thresholds:

- Product Manager -> High (0.95) -> auto-accept -> shown label: `Product Manager`
- Product Owner -> High (0.95) -> auto-accept -> shown label: `Product Owner`
- Chief of Staff -> High (0.95) -> auto-accept -> shown label: `Chief of Staff`
- CEO -> High (0.95) -> auto-accept -> shown label: `CEO`
- CTO -> High (0.95) -> auto-accept -> shown label: `CTO`
- Software Engineer -> High (0.95) -> auto-accept -> shown label: `Software Engineer`
- Data Scientist -> High (1.00) -> auto-accept -> shown label: `Data Scientist`
- Physicist -> High (1.00) -> auto-accept -> shown label: `Physicist`

## Screenshots/components checklist for founder review

Recommended manual screenshot set from `/assessment`:

1. Initial profession screen (`idle`): input + Continue only
2. Medium-confidence state (`medium`): "We found a few possible matches" + up to 3 options
3. Low-confidence state (`low`): retry guidance message
4. Transition after high-confidence submit: direct move to first assessment question

All views are implemented in `ProfessionSelect` + `AssessmentFlow` as above.
