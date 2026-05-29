import type {
  Answers,
  AssessmentResult,
  NarrativeCard,
  SelectedProfession,
} from "./types";
import { STORAGE_KEY } from "./types";
import {
  getAllOccupations,
  getOccupationByCode,
  toProfessionSelection,
} from "./occupations";
import { calculateRiasecProfile } from "./riasec";
import { calculateOnetAdjustedScores } from "./onetScoring";

function getAnswer(answers: Answers, key: string, fallback = 50): number {
  return answers[key] ?? fallback;
}

function getPositioningSummary(
  aiExposure: number,
  resilience: number,
  riskIndex: number
): string {
  if (riskIndex >= 65 && resilience < 55) {
    return "Based on your selected profession and answers, this suggests meaningful AI transition pressure. It is not a verdict.";
  }
  if (resilience >= 70 && aiExposure <= 45) {
    return "Your current signal suggests comparatively durable human value in your profession context.";
  }
  if (aiExposure >= 60 && resilience >= 60) {
    return "This may indicate high AI exposure with meaningful resilience at once—often a sign of workflow evolution.";
  }
  return "Your current profile sits in a mixed zone where deliberate skill positioning may shift outcomes.";
}

function getPositioningDimensions(
  answers: Answers,
  aiExposure: number,
  resilience: number,
  riskIndex: number
) {
  return [
    {
      id: "resilience",
      label: "Career resilience",
      value: resilience,
      insight:
        resilience >= 70
          ? "Your resilience signal is currently strong."
          : resilience >= 55
            ? "Your resilience signal is moderate and buildable."
            : "Your resilience signal may benefit from targeted reinforcement.",
    },
    {
      id: "exposure",
      label: "AI exposure",
      value: aiExposure,
      insight:
        aiExposure >= 65
          ? "Task-level AI exposure appears relatively high."
          : aiExposure >= 50
            ? "AI exposure appears moderate."
            : "AI exposure appears comparatively contained.",
    },
    {
      id: "risk-index",
      label: "ILONAA AI Risk Index",
      value: riskIndex,
      insight:
        riskIndex >= 65
          ? "Combined risk pressure is elevated."
          : riskIndex >= 50
            ? "Combined risk pressure is moderate."
            : "Combined risk pressure is currently lower.",
    },
    {
      id: "human-uniqueness",
      label: "Human uniqueness",
      value: getAnswer(answers, "human-uniqueness", 60),
      insight:
        "Higher values suggest more context-dependent and relationship-rich work that may resist full automation.",
    },
    {
      id: "adaptability",
      label: "Learning adaptability",
      value: getAnswer(answers, "tool-learning-speed", 60),
      insight:
        "Higher values suggest faster capability shifts as tools and workflows evolve.",
    },
    {
      id: "consequence",
      label: "Decision consequence",
      value: getAnswer(answers, "decision-consequence", 60),
      insight:
        "Higher-consequence decisions may increase human oversight and accountability requirements.",
    },
  ];
}

function getHumanAdvantageFactors(
  answers: Answers,
  profession: SelectedProfession
): NarrativeCard[] {
  const factors: (NarrativeCard & { score: number })[] = [
    {
      score: getAnswer(answers, "human-uniqueness", 60),
      title: "Uniquely human contribution",
      description:
        "Your answers suggest meaningful work elements that may still depend on context, empathy, and judgment.",
    },
    {
      score: getAnswer(answers, "tool-learning-speed", 60),
      title: "Adaptive learning speed",
      description:
        "Your learning velocity may support faster repositioning as digital workflows change.",
    },
    {
      score: getAnswer(answers, "decision-consequence", 60),
      title: "Accountability and oversight",
      description:
        "Higher-consequence decisions often preserve a human accountability layer even when AI assists.",
    },
    {
      score: profession.keyOccupationalFactors.decisionJudgment,
      title: "Occupational judgment demand",
      description:
        "Your selected profession baseline indicates non-trivial judgment expectations in core tasks.",
    },
  ];

  return factors
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ title, description }) => ({ title, description }));
}

