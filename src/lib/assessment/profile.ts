import type { Answers } from "./types";

export type CareerProfile = {
  archetypeId: string;
  archetypeTitle: string;
  archetypeTagline: string;
  profileEssence: string;
  profileSummary: string;
  resilienceFraming: string;
  comparativeContext: string;
};

type ProfileContext = {
  answers: Answers;
  aiExposure: number;
  resilience: number;
  strategic: number;
  human: number;
  creativity: number;
  adaptability: number;
  judgment: number;
  expertise: number;
};

function getAnswer(answers: Answers, key: string, fallback = 50): number {
  return answers[key] ?? fallback;
}

function buildContext(
  answers: Answers,
  aiExposure: number,
  resilience: number
): ProfileContext {
  return {
    answers,
    aiExposure,
    resilience,
    strategic: getAnswer(answers, "strategic-decision"),
    human:
      (getAnswer(answers, "human-interaction") +
        getAnswer(answers, "trust-relationships")) /
      2,
    creativity: getAnswer(answers, "creativity"),
    adaptability: getAnswer(answers, "adaptability"),
    judgment: getAnswer(answers, "personal-judgment"),
    expertise: getAnswer(answers, "specialized-expertise"),
  };
}

const PROFILES: Record<
  string,
  Omit<CareerProfile, "archetypeId"> & { id: string }
> = {
  "human-centered-strategist": {
    id: "human-centered-strategist",
    archetypeTitle: "Human-Centered Strategist",
    archetypeTagline: "Your judgment, amplified by trust",
    profileEssence:
      "Your working style appears strongest where relationships, nuance, and long-range thinking meet. In your current positioning, that combination is likely to become more valuable—not less—as tools accelerate routine work around you.",
    profileSummary:
      "You are shaped by strategic clarity and the human judgment machines rarely replicate well.",
    resilienceFraming:
      "Your resilience today is anchored in work that rewards empathy, credibility, and context—capabilities that compound as AI handles more of the predictable.",
    comparativeContext:
      "Compared with highly automation-sensitive roles, you may find your influence grows when decisions become ambiguous and the stakes turn human.",
  },
  "strategic-integrator": {
    id: "strategic-integrator",
    archetypeTitle: "Strategic Integrator",
    archetypeTagline: "Your ability to hold the whole picture",
    profileEssence:
      "Your profile suggests you naturally integrate information, people, and trade-offs into decisions that hold under pressure. That habit is directly relevant to how your role may need to evolve.",
    profileSummary:
      "You bring integrated judgment where others offer fragments—an increasingly rare advantage.",
    resilienceFraming:
      "You are likely to remain strongest where meaning, priority, and consequence still require a person—not a model—to decide.",
    comparativeContext:
      "In teams navigating transformation, people with your profile are often relied on when the path forward is unclear but the need for coherence is urgent.",
  },
  "adaptive-builder": {
    id: "adaptive-builder",
    archetypeTitle: "Adaptive Builder",
    archetypeTagline: "Your capacity to learn into advantage",
    profileEssence:
      "Your responses indicate you treat change as workable material—not background noise. That posture affects your day-to-day positioning more than any single score.",
    profileSummary:
      "You appear oriented toward constructive adaptation rather than defensive rigidity.",
    resilienceFraming:
      "Your current strengths may become increasingly valuable as you pair new tools with the judgment that directs them.",
    comparativeContext:
      "When industries reorder themselves, you may adapt faster than peers who wait for certainty before acting.",
  },
  "creative-synthesizer": {
    id: "creative-synthesizer",
    archetypeTitle: "Creative Synthesizer",
    archetypeTagline: "Your edge in original connection",
    profileEssence:
      "You appear to create value by reframing problems and linking ideas others keep separate. That layer of your work is difficult to automate without losing quality.",
    profileSummary:
      "You are strongest where the output is insight and interpretation—not repetition.",
    resilienceFraming:
      "Your creative judgment may be among the capabilities that remain distinctly yours as production speeds up elsewhere.",
    comparativeContext:
      "Compared with execution-heavy roles, you may remain indispensable where the brief is still being defined.",
  },
  "systems-oriented-thinker": {
    id: "systems-oriented-thinker",
    archetypeTitle: "Systems-Oriented Thinker",
    archetypeTagline: "Your depth as a stabilizing force",
    profileEssence:
      "Your profile suggests you build authority through accumulated knowledge and reliable reasoning. In your field, that depth may matter more than volume as tools proliferate.",
    profileSummary:
      "You are grounded in expertise and structure—quiet advantages that age well.",
    resilienceFraming:
      "You are likely to remain strongest where others need someone who understands what the system should do, and why.",
    comparativeContext:
      "In specialized environments, your credibility may continue to flow from mastery rather than speed alone.",
  },
  "measured-navigator": {
    id: "measured-navigator",
    archetypeTitle: "Measured Navigator",
    archetypeTagline: "Your balanced read of the landscape",
    profileEssence:
      "Your profile suggests a thoughtful middle ground—enough exposure to take change seriously, enough strength to respond with intention rather than reaction.",
    profileSummary:
      "You hold a clear-eyed view of where you stand today—without alarm and without denial.",
    resilienceFraming:
      "Your next advantage may be clarity about where to invest attention as AI reshapes the work immediately around you.",
    comparativeContext:
      "You may find momentum through small, consistent upgrades—before external pressure forces larger ones.",
  },
};

function profileFit(ctx: ProfileContext, id: string): number {
  const {
    strategic,
    human,
    creativity,
    adaptability,
    judgment,
    expertise,
    resilience,
    aiExposure,
  } = ctx;

  switch (id) {
    case "human-centered-strategist":
      return human * 1.4 + strategic * 1.1 + judgment * 0.8 + resilience * 0.5;
    case "strategic-integrator":
      return strategic * 1.3 + judgment * 1.2 + expertise * 0.6 + resilience * 0.5;
    case "adaptive-builder":
      return (
        adaptability * 1.5 +
        creativity * 0.7 +
        (100 - aiExposure) * 0.3 +
        resilience * 0.4
      );
    case "creative-synthesizer":
      return creativity * 1.4 + judgment * 1.0 + adaptability * 0.5;
    case "systems-oriented-thinker":
      return expertise * 1.3 + strategic * 0.8 + judgment * 0.7;
    case "measured-navigator":
      return 100 - Math.abs(resilience - 55) - Math.abs(aiExposure - 50) * 0.5;
    default:
      return 0;
  }
}

export function resolveCareerProfile(
  answers: Answers,
  aiExposure: number,
  resilience: number
): CareerProfile {
  const ctx = buildContext(answers, aiExposure, resilience);

  const ranked = Object.keys(PROFILES)
    .map((id) => ({ id, fit: profileFit(ctx, id) }))
    .sort((a, b) => b.fit - a.fit);

  const winner = PROFILES[ranked[0]?.id ?? "measured-navigator"];

  return {
    archetypeId: winner.id,
    archetypeTitle: winner.archetypeTitle,
    archetypeTagline: winner.archetypeTagline,
    profileEssence: winner.profileEssence,
    profileSummary: winner.profileSummary,
    resilienceFraming: winner.resilienceFraming,
    comparativeContext: winner.comparativeContext,
  };
}
