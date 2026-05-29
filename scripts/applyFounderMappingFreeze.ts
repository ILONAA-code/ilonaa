import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import marketTitles from "../src/data/marketTitles.json";

type MarketTitleRecord = (typeof marketTitles)[number];

const FOUNDER_DECISIONS: Array<{
  marketTitle: string;
  mappedOccupationCode: string;
  mappingConfidence: number;
  searchPriority: number;
}> = [
  { marketTitle: "Chief of Staff", mappedOccupationCode: "11-1021.00", mappingConfidence: 0.83, searchPriority: 100 },
  { marketTitle: "CTO", mappedOccupationCode: "11-1011.00", mappingConfidence: 0.9, searchPriority: 100 },
  { marketTitle: "Chief Technology Officer", mappedOccupationCode: "11-1011.00", mappingConfidence: 0.9, searchPriority: 100 },
  { marketTitle: "CIO", mappedOccupationCode: "11-1011.00", mappingConfidence: 0.9, searchPriority: 100 },
  { marketTitle: "Chief Information Officer", mappedOccupationCode: "11-1011.00", mappingConfidence: 0.9, searchPriority: 100 },
  { marketTitle: "Customer Success Manager", mappedOccupationCode: "41-3091.00", mappingConfidence: 0.86, searchPriority: 100 },
  { marketTitle: "Customer Success Director", mappedOccupationCode: "11-2022.00", mappingConfidence: 0.85, searchPriority: 98 },
  { marketTitle: "Customer Success Operations Manager", mappedOccupationCode: "11-1021.00", mappingConfidence: 0.84, searchPriority: 98 },
  { marketTitle: "Customer Experience Manager", mappedOccupationCode: "11-1021.00", mappingConfidence: 0.83, searchPriority: 96 },
  { marketTitle: "Customer Support Manager", mappedOccupationCode: "11-2022.00", mappingConfidence: 0.83, searchPriority: 96 },
  { marketTitle: "Design Systems Engineer", mappedOccupationCode: "15-1255.00", mappingConfidence: 0.82, searchPriority: 95 },
];

function norm(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s&/+-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  const byTitle = new Map<string, MarketTitleRecord>(
    (marketTitles as MarketTitleRecord[]).map((entry) => [norm(entry.marketTitle), entry])
  );

  for (const decision of FOUNDER_DECISIONS) {
    const key = norm(decision.marketTitle);
    const existing = byTitle.get(key);

    const next: MarketTitleRecord = {
      marketTitle: decision.marketTitle,
      mappedOccupationCode: decision.mappedOccupationCode,
      mappingConfidence: decision.mappingConfidence,
      source: "market-title-layer",
      searchPriority: decision.searchPriority,
    };

    if (existing) {
      byTitle.set(key, { ...existing, ...next });
    } else {
      byTitle.set(key, next);
    }
  }

  const frozen = [...byTitle.values()].sort((a, b) => {
    const confDelta = b.mappingConfidence - a.mappingConfidence;
    if (confDelta !== 0) return confDelta;
    const prioDelta = b.searchPriority - a.searchPriority;
    if (prioDelta !== 0) return prioDelta;
    return a.marketTitle.localeCompare(b.marketTitle);
  });

  // Keep the layer fixed at 2000 entries while guaranteeing founder-decided mappings stay included.
  const sliced = frozen.slice(0, 2000);
  const existingKeys = new Set(sliced.map((entry) => norm(entry.marketTitle)));

  for (const decision of FOUNDER_DECISIONS) {
    if (existingKeys.has(norm(decision.marketTitle))) continue;
    sliced.pop();
    sliced.push({
      marketTitle: decision.marketTitle,
      mappedOccupationCode: decision.mappedOccupationCode,
      mappingConfidence: decision.mappingConfidence,
      source: "market-title-layer",
      searchPriority: decision.searchPriority,
    });
    existingKeys.add(norm(decision.marketTitle));
  }

  sliced.sort((a, b) => {
    const confDelta = b.mappingConfidence - a.mappingConfidence;
    if (confDelta !== 0) return confDelta;
    const prioDelta = b.searchPriority - a.searchPriority;
    if (prioDelta !== 0) return prioDelta;
    return a.marketTitle.localeCompare(b.marketTitle);
  });

  const outputPath = resolve(process.cwd(), "src/data/marketTitles.json");
  await writeFile(outputPath, `${JSON.stringify(sliced, null, 2)}\n`, "utf8");

  // eslint-disable-next-line no-console
  console.log(`Applied founder mapping freeze to ${outputPath}`);
  // eslint-disable-next-line no-console
  console.log(`Total market titles retained: ${sliced.length}`);
}

main().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exitCode = 1;
});
