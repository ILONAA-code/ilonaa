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
    archetypeTagline: "Judgment amplified by trust and perspective",
    profileEssence:
      "You create value where relationships, nuance, and long-range thinking intersect. As knowledge work shifts, that combination tends to become more decisive—not less.",
    profileSummary:
      "A profile shaped by strategic clarity and the human judgment machines rarely replicate.",
    resilienceFraming:
      "Your resilience is anchored in work that rewards empathy, credibility, and context—qualities that compound as tools accelerate everything else.",
    comparativeContext:
      "Compared with highly automation-sensitive roles, profiles like yours often gain influence precisely when decisions become ambiguous and stakes become human.",
  },
  "strategic-integrator": {
    id: "strategic-integrator",
    archetypeTitle: "Strategic Integrator",
    archetypeTagline: "Complexity translated into coherent direction",
    profileEssence:
      "You orient toward synthesis—connecting information, people, and trade-offs into decisions that hold under pressure. That orientation travels well across changing industries.",
    profileSummary:
      "A mind for integration in environments where fragmented answers are easy—and integrated judgment is rare.",
    resilienceFraming:
      "AI may absorb routine analysis, but integrating meaning, priority, and consequence remains distinctly yours.",
    comparativeContext:
      "Profiles like yours often thrive in transformation settings—where teams need someone who can hold the whole picture while others optimize the parts.",
  },
  "adaptive-builder": {
    id: "adaptive-builder",
    archetypeTitle: "Adaptive Builder",
    archetypeTagline: "Learning translated into durable capability",
    profileEssence:
      "You approach change as material to work with—not noise to resist. That posture turns uncertainty into professional momentum over time.",
    profileSummary:
      "A future-work profile defined by constructive adaptability rather than defensive rigidity.",
    resilienceFraming:
      "Your resilience grows through deliberate evolution—using new tools while strengthening the judgment that directs them.",
    comparativeContext:
      "Profiles like yours frequently outperform more static skill sets when industries reorder themselves—not because change is easy, but because you metabolize it.",
  },
  "creative-synthesizer": {
    id: "creative-synthesizer",
    archetypeTitle: "Creative Synthesizer",
    archetypeTagline: "Original thinking applied with intent",
    profileEssence:
      "You generate value by reframing problems and connecting ideas others treat as separate. That creative layer resists commoditization.",
    profileSummary:
      "An orientation toward synthesis and invention—where the output is insight, not repetition.",
    resilienceFraming:
      "Automation pressures routine production; your edge lives in interpretation, imagination, and the courage to propose what is not yet obvious.",
    comparativeContext:
      "Compared with execution-heavy roles, profiles like yours often remain indispensable where the brief is unclear and the path is still being invented.",
  },
  "systems-oriented-thinker": {
    id: "systems-oriented-thinker",
    archetypeTitle: "Systems-Oriented Thinker",
    archetypeTagline: "Depth, structure, and disciplined expertise",
    profileEssence:
      "You build authority through accumulated knowledge and reliable reasoning. In shifting markets, that depth becomes a stabilizing force others depend on.",
    profileSummary:
      "A profile grounded in expertise and structured thinking—less flashy, increasingly valuable.",
    resilienceFraming:
      "Tools may accelerate tasks within your domain; your resilience lies in knowing what the system should do—and why.",
    comparativeContext:
      "Profiles like yours often sustain relevance in specialized environments—where credibility still flows from mastery, not volume.",
  },
  "measured-navigator": {
    id: "measured-navigator",
    archetypeTitle: "Measured Navigator",
    archetypeTagline: "Balanced awareness in a shifting landscape",
    profileEssence:
      "You hold a thoughtful middle ground—enough exposure to take change seriously, enough strength to move with intention rather than reaction.",
    profileSummary:
      "A clear-eyed profile for building direction calmly—without alarm and without denial.",
    resilienceFraming:
      "Your next advantage is not a single skill—it is clarity about where to invest attention as AI reshapes the work around you.",
    comparativeContext:
      "Profiles like yours often find momentum through small, consistent upgrades—turning awareness into strategy before urgency becomes necessity.",
  },
};

function profileFit(ctx: ProfileContext, id: string): number {
  const { strategic, human, creativity, adaptability, judgment, expertise, resilience, aiExposure } =
    ctx;

  switch (id) {
    case "human-centered-strategist":
      return human * 1.4 + strategic * 1.1 + judgment * 0.8 + resilience * 0.5;
    case "strategic-integrator":
      return strategic * 1.3 + judgment * 1.2 + expertise * 0.6 + resilience * 0.5;
    case "adaptive-builder":
      return adaptability * 1.5 + creativity * 0.7 + (100 - aiExposure) * 0.3 + resilience * 0.4;
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
