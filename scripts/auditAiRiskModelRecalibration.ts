import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getAllOccupations, toProfessionSelection } from "../src/lib/assessment/occupations";
import { calculateResults } from "../src/lib/assessment/scoring";
import { JOB_PROFILES } from "../src/lib/assessment/jobProfiles";
import type { Answers } from "../src/lib/assessment/types";
import type { OnetOccupation } from "../src/lib/assessment/onetTypes";

type RiskBand = "Very Low" | "Low" | "Medium" | "High" | "Very High";

type ValidationRow = {
  code: string;
  title: string;
  category: string;
  primaryRiasec: string;
  secondaryRiasec: string;
  factors: OnetOccupation["factors"];
  currentAiExposure: number;
  currentCareerResilience: number;
  currentIlonaaRisk: number;
  expectedAiRiskBand: RiskBand;
  expectedAiRiskScore: number;
  expectedRationale: string;
  mismatch: number;
  absMismatch: number;
  mismatchExplanation: string;
  likelyResponsibleFactor: string;
  proposedAiExposure: number;
  proposedAiReplacementRisk: number;
  proposedCareerResilience: number;
  proposedIlonaaRisk: number;
  absMismatchAfter: number;
  improvement: number;
};

const DEFAULT_ANSWERS: Answers = {
  "ai-tools-usage": 50,
  "tool-learning-speed": 60,
  "human-uniqueness": 60,
  "decision-consequence": 60,
};

const categoryByTitle = new Map(
  JOB_PROFILES.map((profile) => [profile.title, profile.category])
);

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function toBand(score: number): RiskBand {
  if (score < 20) return "Very Low";
  if (score < 40) return "Low";
  if (score < 60) return "Medium";
  if (score < 80) return "High";
  return "Very High";
}

function categoryAdjustment(category: string): number {
  if (category.includes("healthcare")) return -7;
  if (category.includes("public sector")) return -7;
  if (category.includes("skilled trades")) return -9;
  if (category.includes("engineering/manufacturing")) return -3;
  if (category.includes("legal/compliance")) return -4;
  if (category.includes("education")) return -4;
  if (category.includes("finance/accounting")) return 4;
  if (category.includes("operations/logistics")) return 5;
  if (category.includes("administration/support")) return 7;
  if (category.includes("software/technology")) return 2;
  if (category.includes("AI/data")) return 3;
  return 0;
}

function expectedBenchmark(occupation: OnetOccupation, category: string) {
  const f = occupation.factors;

  const riskPressure = clamp(
    f.routineRepetitive * 0.3 +
      f.administrativeStructure * 0.2 +
      f.informationProcessing * 0.2 +
      f.dataAnalysis * 0.15 +
      (100 - f.physicalPracticality) * 0.15
  );
  const protection = clamp(
    f.humanInteraction * 0.2 +
      f.creativityInnovation * 0.1 +
      f.decisionJudgment * 0.25 +
      f.consequenceResponsibility * 0.2 +
      f.physicalPracticality * 0.1 +
      f.adaptabilityLearning * 0.15
  );

  const score = clamp(35 + riskPressure * 0.6 - protection * 0.45 + categoryAdjustment(category));
  const band = toBand(score);

  const rationale = `Conservative prior: automability pressure from routine/process structure is balanced against judgment/accountability, human trust needs, and physical execution requirements.`;
  return { score, band, rationale };
}

