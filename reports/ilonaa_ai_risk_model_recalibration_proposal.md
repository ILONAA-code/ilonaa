# ILONAA AI Risk Model Recalibration Proposal

Generated at: 2026-05-29T07:44:31.768Z

## A. Current formula

- Current ILONAA index blends: 40% exposure, 25% inverse resilience, 15% baseline risk, +10% AI usage, -10% decision consequence (plus constant).
- Exposure and baseline risk dominate the score. Consequence/accountability has only limited direct damping.

## B. Observed weaknesses

- Decision consequence/accountability appears underweighted (overestimated set with high consequence: 57).
- Physical presence appears underweighted (overestimated set with high physical practicality: 30).
- Human relationship depth appears underweighted (overestimated set with high human interaction: 57).
- Routine/admin pressure is not consistently calibrated (underestimated set high routine count: 0, high admin count: 0).
- Professional accountability/compliance consequence and financial consequence are not explicit enough as replacement-risk dampeners.
- RIASEC should remain primarily identity/context, not a dominant risk driver.

## C. Proposed formula

### AI Exposure

`AI Exposure = 0.20*routine + 0.18*administrative + 0.20*informationProcessing + 0.12*dataAnalysis + 0.12*(100-physicalPresence) + 0.10*(100-humanInteraction) + 0.08*(100-creativity)`

### AI Replacement Risk

`AI Replacement Risk = 0.35*AI Exposure + 0.20*routine + 0.10*administrative + 0.12*(100-judgment) + 0.08*(100-adaptability) + 0.05*(100-consequence) + 0.05*(100-physicalPresence) + 0.05*(100-humanInteraction) - 0.10*consequence - 0.08*physicalPresence - 0.05*humanInteraction`

### Career Resilience

`Career Resilience = 0.24*judgment + 0.22*consequence + 0.16*humanInteraction + 0.16*adaptability + 0.08*creativity + 0.08*dataAnalysis + 0.06*physicalPresence`

### ILONAA AI Risk Index

`ILONAA AI Risk Index = 0.25*AI Exposure + 0.50*AI Replacement Risk + 0.25*(100-Career Resilience)`

This keeps the index closer to replacement/disruption risk than raw exposure while staying transparent and explainable.

## D. New/stronger factors

1. Decision consequence/accountability: stronger replacement-risk dampener and resilience booster.
2. Physical presence/hands-on execution: explicit replacement-risk dampener.
3. Professional judgment/licensure proxy: stronger through judgment + consequence.
4. Routine cognitive work: explicit risk amplifier.
5. Current AI capability: increases exposure but not deterministic replacement.
6. Human trust/relationship depth: stronger dampener for replacement risk.
7. Adaptability: explicit resilience amplifier.

## E. Suggested weighting

- Simple linear weighted factors only; no black-box methods and no ML optimization.
- Emphasis shifts from exposure-only interpretation toward replacement-likelihood and human accountability.

## F. Before/after simulation

- Average absolute mismatch before: 5.46
- Average absolute mismatch after: 4.04
- Net average improvement: 1.42

See `reports/ilonaa_ai_risk_model_before_after_simulation.md` and `.csv` for per-occupation deltas, top improvements, and remaining worst mismatches.