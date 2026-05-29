import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

type CandidateRow = {
  marketTitle: string;
  frequencyIndicator: "High" | "Medium" | "Low";
  frequencyScore: number;
  mappedOccupation: string;
  mappedOccupationCode: string;
  mappingConfidence: number;
  matchingMethod: string;
  className: "A" | "B" | "C";
};

type FinalProfessionTitle = {
  marketTitle: string;
  mappedOccupationCode: string;
  mappingConfidence: number;
  frequencyIndicator: "High" | "Medium" | "Low";
  frequencyScore: number;
  matchingMethod: string;
  source: "indeed-onet-class-a-freeze";
  searchPriority: number;
};

type DeferredProfessionTitle = CandidateRow & {
  acceptanceStatus: "deferred-review" | "rejected";
};

const EXECUTIVE_PREFERRED_TITLES: Record<string, string> = {
  CEO: "Chief Executive Officer",
  CFO: "Chief Financial Officer",
  CTO: "Chief Technology Officer",
  CIO: "Chief Information Officer",
  COO: "Chief Operating Officer",
  CMO: "Chief Marketing Officer",
  CHRO: "Chief Human Resources Officer",
};

const EXECUTIVE_FALLBACK_TITLE_PREFIX: Record<string, string> = {
  CEO: "Chief Executive",
  CFO: "Chief Financial",
  CTO: "Chief Technology",
  CIO: "Chief Information",
  COO: "Chief Operating",
  CMO: "Chief Marketing",
  CHRO: "Chief Human Resources",
};

function parseFrequency(value: string): { indicator: "High" | "Medium" | "Low"; score: number } {
  const match = value.match(/^(High|Medium|Low)\s*\(([\d.]+)\)$/);
  if (!match) {
    return { indicator: "Medium", score: 0.62 };
  }
  return {
    indicator: match[1] as "High" | "Medium" | "Low",
    score: Number(match[2]),
  };
}

function parseCandidateTable(markdown: string): CandidateRow[] {
  const lines = markdown.split("\n");
  const rows: CandidateRow[] = [];

  for (const line of lines) {
    if (!line.startsWith("| ")) continue;
    if (line.includes("| ---")) continue;
    if (line.includes("| Market Title |")) continue;

    const cols = line.split("|").map((part) => part.trim());
    if (cols.length < 8) continue;

    const marketTitle = cols[1];
    const frequency = parseFrequency(cols[2]);
    const mappedOccupation = cols[3];
    const mappedOccupationCode = cols[4];
    const mappingConfidence = Number(cols[5]);
    const matchingMethod = cols[6];
    const className = cols[7] as "A" | "B" | "C";

    if (!marketTitle || !mappedOccupationCode || Number.isNaN(mappingConfidence)) continue;

    rows.push({
      marketTitle,
      frequencyIndicator: frequency.indicator,
      frequencyScore: frequency.score,
      mappedOccupation,
      mappedOccupationCode,
      mappingConfidence,
      matchingMethod,
      className,
    });
  }

  return rows;
}

function dedupeByTitle(rows: FinalProfessionTitle[]): FinalProfessionTitle[] {
  const byTitle = new Map<string, FinalProfessionTitle>();
  for (const row of rows) {
    const key = row.marketTitle.toLowerCase();
    const existing = byTitle.get(key);
    if (!existing || row.mappingConfidence > existing.mappingConfidence) {
      byTitle.set(key, row);
    }
  }
  return [...byTitle.values()].sort((a, b) => b.mappingConfidence - a.mappingConfidence || a.marketTitle.localeCompare(b.marketTitle));
}

