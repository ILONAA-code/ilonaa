import occupationsData from "@/data/onetOccupations.json";
import marketTitlesData from "@/data/marketTitles.json";
import type { OnetOccupation, SelectedProfession } from "./onetTypes";

const OCCUPATIONS = occupationsData as OnetOccupation[];
const OCCUPATION_BY_CODE = new Map(OCCUPATIONS.map((occupation) => [occupation.code, occupation]));

type MarketTitleEntry = {
  marketTitle: string;
  mappedOccupationCode: string;
  mappingConfidence: number;
  source: string;
  searchPriority: number;
};

type MarketTitleSearchIndex = {
  marketTitle: string;
  mappedOccupationCode: string;
  mappingConfidence: number;
  source: string;
  searchPriority: number;
  normalizedMarketTitle: string;
  acronym: string;
};

export type ProfessionSearchHit = {
  marketTitle: string;
  mappedOccupationCode: string;
  mappingConfidence: number;
  source: string;
  searchPriority: number;
  occupation: OnetOccupation;
};

function normalizeSearchString(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[^\w\s&/+-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function acronymFromTitle(title: string): string {
  return normalizeSearchString(title)
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => token[0])
    .join("");
}

const MARKET_TITLE_INDEX: MarketTitleSearchIndex[] = (marketTitlesData as MarketTitleEntry[])
  .map((entry) => ({
    ...entry,
    normalizedMarketTitle: normalizeSearchString(entry.marketTitle),
    acronym: acronymFromTitle(entry.marketTitle),
  }))
  .filter((entry) => OCCUPATION_BY_CODE.has(entry.mappedOccupationCode));

function rankMarketTitle(entry: MarketTitleSearchIndex, query: string): number {
  const q = normalizeSearchString(query);
  if (!q) return 0;
  const title = entry.normalizedMarketTitle;

  if (title === q) return 1500 + entry.searchPriority;
  if (entry.acronym && entry.acronym === q.replace(/\s+/g, "")) {
    return 1400 + entry.searchPriority;
  }
  if (title.startsWith(q)) return 1200 + entry.searchPriority;
  if (title.includes(` ${q} `) || title.endsWith(` ${q}`) || title.startsWith(`${q} `)) {
    return 980 + entry.searchPriority;
  }
  if (title.includes(q)) return 860 + Math.round(entry.searchPriority * 0.5);
  return 0;
}

function toSelectedProfession(
  occupation: OnetOccupation,
  displayTitle?: string
): SelectedProfession {
  return {
    code: occupation.code,
    title: displayTitle ?? occupation.title,
    primaryRiasecType: occupation.primaryRiasecType,
    secondaryRiasecType: occupation.secondaryRiasecType,
    baselineAiExposure: occupation.baseline.baselineAiExposure,
    baselineCareerResilience: occupation.baseline.baselineCareerResilience,
    baselineRiskIndex: occupation.baseline.baselineRiskIndex,
    keyOccupationalFactors: occupation.factors,
  };
}

export function getAllOccupations(): OnetOccupation[] {
  return OCCUPATIONS;
}

export function searchOccupations(query: string, limit = 20): ProfessionSearchHit[] {
  const normalizedQuery = normalizeSearchString(query);
  if (normalizedQuery.length < 2) return [];

  return MARKET_TITLE_INDEX
    .map((entry) => ({
      entry,
      score: rankMarketTitle(entry, normalizedQuery),
    }))
    .filter((item) => item.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.entry.searchPriority - a.entry.searchPriority ||
        a.entry.marketTitle.localeCompare(b.entry.marketTitle)
    )
    .slice(0, limit)
    .map(({ entry }) => ({
      marketTitle: entry.marketTitle,
      mappedOccupationCode: entry.mappedOccupationCode,
      mappingConfidence: entry.mappingConfidence,
      source: entry.source,
      searchPriority: entry.searchPriority,
      occupation: OCCUPATION_BY_CODE.get(entry.mappedOccupationCode) as OnetOccupation,
    }));
}

export function getOccupationByCode(code: string): OnetOccupation | null {
  return OCCUPATIONS.find((occupation) => occupation.code === code) ?? null;
}

export function toProfessionSelection(
  occupation: OnetOccupation,
  displayTitle?: string
): SelectedProfession {
  return toSelectedProfession(occupation, displayTitle);
}
