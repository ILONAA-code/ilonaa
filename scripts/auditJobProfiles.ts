import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { JOB_PROFILES } from "../src/lib/assessment/jobProfiles";
import { QUESTIONS } from "../src/lib/assessment/questions";
import { calculateResults } from "../src/lib/assessment/scoring";

type AuditRow = {
  title: string;
  category: string;
  rationale: string;
  answers: Record<string, number>;
  primaryRiasecType: string;
  secondaryRiasecType: string;
  ilonaaAiRiskIndex: number;
  aiExposureScore: number;
  careerResilienceScore: number;
  keyRiskDrivers: string[];
  humanAdvantageFactors: string[];
  recommendedNextMoves: string[];
  summary: string;
};

const EXPECTED_PROFILE_COUNT = 200;
const REQUIRED_QUESTION_IDS = QUESTIONS.map((question) => question.id);
const SLIDER_QUESTION_IDS = new Set(
  QUESTIONS.filter((question) => question.type === "slider").map(
    (question) => question.id
  )
);

const OPTION_VALUE_LOOKUP = new Map(
  QUESTIONS.filter((question) => question.type !== "slider").map((question) => [
    question.id,
    new Set((question.options ?? []).map((option) => option.value)),
  ])
);

function escapeCsv(value: string): string {
  return `"${value.replace(/"/g, "\"\"")}"`;
}

function joinTitles(values: string[]): string {
  return values.join("; ");
}

function distribution<T extends string>(values: T[]): [T, number][] {
  const counts = values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => [key as T, count]);
}

function rankTable(
  rows: AuditRow[],
  sortFn: (a: AuditRow, b: AuditRow) => number,
  sectionTitle: string
): string {
  const ranked = [...rows].sort(sortFn);
  const tableRows = ranked
    .map(
      (row, index) =>
        `| ${index + 1} | ${row.title} | ${row.category} | ${row.ilonaaAiRiskIndex} | ${row.aiExposureScore} | ${row.careerResilienceScore} | ${row.primaryRiasecType} | ${row.secondaryRiasecType} |`
    )
    .join("\n");

  return [
    `## ${sectionTitle}`,
    "",
    "| Rank | Job | Category | ILONAA AI Risk Index | AI Exposure | Career Resilience | Primary RIASEC | Secondary RIASEC |",
    "| ---: | --- | --- | ---: | ---: | ---: | --- | --- |",
    tableRows,
    "",
  ].join("\n");
}

function topListSection(
  title: string,
  rows: AuditRow[],
  limit = 20
): string {
  const lines = rows.slice(0, limit).map(
    (row, index) =>
      `${index + 1}. ${row.title} (${row.category}) — ILONAA AI Risk Index ${row.ilonaaAiRiskIndex}, Exposure ${row.aiExposureScore}, Resilience ${row.careerResilienceScore}, Primary ${row.primaryRiasecType}, Secondary ${row.secondaryRiasecType}`
  );

  return [`## ${title}`, "", ...lines, ""].join("\n");
}

function detailedSection(rows: AuditRow[]): string {
  const sorted = [...rows].sort(
    (a, b) =>
      b.ilonaaAiRiskIndex - a.ilonaaAiRiskIndex ||
      b.aiExposureScore - a.aiExposureScore
  );

  return sorted
    .map((row, index) => {
      const inputLines = REQUIRED_QUESTION_IDS.map(
        (id) => `  - ${id}: ${row.answers[id]}`
      );

      return [
        `### ${index + 1}. ${row.title}`,
        `- Category: ${row.category}`,
        `- Rationale: ${row.rationale}`,
        `- Primary RIASEC Type: ${row.primaryRiasecType}`,
        `- Secondary RIASEC Type: ${row.secondaryRiasecType}`,
        `- ILONAA AI Risk Index: ${row.ilonaaAiRiskIndex}`,
        `- AI Exposure Score: ${row.aiExposureScore}`,
        `- Career Resilience Score: ${row.careerResilienceScore}`,
        `- Key Risk Drivers: ${row.keyRiskDrivers.join(", ")}`,
        `- Human Advantage Factors: ${row.humanAdvantageFactors.join(", ")}`,
        `- Recommended Next Moves: ${row.recommendedNextMoves.join(", ")}`,
        `- Summary: ${row.summary}`,
        "- Inputs:",
        ...inputLines,
        "",
      ].join("\n");
    })
    .join("\n");
}

