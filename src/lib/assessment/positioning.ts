import type { Answers } from "./types";

export type PositioningDimension = {
  id: string;
  label: string;
  value: number;
  insight: string;
};

function getAnswer(answers: Answers, key: string, fallback = 50): number {
  return answers[key] ?? fallback;
}

function capabilityInsight(label: string, value: number): string {
  if (value >= 70) {
    return `${label} reads as a present-day advantage—worth leaning into deliberately.`;
  }

  if (value >= 55) {
    return `${label} looks solid; protect it as your role evolves.`;
  }

  return `${label} may deserve intentional attention as tasks shift around you.`;
}

function exposureInsight(value: number): string {
  if (value >= 65) {
    return "Some of your work may feel AI pressure soon—useful signal for where to adapt first.";
  }

  if (value >= 45) {
    return "Moderate exposure in your profile—worth watching, not alarming.";
  }

  return "Exposure appears contained—room to invest in strengths over reaction.";
}

function resilienceInsight(value: number): string {
  if (value >= 70) {
    return "You likely stay strongest where judgment, relationships, and context still decide.";
  }

  if (value >= 55) {
    return "A workable foundation—enough resilience to navigate change with intention.";
  }

  return "Deepening your most human capabilities could meaningfully shift your positioning.";
}

export function derivePositioningSummary(
  aiExposure: number,
  resilience: number
): string {
  if (resilience >= 68 && aiExposure <= 48) {
    return "Well positioned today—human leverage with manageable automation pressure.";
  }

  if (resilience >= 60 && aiExposure >= 55) {
    return "Capable and exposed at once—strength to use, pressure to read honestly.";
  }

  if (aiExposure >= 62) {
    return "Real exposure in parts of how you work—clarity now prevents drift later.";
  }

  return "Your positioning is still forming—a calm map of where you stand, not a verdict.";
}

export function derivePositioningDimensions(
  answers: Answers,
  aiExposure: number,
  resilience: number
): PositioningDimension[] {
  const humanCentered = Math.round(
    (getAnswer(answers, "human-interaction") +
      getAnswer(answers, "trust-relationships")) /
      2
  );
  const strategicStrength = Math.round(
    (getAnswer(answers, "strategic-decision") +
      getAnswer(answers, "personal-judgment")) /
      2
  );
  const adaptability = getAnswer(answers, "adaptability");
  const creativeEdge = getAnswer(answers, "creativity");

  return [
    {
      id: "resilience",
      label: "Your career resilience",
      value: resilience,
      insight: resilienceInsight(resilience),
    },
    {
      id: "exposure",
      label: "Your AI exposure pressure",
      value: aiExposure,
      insight: exposureInsight(aiExposure),
    },
    {
      id: "human",
      label: "Your human-centered strengths",
      value: humanCentered,
      insight: capabilityInsight("Human-centered capability", humanCentered),
    },
    {
      id: "strategic",
      label: "Your strategic judgment",
      value: strategicStrength,
      insight: capabilityInsight("Strategic judgment", strategicStrength),
    },
    {
      id: "adaptability",
      label: "Your adaptability",
      value: adaptability,
      insight: capabilityInsight("Adaptability", adaptability),
    },
    {
      id: "creative",
      label: "Your creative differentiation",
      value: creativeEdge,
      insight: capabilityInsight("Creative differentiation", creativeEdge),
    },
  ];
}