function getKeyRiskDrivers(
  answers: Answers,
  profession: SelectedProfession
): NarrativeCard[] {
  const drivers: (NarrativeCard & { score: number })[] = [
    {
      score: profession.keyOccupationalFactors.routineRepetitive,
      title: "Routine task concentration",
      description:
        "Your profession baseline includes repeatable workflows that may be easier to automate.",
    },
    {
      score: getAnswer(answers, "ai-tools-usage", 50),
      title: "Current AI usage intensity",
      description:
        "Higher AI usage may indicate stronger proximity to tool-mediated workflow disruption.",
    },
    {
      score: profession.keyOccupationalFactors.administrativeStructure,
      title: "Structured process dependency",
      description:
        "Highly structured process environments can increase substitution pressure on predictable tasks.",
    },
    {
      score: profession.keyOccupationalFactors.informationProcessing,
      title: "Information-processing load",
      description:
        "High processing volume may increase augmentation pressure and task redesign over time.",
    },
  ];

  return drivers
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ title, description }) => ({ title, description }));
}

function getRecommendedNextMoves(
  answers: Answers,
  riskIndex: number
): NarrativeCard[] {
  const learning = getAnswer(answers, "tool-learning-speed", 60);
  const human = getAnswer(answers, "human-uniqueness", 60);
  const consequence = getAnswer(answers, "decision-consequence", 60);

  const moves: NarrativeCard[] = [];

  if (learning < 60 || riskIndex >= 60) {
    moves.push({
      title: "Upgrade tool fluency deliberately",
      description:
        "Build repeatable AI-assisted workflows to reduce blind-risk and improve transition readiness.",
    });
  }

  if (human < 70) {
    moves.push({
      title: "Increase human differentiation",
      description:
        "Shift more effort toward context-heavy, relational, and judgment-centric outputs.",
    });
  }

  if (consequence >= 80) {
    moves.push({
      title: "Clarify human accountability boundaries",
      description:
        "Make explicit where AI can assist and where human sign-off remains mandatory for safety or compliance.",
    });
  } else {
    moves.push({
      title: "Define quality checkpoints",
      description:
        "Establish clear review standards so automation improves speed without degrading decision quality.",
    });
  }

  if (moves.length < 3) {
    moves.push({
      title: "Reassess quarterly",
      description:
        "Review your profession baseline and adaptation signals regularly as market and tools evolve.",
    });
  }

  return moves.slice(0, 3);
}

function getModelDistinctionNarrative(
  profession: SelectedProfession,
  aiExposure: number,
  resilience: number
): string {
  if (aiExposure >= 60 && resilience >= 60) {
    return `Your selected profession (${profession.title}) appears AI-exposed and resilient at once. Exposure is not a verdict.`;
  }
  if (resilience >= 70) {
    return `Based on your selected profession and answers, your human-strength signal may provide meaningful resilience in the current transition.`;
  }
  return "RIASEC describes occupational identity. ILONAA estimates AI risk pressure using profession baseline plus your four adjustment answers.";
}

function getBenchmarkNarrative(
  profession: SelectedProfession,
  aiExposure: number,
  resilience: number
): string {
  if (profession.baselineAiExposure >= 65 && resilience >= 60) {
    return "Your profession baseline appears structurally exposed, yet your current profile suggests adaptive capacity.";
  }
  if (profession.baselineCareerResilience >= 65 && aiExposure <= 50) {
    return "Your selected profession and answers suggest comparatively stable near-term positioning.";
  }
  return "These results are decision-support signals based on profession baseline and your answers, not deterministic predictions.";
}

function getSummary(riskIndex: number, resilience: number): string {
  if (riskIndex >= 65 && resilience < 55) {
    return "Risk pressure may be elevated. Prioritize adaptability and human differentiation in your near-term role strategy.";
  }
  if (resilience >= 70 && riskIndex <= 50) {
    return "Your current profile suggests a relatively resilient position, provided you continue active adaptation.";
  }
  return "Your current signal is mixed but actionable—use this as structured orientation, not a final verdict.";
}