function validateProfiles() {
  if (JOB_PROFILES.length !== EXPECTED_PROFILE_COUNT) {
    throw new Error(
      `Expected ${EXPECTED_PROFILE_COUNT} job profiles, found ${JOB_PROFILES.length}.`
    );
  }

  for (const profile of JOB_PROFILES) {
    for (const questionId of REQUIRED_QUESTION_IDS) {
      if (!(questionId in profile.answers)) {
        throw new Error(
          `Profile "${profile.title}" is missing answer for "${questionId}".`
        );
      }

      const value = profile.answers[questionId];
      if (value < 0 || value > 100) {
        throw new Error(
          `Profile "${profile.title}" has out-of-range value ${value} for "${questionId}".`
        );
      }

      if (SLIDER_QUESTION_IDS.has(questionId) && value % 10 !== 0) {
        throw new Error(
          `Profile "${profile.title}" has non-10-step slider value ${value} for "${questionId}".`
        );
      }

      if (!SLIDER_QUESTION_IDS.has(questionId)) {
        const validOptions = OPTION_VALUE_LOOKUP.get(questionId);
        if (validOptions && !validOptions.has(value)) {
          throw new Error(
            `Profile "${profile.title}" has invalid option value ${value} for "${questionId}".`
          );
        }
      }
    }
  }
}

function buildRows(): AuditRow[] {
  return JOB_PROFILES.map((profile) => {
    const result = calculateResults(profile.answers);

    return {
      title: profile.title,
      category: profile.category,
      rationale: profile.rationale,
      answers: profile.answers,
      primaryRiasecType: result.riasecProfile.primaryType,
      secondaryRiasecType: result.riasecProfile.secondaryType,
      ilonaaAiRiskIndex: result.ilonaaRiskIndex.score,
      aiExposureScore: result.aiExposureScore,
      careerResilienceScore: result.careerResilienceScore,
      keyRiskDrivers: result.keyRiskDrivers.map((item) => item.title),
      humanAdvantageFactors: result.humanAdvantageFactors.map((item) => item.title),
      recommendedNextMoves: result.recommendedNextMoves.map(
        (item) => item.title
      ),
      summary: result.summary,
    };
  });
}

function buildCsv(rows: AuditRow[]): string {
  const header = [
    "job_title",
    "category",
    "primary_riasec_type",
    "secondary_riasec_type",
    "ilonaa_ai_risk_index",
    "ai_exposure_score",
    "career_resilience_score",
    "key_risk_drivers",
    "human_advantage_factors",
    "recommended_next_moves",
  ].join(",");

  const lines = [...rows]
    .sort(
      (a, b) =>
        b.ilonaaAiRiskIndex - a.ilonaaAiRiskIndex ||
        b.aiExposureScore - a.aiExposureScore
    )
    .map((row) =>
      [
        escapeCsv(row.title),
        escapeCsv(row.category),
        escapeCsv(row.primaryRiasecType),
        escapeCsv(row.secondaryRiasecType),
        row.ilonaaAiRiskIndex.toString(),
        row.aiExposureScore.toString(),
        row.careerResilienceScore.toString(),
        escapeCsv(joinTitles(row.keyRiskDrivers)),
        escapeCsv(joinTitles(row.humanAdvantageFactors)),
        escapeCsv(joinTitles(row.recommendedNextMoves)),
      ].join(",")
    );

  return [header, ...lines].join("\n");
}

