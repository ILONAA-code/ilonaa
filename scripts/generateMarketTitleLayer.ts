import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import occupations from "../src/data/onetOccupations.json";

type OnetOccupation = (typeof occupations)[number];

type MarketTitleRecord = {
  marketTitle: string;
  mappedOccupationCode: string;
  mappingConfidence: number;
  source: string;
  searchPriority: number;
};

type Candidate = {
  marketTitle: string;
  mappedOccupationCode: string;
  source: string;
  searchPriority: number;
  score: number;
  seeded?: boolean;
};

const TARGET_COUNT = 2000;

const SEEDED_TITLES: Array<{
  marketTitle: string;
  mappedOccupationCode: string;
  mappingConfidence: number;
  searchPriority: number;
}> = [
  { marketTitle: "Product Manager", mappedOccupationCode: "11-2021.00", mappingConfidence: 0.92, searchPriority: 100 },
  { marketTitle: "Product Owner", mappedOccupationCode: "13-1082.00", mappingConfidence: 0.86, searchPriority: 100 },
  { marketTitle: "Chief of Staff", mappedOccupationCode: "11-9199.00", mappingConfidence: 0.82, searchPriority: 100 },
  { marketTitle: "Financial Controller", mappedOccupationCode: "11-3031.01", mappingConfidence: 0.95, searchPriority: 100 },
  { marketTitle: "CFO", mappedOccupationCode: "11-1011.00", mappingConfidence: 0.96, searchPriority: 100 },
  { marketTitle: "Software Engineer", mappedOccupationCode: "15-1252.00", mappingConfidence: 0.95, searchPriority: 100 },
  { marketTitle: "Data Scientist", mappedOccupationCode: "15-2051.00", mappingConfidence: 0.96, searchPriority: 100 },
  { marketTitle: "Teacher", mappedOccupationCode: "25-3099.00", mappingConfidence: 0.9, searchPriority: 100 },
  { marketTitle: "Lawyer", mappedOccupationCode: "23-1011.00", mappingConfidence: 0.97, searchPriority: 100 },
  { marketTitle: "Electrician", mappedOccupationCode: "47-2111.00", mappingConfidence: 0.97, searchPriority: 100 },
  { marketTitle: "Customer Success Manager", mappedOccupationCode: "43-1011.00", mappingConfidence: 0.9, searchPriority: 100 },
  { marketTitle: "Head of People", mappedOccupationCode: "11-3121.00", mappingConfidence: 0.83, searchPriority: 96 },
];

const BANNED_PATTERNS = [
  "biofuels",
  "biodiesel",
  "geothermal",
  "tiltrotor",
  "aoc",
  "aadc",
  "sigint",
  "counterintelligence",
  "handkerchief",
  "hydroelectric",
  "all other",
  "except",
  "postsecondary",
  "crew chief",
  "battalion",
  "substation",
  "relay",
  "aerospace and operation technologist",
  "command and control",
  "air crew",
  "tactical operation",
  "military",
  "sericulture",
  "pomology",
  "olericulture",
  "floriculture",
  "hand",
  "all other",
  "correctional",
];

const MARKET_KEYWORDS = [
  "manager",
  "engineer",
  "scientist",
  "analyst",
  "specialist",
  "director",
  "owner",
  "officer",
  "counsel",
  "teacher",
  "nurse",
  "developer",
  "architect",
  "technician",
  "coordinator",
  "consultant",
  "partner",
  "executive",
  "controller",
  "staff",
];