async function main() {
  const candidatePath = resolve(process.cwd(), "docs/indeed_onet_candidate_list.md");
  const candidateMarkdown = await readFile(candidatePath, "utf8");
  const candidates = parseCandidateTable(candidateMarkdown);

  const acceptedRaw = candidates.filter((row) => row.className === "A");
  const deferredRaw = candidates.filter((row) => row.className === "B");
  const rejectedRaw = candidates.filter((row) => row.className === "C");

  const acceptedBase: FinalProfessionTitle[] = acceptedRaw.map((row) => ({
    marketTitle: row.marketTitle,
    mappedOccupationCode: row.mappedOccupationCode,
    mappingConfidence: row.mappingConfidence,
    frequencyIndicator: row.frequencyIndicator,
    frequencyScore: row.frequencyScore,
    matchingMethod: row.matchingMethod,
    source: "indeed-onet-class-a-freeze",
    searchPriority: Math.max(60, Math.min(100, Math.round(row.mappingConfidence * 100))),
  }));

  const acceptedTitles = new Set(acceptedBase.map((row) => row.marketTitle));
  const aliasMap: Record<string, string> = {};

  for (const [acronym, preferred] of Object.entries(EXECUTIVE_PREFERRED_TITLES)) {
    const preferredExists = acceptedTitles.has(preferred);
    if (preferredExists) {
      aliasMap[acronym] = preferred;
      continue;
    }
    const fallbackPrefix = EXECUTIVE_FALLBACK_TITLE_PREFIX[acronym];
    const fallback = acceptedBase.find((row) => row.marketTitle.startsWith(fallbackPrefix));
    if (fallback) {
      aliasMap[acronym] = fallback.marketTitle;
    }
  }

  const visibleAccepted = dedupeByTitle(
    acceptedBase.filter((row) => {
      const preferred = EXECUTIVE_PREFERRED_TITLES[row.marketTitle];
      if (!preferred) return true;
      return row.marketTitle === preferred;
    })
  );

  const deferredForStorage: DeferredProfessionTitle[] = [
    ...deferredRaw.map((row) => ({ ...row, acceptanceStatus: "deferred-review" as const })),
    ...rejectedRaw.map((row) => ({ ...row, acceptanceStatus: "rejected" as const })),
  ].sort((a, b) => b.mappingConfidence - a.mappingConfidence || a.marketTitle.localeCompare(b.marketTitle));

  const finalLayerPath = resolve(process.cwd(), "src/data/professionLayerFinal.json");
  const deferredLayerPath = resolve(process.cwd(), "src/data/professionLayerDeferred.json");
  const aliasMapPath = resolve(process.cwd(), "src/data/professionAliasMap.json");
  const summaryPath = resolve(process.cwd(), "docs/final_profession_layer_summary.md");

  await writeFile(finalLayerPath, `${JSON.stringify(visibleAccepted, null, 2)}\n`, "utf8");
  await writeFile(deferredLayerPath, `${JSON.stringify(deferredForStorage, null, 2)}\n`, "utf8");
  await writeFile(aliasMapPath, `${JSON.stringify(aliasMap, null, 2)}\n`, "utf8");

  const acceptedExamples = visibleAccepted.slice(0, 15).map((row) => `- ${row.marketTitle} -> ${row.mappedOccupationCode} (${row.mappingConfidence.toFixed(2)})`);
  const deferredExamples = deferredForStorage.slice(0, 15).map(
    (row) =>
      `- ${row.marketTitle} -> ${row.mappedOccupationCode} (${row.mappingConfidence.toFixed(2)}, ${row.acceptanceStatus})`
  );

  const summaryLines = [
    "# Final Profession Layer Summary",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    `- total visible profession titles: **${visibleAccepted.length}**`,
    `- total accepted titles (Class A raw): **${acceptedRaw.length}**`,
    `- total rejected titles (Class B + C deferred/rejected): **${deferredForStorage.length}**`,
    "",
    "## Freeze Rule Applied",
    "",
    "- Only Class A titles (confidence >= 0.85) are accepted into the production-visible layer.",
    "- Class B and Class C are stored for future review and are not exposed in production search.",
    "- Executive acronyms are retained as internal aliases and collapse to preferred full titles.",
    "",
    "## Examples of Accepted Titles",
    "",
    ...acceptedExamples,
    "",
    "## Examples of Deferred Titles",
    "",
    ...deferredExamples,
    "",
    "## Produced Artifacts",
    "",
    "- `src/data/professionLayerFinal.json` (production-visible layer, frozen)",
    "- `src/data/professionLayerDeferred.json` (Class B/C storage for later review)",
    "- `src/data/professionAliasMap.json` (internal alias routing to preferred visible titles)",
  ];

  await writeFile(summaryPath, `${summaryLines.join("\n")}\n`, "utf8");

  // eslint-disable-next-line no-console
  console.log(`Final visible titles: ${visibleAccepted.length}`);
  // eslint-disable-next-line no-console
  console.log(`Accepted (Class A raw): ${acceptedRaw.length}`);
  // eslint-disable-next-line no-console
  console.log(`Deferred/rejected stored: ${deferredForStorage.length}`);
}

main().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exitCode = 1;
});
