# Landing Page Example Result Update

Date: 2026-05-29

## Objective

Update the landing page example/preview card to match the simplified results hierarchy:

- Result first
- Profession anchor first
- One primary score only: **AI Replacement Risk**
- RIASEC as secondary explanation

## Old Example Structure

Previous landing example card in `ScorePreview`:

1. `Your RIASEC profile` (primary heading)
2. Primary/Secondary RIASEC labels
3. AI Replacement Risk score block
4. Insight copy block
5. Supporting factors badges

Issues:

- Led with RIASEC (model framing before user result)
- Included mixed insight framing from older structure
- Did not mirror current result-page hierarchy

## New Example Structure

Updated landing example card now follows:

1. `YOUR RESULT`
2. `Product Manager` (profession anchor)
3. `AI Replacement Risk`
4. `42 / 100`
5. `Medium`
6. Trust sentence:
   - `Risk is not destiny. Exposure does not automatically imply replacement.`
7. Secondary section:
   - `Understanding your profession`
   - `RIASEC Type: Enterprising`
   - `Secondary Orientation: Social`
8. Supporting explanation:
   - `Why this risk level?`
   - Human advantage factors
   - Risk drivers

## Changed Copy

Primary example values now:

- Profession: `Product Manager`
- AI Replacement Risk: `42 / 100`
- Risk level: `Medium`
- RIASEC Type: `Enterprising`
- Secondary Orientation: `Social`

Supporting factor copy now:

- Human advantage factors:
  - Strategic judgment
  - Customer and stakeholder context
  - Product ownership
- Risk drivers:
  - AI-assisted research and analysis
  - Documentation and prioritization workflows
  - Market and user insight synthesis

## Component References

- Updated component: `src/components/sections/Hero.tsx`
- Updated function: `ScorePreview`

No model, scoring, search, or results-page logic was changed.