function normalizeLabel(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeKey(value: string): string {
  return normalizeLabel(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s&/+.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(input: string): string {
  return input
    .split(" ")
    .map((word) => {
      if (!word) return word;
      if (word.toUpperCase() === word && word.length <= 5) return word;
      return `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`;
    })
    .join(" ");
}

function removeParenthetical(value: string): string {
  return normalizeLabel(value.replace(/\([^)]*\)/g, " "));
}

function singularizeTrailingPlural(title: string): string {
  const words = normalizeLabel(title).split(" ");
  if (words.length === 0) return title;
  const last = words[words.length - 1];
  const explicitlyPlural = new Set([
    "managers",
    "scientists",
    "teachers",
    "lawyers",
    "electricians",
    "developers",
    "engineers",
    "specialists",
    "technicians",
    "architects",
    "analysts",
    "officers",
    "directors",
    "nurses",
    "executives",
    "consultants",
    "coordinators",
    "controllers",
    "designers",
  ]);
  if (explicitlyPlural.has(last.toLowerCase())) {
    words[words.length - 1] = last.slice(0, -1);
    return words.join(" ");
  }
  return title;
}

function isMarketFacing(title: string): boolean {
  const normalized = normalizeKey(title);
  if (!normalized || normalized.length < 3 || normalized.length > 58) return false;
  if (BANNED_PATTERNS.some((pattern) => normalized.includes(pattern))) return false;
  const words = normalized.split(" ").filter(Boolean);
  if (words.length === 0 || words.length > 6) return false;
  if (/[0-9]{3,}/.test(normalized)) return false;
  if (normalized.includes("--")) return false;
  if (normalized.includes("/")) return false;
  if (normalized.includes(",")) return false;
  return true;
}

function candidateScore(title: string, source: string): number {
  const normalized = normalizeKey(title);
  const words = normalized.split(" ").filter(Boolean);
  let score = 0;

  if (source === "seeded-market-title") score += 1200;
  if (source === "onet-title-normalized") score += 230;
  if (source === "onet-alternate-title") score += 180;
  if (source === "onet-search-term") score += 150;

  if (words.length === 1) score += 45;
  if (words.length === 2) score += 70;
  if (words.length === 3) score += 65;
  if (words.length === 4) score += 45;
  if (words.length >= 5) score += 20;

  const keywordHits = MARKET_KEYWORDS.filter((keyword) => normalized.includes(keyword)).length;
  score += keywordHits * 25;

  if (normalized.length > 42) score -= 25;
  if (normalized.includes("/")) score -= 30;
  if (normalized.includes(",")) score -= 20;

  return score;
}

function scoreToConfidence(score: number, seededConfidence?: number): number {
  if (seededConfidence !== undefined) return seededConfidence;
  const normalized = Math.max(0, Math.min(1, (score - 140) / 320));
  return Number((0.7 + normalized * 0.27).toFixed(2));
}

function scoreToPriority(score: number, seededPriority?: number): number {
  if (seededPriority !== undefined) return seededPriority;
  return Math.max(45, Math.min(95, Math.round(score / 8)));
}

async function main() {
  const onetByCode = new Map<string, OnetOccupation>();
  for (const occupation of occupations) {
    onetByCode.set(occupation.code, occupation);
  }

  const candidates: Candidate[] = [];

  for (const seed of SEEDED_TITLES) {
    if (!onetByCode.has(seed.mappedOccupationCode)) continue;
    candidates.push({
      marketTitle: seed.marketTitle,
      mappedOccupationCode: seed.mappedOccupationCode,
      source: "seeded-market-title",
      searchPriority: seed.searchPriority,
      score: 5000,
      seeded: true,
    });
  }

  for (const occupation of occupations) {
    const rawCandidates = new Set<string>();
    rawCandidates.add(occupation.title);
    rawCandidates.add(singularizeTrailingPlural(occupation.title));
    for (const alt of occupation.alternateTitles ?? []) rawCandidates.add(alt);
    for (const term of occupation.searchTerms ?? []) rawCandidates.add(term);

    for (const rawTitle of rawCandidates) {
      const compact = normalizeLabel(rawTitle);
      const noParen = removeParenthetical(compact);
      const normalizedVariants = new Set<string>([
        compact,
        noParen,
        singularizeTrailingPlural(noParen),
      ]);

      for (const variant of normalizedVariants) {
        const clean = titleCase(normalizeLabel(variant));
        if (!isMarketFacing(clean)) continue;

        const source = (occupation.alternateTitles ?? []).includes(rawTitle)
          ? "onet-alternate-title"
          : (occupation.searchTerms ?? []).includes(rawTitle)
            ? "onet-search-term"
            : "onet-title-normalized";

        candidates.push({
          marketTitle: clean,
          mappedOccupationCode: occupation.code,
          source,
          searchPriority: 0,
          score: candidateScore(clean, source),
        });
      }
    }
  }

  const grouped = new Map<string, Candidate[]>();
  for (const candidate of candidates) {
    const key = normalizeKey(candidate.marketTitle);
    if (!key) continue;
    const list = grouped.get(key) ?? [];
    list.push(candidate);
    grouped.set(key, list);
  }

  const resolved: MarketTitleRecord[] = [];

  for (const [, list] of grouped) {
    const byCode = new Map<string, Candidate>();
    for (const item of list) {
      const current = byCode.get(item.mappedOccupationCode);
      if (!current || item.score > current.score) {
        byCode.set(item.mappedOccupationCode, item);
      }
    }

    const candidatesByCode = [...byCode.values()].sort((a, b) => b.score - a.score);
    const hasSeeded = candidatesByCode.find((item) => item.seeded);

    if (hasSeeded) {
      const seededDef = SEEDED_TITLES.find(
        (seed) =>
          normalizeKey(seed.marketTitle) === normalizeKey(hasSeeded.marketTitle) &&
          seed.mappedOccupationCode === hasSeeded.mappedOccupationCode
      );
      if (!seededDef) continue;
      resolved.push({
        marketTitle: seededDef.marketTitle,
        mappedOccupationCode: seededDef.mappedOccupationCode,
        mappingConfidence: seededDef.mappingConfidence,
        source: "market-title-layer",
        searchPriority: seededDef.searchPriority,
      });
      continue;
    }

    if (candidatesByCode.length !== 1) {
      // Ambiguous title across multiple O*NET occupations: exclude for one-to-one mapping requirement.
      continue;
    }

    const best = candidatesByCode[0];
    resolved.push({
      marketTitle: best.marketTitle,
      mappedOccupationCode: best.mappedOccupationCode,
      mappingConfidence: scoreToConfidence(best.score),
      source: "market-title-layer",
      searchPriority: scoreToPriority(best.score),
    });
  }

  const uniqueByTitle = new Map<string, MarketTitleRecord>();
  for (const entry of resolved) {
    const key = normalizeKey(entry.marketTitle);
    const existing = uniqueByTitle.get(key);
    if (!existing || entry.searchPriority > existing.searchPriority) {
      uniqueByTitle.set(key, entry);
    }
  }

  const ranked = [...uniqueByTitle.values()].sort((a, b) => {
    const confidenceDelta = b.mappingConfidence - a.mappingConfidence;
    if (confidenceDelta !== 0) return confidenceDelta;
    const priorityDelta = b.searchPriority - a.searchPriority;
    if (priorityDelta !== 0) return priorityDelta;
    return a.marketTitle.localeCompare(b.marketTitle);
  });

  const finalList = ranked.slice(0, TARGET_COUNT);

  for (const seed of SEEDED_TITLES) {
    const exists = finalList.some((entry) => normalizeKey(entry.marketTitle) === normalizeKey(seed.marketTitle));
    if (exists) continue;
    finalList.pop();
    finalList.push({
      marketTitle: seed.marketTitle,
      mappedOccupationCode: seed.mappedOccupationCode,
      mappingConfidence: seed.mappingConfidence,
      source: "market-title-layer",
      searchPriority: seed.searchPriority,
    });
  }

  finalList.sort((a, b) => {
    const confidenceDelta = b.mappingConfidence - a.mappingConfidence;
    if (confidenceDelta !== 0) return confidenceDelta;
    const priorityDelta = b.searchPriority - a.searchPriority;
    if (priorityDelta !== 0) return priorityDelta;
    return a.marketTitle.localeCompare(b.marketTitle);
  });

  const outputPath = resolve(process.cwd(), "src/data/marketTitles.json");
  await writeFile(outputPath, `${JSON.stringify(finalList, null, 2)}\n`, "utf8");

  // eslint-disable-next-line no-console
  console.log(`Generated ${outputPath}`);
  // eslint-disable-next-line no-console
  console.log(`Total market titles: ${finalList.length}`);
}

main().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exitCode = 1;
});
