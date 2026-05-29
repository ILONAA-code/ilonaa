import type { SelectedProfession } from "./onetTypes";
import type { Answers, IlonaaRiskIndex } from "./types";

export type OnetAdjustedScores = {
  aiExposureScore: number;
  careerResilienceScore: number;
  ilonaaRiskIndex: IlonaaRiskIndex;
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function getAnswer(answers: Answers, key: string, fallback = 50): number {
  return answers[key] ?? fallback;
}

export function calculateOnetAdjustedScores(
  profession: SelectedProfession,
  answers: Answers
): OnetAdjustedScores {
  const aiUsage = getAnswer(answers, "ai-tools-usage");
  const learningSpeed = getAnswer(answers, "tool-learning-speed", 60);
  const humanUniqueness = getAnswer(answers, "human-uniqueness", 60);
  const decisionConsequence = getAnswer(answers, "decision-consequence", 60);

  const baselineExposure = profession.baselineAiExposure;
  const baselineResilience = profession.baselineCareerResilience;

  const aiUsagePressure = (aiUsage - 50) * 0.25;
  const adaptabilityRelief = (learningSpeed - 60) * 0.35;
  const humanRelief = (humanUniqueness - 60) * 0.45;
  const consequenceRelief = (decisionConsequence - 60) * 0.25;

  const aiUsageWithLearningInteraction =
    (Math.max(aiUsage - 50, 0) * Math.max(learningSpeed - 60, 0)) / 250;

  const aiExposureScore = clamp(
    baselineExposure + aiUsagePressure - adaptabilityRelief * 0.3 - humanRelief * 0.25
  );

  const careerResilienceScore = clamp(
    baselineResilience +
      (learningSpeed - 60) * 0.5 +
      (humanUniqueness - 60) * 0.6 +
      (decisionConsequence - 60) * 0.2 -
      Math.max(aiUsage - 70, 0) * 0.15 +
      aiUsageWithLearningInteraction
  );

  const inverseResilience = 100 - careerResilienceScore;

  /*
   * ILONAA AI Risk Index (0-100)
   *
   * Composite model:
   *  - 40% AI Exposure Score
   *  - 25% Inverse Career Resilience
   *  - 15% Profession baseline risk
   *  - 10% AI usage pressure
   *  - 10% Consequence-adjusted accountability offset
   *
   * The accountability term reflects that high-consequence decisions can lower
   * full replacement likelihood because human accountability and oversight remain required.
   */
  const score = clamp(
    aiExposureScore * 0.4 +
      inverseResilience * 0.25 +
      profession.baselineRiskIndex * 0.15 +
      aiUsage * 0.1 -
      decisionConsequence * 0.1 +
      10
  );

  return {
    aiExposureScore,
    careerResilienceScore,
    ilonaaRiskIndex: {
      score,
      explanation:
        "Composite of profession baseline, exposure pressure, resilience offset, current AI tool usage, and consequence-sensitive human accountability.",
      components: {
        aiExposure: aiExposureScore,
        inverseResilience,
        industryChange: profession.keyOccupationalFactors.adaptabilityLearning,
        aiCapableToday: aiUsage,
        repetitiveTasks: profession.keyOccupationalFactors.routineRepetitive,
      },
    },
  };
}
