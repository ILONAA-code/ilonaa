import type {
  Answers,
  AssessmentResult,
  IlonaaRiskIndex,
  NarrativeCard,
} from "./types";
import { STORAGE_KEY } from "./types";
import { calculateRiasecProfile } from "./riasec";
import {
  derivePositioningDimensions,
  derivePositioningSummary,
} from "./positioning";

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

function generateModelDistinctionNarrative(
  answers: Answers,
  aiExposure: number,
  resilience: number
): string {
  const adaptability = getAnswer(answers, "adaptability");
  const expertise = getAnswer(answers, "specialized-expertise");

  if (resilience >= 70) {
    return "Your RIASEC type describes your work identity; ILONAA’s risk layer suggests your human strengths remain materially protective.";
  }

  if (adaptability >= 65 && expertise >= 55) {
    return "Your occupational orientation appears compatible with change—an important distinction between exposure and replacement risk.";
  }

  if (aiExposure >= 60) {
    return "Your work may be significantly AI-exposed, but occupational type and resilience still indicate where durable human advantage can be reinforced.";
  }

  return "RIASEC identifies the nature of your work; ILONAA estimates how that work may shift under AI-driven change.";
}

function calculateIlonaaRiskIndex(
  answers: Answers,
  aiExposureScore: number,
  careerResilienceScore: number
): IlonaaRiskIndex {
  const industryChange = getAnswer(answers, "industry-change");
  const aiCapableToday = getAnswer(answers, "ai-capable-today");
  const repetitiveTasks = getAnswer(answers, "repetitive-tasks");

  /*
   * ILONAA AI Risk Index formula (0-100):
   * - AI Exposure Score (35%)
   * - Inverse Career Resilience (25%)
   * - Industry change pressure (15%)
   * - AI-capable-today pressure (15%)
   * - Repetitive task exposure (10%)
   *
   * The formula intentionally separates occupational identity (RIASEC) from
   * risk pressure, so users can see both what their work is and how exposed it may be.
   */
  const score = clamp(
    aiExposureScore * 0.35 +
      (100 - careerResilienceScore) * 0.25 +
      industryChange * 0.15 +
      aiCapableToday * 0.15 +
      repetitiveTasks * 0.1
  );

  return {
    score,
    explanation:
      "Composite of AI exposure, inverse resilience, industry change pace, current AI task capability, and routine-task pressure.",
    components: {
      aiExposure: aiExposureScore,
      inverseResilience: 100 - careerResilienceScore,
      industryChange,
      aiCapableToday,
      repetitiveTasks,
    },
  };
}

function generateKeyStrengths(answers: Answers): NarrativeCard[] {
  const candidates: (NarrativeCard & { score: number })[] = [
    {
      score: getAnswer(answers, "strategic-decision"),
      title: "Strategic Thinking",
      description:
        "You set direction—trade-offs, consequences, outcomes beyond the immediate task.",
    },
    {
      score:
        (getAnswer(answers, "human-interaction") +
          getAnswer(answers, "trust-relationships")) /
        2,
      title: "Human-Centered Skills",
      description:
        "Trust and interpersonal depth sit at the center of how you create value.",
    },
    {
      score: getAnswer(answers, "adaptability"),
      title: "Adaptability",
      description:
        "You integrate new tools while keeping a coherent professional identity.",
    },
    {
      score: getAnswer(answers, "personal-judgment"),
      title: "Contextual Judgment",
      description:
        "Nuanced decisions under ambiguity—a distinctly human pattern in your work.",
    },
    {
      score: getAnswer(answers, "creativity"),
      title: "Creative Problem-Solving",
      description:
        "Original thinking creates space between routine execution and automation.",
    },
    {
      score: getAnswer(answers, "specialized-expertise"),
      title: "Specialized Expertise",
      description:
        "Domain depth compounds over years—an advantage that does not arrive overnight.",
    },
  ];

  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ title, description }) => ({ title, description }));
}

function generateExposureAreas(answers: Answers): NarrativeCard[] {
  const areas: (NarrativeCard & { pressure: number })[] = [
    {
      pressure: getAnswer(answers, "repetitive-tasks"),
      title: "Routine Task Patterns",
      description:
        "Predictable workflows may automate gradually—a signal to elevate the variable parts of your role.",
    },
    {
      pressure: getAnswer(answers, "ai-capable-today"),
      title: "Partial Task Automation",
      description:
        "Parts of your work may already be tool-assisted—industry momentum, not a verdict on your value.",
    },
    {
      pressure: getAnswer(answers, "industry-change"),
      title: "Industry Transformation Pace",
      description:
        "Your field is moving at a noticeable pace—awareness helps you stay ahead rather than react.",
    },
    {
      pressure: 100 - getAnswer(answers, "creativity"),
      title: "Limited Creative Differentiation",
      description:
        "Less original thinking can narrow margins over time—room to cultivate more distinctive contributions.",
    },
    {
      pressure: 100 - getAnswer(answers, "human-interaction"),
      title: "Reduced Interpersonal Dependency",
      description:
        "Roles with less human connection may substitute faster—relationship skill becomes a sharper counterbalance.",
    },
  ];

  const selected = areas
    .filter((area) => area.pressure >= 45)
    .sort((a, b) => b.pressure - a.pressure)
    .slice(0, 3);

  if (selected.length >= 2) {
    return selected.map(({ title, description }) => ({ title, description }));
  }

  return [
    {
      title: "Moderate Structural Shift",
      description:
        "Exposure suggests gradual change—space to observe, adapt, and strengthen what lasts.",
    },
    {
      title: "Tool-Assisted Workflows",
      description:
        "AI may support more of your workflow; the opportunity is directing tools with judgment.",
    },
  ];
}