function buildMarkdown(rows: AuditRow[]): string {
  const byIndex = [...rows].sort(
    (a, b) =>
      b.ilonaaAiRiskIndex - a.ilonaaAiRiskIndex ||
      b.aiExposureScore - a.aiExposureScore
  );
  const byResilience = [...rows].sort(
    (a, b) =>
      b.careerResilienceScore - a.careerResilienceScore ||
      a.aiExposureScore - b.aiExposureScore
  );
  const byLowestIndex = [...rows].sort(
    (a, b) =>
      a.ilonaaAiRiskIndex - b.ilonaaAiRiskIndex ||
      b.careerResilienceScore - a.careerResilienceScore
  );
  const divergence = [...rows].filter(
    (row) =>
      (row.primaryRiasecType === "Conventional" && row.ilonaaAiRiskIndex >= 60) ||
      (row.primaryRiasecType === "Investigative" &&
        row.ilonaaAiRiskIndex >= 40 &&
        row.ilonaaAiRiskIndex <= 60) ||
      (row.primaryRiasecType === "Social" && row.ilonaaAiRiskIndex <= 45) ||
      (row.primaryRiasecType === "Enterprising" &&
        row.ilonaaAiRiskIndex >= 45 &&
        row.ilonaaAiRiskIndex <= 65)
  );

  const primaryDist = distribution(rows.map((row) => row.primaryRiasecType));
  const secondaryDist = distribution(rows.map((row) => row.secondaryRiasecType));
  const categoryDist = distribution(rows.map((row) => row.category));

  const primaryLines = primaryDist.map(
    ([name, count]) =>
      `- ${name}: ${count} (${((count / rows.length) * 100).toFixed(1)}%)`
  );
  const secondaryLines = secondaryDist.map(
    ([name, count]) =>
      `- ${name}: ${count} (${((count / rows.length) * 100).toFixed(1)}%)`
  );
  const categoryLines = categoryDist.map(
    ([name, count]) =>
      `- ${name}: ${count} (${((count / rows.length) * 100).toFixed(1)}%)`
  );

  return [
    "# ILONAA 200 Job Profile Audit (RIASEC)",
    "",
    `Generated at: ${new Date().toISOString()}`,
    "",
    `Total profiles: ${rows.length}`,
    "",
    rankTable(
      rows,
      (a, b) =>
        b.ilonaaAiRiskIndex - a.ilonaaAiRiskIndex ||
        b.aiExposureScore - a.aiExposureScore,
      "Ranking by ILONAA AI Risk Index"
    ),
    rankTable(
      rows,
      (a, b) =>
        b.careerResilienceScore - a.careerResilienceScore ||
        a.aiExposureScore - b.aiExposureScore,
      "Ranking by Career Resilience"
    ),
    "## Distribution by Primary RIASEC Type",
    "",
    ...primaryLines,
    "",
    "## Distribution by Secondary RIASEC Type",
    "",
    ...secondaryLines,
    "",
    "## Category Distribution",
    "",
    ...categoryLines,
    "",
    topListSection("Top 20 Highest ILONAA AI Risk Index Jobs", byIndex, 20),
    topListSection("Top 20 Lowest ILONAA AI Risk Index Jobs", byLowestIndex, 20),
    topListSection("Top 20 Highest AI Exposure Jobs", [...rows].sort((a, b) => b.aiExposureScore - a.aiExposureScore), 20),
    topListSection("Top 20 Highest Resilience Jobs", byResilience, 20),
    topListSection("Examples Where RIASEC Type and AI Risk Diverge", divergence, 20),
    "## Detailed Job Results",
    "",
    detailedSection(byIndex),
    "",
  ].join("\n");
}

async function main() {
  validateProfiles();
  const rows = buildRows();

  const reportsDir = resolve(process.cwd(), "reports");
  await mkdir(reportsDir, { recursive: true });

  const markdownName = "ilonaa_200_job_profile_audit_riasec.md";
  const csvName = "ilonaa_200_job_profile_audit_riasec.csv";

  const markdownPath = resolve(reportsDir, markdownName);
  const csvPath = resolve(reportsDir, csvName);

  await writeFile(markdownPath, buildMarkdown(rows), "utf8");
  await writeFile(csvPath, buildCsv(rows), "utf8");

  // eslint-disable-next-line no-console
  console.log(`Generated ${markdownPath}`);
  // eslint-disable-next-line no-console
  console.log(`Generated ${csvPath}`);
}

main().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exitCode = 1;
});
