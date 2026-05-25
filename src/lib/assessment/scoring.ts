import type { Answers, AssessmentResult } from "./types";
import { STORAGE_KEY } from "./types";

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function getAnswer(answers: Answers, key: string, fallback = 50): number {
  return answers[key] ?? fallback;
}

function calculateAiExposureScore(answers: Answers): number {
  const exposureSignals = [
    getAnswer(answers, "repetitive-tasks"),
    100 - getAnswer(answers, "human-interaction"),
    100 - getAnswer(answers, "creativity"),
    100 - getAnswer(answers, "strategic-decision"),
    100 - getAnswer(answers, "specialized-expertise"),
    getAnswer(answers, "ai-capable-today"),
    100 - getAnswer(answers, "trust-relationships"),
    getAnswer(answers, "industry-change"),
    100 - getAnswer(answers, "adaptability"),
    100 - getAnswer(answers, "personal-judgment"),
  ];

  const average =
    exposureSignals.reduce((sum, value) => sum + value, 0) /
    exposureSignals.length;

  return clamp(average);
}

function calculateCareerResilienceScore(answers: Answers): number {
  const resilienceSignals = [
    100 - getAnswer(answers, "repetitive-tasks"),
    getAnswer(answers, "human-interaction"),
    getAnswer(answers, "creativity"),
    getAnswer(answers, "strategic-decision"),
    getAnswer(answers, "specialized-expertise"),
    100 - getAnswer(answers, "ai-capable-today"),
    getAnswer(answers, "trust-relationships"),
    100 - getAnswer(answers, "industry-change") * 0.6,
    getAnswer(answers, "adaptability"),
    getAnswer(answers, "personal-judgment"),
  ];

  const average =
    resilienceSignals.reduce((sum, value) => sum + value, 0) /
    resilienceSignals.length;

  return clamp(average);
}

function exposureLabel(score: number): string {
  if (score >= 70) return "elevated";
  if (score >= 45) return "moderate";
  return "lower";
}

function resilienceLabel(score: number): string {
  if (score >= 70) return "strong";
  if (score >= 45) return "developing";
  return "emerging";
}

function generateInsights(
  answers: Answers,
  aiExposure: number,
  resilience: number
): string[] {
  const insights: string[] = [];

  if (getAnswer(answers, "repetitive-tasks") >= 65) {
    insights.push(
      "A meaningful portion of your work follows predictable patterns — an area where automation tends to advance first."
    );
  } else {
    insights.push(
      "Your work includes meaningful variation, which naturally creates distance from fully automated workflows."
    );
  }

  if (getAnswer(answers, "human-interaction") >= 65) {
    insights.push(
      "Human connection is central to your role — a durable advantage that technology complements rather than replaces."
    );
  } else if (getAnswer(answers, "personal-judgment") >= 65) {
    insights.push(
      "Your role relies on nuanced judgment — the kind of contextual decision-making that remains distinctly human."
    );
  } else {
    insights.push(
      "Building stronger interpersonal and judgment-based dimensions could meaningfully strengthen your professional position."
    );
  }

  if (aiExposure >= 60 && resilience >= 60) {
    insights.push(
      "You operate in a changing landscape with solid foundations — awareness and intentional growth will serve you well."
    );
  } else if (aiExposure >= 60) {
    insights.push(
      `Your AI exposure is ${exposureLabel(aiExposure)}, but your resilience is still ${resilienceLabel(resilience)} — a clear signal to invest in adaptive strengths.`
    );
  } else {
    insights.push(
      `Your profile suggests ${exposureLabel(aiExposure)} AI exposure alongside ${resilienceLabel(resilience)} career resilience — a balanced starting point for thoughtful planning.`
    );
  }

  return insights.slice(0, 3);
}

function generateProtectionFactors(answers: Answers): string[] {
  const factors: { score: number; text: string }[] = [
    {
      score: getAnswer(answers, "human-interaction"),
      text: "Interpersonal depth and collaborative relationships in your work",
    },
    {
      score: getAnswer(answers, "specialized-expertise"),
      text: "Specialized knowledge that develops over time",
    },
    {
      score: getAnswer(answers, "personal-judgment"),
      text: "Contextual judgment and decision-making under ambiguity",
    },
    {
      score: getAnswer(answers, "trust-relationships"),
      text: "Trust-building and long-term professional relationships",
    },
    {
      score: getAnswer(answers, "creativity"),
      text: "Creative thinking and original problem-solving",
    },
    {
      score: getAnswer(answers, "strategic-decision"),
      text: "Strategic perspective and long-range decision-making",
    },
  ];

  return factors
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((factor) => factor.text);
}

function generateFutureProofSkills(
  answers: Answers,
  aiExposure: number
): string[] {
  const skills: string[] = [];

  if (getAnswer(answers, "adaptability") < 60) {
    skills.push("Digital fluency and comfort adopting new AI-assisted workflows");
  } else {
    skills.push("Advanced AI collaboration — directing tools with clear intent and quality standards");
  }

  if (getAnswer(answers, "strategic-decision") < 60 || aiExposure >= 55) {
    skills.push("Strategic thinking and prioritization in evolving environments");
  } else {
    skills.push("Cross-functional leadership and influence without formal authority");
  }

  if (getAnswer(answers, "human-interaction") < 60) {
    skills.push("Relationship intelligence and stakeholder communication");
  } else if (getAnswer(answers, "creativity") < 60) {
    skills.push("Creative synthesis — connecting ideas across domains");
  } else {
    skills.push("Complex problem-solving with human-centered outcomes");
  }

  return skills.slice(0, 3);
}

function generateSummary(
  aiExposure: number,
  resilience: number
): string {
  if (resilience >= 70 && aiExposure <= 45) {
    return "Your profile reflects a thoughtful balance of human strengths and manageable exposure. Continue nurturing the capabilities that make your work distinctly yours — clarity is your advantage.";
  }

  if (resilience >= 70) {
    return "You bring meaningful strengths to a shifting landscape. Your resilience is a genuine asset — paired with intentional learning, you are well positioned to navigate what comes next with confidence.";
  }

  if (aiExposure >= 65 && resilience < 55) {
    return "Change is present in your professional landscape, and that is not a cause for alarm — it is an invitation. Small, deliberate steps toward adaptability and human-centered skills can shift your trajectory meaningfully.";
  }

  return "Understanding where you stand is the first step toward intentional growth. Your results highlight both opportunity and strength — use them as a calm, practical guide for the decisions ahead.";
}

export function calculateResults(answers: Answers): AssessmentResult {
  const aiExposureScore = calculateAiExposureScore(answers);
  const careerResilienceScore = calculateCareerResilienceScore(answers);

  return {
    aiExposureScore,
    careerResilienceScore,
    insights: generateInsights(answers, aiExposureScore, careerResilienceScore),
    protectionFactors: generateProtectionFactors(answers),
    futureProofSkills: generateFutureProofSkills(answers, aiExposureScore),
    summary: generateSummary(aiExposureScore, careerResilienceScore),
    answers,
    completedAt: new Date().toISOString(),
  };
}

export function saveResults(result: AssessmentResult): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result));
}

export function loadResults(): AssessmentResult | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AssessmentResult;
  } catch {
    return null;
  }
}
