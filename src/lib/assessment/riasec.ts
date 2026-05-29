import type { Answers, RiasecProfile, RiasecType } from "./types";

export type RiasecScoreMap = Record<RiasecType, number>;

const RIASEC_DESCRIPTIONS: Record<RiasecType, string> = {
  Realistic:
    "Hands-on, practical, tool- and system-oriented work focused on technical execution and applied troubleshooting.",
  Investigative:
    "Analytical, diagnostic, and knowledge-intensive work centered on problem solving, interpretation, and complex analysis.",
  Artistic:
    "Creative, expressive, and design-oriented work where originality, storytelling, and aesthetic judgment matter.",
  Social:
    "People-centered work built on teaching, advising, care, empathy, communication, and interpersonal trust.",
  Enterprising:
    "Leadership, influence, decision-making, and commercial or organizational direction under uncertainty.",
  Conventional:
    "Structured, rule-based, detail-focused, and process-oriented work emphasizing coordination and consistency.",
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function getAnswer(answers: Answers, key: string, fallback = 50): number {
  return answers[key] ?? fallback;
}

function weightedAverage(
  entries: Array<{ value: number; weight: number }>
): number {
  const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);
  if (totalWeight <= 0) return 0;
  const weightedSum = entries.reduce(
    (sum, entry) => sum + entry.value * entry.weight,
    0
  );
  return clamp(weightedSum / totalWeight);
}

function calculateRiasecScores(answers: Answers): RiasecScoreMap {
  const repetitive = getAnswer(answers, "repetitive-tasks");
  const humanInteraction = getAnswer(answers, "human-interaction");
  const creativity = getAnswer(answers, "creativity");
  const strategic = getAnswer(answers, "strategic-decision");
  const expertise = getAnswer(answers, "specialized-expertise");
  const aiCapableToday = getAnswer(answers, "ai-capable-today");
  const trust = getAnswer(answers, "trust-relationships");
  const industryChange = getAnswer(answers, "industry-change");
  const adaptability = getAnswer(answers, "adaptability");
  const judgment = getAnswer(answers, "personal-judgment");

  const practicalRoutineFit = 100 - Math.abs(repetitive - 60);

  const realistic = weightedAverage([
    { value: expertise, weight: 1.2 },
    { value: judgment, weight: 1.0 },
    { value: 100 - aiCapableToday, weight: 0.8 },
    { value: practicalRoutineFit, weight: 0.7 },
    { value: 100 - creativity, weight: 0.5 },
  ]);

  const investigative = weightedAverage([
    { value: expertise, weight: 1.2 },
    { value: judgment, weight: 1.1 },
    { value: strategic, weight: 0.9 },
    { value: adaptability, weight: 0.6 },
    { value: 100 - humanInteraction, weight: 0.4 },
  ]);

  const artistic = weightedAverage([
    { value: creativity, weight: 1.5 },
    { value: judgment, weight: 0.8 },
    { value: adaptability, weight: 0.7 },
    { value: 100 - repetitive, weight: 0.7 },
    { value: humanInteraction, weight: 0.3 },
  ]);

  const social = weightedAverage([
    { value: humanInteraction, weight: 1.2 },
    { value: trust, weight: 1.2 },
    { value: judgment, weight: 0.7 },
    { value: 100 - aiCapableToday, weight: 0.5 },
    { value: adaptability, weight: 0.4 },
  ]);

  const enterprising = weightedAverage([
    { value: strategic, weight: 1.2 },
    { value: humanInteraction, weight: 0.9 },
    { value: trust, weight: 0.8 },
    { value: judgment, weight: 0.9 },
    { value: adaptability, weight: 0.6 },
    { value: industryChange, weight: 0.3 },
  ]);

  const conventional = weightedAverage([
    { value: repetitive, weight: 1.2 },
    { value: expertise, weight: 0.8 },
    { value: 100 - creativity, weight: 0.9 },
    { value: aiCapableToday, weight: 0.7 },
    { value: judgment, weight: 0.5 },
  ]);

  return {
    Realistic: realistic,
    Investigative: investigative,
    Artistic: artistic,
    Social: social,
    Enterprising: enterprising,
    Conventional: conventional,
  };
}

export function calculateRiasecProfile(answers: Answers): RiasecProfile {
  const scores = calculateRiasecScores(answers);

  const ranked = (Object.entries(scores) as Array<[RiasecType, number]>).sort(
    (a, b) => b[1] - a[1]
  );

  const primaryType = ranked[0]?.[0] ?? "Conventional";
  const secondaryType = ranked[1]?.[0] ?? "Social";

  const primaryScore = ranked[0]?.[1] ?? 0;
  const secondaryScore = ranked[1]?.[1] ?? 0;
  const delta = primaryScore - secondaryScore;

  const confidenceLevel =
    delta >= 12 ? "high" : delta >= 6 ? "moderate" : "emerging";

  const explanation = `Your answers align most strongly with ${primaryType} work patterns, with ${secondaryType} as a secondary orientation. ${RIASEC_DESCRIPTIONS[primaryType]}`;

  return {
    primaryType,
    secondaryType,
    scores,
    explanation,
    confidenceLevel,
  };
}

export function getRiasecTypeDescription(type: RiasecType): string {
  return RIASEC_DESCRIPTIONS[type];
}
