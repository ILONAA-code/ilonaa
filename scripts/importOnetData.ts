import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { JOB_PROFILES } from "../src/lib/assessment/jobProfiles";
import type { RiasecType } from "../src/lib/assessment/types";
import type {
  OnetOccupation,
  OnetOccupationFactors,
  OnetRiasecScores,
} from "../src/lib/assessment/onetTypes";

type LegacyAnswers = Record<string, number>;

type RiasecPair = {
  primary: RiasecType;
  secondary: RiasecType;
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function getLegacy(answers: LegacyAnswers, key: string, fallback = 50): number {
  return answers[key] ?? fallback;
}

function mapCategoryToRiasec(category: string): RiasecPair {
  if (category.includes("finance")) return { primary: "Conventional", secondary: "Enterprising" };
  if (category.includes("legal")) return { primary: "Conventional", secondary: "Investigative" };
  if (category.includes("software")) return { primary: "Investigative", secondary: "Realistic" };
  if (category.includes("ai/data")) return { primary: "Investigative", secondary: "Conventional" };
  if (category.includes("management")) return { primary: "Enterprising", secondary: "Social" };
  if (category.includes("healthcare")) return { primary: "Social", secondary: "Investigative" };
  if (category.includes("education")) return { primary: "Social", secondary: "Artistic" };
  if (category.includes("skilled")) return { primary: "Realistic", secondary: "Conventional" };
  if (category.includes("engineering")) return { primary: "Investigative", secondary: "Realistic" };
  if (category.includes("sales")) return { primary: "Enterprising", secondary: "Social" };
  if (category.includes("marketing")) return { primary: "Artistic", secondary: "Enterprising" };
  if (category.includes("hr")) return { primary: "Social", secondary: "Enterprising" };
  if (category.includes("operations")) return { primary: "Conventional", secondary: "Realistic" };
  if (category.includes("administration")) return { primary: "Conventional", secondary: "Social" };
  if (category.includes("science")) return { primary: "Investigative", secondary: "Conventional" };
  if (category.includes("public")) return { primary: "Social", secondary: "Conventional" };
  return { primary: "Conventional", secondary: "Social" };
}

function buildRiasecScores(pair: RiasecPair): OnetRiasecScores {
  const base: OnetRiasecScores = {
    Realistic: 42,
    Investigative: 42,
    Artistic: 42,
    Social: 42,
    Enterprising: 42,
    Conventional: 42,
  };

  base[pair.primary] = 85;
  base[pair.secondary] = 70;
  return base;
}

function deriveFactors(answers: LegacyAnswers): OnetOccupationFactors {
  const repetitive = getLegacy(answers, "repetitive-tasks");
  const human = getLegacy(answers, "human-interaction");
  const creativity = getLegacy(answers, "creativity");
  const strategic = getLegacy(answers, "strategic-decision");
  const expertise = getLegacy(answers, "specialized-expertise");
  const aiCapable = getLegacy(answers, "ai-capable-today");
  const trust = getLegacy(answers, "trust-relationships");
  const change = getLegacy(answers, "industry-change");
  const adaptability = getLegacy(answers, "adaptability");
  const judgment = getLegacy(answers, "personal-judgment");

  return {
    routineRepetitive: repetitive,
    informationProcessing: clamp((expertise + strategic + (100 - repetitive)) / 3),
    dataAnalysis: clamp((expertise + judgment + strategic) / 3),
    administrativeStructure: clamp((repetitive + (100 - creativity) + aiCapable) / 3),
    humanInteraction: clamp((human + trust) / 2),
    creativityInnovation: creativity,
    decisionJudgment: clamp((judgment + strategic) / 2),
    consequenceResponsibility: clamp((judgment + trust + strategic) / 3),
    physicalPracticality: clamp((100 - getLegacy(answers, "human-interaction") + expertise) / 2),
    adaptabilityLearning: clamp((adaptability + (100 - repetitive) + change) / 3),
  };
}

function deriveBaselines(factors: OnetOccupationFactors) {
  const baselineAiExposure = clamp(
    factors.routineRepetitive * 0.25 +
      factors.administrativeStructure * 0.15 +
      (100 - factors.humanInteraction) * 0.2 +
      (100 - factors.creativityInnovation) * 0.15 +
      (100 - factors.decisionJudgment) * 0.15 +
      (100 - factors.physicalPracticality) * 0.1
  );

  const baselineCareerResilience = clamp(
    factors.humanInteraction * 0.18 +
      factors.creativityInnovation * 0.14 +
      factors.decisionJudgment * 0.2 +
      factors.adaptabilityLearning * 0.2 +
      factors.physicalPracticality * 0.1 +
      factors.dataAnalysis * 0.1 +
      (100 - factors.routineRepetitive) * 0.08
  );

  const baselineRiskIndex = clamp(
    baselineAiExposure * 0.45 + (100 - baselineCareerResilience) * 0.35 + factors.routineRepetitive * 0.2
  );

  return { baselineAiExposure, baselineCareerResilience, baselineRiskIndex };
}

function deriveDescriptors(category: string): {
  workActivities: string[];
  workStyles: string[];
  skills: string[];
  abilities: string[];
  workContext: string[];
} {
  const shared = {
    workActivities: ["Information processing", "Decision support", "Task execution"],
    workStyles: ["Dependability", "Adaptability", "Attention to detail"],
    skills: ["Critical thinking", "Communication", "Digital tool usage"],
    abilities: ["Oral comprehension", "Deductive reasoning", "Problem sensitivity"],
    workContext: ["Pace of industry change", "Collaboration intensity", "Structured workflows"],
  };

  if (category.includes("healthcare") || category.includes("public")) {
    return {
      ...shared,
      workStyles: [...shared.workStyles, "Stress tolerance", "Concern for others"],
      workContext: [...shared.workContext, "Consequence of decisions"],
    };
  }

  if (category.includes("software") || category.includes("ai/data")) {
    return {
      ...shared,
      skills: [...shared.skills, "Systems analysis", "Programming logic"],
      workActivities: [...shared.workActivities, "Model/tool evaluation"],
    };
  }

  if (category.includes("marketing") || category.includes("creative")) {
    return {
      ...shared,
      workStyles: [...shared.workStyles, "Innovation"],
      skills: [...shared.skills, "Content development"],
    };
  }

  return shared;
}

function normalizeTitle(title: string): string[] {
  const map: Record<string, string[]> = {
    "Software Engineer": ["Developer", "Programmer"],
    "Product Manager": ["PM", "Product Lead"],
    "Data Scientist": ["ML Scientist", "Analytics Scientist"],
    "Registered Nurse": ["RN", "Nurse"],
    "Account Executive": ["AE", "Sales Executive"],
    "Human Resources": ["HR"],
  };

  for (const key of Object.keys(map)) {
    if (title.includes(key)) return map[key];
  }

  return [];
}

function buildOnetOccupation(code: string, profile: (typeof JOB_PROFILES)[number]): OnetOccupation {
  const pair = mapCategoryToRiasec(profile.category);
  const factors = deriveFactors(profile.answers as LegacyAnswers);
  const baseline = deriveBaselines(factors);
  const descriptors = deriveDescriptors(profile.category);

  return {
    code,
    title: profile.title,
    alternateTitles: normalizeTitle(profile.title),
    description: profile.rationale,
    riasecScores: buildRiasecScores(pair),
    primaryRiasecType: pair.primary,
    secondaryRiasecType: pair.secondary,
    workActivities: descriptors.workActivities,
    workStyles: descriptors.workStyles,
    skills: descriptors.skills,
    abilities: descriptors.abilities,
    workContext: descriptors.workContext,
    factors,
    baseline,
  };
}

async function main() {
  const outputDir = resolve(process.cwd(), "src/data");
  const outputPath = resolve(outputDir, "onetOccupations.json");

  const occupations = JOB_PROFILES.map((profile, index) => {
    const code = `ONET-${String(index + 1).padStart(5, "0")}`;
    return buildOnetOccupation(code, profile);
  });

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, JSON.stringify(occupations, null, 2), "utf8");

  // eslint-disable-next-line no-console
  console.log(`Generated ${outputPath}`);
  // eslint-disable-next-line no-console
  console.log(`Total occupations: ${occupations.length}`);
}

main().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exitCode = 1;
});
