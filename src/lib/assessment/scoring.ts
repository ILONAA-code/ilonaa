import type { Answers, AssessmentResult, NarrativeCard } from "./types";
import { STORAGE_KEY } from "./types";
import { resolveCareerProfile } from "./profile";
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

function generateHeroHeadline(
  answers: Answers,
  aiExposure: number,
  resilience: number
): string {
  const strategic = getAnswer(answers, "strategic-decision");
  const human = getAnswer(answers, "human-interaction");
  const judgment = getAnswer(answers, "personal-judgment");

  if (resilience >= 70 && human >= 65) {
    return "Your profile suggests strong resilience in strategic and relationship-driven environments.";
  }

  if (resilience >= 70 && strategic >= 65) {
    return "Your profile reflects thoughtful strength in complexity, judgment, and long-range thinking.";
  }

  if (resilience >= 55 && aiExposure <= 50) {
    return "Your profile suggests a balanced foundation with room to deepen your most human advantages.";
  }

  if (aiExposure >= 60 && resilience >= 55) {
    return "Your profile sits at an active intersection of change and capability — a thoughtful place to begin.";
  }

  return "Your profile reveals a clear starting point for building clarity and intentional career direction.";
}

function generateHeroNarrative(
  answers: Answers,
  aiExposure: number,
  resilience: number
): string {
  const adaptability = getAnswer(answers, "adaptability");
  const expertise = getAnswer(answers, "specialized-expertise");

  if (resilience >= 70) {
    return "Your responses point to durable professional qualities — the kind that tend to compound over time rather than fade with technological shifts.";
  }

  if (adaptability >= 65 && expertise >= 55) {
    return "You combine developing depth with openness to change — a pairing that often translates well as industries evolve.";
  }

  if (aiExposure >= 60) {
    return "Some aspects of your work may face increasing automation pressure, but this is context for planning — not a verdict on your future.";
  }

  return "These patterns are meant to inform your thinking with calm precision — offering direction without reducing your career to a single score.";
}

