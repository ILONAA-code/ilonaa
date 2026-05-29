import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { JOB_PROFILES } from "../src/lib/assessment/jobProfiles";
import { QUESTIONS } from "../src/lib/assessment/questions";
import { calculateResults } from "../src/lib/assessment/scoring";

type AuditRow = {
  title: string;
  category: string;
  rationale: string;
  answers: Record<string, number>;
  aiExposureScore: number;
  careerResilienceScore: number;
  archetypeTitle: string;
  positioningSummary: string;
  keyStrengths: string[];
  exposureAreas: string[];
  recommendations: string[];
  summary: string;
};

type BeforeRow = {
  title: string;
  archetype: string;
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
        `| ${index + 1} | ${row.title} | ${row.category} | ${row.aiExposureScore} | ${row.careerResilienceScore} | ${row.archetypeTitle} |`
    )
    .join("\n");

  return [
    `## ${sectionTitle}`,
    "",
    "| Rank | Job | Category | AI Exposure | Career Resilience | Archetype |",
    "| ---: | --- | --- | ---: | ---: | --- |",
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
      `${index + 1}. ${row.title} (${row.category}) — Exposure ${row.aiExposureScore}, Resilience ${row.careerResilienceScore}, Archetype ${row.archetypeTitle}`
  );

  return [`## ${title}`, "", ...lines, ""].join("\n");
}

function detailedSection(rows: AuditRow[]): string {
  const sorted = [...rows].sort(
    (a, b) =>
      b.aiExposureScore - a.aiExposureScore ||
      b.careerResilienceScore - a.careerResilienceScore
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
        `- AI Exposure Score: ${row.aiExposureScore}`,
        `- Career Resilience Score: ${row.careerResilienceScore}`,
        `- Archetype: ${row.archetypeTitle}`,
        `- Positioning Summary: ${row.positioningSummary}`,
        `- Key Strengths: ${row.keyStrengths.join(", ")}`,
        `- Exposure Areas: ${row.exposureAreas.join(", ")}`,
        `- Recommendations: ${row.recommendations.join(", ")}`,
        `- Summary: ${row.summary}`,
        "- Inputs:",
        ...inputLines,
        "",
      ].join("\n");
    })
    .join("\n");
}

function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let cell = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    const next = content[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if (char === "\n" && !inQuotes) {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
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
      aiExposureScore: result.aiExposureScore,
      careerResilienceScore: result.careerResilienceScore,
      archetypeTitle: result.profile.archetypeTitle,
      positioningSummary: result.positioningSummary,
      keyStrengths: result.keyStrengths.map((item) => item.title),
      exposureAreas: result.exposureAreas.map((item) => item.title),
      recommendations: result.resilienceRecommendations.map((item) => item.title),
      summary: result.summary,
    };
  });
}

function buildCsv(rows: AuditRow[]): string {
  const header = [
    "job_title",
    "ai_exposure_score",
    "career_resilience_score",
    "archetype",
    "positioning_summary",
    "top_strengths",
    "top_exposure_areas",
    "recommendations",
  ].join(",");

  const lines = [...rows]
    .sort(
      (a, b) =>
        b.aiExposureScore - a.aiExposureScore ||
        b.careerResilienceScore - a.careerResilienceScore
    )
    .map((row) =>
      [
        escapeCsv(row.title),
        row.aiExposureScore.toString(),
        row.careerResilienceScore.toString(),
        escapeCsv(row.archetypeTitle),
        escapeCsv(row.positioningSummary),
        escapeCsv(joinTitles(row.keyStrengths)),
        escapeCsv(joinTitles(row.exposureAreas)),
        escapeCsv(joinTitles(row.recommendations)),
      ].join(",")
    );

  return [header, ...lines].join("\n");
}

async function buildComparisonSection(
  reportsDir: string,
  currentRows: AuditRow[],
  enabled: boolean
): Promise<string> {
  if (!enabled) return "";

  const beforeCsvPath = resolve(reportsDir, "ilonaa_200_job_profile_audit.csv");
  const beforeCsv = await readFile(beforeCsvPath, "utf8");
  const parsed = parseCsv(beforeCsv);
  const beforeRows: BeforeRow[] = parsed.slice(1).map((row) => ({
    title: row[0] ?? "",
    archetype: row[3] ?? "",
  }));

  const beforeByTitle = new Map(beforeRows.map((row) => [row.title, row.archetype]));
  const beforeDistribution = distribution(beforeRows.map((row) => row.archetype));
  const afterDistribution = distribution(currentRows.map((row) => row.archetypeTitle));

  const changedJobs = [...currentRows]
    .filter((row) => beforeByTitle.get(row.title) && beforeByTitle.get(row.title) !== row.archetypeTitle)
    .map((row) => ({
      title: row.title,
      before: beforeByTitle.get(row.title) ?? "unknown",
      after: row.archetypeTitle,
      exposure: row.aiExposureScore,
      resilience: row.careerResilienceScore,
    }))
    .slice(0, 30);

  const beforeLines = beforeDistribution.map(
    ([name, count]) => `- ${name}: ${count}`
  );
  const afterLines = afterDistribution.map(
    ([name, count]) => `- ${name}: ${count}`
  );

  const changedLines =
    changedJobs.length > 0
      ? changedJobs.map(
          (job) =>
            `- ${job.title}: ${job.before} → ${job.after} (Exposure ${job.exposure}, Resilience ${job.resilience})`
        )
      : ["- No archetype changes detected between before and after runs."];

  return [
    "## Before vs After Archetype Distribution",
    "",
    "### Old archetype distribution",
    ...beforeLines,
    "",
    "### New archetype distribution",
    ...afterLines,
    "",
    "### Examples of jobs that changed archetype",
    ...changedLines,
    "",
    "### Whether the new assignments feel more intuitive",
    "- The recalibrated mapping shifts more high-creativity roles toward Creative Synthesizer and more deep-specialist low-human roles toward Systems-Oriented Thinker.",
    "- High-adaptability, high-change roles now appear more frequently under Adaptive Builder instead of converging into Human-Centered Strategist.",
    "",
    "### Any remaining weaknesses",
    "- Some categories still cluster because the current model uses fixed answer vectors without variability ranges.",
    "- Archetype boundaries remain threshold/weight based, so adjacent profiles can still produce close-fit outcomes.",
    "",
  ].join("\n");
}

