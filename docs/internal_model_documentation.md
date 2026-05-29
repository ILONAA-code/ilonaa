INTERNAL USE ONLY

NOT FOR PUBLIC DISPLAY

# ILONAA Internal Model Documentation

## 1) Scoring architecture

Assessment flow:

1. Profession selection from local `onetOccupations.json`
2. Profession baseline loaded:
   - `baselineAiExposure`
   - `baselineCareerResilience`
   - `baselineRiskIndex`
3. Four ILONAA answers captured:
   - `ai-tools-usage`
   - `tool-learning-speed`
   - `human-uniqueness`
   - `decision-consequence`
4. `calculateOnetAdjustedScores()` computes:
   - `aiExposureScore`
   - `careerResilienceScore`
   - `ilonaaRiskIndex.score`
5. Output packaged into `AssessmentResult` for results UI.

## 2) Current production formulas (`src/lib/assessment/onetScoring.ts`)

Inputs:

- `aiUsage = answers["ai-tools-usage"]`
- `learningSpeed = answers["tool-learning-speed"]`
- `humanUniqueness = answers["human-uniqueness"]`
- `decisionConsequence = answers["decision-consequence"]`
- `baselineExposure = profession.baselineAiExposure`
- `baselineResilience = profession.baselineCareerResilience`

Derived adjustments:

- `aiUsagePressure = (aiUsage - 50) * 0.25`
- `adaptabilityRelief = (learningSpeed - 60) * 0.35`
- `humanRelief = (humanUniqueness - 60) * 0.45`
- `consequenceRelief = (decisionConsequence - 60) * 0.25`
- `aiUsageWithLearningInteraction = (max(aiUsage-50,0) * max(learningSpeed-60,0)) / 250`

Production score formulas:

- `aiExposureScore = clamp(baselineExposure + aiUsagePressure - adaptabilityRelief*0.3 - humanRelief*0.25)`
- `careerResilienceScore = clamp(baselineResilience + (learningSpeed-60)*0.5 + (humanUniqueness-60)*0.6 + (decisionConsequence-60)*0.2 - max(aiUsage-70,0)*0.15 + aiUsageWithLearningInteraction)`
- `inverseResilience = 100 - careerResilienceScore`
- `ilonaaRiskIndex = clamp(aiExposureScore*0.4 + inverseResilience*0.25 + profession.baselineRiskIndex*0.15 + aiUsage*0.1 - decisionConsequence*0.1 + 10)`

## 3) O*NET-inspired import mappings (`scripts/importOnetData.ts`)

### 3.1 Category -> RIASEC pair mapping

- finance -> Conventional / Enterprising
- legal -> Conventional / Investigative
- software -> Investigative / Realistic
- ai/data -> Investigative / Conventional
- management -> Enterprising / Social
- healthcare -> Social / Investigative
- education -> Social / Artistic
- skilled trades -> Realistic / Conventional
- engineering -> Investigative / Realistic
- sales -> Enterprising / Social
- marketing -> Artistic / Enterprising
- hr -> Social / Enterprising
- operations -> Conventional / Realistic
- administration -> Conventional / Social
- science -> Investigative / Conventional
- public -> Social / Conventional

### 3.2 Legacy answer -> factor mapping

Derived occupation factors:

- `routineRepetitive = repetitive-tasks`
- `informationProcessing = (specialized-expertise + strategic-decision + (100 - repetitive-tasks))/3`
- `dataAnalysis = (specialized-expertise + personal-judgment + strategic-decision)/3`
- `administrativeStructure = (repetitive-tasks + (100-creativity) + ai-capable-today)/3`
- `humanInteraction = (human-interaction + trust-relationships)/2`
- `creativityInnovation = creativity`
- `decisionJudgment = (personal-judgment + strategic-decision)/2`
- `consequenceResponsibility = (personal-judgment + trust-relationships + strategic-decision)/3`
- `physicalPracticality = (100-human-interaction + specialized-expertise)/2`
- `adaptabilityLearning = (adaptability + (100-repetitive-tasks) + industry-change)/3`

### 3.3 Baseline generation formulas

- `baselineAiExposure = routine*0.25 + admin*0.15 + (100-human)*0.2 + (100-creativity)*0.15 + (100-judgment)*0.15 + (100-physical)*0.1`
- `baselineCareerResilience = human*0.18 + creativity*0.14 + judgment*0.2 + adaptability*0.2 + physical*0.1 + data*0.1 + (100-routine)*0.08`
- `baselineRiskIndex = baselineAiExposure*0.45 + (100-baselineCareerResilience)*0.35 + routine*0.2`

## 4) RIASEC profile logic (`src/lib/assessment/riasec.ts`)

`calculateRiasecProfile()`:

1. Computes six RIASEC scores via weighted averages of answer proxies.
2. Sorts scores descending.
3. Highest = primary, second highest = secondary.
4. Confidence:
   - high: delta >= 12
   - moderate: delta >= 6
   - emerging: delta < 6

## 5) Accountability and consequence weighting

Current production:

- Decision consequence affects resilience via `+ (decisionConsequence - 60) * 0.2`
- Decision consequence affects final index via `- decisionConsequence * 0.1`

Calibration scripts (non-production) test stronger damping by:

- increasing consequence/accountability contribution in resilience
- adding explicit compliance/regulatory proxy
- applying stronger replacement-risk offsets for consequence, relationship depth, and physical presence

## 6) Physical presence and relationship weighting

Current production:

- Physical and relationship effects enter through profession baseline features and four-answer adjustments.

Calibration candidate script:

- explicit replacement-risk dampeners for:
  - `physicalPracticality`
  - `humanInteraction`
  - `consequenceResponsibility`
  - compliance/regulatory proxy

## 7) Current model artifacts to review

- Production logic: `src/lib/assessment/onetScoring.ts`
- Import/mapping logic: `scripts/importOnetData.ts`
- Calibration audit logic: `scripts/auditAiRiskModelRecalibration.ts`
- Review reports under `reports/`
