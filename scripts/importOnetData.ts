import { execFileSync } from "node:child_process";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { OnetOccupation, OnetOccupationFactors, OnetRiasecScores } from "../src/lib/assessment/onetTypes";

const ONET_TEXT_ZIP_URL =
  "https://www.onetcenter.org/dl_files/database/db_29_1_text.zip";

const SCALE_MAX: Record<string, number> = {
  IM: 5,
  CX: 5,
  LV: 7,
  OI: 7,
};

const RIASEC_TYPES = ["Realistic", "Investigative", "Artistic", "Social", "Enterprising", "Conventional"] as const;
type RiasecType = (typeof RIASEC_TYPES)[number];
type MetricMap = Map<string, Map<string, number>>;

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function normalizeLabel(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ");
}

function normalizeSearchString(value: string): string {
  return normalizeLabel(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s&/+-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseTsv(text: string): Array<Record<string, string>> {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const headers = lines[0].split("\t").map((header) => normalizeLabel(header));
  return lines.slice(1).map((line) => {
    const values = line.split("\t");
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = normalizeLabel(values[index] ?? "");
    });
    return row;
  });
}

function unzipList(zipPath: string): string[] {
  const output = execFileSync("unzip", ["-Z1", zipPath], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20,
  });
  return output.split(/\r?\n/).filter(Boolean);
}

function unzipEntry(zipPath: string, entryPath: string): string {
  return execFileSync("unzip", ["-p", zipPath, entryPath], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 200,
  });
}

function normalizeScaleValue(scaleId: string, raw: string): number | null {
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return null;
  const scaleMax = SCALE_MAX[scaleId];
  if (!scaleMax) return null;
  return clamp(((value - 1) / (scaleMax - 1)) * 100);
}

function addMetric(metricMap: MetricMap, code: string, name: string, value: number): void {
  const codeMap = metricMap.get(code) ?? new Map<string, number>();
  codeMap.set(name.toLowerCase(), value);
  metricMap.set(code, codeMap);
}

function buildMetricMap(
  rows: Array<Record<string, string>>,
  allowedScales: Set<string>
): MetricMap {
  const temp = new Map<string, Map<string, number[]>>();

  for (const row of rows) {
    const code = row["O*NET-SOC Code"];
    const scaleId = row["Scale ID"];
    const name = row["Element Name"];
    if (!code || !name || !allowedScales.has(scaleId)) continue;

    const normalized = normalizeScaleValue(scaleId, row["Data Value"]);
    if (normalized === null) continue;

    const codeMap = temp.get(code) ?? new Map<string, number[]>();
    const key = name.toLowerCase();
    const list = codeMap.get(key) ?? [];
    list.push(normalized);
    codeMap.set(key, list);
    temp.set(code, codeMap);
  }

  const metricMap: MetricMap = new Map();
  for (const [code, codeMap] of temp) {
    for (const [name, values] of codeMap) {
      const avg = values.reduce((sum, current) => sum + current, 0) / values.length;
      addMetric(metricMap, code, name, avg);
    }
  }
  return metricMap;
}

function keywordAverage(
  metricMap: MetricMap,
  code: string,
  keywords: string[],
  fallback = 50
): number {
  const codeMap = metricMap.get(code);
  if (!codeMap) return fallback;

  const matches: number[] = [];
  for (const [label, value] of codeMap.entries()) {
    if (keywords.some((keyword) => label.includes(keyword))) {
      matches.push(value);
    }
  }

  if (matches.length === 0) return fallback;
  const average = matches.reduce((sum, current) => sum + current, 0) / matches.length;
  return clamp(average);
}

function topLabels(metricMap: MetricMap, code: string, limit = 3): string[] {
  const codeMap = metricMap.get(code);
  if (!codeMap) return [];
  return [...codeMap.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([name]) => name.replace(/\b\w/g, (char) => char.toUpperCase()));
}

