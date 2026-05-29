# Single-Score Simplification Review

## Objective

Simplify ILONAA product communication so users receive one clear primary outcome:

**AI Replacement Risk**

All other dimensions remain supporting context.

## Scope and Constraints

- No scoring model changes
- No O*NET integration changes
- No RIASEC calculation changes
- No profession selection flow changes
- No four-question flow changes
- Presentation, hierarchy, and messaging updates only

## Updated Results Hierarchy

### Primary result (dominant)

- `AI Replacement Risk` shown as the main hero score (`x / 100` + risk level band)

Component reference:

- `src/components/assessment/results/ResultsSections.tsx` -> `ResultsHero`

### Supporting interpretation

- New section: `Why Your Risk Is <Low/Medium/High/Very high>`
- Two supporting clusters:
  - Human Advantage Factors
  - Risk Drivers
- Short narrative explanation retained

Component reference:

- `src/components/assessment/results/ResultsSections.tsx` -> `RiskWhySection`
- Used in `src/components/assessment/ResultsView.tsx`

## Removed Competing Score Cards

Removed as first-class equal outputs in results hero:

- AI Exposure Score card
- Career Resilience Score card
- Confidence label for RIASEC type

Removed equal-importance positioning block in results flow:

- `Your positioning at a glance` usage removed from `ResultsView`
- Exposure/resilience split visualization no longer foregrounded in main result hierarchy

## RIASEC Presentation Simplification

Updated wording:

- `RIASEC Type: <Primary>`
- `Secondary orientation: <Secondary>`

Confidence display removed from user-facing UI.

## Landing Messaging Updates

Primary promise aligned to single-score strategy:

- Headline and subheadline now center the replacement-risk question
- Preview card now foregrounds `AI Replacement Risk`
- Exposure/resilience no longer presented as equal promises

Component reference:

- `src/components/sections/Hero.tsx`
- `src/components/sections/Process.tsx`
- `src/components/sections/WhatYouReceive.tsx`

## Methodology Wording Updates

Public methodology now clarifies:

- Primary user-facing outcome = AI Replacement Risk
- AI Exposure and Career Resilience = supporting internal analytical dimensions

Files:

- `src/app/methodology/page.tsx`
- `docs/public_methodology_export.md`
- `docs/final_methodology_review.md`

## Metadata and Public Framing Updates

Search/social summaries now emphasize replacement-risk-first positioning:

- `src/lib/site/metadata.ts`
- `src/lib/site/schema.ts`

## Visual/UX Notes

- Results hero label adjusted to reduce left-edge dominance and improve grid alignment
- Clutter reduced by removing parallel score blocks
- Premium editorial feel retained with cleaner hierarchy

## Verification References

Primary component references for review:

- `src/components/assessment/ResultsView.tsx`
- `src/components/assessment/results/ResultsSections.tsx`
- `src/components/sections/Hero.tsx`
- `src/app/methodology/page.tsx`
