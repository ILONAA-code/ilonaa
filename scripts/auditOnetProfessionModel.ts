import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getAllOccupations, toProfessionSelection } from "../src/lib/assessment/occupations";
import { calculateResults } from "../src/lib/assessment/scoring";
import type { Answers } from "../src/lib/assessment/types";
import type { OnetOccupation } from "../src/lib/assessment/onetTypes";

type AuditRow = {
  code: string;
  title: string;
  primaryRiasec: string;
  secondaryRiasec: string;
  ilonaaAiRiskIndex: number;
  aiExposure: number;
  resilience: number;
  baselineRisk: number;
  baselineExposure: number;
  baselineResilience: number;
  routine: number;
  consequence: number;
};

const DEFAULT_ANSWERS: Answers = {
  "ai-tools-usage": 50,
  "tool-learning-speed": 60,
  "human-uniqueness": 60,
  "decision-consequence": 60,
};

const HIGH_CONSEQUENCE_ANSWERS: Answers = {
  ...DEFAULT_ANSWERS,
  "decision-consequence": 100,
};

function distribution(values: string[]): [string, number][] {
  const counts = values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

function escapeCsv(value: string): string {
  return `"${value.replace(/"/g, "\"\"")}"`;
}

function topSection(title: string, rows: AuditRow[], limit = 30): string {
  const lines = rows.slice(0, limit).map(
    (row, index) =>
      `${index + 1}. ${row.title} (${row.code}) — ILONAA AI Risk Index ${row.ilonaaAiRiskIndex}, AI Exposure ${row.aiExposure}, Career Resilience ${row.resilience}, RIASEC ${row.primaryRiasec}/${row.secondaryRiasec}`
  );

  return [`## ${title}`, "", ...lines, ""].join("\n");
}

function buildRows(occupations: OnetOccupation[]): AuditRow[] {
  return occupations.map((occupation) => {
    const result = calculateResults(
      toProfessionSelection(occupation),
      DEFAULT_ANSWERS
    );

    return {
      code: occupation.code,
      title: occupation.title,
      primaryRiasec: result.riasecProfile.primaryType,
      secondaryRiasec: result.riasecProfile.secondaryType,
      ilonaaAiRiskIndex: result.ilonaaRiskIndex.score,
      aiExposure: result.aiExposureScore,
      resilience: result.careerResilienceScore,
      baselineRisk: occupation.baseline.baselineRiskIndex,
      baselineExposure: occupation.baseline.baselineAiExposure,
      baselineResilience: occupation.baseline.baselineCareerResilience,
      routine: occupation.factors.routineRepetitive,
      consequence: occupation.factors.consequenceResponsibility,
    };
  });
}

function buildCsv(rows: AuditRow[]): string {
  const header = [
    "occupation_code",
    "occupation_title",
    "primary_riasec_type",
    "secondary_riasec_type",
    "ilonaa_ai_risk_index",
    "ai_exposure_score",
    "career_resilience_score",
    "baseline_risk_index",
    "baseline_ai_exposure",
    "baseline_career_resilience",
  ].join(",");

  const body = [...rows]
    .sort((a, b) => b.ilonaaAiRiskIndex - a.ilonaaAiRiskIndex)
    .map((row) =>
      [
        escapeCsv(row.code),
        escapeCsv(row.title),
        escapeCsv(row.primaryRiasec),
        escapeCsv(row.secondaryRiasec),
        row.ilonaaAiRiskIndex.toString(),
        row.aiExposure.toString(),
        row.resilience.toString(),
        row.baselineRisk.toString(),
        row.baselineExposure.toString(),
        row.baselineResilience.toString(),
      ].join(",")
    );

  return [header, ...body].join("\n");
}

function buildMarkdown(occupations: OnetOccupation[], rows: AuditRow[]): string {
  const byRisk = [...rows].sort((a, b) => b.ilonaaAiRiskIndex - a.ilonaaAiRiskIndex);
  const byLowRisk = [...rows].sort((a, b) => a.ilonaaAiRiskIndex - b.ilonaaAiRiskIndex);
  const byExposure = [...rows].sort((a, b) => b.aiExposure - a.aiExposure);
  const byResilience = [...rows].sort((a, b) => b.resilience - a.resilience);

  const primaryDist = distribution(rows.map((row) => row.primaryRiasec));
  const secondaryDist = distribution(rows.map((row) => row.secondaryRiasec));

  const consequenceOffsets = occupations
    .map((occupation) => {
      const base = calculateResults(toProfessionSelection(occupation), DEFAULT_ANSWERS);
      const highConsequence = calculateResults(
        toProfessionSelection(occupation),
        HIGH_CONSEQUENCE_ANSWERS
      );
      return {
        title: occupation.title,
        baseRisk: base.ilonaaRiskIndex.score,
        highConsequenceRisk: highConsequence.ilonaaRiskIndex.score,
        exposure: base.aiExposureScore,
      };
    })
    .filter(
      (row) =>
        row.exposure >= 60 && row.baseRisk - row.highConsequenceRisk >= 6
    )
    .sort((a, b) => b.baseRisk - b.highConsequenceRisk - (a.baseRisk - a.highConsequenceRisk))
    .slice(0, 20)
    .map(
      (row) =>
        `- ${row.title}: risk ${row.baseRisk} → ${row.highConsequenceRisk} when consequence moves to maximum while exposure remains high (${row.exposure}).`
    );

  const conventionalRoutineRisk = byRisk
    .filter((row) => row.primaryRiasec === "Conventional" && row.routine >= 70)
    .slice(0, 20)
    .map(
      (row) =>
        `- ${row.title}: Conventional profile with routine signal ${row.routine} and ILONAA AI Risk Index ${row.ilonaaAiRiskIndex}.`
    );

  const weakInputs = occupations
    .filter(
      (occupation) =>
        occupation.skills.length === 0 ||
        occupation.workActivities.length === 0 ||
        occupation.workStyles.length === 0 ||
        occupation.abilities.length === 0
    )
    .map((occupation) => `- ${occupation.title} (${occupation.code})`);

  return [
    "# ILONAA O*NET Profession Model Audit",
    "",
    `Generated at: ${new Date().toISOString()}`,
    "",
    `Total imported occupations: ${occupations.length}`,
    "",
    "## Distribution by Primary RIASEC Type",
    "",
    ...primaryDist.map(([name, count]) => `- ${name}: ${count}`),
    "",
    "## Distribution by Secondary RIASEC Type",
    "",
    ...secondaryDist.map(([name, count]) => `- ${name}: ${count}`),
    "",
    topSection("Top 30 Highest ILONAA AI Risk Index Occupations", byRisk, 30),
    topSection("Top 30 Lowest ILONAA AI Risk Index Occupations", byLowRisk, 30),
    topSection("Top 30 Highest AI Exposure Occupations", byExposure, 30),
    topSection("Top 30 Highest Career Resilience Occupations", byResilience, 30),
    "## Examples Where High AI Exposure Is Offset by High Decision Consequence",
    "",
    ...(consequenceOffsets.length > 0
      ? consequenceOffsets
      : ["- No occupations met the current offset threshold in this run."]),
    "",
    "## Examples Where Routine Conventional Work Creates Higher Replacement Risk",
    "",
    ...(conventionalRoutineRisk.length > 0
      ? conventionalRoutineRisk
      : ["- No occupations met the current routine-conventional threshold in this run."]),
    "",
    "## Occupations With Missing or Weak O*NET Inputs",
    "",
    ...(weakInputs.length > 0 ? weakInputs : ["- None detected in the compact dataset."]),
    "",
    "## Model Warnings and Limitations",
    "",
    "- This audit uses a compact O*NET-inspired local dataset, not full raw O*NET tables.",
    "- Profession-level baselines are approximations and should be interpreted as structured orientation, not deterministic truth.",
    "- User-specific adjustments are based on four self-reported answers and may vary with interpretation.",
    "- ILONAA outputs are decision-support signals and do not guarantee employment outcomes.",
    "",
  ].join("\n");
}

async function main() {
  const occupations = getAllOccupations();
  const rows = buildRows(occupations);
  const reportsDir = resolve(process.cwd(), "reports");
  await mkdir(reportsDir, { recursive: true });

  const mdPath = resolve(reportsDir, "ilonaa_onet_profession_model_audit.md");
  const csvPath = resolve(reportsDir, "ilonaa_onet_profession_model_audit.csv");

  await writeFile(mdPath, buildMarkdown(occupations, rows), "utf8");
  await writeFile(csvPath, buildCsv(rows), "utf8");

  // eslint-disable-next-line no-console
  console.log(`Generated ${mdPath}`);
  // eslint-disable-next-line no-console
  console.log(`Generated ${csvPath}`);
}

main().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exitCode = 1;
});