function proposedScores(occupation: OnetOccupation) {
  const f = occupation.factors;

  const aiExposure = clamp(
    f.routineRepetitive * 0.2 +
      f.administrativeStructure * 0.18 +
      f.informationProcessing * 0.2 +
      f.dataAnalysis * 0.12 +
      (100 - f.physicalPracticality) * 0.12 +
      (100 - f.humanInteraction) * 0.1 +
      (100 - f.creativityInnovation) * 0.08
  );

  const aiReplacementRisk = clamp(
    aiExposure * 0.35 +
      f.routineRepetitive * 0.2 +
      f.administrativeStructure * 0.1 +
      (100 - f.decisionJudgment) * 0.12 +
      (100 - f.adaptabilityLearning) * 0.08 +
      (100 - f.consequenceResponsibility) * 0.05 +
      (100 - f.physicalPracticality) * 0.05 +
      (100 - f.humanInteraction) * 0.05 -
      f.consequenceResponsibility * 0.1 -
      f.physicalPracticality * 0.08 -
      f.humanInteraction * 0.05
  );

  const careerResilience = clamp(
    f.decisionJudgment * 0.24 +
      f.consequenceResponsibility * 0.22 +
      f.humanInteraction * 0.16 +
      f.adaptabilityLearning * 0.16 +
      f.creativityInnovation * 0.08 +
      f.dataAnalysis * 0.08 +
      f.physicalPracticality * 0.06
  );

  const ilonaaRisk = clamp(
    aiExposure * 0.25 + aiReplacementRisk * 0.5 + (100 - careerResilience) * 0.25
  );

  return { aiExposure, aiReplacementRisk, careerResilience, ilonaaRisk };
}

function likelyFactor(mismatch: number, f: OnetOccupation["factors"]): string {
  if (mismatch > 0) {
    if (f.consequenceResponsibility >= 70) return "decision consequence/accountability underweighted";
    if (f.physicalPracticality >= 70) return "physical presence/hands-on execution underweighted";
    if (f.humanInteraction >= 70) return "human trust/relationship depth underweighted";
    return "routine/process structure likely overweighted";
  }

  if (f.routineRepetitive >= 70) return "routine cognitive work likely underweighted";
  if (f.administrativeStructure >= 65) return "administrative structure pressure underweighted";
  return "AI disruption pressure likely underweighted";
}

function mismatchWhy(title: string, category: string, mismatch: number): string {
  if (mismatch > 0) {
    return `${title} (${category}) appears overestimated by ${mismatch} points versus human-prior benchmark.`;
  }
  return `${title} (${category}) appears underestimated by ${Math.abs(
    mismatch
  )} points versus human-prior benchmark.`;
}