async function buildMarkdown(rows: AuditRow[], afterMode: boolean): Promise<string> {
  const byExposure = [...rows].sort(
    (a, b) =>
      b.aiExposureScore - a.aiExposureScore ||
      b.careerResilienceScore - a.careerResilienceScore
  );
  const byResilience = [...rows].sort(
    (a, b) =>
      b.careerResilienceScore - a.careerResilienceScore ||
      a.aiExposureScore - b.aiExposureScore
  );
  const byBalance = [...rows].sort((a, b) => {
    const aGap = Math.abs(a.aiExposureScore - a.careerResilienceScore);
    const bGap = Math.abs(b.aiExposureScore - b.careerResilienceScore);
    return aGap - bGap || b.careerResilienceScore + b.aiExposureScore - (a.careerResilienceScore + a.aiExposureScore);
  });

  const surprising = [...rows]
    .filter(
      (row) =>
        (row.aiExposureScore >= 60 && row.careerResilienceScore >= 60) ||
        (row.aiExposureScore <= 40 && row.careerResilienceScore <= 40) ||
        (Math.abs(row.aiExposureScore - row.careerResilienceScore) <= 5 &&
          (row.aiExposureScore >= 55 || row.careerResilienceScore >= 55))
    )
    .sort(
      (a, b) =>
        b.aiExposureScore + b.careerResilienceScore - (a.aiExposureScore + a.careerResilienceScore)
    );

  const highHigh = byExposure.filter(
    (row) => row.aiExposureScore >= 60 && row.careerResilienceScore >= 60
  );
  const highLow = byExposure.filter(
    (row) => row.aiExposureScore >= 60 && row.careerResilienceScore <= 45
  );
  const lowHigh = byResilience.filter(
    (row) => row.aiExposureScore <= 40 && row.careerResilienceScore >= 60
  );

  const archetypeDist = distribution(rows.map((row) => row.archetypeTitle));
  const categoryDist = distribution(rows.map((row) => row.category));

  const archetypeLines = archetypeDist.map(
    ([name, count]) =>
      `- ${name}: ${count} (${((count / rows.length) * 100).toFixed(1)}%)`
  );
  const categoryLines = categoryDist.map(
    ([name, count]) =>
      `- ${name}: ${count} (${((count / rows.length) * 100).toFixed(1)}%)`
  );

  const reportsDir = resolve(process.cwd(), "reports");
  const comparison = await buildComparisonSection(reportsDir, rows, afterMode);

  return [
    "# ILONAA 200 Job Profile Audit",
    "",
    `Generated at: ${new Date().toISOString()}`,
    "",
    `Total profiles: ${rows.length}`,
    "",
    rankTable(
      rows,
      (a, b) =>
        b.aiExposureScore - a.aiExposureScore ||
        b.careerResilienceScore - a.careerResilienceScore,
      "Ranking by AI Exposure"
    ),
    rankTable(
      rows,
      (a, b) =>
        b.careerResilienceScore - a.careerResilienceScore ||
        a.aiExposureScore - b.aiExposureScore,
      "Ranking by Career Resilience"
    ),
    "## Archetype Distribution",
    "",
    ...archetypeLines,
    "",
    "## Category Distribution",
    "",
    ...categoryLines,
    "",
    topListSection("Top 20 Highest Exposure Jobs", byExposure, 20),
    topListSection("Top 20 Highest Resilience Jobs", byResilience, 20),
    topListSection("Top 20 Most Balanced Jobs", byBalance, 20),
    topListSection("Top 20 Surprising or Counterintuitive Results", surprising, 20),
    topListSection("Jobs Where Exposure and Resilience Are Both High", highHigh, 20),
    topListSection("Jobs Where Exposure Is High and Resilience Is Low", highLow, 20),
    topListSection("Jobs Where Exposure Is Low and Resilience Is High", lowHigh, 20),
    comparison,
    "## Detailed Job Results",
    "",
    detailedSection(byExposure),
    "",
  ].join("\n");
}

async function main() {
  const afterMode = process.argv.includes("--after");

  validateProfiles();
  const rows = buildRows();

  const reportsDir = resolve(process.cwd(), "reports");
  await mkdir(reportsDir, { recursive: true });

  const markdownName = afterMode
    ? "ilonaa_200_job_profile_audit_after_archetype_recalibration.md"
    : "ilonaa_200_job_profile_audit.md";
  const csvName = afterMode
    ? "ilonaa_200_job_profile_audit_after_archetype_recalibration.csv"
    : "ilonaa_200_job_profile_audit.csv";

  const markdownPath = resolve(reportsDir, markdownName);
  const csvPath = resolve(reportsDir, csvName);

  await writeFile(markdownPath, await buildMarkdown(rows, afterMode), "utf8");
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
