import type { Answers } from "./types";

export type CareerProfile = {
  archetypeId: string;
  archetypeTitle: string;
  archetypeTagline: string;
  quotableInsight: string;
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
  humanInteraction: number;
  trust: number;
  human: number;
  industryChange: number;
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
  const humanInteraction = getAnswer(answers, "human-interaction");
  const trust = getAnswer(answers, "trust-relationships");

  return {
    answers,
    aiExposure,
    resilience,
    strategic: getAnswer(answers, "strategic-decision"),
    humanInteraction,
    trust,
    human: (humanInteraction + trust) / 2,
    industryChange: getAnswer(answers, "industry-change"),
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
    archetypeTagline: "Judgment, amplified by trust",
    quotableInsight:
      "Your advantage grows where ambiguity still needs a person in the room.",
    profileEssence:
      "You appear strongest where relationships, nuance, and long-range thinking meet—capabilities that compound as routine work automates around you.",
    profileSummary:
      "Strategic clarity plus human judgment machines rarely replicate well.",
    resilienceFraming:
      "Your resilience is anchored in empathy, credibility, and context—the work that still decides outcomes when tools handle the predictable.",
    comparativeContext:
      "Compared with automation-heavy roles, your influence may grow when decisions turn ambiguous and the stakes turn human.",
  },
  "strategic-integrator": {
    id: "strategic-integrator",
    archetypeTitle: "Strategic Integrator",
    archetypeTagline: "You hold the whole picture",
    quotableInsight:
      "You remain strongest where someone must integrate what others only fragment.",
    profileEssence:
      "You integrate information, people, and trade-offs into decisions that hold under pressure—a habit directly relevant to how your role evolves.",
    profileSummary:
      "Integrated judgment where others offer fragments—a rarer advantage.",
    resilienceFraming:
      "You stay essential where meaning, priority, and consequence still require a person—not a model—to decide.",
    comparativeContext:
      "In transformation, people with your profile are often relied on when the path is unclear but coherence is urgent.",
  },
  "adaptive-builder": {
    id: "adaptive-builder",
    archetypeTitle: "Adaptive Builder",
    archetypeTagline: "You learn into advantage",
    quotableInsight:
      "Your edge sharpens where learning moves faster than certainty.",
    profileEssence:
      "You treat change as workable material—not background noise. That posture shapes your positioning more than any single score.",
    profileSummary:
      "Oriented toward constructive adaptation rather than defensive rigidity.",
    resilienceFraming:
      "Your strengths may compound as you pair new tools with the judgment that directs them.",
    comparativeContext:
      "When industries reorder, you may adapt before peers who wait for certainty.",
  },
  "creative-synthesizer": {
    id: "creative-synthesizer",
    archetypeTitle: "Creative Synthesizer",
    archetypeTagline: "Original connection is your edge",
    quotableInsight:
      "Your value concentrates where insight still outruns execution.",
    profileEssence:
      "You create value by reframing problems and linking ideas others keep separate—difficult to automate without losing quality.",
    profileSummary:
      "Strongest where the output is insight and interpretation—not repetition.",
    resilienceFraming:
      "Creative judgment may remain distinctly yours as production accelerates elsewhere.",
    comparativeContext:
      "Compared with execution-heavy roles, you may stay indispensable while the brief is still being defined.",
  },
  "systems-oriented-thinker": {
    id: "systems-oriented-thinker",
    archetypeTitle: "Systems-Oriented Thinker",
    archetypeTagline: "Depth as a stabilizing force",
    quotableInsight:
      "You stay essential where depth still decides what the system should do.",
    profileEssence:
      "You build authority through accumulated knowledge and reliable reasoning—depth that may matter more than volume as tools proliferate.",
    profileSummary:
      "Grounded in expertise and structure—quiet advantages that age well.",
    resilienceFraming:
      "You remain strongest where others need someone who understands what the system should do, and why.",
    comparativeContext:
      "In specialized environments, credibility may flow from mastery rather than speed alone.",
  },
  "measured-navigator": {
    id: "measured-navigator",
    archetypeTitle: "Measured Navigator",
    archetypeTagline: "A balanced read of the landscape",
    quotableInsight:
      "Your steadiness is the advantage—before urgency chooses for you.",
    profileEssence:
      "A thoughtful middle ground—enough exposure to take change seriously, enough strength to respond with intention.",
    profileSummary:
      "A clear-eyed view of where you stand—without alarm or denial.",
    resilienceFraming:
      "Your next edge may be clarity about where to invest as AI reshapes the work around you.",
    comparativeContext:
      "Momentum may come through small, consistent upgrades—before external pressure forces larger ones.",
  },
};