function generateKeyStrengths(answers: Answers): NarrativeCard[] {
  const candidates: (NarrativeCard & { score: number })[] = [
    {
      score: getAnswer(answers, "strategic-decision"),
      title: "Strategic Thinking",
      description:
        "Your work involves meaningful direction-setting — weighing trade-offs, anticipating consequences, and shaping outcomes beyond immediate tasks.",
    },
    {
      score:
        (getAnswer(answers, "human-interaction") +
          getAnswer(answers, "trust-relationships")) /
        2,
      title: "Human-Centered Skills",
      description:
        "Interpersonal depth and trust-building appear central to how you create value — qualities that technology tends to amplify rather than replace.",
    },
    {
      score: getAnswer(answers, "adaptability"),
      title: "Adaptability",
      description:
        "Your openness to learning and evolving how you work suggests a capacity to integrate new tools without losing your professional identity.",
    },
    {
      score: getAnswer(answers, "personal-judgment"),
      title: "Contextual Judgment",
      description:
        "Nuanced decision-making under ambiguity is a recurring theme in your profile — a distinctly human capability in complex environments.",
    },
    {
      score: getAnswer(answers, "creativity"),
      title: "Creative Problem-Solving",
      description:
        "Original thinking and ideation play a meaningful role in your work — creating space between routine execution and full automation.",
    },
    {
      score: getAnswer(answers, "specialized-expertise"),
      title: "Specialized Expertise",
      description:
        "Depth of knowledge in your domain provides a foundation that develops over years — not overnight.",
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
        "Predictable workflows may gradually become candidates for automation — not as a threat, but as a signal to elevate the more variable aspects of your role.",
    },
    {
      pressure: getAnswer(answers, "ai-capable-today"),
      title: "Partial Task Automation",
      description:
        "Some elements of your work could already be assisted by AI tools today. This reflects industry momentum — not a judgment on your overall value.",
    },
    {
      pressure: getAnswer(answers, "industry-change"),
      title: "Industry Transformation Pace",
      description:
        "Your field appears to be evolving at a noticeable pace. Awareness of this rhythm helps you stay ahead of change rather than react to it.",
    },
    {
      pressure: 100 - getAnswer(answers, "creativity"),
      title: "Limited Creative Differentiation",
      description:
        "Roles with less emphasis on original thinking may face narrower margins over time — an invitation to cultivate more distinctive contributions.",
    },
    {
      pressure: 100 - getAnswer(answers, "human-interaction"),
      title: "Reduced Interpersonal Dependency",
      description:
        "Work that relies less on human connection may see faster tool-based substitution — making relationship skills an increasingly valuable counterbalance.",
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
        "Your exposure profile suggests gradual rather than sudden change — space to observe, adapt, and strengthen your most durable professional qualities.",
    },
    {
      title: "Tool-Assisted Workflows",
      description:
        "AI may increasingly support portions of your workflow. The opportunity lies in directing these tools with judgment rather than competing with them.",
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
        "Connecting insights across domains helps you see opportunities others miss — especially valuable as boundaries between roles continue to blur.",
    });
  }

  if (getAnswer(answers, "human-interaction") < 65) {
    recommendations.push({
      title: "Strategic Communication",
      description:
        "The ability to translate complexity into clarity — for colleagues, clients, or stakeholders — becomes more valuable as automated outputs proliferate.",
    });
  } else {
    recommendations.push({
      title: "Strategic Communication",
      description:
        "Deepen your ability to articulate judgment and perspective — turning your existing relational strengths into visible leadership signals.",
    });
  }

  if (getAnswer(answers, "adaptability") < 60) {
    recommendations.push({
      title: "AI-Assisted Decision Making",
      description:
        "Learning to collaborate with AI tools — setting intent, evaluating outputs, maintaining quality standards — is an increasingly essential professional skill.",
    });
  } else {
    recommendations.push({
      title: "AI-Assisted Decision Making",
      description:
        "Build on your adaptability by developing a deliberate practice of directing AI tools — combining speed with the judgment only you can provide.",
    });
  }

  if (recommendations.length < 3) {
    recommendations.push({
      title: "Complex Problem-Solving",
      description:
        "Focus on problems that require synthesis, empathy, and context — the kind that resist simple automation and reward human depth.",
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
    return "You may find your strengths carry particular weight in transformation-oriented settings—where empathy, judgment, and perspective still decide outcomes.";
  }

  if (resilience >= 60 && aiExposure <= 55) {
    return "Your profile suggests you can navigate industry shifts with measured confidence—aware of change without being defined by it.";
  }

  if (getAnswer(answers, "adaptability") >= 65) {
    return "You may be especially effective when learning curves steepen—turning uncertainty into momentum rather than anxiety.";
  }

  return "You may gain the most from intentional skill investment—small, consistent choices that compound into lasting professional resilience.";
}

function generateSummary(
  aiExposure: number,
  resilience: number
): string {
  if (resilience >= 70 && aiExposure <= 45) {
    return "You appear well balanced today—protect the capabilities that make your work distinctly yours.";
  }

  if (resilience >= 70) {
    return "Your resilience is a genuine asset in your current landscape. Paired with deliberate learning, you are positioned to move forward with confidence.";
  }

  if (aiExposure >= 65 && resilience < 55) {
    return "Change is present in how you work—not as alarm, but as a prompt. Deliberate steps toward adaptability can shift your trajectory meaningfully.";
  }

  return "Understanding where you stand today is the beginning of intentional growth. Use these insights as a calm guide for the decisions ahead.";
}

export function calculateResults(answers: Answers): AssessmentResult {
  const aiExposureScore = calculateAiExposureScore(answers);
  const careerResilienceScore = calculateCareerResilienceScore(answers);
  const profile = resolveCareerProfile(
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
    aiExposureScore,
    careerResilienceScore,
    profile,
    positioningSummary,
    positioningDimensions,
    heroHeadline: generateHeroHeadline(
      answers,
      aiExposureScore,
      careerResilienceScore
    ),
    heroNarrative: generateHeroNarrative(
      answers,
      aiExposureScore,
      careerResilienceScore
    ),
    keyStrengths: generateKeyStrengths(answers),
    exposureAreas: generateExposureAreas(answers),
    resilienceRecommendations: generateResilienceRecommendations(
      answers,
      aiExposureScore
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

    if (parsed.profile?.archetypeTitle && parsed.positioningDimensions) {
      return parsed as AssessmentResult;
    }

    return calculateResults(parsed.answers);
  } catch {
    return null;
  }
}
