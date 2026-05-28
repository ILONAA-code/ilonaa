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
    return `Your responses suggest ${label} is a present-day advantage you can lean into deliberately.`;
  }

  if (value >= 55) {
    return `Your ${label} appears solid—an area to protect as your role continues to evolve.`;
  }

  return `Your ${label} may benefit from intentional attention as AI reshapes tasks around you.`;
}

function exposureInsight(value: number): string {
  if (value >= 65) {
    return "You may feel AI pressure in parts of your current work—useful context for where to adapt first.";
  }

  if (value >= 45) {
    return "You carry moderate exposure in your profile—not alarming, but worth monitoring in how you spend your time.";
  }

  return "Your current exposure appears contained—giving you room to invest in strengths rather than react to risk.";
}

function resilienceInsight(value: number): string {
  if (value >= 70) {
    return "You are likely to remain strongest where judgment, relationships, and context still decide outcomes.";
  }

  if (value >= 55) {
    return "You hold a workable foundation—enough resilience to navigate change with intention.";
  }

  return "Building resilience in your most human capabilities could meaningfully shift your positioning.";
}

export function derivePositioningSummary(
  aiExposure: number,
  resilience: number
): string {
  if (resilience >= 68 && aiExposure <= 48) {
    return "Your profile suggests you are well positioned today—meaningful human leverage with manageable automation pressure in your current work.";
  }

  if (resilience >= 60 && aiExposure >= 55) {
    return "You appear capable and exposed at once—strength to use, pressure to read honestly, and direction to choose.";
  }

  if (aiExposure >= 62) {
    return "Your profile points to real exposure in parts of how you work today—clarity now can prevent drift later.";
  }

  return "Your positioning is still forming—this reflection is a calm map of where you stand, not a verdict on your future.";
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
      insight: capabilityInsight("human-centered capability", humanCentered),
    },
    {
      id: "strategic",
      label: "Your strategic judgment",
      value: strategicStrength,
      insight: capabilityInsight("strategic judgment", strategicStrength),
    },
    {
      id: "adaptability",
      label: "Your adaptability",
      value: adaptability,
      insight: capabilityInsight("adaptability", adaptability),
    },
    {
      id: "creative",
      label: "Your creative differentiation",
      value: creativeEdge,
      insight: capabilityInsight("creative differentiation", creativeEdge),
    },
  ];
}