const QUOTABLE_ALTERNATES: Record<
  string,
  { when: (ctx: ProfileContext) => boolean; line: string }[]
> = {
  "human-centered-strategist": [
    {
      when: (ctx) => ctx.resilience >= 70 && ctx.aiExposure <= 45,
      line: "You remain strongest where trust still outperforms prediction.",
    },
  ],
  "strategic-integrator": [
    {
      when: (ctx) => ctx.judgment >= 68,
      line: "Your value increases where context resists automation.",
    },
  ],
  "adaptive-builder": [
    {
      when: (ctx) => ctx.aiExposure >= 58,
      line: "You operate where tools accelerate work—but judgment still sets direction.",
    },
  ],
  "creative-synthesizer": [
    {
      when: (ctx) => ctx.creativity >= 72,
      line: "Your advantage grows where ambiguity still needs interpretation.",
    },
  ],
  "systems-oriented-thinker": [
    {
      when: (ctx) => ctx.expertise >= 68,
      line: "You remain strongest where judgment still matters more than output.",
    },
  ],
  "measured-navigator": [
    {
      when: (ctx) => ctx.resilience >= 62 && ctx.aiExposure >= 55,
      line: "You hold ground where capability and exposure meet at once.",
    },
  ],
};

function resolveQuotableInsight(id: string, ctx: ProfileContext): string {
  const base = PROFILES[id]?.quotableInsight ?? PROFILES["measured-navigator"].quotableInsight;
  const alternate = QUOTABLE_ALTERNATES[id]?.find((entry) => entry.when(ctx));
  return alternate?.line ?? base;
}

function profileFit(ctx: ProfileContext, id: string): number {
  const {
    strategic,
    humanInteraction,
    trust,
    human,
    industryChange,
    creativity,
    adaptability,
    judgment,
    expertise,
    resilience,
    aiExposure,
  } = ctx;

  switch (id) {
    case "human-centered-strategist":
      return (
        human * 1.35 +
        trust * 0.6 +
        strategic * 0.65 +
        judgment * 0.7 +
        resilience * 0.45 -
        aiExposure * 0.35 +
        Math.max(0, human - 70) * 0.6
      );
    case "strategic-integrator":
      return (
        strategic * 1.45 +
        judgment * 1.25 +
        expertise * 0.9 +
        resilience * 0.35 +
        adaptability * 0.2 +
        Math.max(0, strategic - 70) * 0.5
      );
    case "adaptive-builder":
      return (
        adaptability * 1.55 +
        industryChange * 1.15 +
        aiExposure * 0.7 +
        creativity * 0.45 +
        resilience * 0.2 +
        strategic * 0.2
      );
    case "creative-synthesizer":
      return (
        creativity * 2.2 +
        judgment * 0.8 +
        adaptability * 0.5 +
        strategic * 0.25 +
        human * 0.2 +
        Math.max(0, creativity - 70) * 1.0
      );
    case "systems-oriented-thinker":
      return (
        expertise * 1.25 +
        judgment * 1.15 +
        strategic * 0.9 +
        (100 - humanInteraction) * 0.9 +
        resilience * 0.2 +
        Math.max(0, expertise - 70) * 0.6
      );
    case "measured-navigator":
      return (
        350 -
        Math.abs(resilience - 55) * 2.2 -
        Math.abs(aiExposure - 50) * 2.0 -
        Math.abs(adaptability - 60) * 1.0 -
        Math.abs(human - 55) * 0.9 -
        Math.abs(strategic - 55) * 0.8 -
        Math.abs(industryChange - 55) * 0.6
      );
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

  const winnerId = ranked[0]?.id ?? "measured-navigator";
  const winner = PROFILES[winnerId];

  return {
    archetypeId: winner.id,
    archetypeTitle: winner.archetypeTitle,
    archetypeTagline: winner.archetypeTagline,
    quotableInsight: resolveQuotableInsight(winnerId, ctx),
    profileEssence: winner.profileEssence,
    profileSummary: winner.profileSummary,
    resilienceFraming: winner.resilienceFraming,
    comparativeContext: winner.comparativeContext,
  };
}