function generateResilienceRecommendations(
  answers: Answers,
  aiExposure: number
): NarrativeCard[] {
  const recommendations: NarrativeCard[] = [];

  if (
    getAnswer(answers, "strategic-decision") < 65 ||
    aiExposure >= 55
  ) {
    recommendations.push({
      title: "Interdisciplinary Thinking",
      description:
        "Connect insights across domains—especially as boundaries between roles blur.",
    });
  }

  if (getAnswer(answers, "human-interaction") < 65) {
    recommendations.push({
      title: "Strategic Communication",
      description:
        "Translate complexity into clarity for others—a skill that compounds as automated output grows.",
    });
  } else {
    recommendations.push({
      title: "Strategic Communication",
      description:
        "Articulate judgment and perspective—turn relational strength into visible leadership signal.",
    });
  }

  if (getAnswer(answers, "adaptability") < 60) {
    recommendations.push({
      title: "AI-Assisted Decision Making",
      description:
        "Practice directing AI tools—intent, evaluation, quality—without surrendering judgment.",
    });
  } else {
    recommendations.push({
      title: "AI-Assisted Decision Making",
      description:
        "Pair adaptability with deliberate tool direction—speed plus judgment only you provide.",
    });
  }

  if (recommendations.length < 3) {
    recommendations.push({
      title: "Complex Problem-Solving",
      description:
        "Prioritize work that needs synthesis, empathy, and context—problems that resist simple automation.",
    });
  }

  return recommendations.slice(0, 3);
}

function generateBenchmarkNarrative(
  answers: Answers,
  aiExposure: number,
  resilience: number
): string {
  const human =
    (getAnswer(answers, "human-interaction") +
      getAnswer(answers, "trust-relationships")) /
    2;

  if (resilience >= 70 && human >= 60) {
    return "In transformation, empathy and judgment may carry more weight than speed alone.";
  }

  if (resilience >= 60 && aiExposure <= 55) {
    return "You can navigate industry shifts with measured confidence—aware of change, not defined by it.";
  }

  if (getAnswer(answers, "adaptability") >= 65) {
    return "When learning curves steepen, you may turn uncertainty into momentum—not anxiety.";
  }

  return "Small, consistent skill choices may compound into lasting resilience.";
}

function generateSummary(
  aiExposure: number,
  resilience: number
): string {
  if (resilience >= 70 && aiExposure <= 45) {
    return "Well balanced today—protect what makes your work distinctly yours.";
  }

  if (resilience >= 70) {
    return "Resilience is a genuine asset here. Deliberate learning can carry you forward with confidence.";
  }

  if (aiExposure >= 65 && resilience < 55) {
    return "Change is present in how you work—a prompt, not an alarm. Adaptability can shift your trajectory.";
  }

  return "Where you stand today is the start of intentional growth—a calm guide for what comes next.";
}

export function calculateResults(answers: Answers): AssessmentResult {
  const aiExposureScore = calculateAiExposureScore(answers);
  const careerResilienceScore = calculateCareerResilienceScore(answers);
  const riasecProfile = calculateRiasecProfile(answers);
  const ilonaaRiskIndex = calculateIlonaaRiskIndex(
    answers,
    aiExposureScore,
    careerResilienceScore
  );
  const positioningSummary = derivePositioningSummary(
    aiExposureScore,
    careerResilienceScore
  );
  const positioningDimensions = derivePositioningDimensions(
    answers,
    aiExposureScore,
    careerResilienceScore
  );

  return {
    riasecProfile,
    ilonaaRiskIndex,
    aiExposureScore,
    careerResilienceScore,
    positioningSummary,
    positioningDimensions,
    humanAdvantageFactors: generateKeyStrengths(answers),
    keyRiskDrivers: generateExposureAreas(answers),
    recommendedNextMoves: generateResilienceRecommendations(
      answers,
      aiExposureScore
    ),
    modelDistinctionNarrative: generateModelDistinctionNarrative(
      answers,
      aiExposureScore,
      careerResilienceScore
    ),
    benchmarkNarrative: generateBenchmarkNarrative(
      answers,
      aiExposureScore,
      careerResilienceScore
    ),
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
    const parsed = JSON.parse(raw) as Partial<AssessmentResult> & {
      answers?: Answers;
    };

    if (!parsed.answers) return null;

    if (
      parsed.riasecProfile?.primaryType &&
      parsed.riasecProfile?.secondaryType &&
      parsed.ilonaaRiskIndex?.score !== undefined &&
      parsed.positioningDimensions &&
      parsed.keyRiskDrivers &&
      parsed.humanAdvantageFactors &&
      parsed.recommendedNextMoves &&
      parsed.modelDistinctionNarrative
    ) {
      return parsed as AssessmentResult;
    }

    return calculateResults(parsed.answers);
  } catch {
    return null;
  }
}