function deriveFactors(
  code: string,
  activityMetrics: MetricMap,
  contextMetrics: MetricMap,
  styleMetrics: MetricMap,
  skillMetrics: MetricMap,
  knowledgeMetrics: MetricMap
): OnetOccupationFactors {
  const routineRepetitive = clamp(
    keywordAverage(contextMetrics, code, [
      "repetitive motions",
      "structured versus unstructured work",
      "importance of being exact or accurate",
      "automation",
    ]) *
      0.6 +
      keywordAverage(activityMetrics, code, ["processing information", "documenting/recording information"]) *
        0.4
  );

  const informationProcessing = keywordAverage(activityMetrics, code, [
    "processing information",
    "getting information",
    "documenting/recording information",
    "updating and using relevant knowledge",
  ]);

  const dataAnalysis = keywordAverage(activityMetrics, code, [
    "analyzing data or information",
    "interpreting the meaning of information",
    "estimating the quantifiable characteristics",
    "making decisions and solving problems",
  ]);

  const administrativeStructure = clamp(
    keywordAverage(knowledgeMetrics, code, ["administrative", "administration and management"]) * 0.5 +
      keywordAverage(contextMetrics, code, ["structured versus unstructured work", "importance of being exact"]) *
        0.5
  );

  const humanInteraction = clamp(
    keywordAverage(contextMetrics, code, [
      "contact with others",
      "face-to-face discussions",
      "deal with external customers",
      "work with work group or team",
    ]) *
      0.55 +
      keywordAverage(activityMetrics, code, [
        "communicating with supervisors, peers, or subordinates",
        "establishing and maintaining interpersonal relationships",
        "assisting and caring for others",
      ]) *
        0.45
  );

  const creativityInnovation = clamp(
    keywordAverage(activityMetrics, code, [
      "thinking creatively",
      "developing objectives and strategies",
      "designing equipment and technology",
    ]) *
      0.7 +
      keywordAverage(styleMetrics, code, ["innovation", "initiative"]) * 0.3
  );

  const decisionJudgment = keywordAverage(activityMetrics, code, [
    "making decisions and solving problems",
    "judging the qualities of objects, services, or people",
    "evaluating information to determine compliance",
  ]);

  const consequenceResponsibility = keywordAverage(contextMetrics, code, [
    "impact of decisions on co-workers or company results",
    "responsibility for outcomes and results",
    "consequence of error",
    "frequency of decision making",
  ]);

  const physicalPracticality = keywordAverage(activityMetrics, code, [
    "handling and moving objects",
    "operating vehicles, mechanized devices, or equipment",
    "controlling machines and processes",
    "performing general physical activities",
    "repairing and maintaining mechanical equipment",
    "inspecting equipment, structures, or materials",
  ]);

  const adaptabilityLearning = clamp(
    keywordAverage(styleMetrics, code, ["adaptability/flexibility", "initiative", "persistence"]) * 0.6 +
      keywordAverage(skillMetrics, code, ["learning strategies", "active learning"]) * 0.2 +
      keywordAverage(activityMetrics, code, ["updating and using relevant knowledge"]) * 0.2
  );

  return {
    routineRepetitive,
    informationProcessing,
    dataAnalysis,
    administrativeStructure,
    humanInteraction,
    creativityInnovation,
    decisionJudgment,
    consequenceResponsibility,
    physicalPracticality,
    adaptabilityLearning,
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

function buildSearchTerms(title: string, alternateTitles: string[]): string[] {
  const terms = new Set<string>([title, ...alternateTitles]);

  for (const term of [...terms]) {
    const plain = term.replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
    if (plain) terms.add(plain);
    const noParen = term.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
    if (noParen) terms.add(noParen);
  }

  return [...terms]
    .map(normalizeLabel)
    .filter((term) => term && term.toLowerCase() !== "n/a");
}

async function downloadOnetZip(zipPath: string): Promise<void> {
  const response = await fetch(ONET_TEXT_ZIP_URL);
  if (!response.ok) {
    throw new Error(`Failed to download O*NET zip: ${response.status} ${response.statusText}`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(zipPath, bytes);
}

function pickRiasec(scores: OnetRiasecScores): { primary: RiasecType; secondary: RiasecType } {
  const ordered = RIASEC_TYPES.map((type) => ({ type, value: scores[type] })).sort(
    (a, b) => b.value - a.value
  );
  return { primary: ordered[0].type, secondary: ordered[1].type };
}

async function main() {
  const root = process.cwd();
  const tmpDir = resolve(root, "tmp");
  const outputDir = resolve(root, "src/data");
  const zipPath = resolve(tmpDir, "onet_db_text.zip");
  const outputPath = resolve(outputDir, "onetOccupations.json");

  await mkdir(tmpDir, { recursive: true });
  await mkdir(outputDir, { recursive: true });

  await downloadOnetZip(zipPath);

  const entries = unzipList(zipPath);
  const occupationDataEntry = entries.find((entry) => entry.endsWith("/Occupation Data.txt"));
  if (!occupationDataEntry) {
    throw new Error("Could not locate 'Occupation Data.txt' in O*NET zip.");
  }

  const datasetDir = occupationDataEntry.slice(0, occupationDataEntry.lastIndexOf("/"));
  const readEntry = (name: string) => unzipEntry(zipPath, `${datasetDir}/${name}`);

  const occupationRows = parseTsv(readEntry("Occupation Data.txt"));
  const alternateRows = parseTsv(readEntry("Alternate Titles.txt"));
  const interestsRows = parseTsv(readEntry("Interests.txt"));
  const activityRows = parseTsv(readEntry("Work Activities.txt"));
  const contextRows = parseTsv(readEntry("Work Context.txt"));
  const styleRows = parseTsv(readEntry("Work Styles.txt"));
  const skillRows = parseTsv(readEntry("Skills.txt"));
  const abilityRows = parseTsv(readEntry("Abilities.txt"));
  const knowledgeRows = parseTsv(readEntry("Knowledge.txt"));

  const alternateTitleMap = new Map<string, Set<string>>();
  for (const row of alternateRows) {
    const code = row["O*NET-SOC Code"];
    if (!code) continue;
    const set = alternateTitleMap.get(code) ?? new Set<string>();
    const primary = normalizeLabel(row["Alternate Title"]);
    const short = normalizeLabel(row["Short Title"]);
    if (primary && primary.toLowerCase() !== "n/a") set.add(primary);
    if (short && short.toLowerCase() !== "n/a") set.add(short);
    alternateTitleMap.set(code, set);
  }

  const riasecByCode = new Map<string, OnetRiasecScores>();
  for (const row of interestsRows) {
    const code = row["O*NET-SOC Code"];
    if (!code || row["Scale ID"] !== "OI") continue;
    const element = row["Element Name"] as RiasecType;
    if (!RIASEC_TYPES.includes(element)) continue;
    const normalized = normalizeScaleValue("OI", row["Data Value"]);
    if (normalized === null) continue;

    const existing = riasecByCode.get(code) ?? {
      Realistic: 42,
      Investigative: 42,
      Artistic: 42,
      Social: 42,
      Enterprising: 42,
      Conventional: 42,
    };
    existing[element] = normalized;
    riasecByCode.set(code, existing);
  }

  const activityMetrics = buildMetricMap(activityRows, new Set(["IM"]));
  const contextMetrics = buildMetricMap(contextRows, new Set(["CX"]));
  const styleMetrics = buildMetricMap(styleRows, new Set(["IM"]));
  const skillMetrics = buildMetricMap(skillRows, new Set(["IM"]));
  const abilityMetrics = buildMetricMap(abilityRows, new Set(["IM"]));
  const knowledgeMetrics = buildMetricMap(knowledgeRows, new Set(["IM"]));

  const occupations: OnetOccupation[] = occupationRows
    .filter((row) => row["O*NET-SOC Code"] && row.Title)
    .map((row) => {
      const code = row["O*NET-SOC Code"];
      const title = normalizeLabel(row.Title);
      const description = normalizeLabel(row.Description) || "No O*NET description available.";
      const alternateTitles = [...(alternateTitleMap.get(code) ?? new Set<string>())].filter(
        (candidate) => normalizeSearchString(candidate) !== normalizeSearchString(title)
      );

      const riasecScores =
        riasecByCode.get(code) ??
        ({
          Realistic: 42,
          Investigative: 42,
          Artistic: 42,
          Social: 42,
          Enterprising: 42,
          Conventional: 42,
        } as OnetRiasecScores);
      const { primary, secondary } = pickRiasec(riasecScores);
      const factors = deriveFactors(
        code,
        activityMetrics,
        contextMetrics,
        styleMetrics,
        skillMetrics,
        knowledgeMetrics
      );

      return {
        code,
        title,
        alternateTitles,
        searchTerms: buildSearchTerms(title, alternateTitles),
        description,
        riasecScores,
        primaryRiasecType: primary,
        secondaryRiasecType: secondary,
        workActivities: topLabels(activityMetrics, code),
        workStyles: topLabels(styleMetrics, code),
        skills: topLabels(skillMetrics, code),
        abilities: topLabels(abilityMetrics, code),
        workContext: topLabels(contextMetrics, code),
        factors,
        baseline: deriveBaselines(factors),
      } satisfies OnetOccupation;
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  await writeFile(outputPath, JSON.stringify(occupations, null, 2), "utf8");
  const fileStats = await stat(outputPath);

  // eslint-disable-next-line no-console
  console.log(`Generated ${outputPath}`);
  // eslint-disable-next-line no-console
  console.log(`Imported occupations: ${occupations.length}`);
  // eslint-disable-next-line no-console
  console.log(
    `Imported aliases: ${occupations.reduce((sum, occupation) => sum + occupation.alternateTitles.length, 0)}`
  );
  // eslint-disable-next-line no-console
  console.log(`Dataset size (bytes): ${fileStats.size}`);
}

main().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exitCode = 1;
});