function escapeCsv(value: string): string {
  return `"${value.replace(/"/g, "\"\"")}"`;
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function buildRows(): ValidationRow[] {
  return getAllOccupations().map((occupation) => {
    const category = categoryByTitle.get(occupation.title) ?? "unmapped";
    const current = calculateResults(toProfessionSelection(occupation), DEFAULT_ANSWERS);
    const expected = expectedBenchmark(occupation, category);
    const mismatch = current.ilonaaRiskIndex.score - expected.score;
    const proposed = proposedScores(occupation);
    const absMismatch = Math.abs(mismatch);
    const absMismatchAfter = Math.abs(proposed.ilonaaRisk - expected.score);

    return {
      code: occupation.code,
      title: occupation.title,
      category,
      primaryRiasec: occupation.primaryRiasecType,
      secondaryRiasec: occupation.secondaryRiasecType,
      factors: occupation.factors,
      currentAiExposure: current.aiExposureScore,
      currentCareerResilience: current.careerResilienceScore,
      currentIlonaaRisk: current.ilonaaRiskIndex.score,
      expectedAiRiskBand: expected.band,
      expectedAiRiskScore: expected.score,
      expectedRationale: expected.rationale,
      mismatch,
      absMismatch,
      mismatchExplanation: mismatchWhy(occupation.title, category, mismatch),
      likelyResponsibleFactor: likelyFactor(mismatch, occupation.factors),
      proposedAiExposure: proposed.aiExposure,
      proposedAiReplacementRisk: proposed.aiReplacementRisk,
      proposedCareerResilience: proposed.careerResilience,
      proposedIlonaaRisk: proposed.ilonaaRisk,
      absMismatchAfter,
      improvement: clamp(absMismatch - absMismatchAfter, -100, 100),
    };
  });
}

function topList(
  title: string,
  rows: ValidationRow[],
  line: (row: ValidationRow, i: number) => string,
  limit = 20
): string {
  return [`## ${title}`, "", ...rows.slice(0, limit).map(line), ""].join("\n");
}

function buildMismatchCsv(rows: ValidationRow[]): string {
  const header = [
    "occupation_code",
    "occupation_title",
    "category",
    "primary_riasec",
    "secondary_riasec",
    "current_ai_exposure",
    "current_career_resilience",
    "current_ilonaa_ai_risk_index",
    "expected_ai_risk_band",
    "expected_ai_risk_score",
    "expected_rationale",
    "mismatch_current_minus_expected",
    "absolute_mismatch",
    "likely_responsible_factor",
    "mismatch_explanation",
  ].join(",");

  const lines = [...rows]
    .sort((a, b) => b.absMismatch - a.absMismatch)
    .map((row) =>
      [
        escapeCsv(row.code),
        escapeCsv(row.title),
        escapeCsv(row.category),
        escapeCsv(row.primaryRiasec),
        escapeCsv(row.secondaryRiasec),
        row.currentAiExposure.toString(),
        row.currentCareerResilience.toString(),
        row.currentIlonaaRisk.toString(),
        escapeCsv(row.expectedAiRiskBand),
        row.expectedAiRiskScore.toString(),
        escapeCsv(row.expectedRationale),
        row.mismatch.toString(),
        row.absMismatch.toString(),
        escapeCsv(row.likelyResponsibleFactor),
        escapeCsv(row.mismatchExplanation),
      ].join(",")
    );

  return [header, ...lines].join("\n");
}

function buildMismatchMarkdown(rows: ValidationRow[]): string {
  const over = [...rows].sort((a, b) => b.mismatch - a.mismatch);
  const under = [...rows].sort((a, b) => a.mismatch - b.mismatch);
  const abs = [...rows].sort((a, b) => b.absMismatch - a.absMismatch);

  const validationSet = [
    "## 200-Job Validation Set",
    "",
    ...rows.map((row) => {
      const f = row.factors;
      return `- ${row.title} (${row.code}) | ${row.category} | RIASEC ${row.primaryRiasec}/${row.secondaryRiasec} | factors: routine ${f.routineRepetitive}, info ${f.informationProcessing}, data ${f.dataAnalysis}, admin ${f.administrativeStructure}, human ${f.humanInteraction}, creativity ${f.creativityInnovation}, judgment ${f.decisionJudgment}, consequence ${f.consequenceResponsibility}, physical ${f.physicalPracticality}, adaptability ${f.adaptabilityLearning} | current: exposure ${row.currentAiExposure}, resilience ${row.currentCareerResilience}, risk ${row.currentIlonaaRisk}.`;
    }),
    "",
  ].join("\n");

  return [
    "# ILONAA AI Risk Model Mismatch Audit",
    "",
    `Generated at: ${new Date().toISOString()}`,
    "",
    validationSet,
    topList(
      "Top 20 Overestimated Risks",
      over,
      (row, i) =>
        `${i + 1}. ${row.title} (${row.code}) — current ${row.currentIlonaaRisk}, expected ${row.expectedAiRiskScore}, mismatch +${row.mismatch}. Cause: ${row.likelyResponsibleFactor}.`,
      20
    ),
    topList(
      "Top 20 Underestimated Risks",
      under,
      (row, i) =>
        `${i + 1}. ${row.title} (${row.code}) — current ${row.currentIlonaaRisk}, expected ${row.expectedAiRiskScore}, mismatch ${row.mismatch}. Cause: ${row.likelyResponsibleFactor}.`,
      20
    ),
    topList(
      "Top 20 Largest Absolute Mismatches",
      abs,
      (row, i) =>
        `${i + 1}. ${row.title} (${row.code}) — current ${row.currentIlonaaRisk}, expected ${row.expectedAiRiskScore}, |mismatch| ${row.absMismatch}. ${row.mismatchExplanation} Responsible factor: ${row.likelyResponsibleFactor}.`,
      20
    ),
  ].join("\n");
}

function buildBeforeAfterCsv(rows: ValidationRow[]): string {
  const header = [
    "occupation_code",
    "occupation_title",
    "category",
    "before_score",
    "after_score",
    "expected_benchmark",
    "absolute_mismatch_before",
    "absolute_mismatch_after",
    "improvement",
    "proposed_ai_exposure",
    "proposed_ai_replacement_risk",
    "proposed_career_resilience",
  ].join(",");

  const lines = [...rows]
    .sort((a, b) => b.improvement - a.improvement)
    .map((row) =>
      [
        escapeCsv(row.code),
        escapeCsv(row.title),
        escapeCsv(row.category),
        row.currentIlonaaRisk.toString(),
        row.proposedIlonaaRisk.toString(),
        row.expectedAiRiskScore.toString(),
        row.absMismatch.toString(),
        row.absMismatchAfter.toString(),
        row.improvement.toString(),
        row.proposedAiExposure.toString(),
        row.proposedAiReplacementRisk.toString(),
        row.proposedCareerResilience.toString(),
      ].join(",")
    );

  return [header, ...lines].join("\n");
}

function buildBeforeAfterMarkdown(rows: ValidationRow[]): string {
  const topImprovement = [...rows].sort((a, b) => b.improvement - a.improvement);
  const worstAfter = [...rows].sort((a, b) => b.absMismatchAfter - a.absMismatchAfter);

  return [
    "# ILONAA AI Risk Model Before/After Simulation",
    "",
    `Generated at: ${new Date().toISOString()}`,
    "",
    `Average absolute mismatch before: ${mean(rows.map((row) => row.absMismatch)).toFixed(2)}`,
    `Average absolute mismatch after: ${mean(rows.map((row) => row.absMismatchAfter)).toFixed(2)}`,
    "",
    topList(
      "Top Improvements",
      topImprovement,
      (row, i) =>
        `${i + 1}. ${row.title} (${row.code}) — before ${row.currentIlonaaRisk}, after ${row.proposedIlonaaRisk}, expected ${row.expectedAiRiskScore}, |mismatch| ${row.absMismatch} -> ${row.absMismatchAfter}, improvement ${row.improvement}.`,
      30
    ),
    topList(
      "Remaining Worst Mismatches",
      worstAfter,
      (row, i) =>
        `${i + 1}. ${row.title} (${row.code}) — after ${row.proposedIlonaaRisk}, expected ${row.expectedAiRiskScore}, |mismatch| ${row.absMismatchAfter}.`,
      30
    ),
  ].join("\n");
}

function buildProposalMarkdown(rows: ValidationRow[]): string {
  const over = rows.filter((row) => row.mismatch > 0);
  const under = rows.filter((row) => row.mismatch < 0);

  const overHighConsequence = over.filter((row) => row.factors.consequenceResponsibility >= 70).length;
  const overHighPhysical = over.filter((row) => row.factors.physicalPracticality >= 70).length;
  const overHighHuman = over.filter((row) => row.factors.humanInteraction >= 70).length;
  const underHighRoutine = under.filter((row) => row.factors.routineRepetitive >= 70).length;
  const underHighAdmin = under.filter((row) => row.factors.administrativeStructure >= 65).length;

  return [
    "# ILONAA AI Risk Model Recalibration Proposal",
    "",
    `Generated at: ${new Date().toISOString()}`,
    "",
    "## A. Current formula",
    "",
    "- Current ILONAA index blends: 40% exposure, 25% inverse resilience, 15% baseline risk, +10% AI usage, -10% decision consequence (plus constant).",
    "- Exposure and baseline risk dominate the score. Consequence/accountability has only limited direct damping.",
    "",
    "## B. Observed weaknesses",
    "",
    `- Decision consequence/accountability appears underweighted (overestimated set with high consequence: ${overHighConsequence}).`,
    `- Physical presence appears underweighted (overestimated set with high physical practicality: ${overHighPhysical}).`,
    `- Human relationship depth appears underweighted (overestimated set with high human interaction: ${overHighHuman}).`,
    `- Routine/admin pressure is not consistently calibrated (underestimated set high routine count: ${underHighRoutine}, high admin count: ${underHighAdmin}).`,
    "- Professional accountability/compliance consequence and financial consequence are not explicit enough as replacement-risk dampeners.",
    "- RIASEC should remain primarily identity/context, not a dominant risk driver.",
    "",
    "## C. Proposed formula",
    "",
    "### AI Exposure",
    "",
    "`AI Exposure = 0.20*routine + 0.18*administrative + 0.20*informationProcessing + 0.12*dataAnalysis + 0.12*(100-physicalPresence) + 0.10*(100-humanInteraction) + 0.08*(100-creativity)`",
    "",
    "### AI Replacement Risk",
    "",
    "`AI Replacement Risk = 0.35*AI Exposure + 0.20*routine + 0.10*administrative + 0.12*(100-judgment) + 0.08*(100-adaptability) + 0.05*(100-consequence) + 0.05*(100-physicalPresence) + 0.05*(100-humanInteraction) - 0.10*consequence - 0.08*physicalPresence - 0.05*humanInteraction`",
    "",
    "### Career Resilience",
    "",
    "`Career Resilience = 0.24*judgment + 0.22*consequence + 0.16*humanInteraction + 0.16*adaptability + 0.08*creativity + 0.08*dataAnalysis + 0.06*physicalPresence`",
    "",
    "### ILONAA AI Risk Index",
    "",
    "`ILONAA AI Risk Index = 0.25*AI Exposure + 0.50*AI Replacement Risk + 0.25*(100-Career Resilience)`",
    "",
    "This keeps the index closer to replacement/disruption risk than raw exposure while staying transparent and explainable.",
    "",
    "## D. New/stronger factors",
    "",
    "1. Decision consequence/accountability: stronger replacement-risk dampener and resilience booster.",
    "2. Physical presence/hands-on execution: explicit replacement-risk dampener.",
    "3. Professional judgment/licensure proxy: stronger through judgment + consequence.",
    "4. Routine cognitive work: explicit risk amplifier.",
    "5. Current AI capability: increases exposure but not deterministic replacement.",
    "6. Human trust/relationship depth: stronger dampener for replacement risk.",
    "7. Adaptability: explicit resilience amplifier.",
    "",
    "## E. Suggested weighting",
    "",
    "- Simple linear weighted factors only; no black-box methods and no ML optimization.",
    "- Emphasis shifts from exposure-only interpretation toward replacement-likelihood and human accountability.",
    "",
    "## F. Before/after simulation",
    "",
    `- Average absolute mismatch before: ${mean(rows.map((row) => row.absMismatch)).toFixed(2)}`,
    `- Average absolute mismatch after: ${mean(rows.map((row) => row.absMismatchAfter)).toFixed(2)}`,
    `- Net average improvement: ${(
      mean(rows.map((row) => row.absMismatch)) - mean(rows.map((row) => row.absMismatchAfter))
    ).toFixed(2)}`,
    "",
    "See `reports/ilonaa_ai_risk_model_before_after_simulation.md` and `.csv` for per-occupation deltas, top improvements, and remaining worst mismatches.",
  ].join("\n");
}

async function main() {
  const rows = buildRows();
  const reportsDir = resolve(process.cwd(), "reports");
  await mkdir(reportsDir, { recursive: true });

  await writeFile(
    resolve(reportsDir, "ilonaa_ai_risk_model_mismatch_audit.md"),
    buildMismatchMarkdown(rows),
    "utf8"
  );
  await writeFile(
    resolve(reportsDir, "ilonaa_ai_risk_model_mismatch_audit.csv"),
    buildMismatchCsv(rows),
    "utf8"
  );
  await writeFile(
    resolve(reportsDir, "ilonaa_ai_risk_model_recalibration_proposal.md"),
    buildProposalMarkdown(rows),
    "utf8"
  );
  await writeFile(
    resolve(reportsDir, "ilonaa_ai_risk_model_before_after_simulation.md"),
    buildBeforeAfterMarkdown(rows),
    "utf8"
  );
  await writeFile(
    resolve(reportsDir, "ilonaa_ai_risk_model_before_after_simulation.csv"),
    buildBeforeAfterCsv(rows),
    "utf8"
  );

  console.log("Generated ILONAA AI risk mismatch/proposal/simulation reports.");
}

void main();