function inferProfessionFromLegacyAnswers(
  answers: Answers
): SelectedProfession | null {
  const legacyKeys = [
    "repetitive-tasks",
    "human-interaction",
    "creativity",
    "strategic-decision",
    "specialized-expertise",
    "industry-change",
    "adaptability",
    "personal-judgment",
  ];

  if (!legacyKeys.some((key) => answers[key] !== undefined)) return null;

  const target = {
    routineRepetitive: getAnswer(answers, "repetitive-tasks"),
    humanInteraction: getAnswer(answers, "human-interaction"),
    creativityInnovation: getAnswer(answers, "creativity"),
    decisionJudgment: getAnswer(answers, "personal-judgment"),
    dataAnalysis: getAnswer(answers, "specialized-expertise"),
    adaptabilityLearning: getAnswer(answers, "adaptability"),
  };

  const nearest = getAllOccupations()
    .map((occupation) => {
      const f = occupation.factors;
      const distance =
        Math.abs(f.routineRepetitive - target.routineRepetitive) +
        Math.abs(f.humanInteraction - target.humanInteraction) +
        Math.abs(f.creativityInnovation - target.creativityInnovation) +
        Math.abs(f.decisionJudgment - target.decisionJudgment) +
        Math.abs(f.dataAnalysis - target.dataAnalysis) +
        Math.abs(f.adaptabilityLearning - target.adaptabilityLearning);

      return { occupation, distance };
    })
    .sort((a, b) => a.distance - b.distance)[0];

  return nearest ? toProfessionSelection(nearest.occupation) : null;
}

export function calculateResults(
  profession: SelectedProfession,
  answers: Answers
): AssessmentResult {
  const riasecProfile = calculateRiasecProfile({
    "repetitive-tasks": profession.keyOccupationalFactors.routineRepetitive,
    "human-interaction": profession.keyOccupationalFactors.humanInteraction,
    creativity: profession.keyOccupationalFactors.creativityInnovation,
    "strategic-decision": profession.keyOccupationalFactors.decisionJudgment,
    "specialized-expertise": profession.keyOccupationalFactors.dataAnalysis,
    "ai-capable-today": profession.baselineAiExposure,
    "trust-relationships": profession.keyOccupationalFactors.humanInteraction,
    "industry-change": profession.keyOccupationalFactors.adaptabilityLearning,
    adaptability: getAnswer(answers, "tool-learning-speed", 60),
    "personal-judgment": profession.keyOccupationalFactors.decisionJudgment,
  });

  const { aiExposureScore, careerResilienceScore, ilonaaRiskIndex } =
    calculateOnetAdjustedScores(profession, answers);

  return {
    selectedProfession: profession,
    riasecProfile: {
      ...riasecProfile,
      primaryType: profession.primaryRiasecType,
      secondaryType: profession.secondaryRiasecType,
    },
    ilonaaRiskIndex,
    aiExposureScore,
    careerResilienceScore,
    positioningSummary: getPositioningSummary(
      aiExposureScore,
      careerResilienceScore,
      ilonaaRiskIndex.score
    ),
    positioningDimensions: getPositioningDimensions(
      answers,
      aiExposureScore,
      careerResilienceScore,
      ilonaaRiskIndex.score
    ),
    humanAdvantageFactors: getHumanAdvantageFactors(answers, profession),
    keyRiskDrivers: getKeyRiskDrivers(answers, profession),
    recommendedNextMoves: getRecommendedNextMoves(answers, ilonaaRiskIndex.score),
    modelDistinctionNarrative: getModelDistinctionNarrative(
      profession,
      aiExposureScore,
      careerResilienceScore
    ),
    benchmarkNarrative: getBenchmarkNarrative(
      profession,
      aiExposureScore,
      careerResilienceScore
    ),
    summary: getSummary(ilonaaRiskIndex.score, careerResilienceScore),
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
      selectedProfession?: { code?: string };
    };

    if (!parsed.answers) return null;

    if (
      parsed.selectedProfession?.code &&
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

    if (parsed.selectedProfession?.code) {
      const occupation = getOccupationByCode(parsed.selectedProfession.code);
      if (occupation) {
        return calculateResults(toProfessionSelection(occupation), parsed.answers);
      }
    }

    const inferred = inferProfessionFromLegacyAnswers(parsed.answers);
    if (inferred) {
      return calculateResults(inferred, parsed.answers);
    }

    return null;
  } catch {
    return null;
  }
}
