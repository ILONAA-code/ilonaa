import occupationsData from "@/data/onetOccupations.json";
import professionLayerFinalData from "@/data/professionLayerFinal.json";
import professionAliasMapData from "@/data/professionAliasMap.json";
import type { OnetOccupation, SelectedProfession } from "./onetTypes";

type FinalProfessionLayerEntry = {
  marketTitle: string;
  mappedOccupationCode: string;
  mappingConfidence: number;
  frequencyIndicator: "High" | "Medium" | "Low";
  frequencyScore: number;
  matchingMethod: string;
  source: string;
  searchPriority: number;
};

const OCCUPATIONS = occupationsData as OnetOccupation[];
const OCCUPATION_BY_CODE = new Map(OCCUPATIONS.map((occupation) => [occupation.code, occupation]));
const PROFESSION_LAYER_FINAL = professionLayerFinalData as FinalProfessionLayerEntry[];
const PROFESSION_ALIAS_MAP = professionAliasMapData as Record<string, string>;

const INTERNAL_ALIAS_BY_PREFERRED_TITLE = new Map<string, string[]>();
for (const [alias, preferredTitle] of Object.entries(PROFESSION_ALIAS_MAP)) {
  const key = normalizeSearchString(preferredTitle);
  const aliases = INTERNAL_ALIAS_BY_PREFERRED_TITLE.get(key) ?? [];
  aliases.push(normalizeSearchString(alias));
  INTERNAL_ALIAS_BY_PREFERRED_TITLE.set(key, aliases);
}

type MarketTitleSearchIndex = {
  marketTitle: string;
  mappedOccupationCode: string;
  normalizedPreferredTitle: string;
  searchTerms: string[];
  searchPriority: number;
  mappingConfidence: number;
};

export type ProfessionSearchHit = {
  marketTitle: string;
  mappedOccupationCode: string;
  mappingConfidence: number;
  source: string;
  searchPriority: number;
  occupation: OnetOccupation;
  matchConfidence: number;
  matchType: "exact" | "acronym" | "prefix" | "token-prefix";
  rankingScore: number;
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
const MARKET_TITLE_INDEX: MarketTitleSearchIndex[] = PROFESSION_LAYER_FINAL.filter((entry) =>
  OCCUPATION_BY_CODE.has(entry.mappedOccupationCode)
).map((entry) => {
  const normalizedPreferredTitle = normalizeSearchString(entry.marketTitle);
  const aliases = INTERNAL_ALIAS_BY_PREFERRED_TITLE.get(normalizedPreferredTitle) ?? [];
  const aliasTerms = aliases.filter((alias) => alias.length >= 2 && alias.length <= 5);

  return {
    marketTitle: entry.marketTitle,
    mappedOccupationCode: entry.mappedOccupationCode,
    normalizedPreferredTitle,
    searchTerms: [normalizedPreferredTitle, ...aliasTerms],
    searchPriority: entry.searchPriority,
    mappingConfidence: entry.mappingConfidence,
  };
});

const MIN_SEARCH_CONFIDENCE = 0.8;

type RankedMarketTitle = {
  entry: MarketTitleSearchIndex;
  rankingScore: number;
  matchConfidence: number;
  matchType: "exact" | "acronym" | "prefix" | "token-prefix";
};

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

function titleSpecificityBoost(title: string, query: string, tokenCount: number): number {
  const lengthDelta = Math.max(0, title.length - query.length);
  const compactnessBoost = Math.max(0, 0.05 - lengthDelta * 0.0025);
  const tokenBoost = tokenCount === 1 ? 0.08 : Math.max(0, 0.04 - (tokenCount - 2) * 0.01);
  return compactnessBoost + tokenBoost;
}

function rankMarketTitle(entry: MarketTitleSearchIndex, query: string): RankedMarketTitle | null {
  const q = normalizeSearchString(query);
  if (!q) return null;

  const compactQuery = q.replace(/\s+/g, "");
  const isAcronymStyleQuery = compactQuery.length <= 4 && !q.includes(" ");
  let bestMatchType: RankedMarketTitle["matchType"] | null = null;
  let bestRelevanceScore = 0;

  for (const term of entry.searchTerms) {
    const tokens = term.split(/\s+/).filter(Boolean);
    let matchType: RankedMarketTitle["matchType"] | null = null;
    let relevanceScore = 0;

    if (term === q) {
      matchType = term.length <= 5 ? "acronym" : "exact";
      relevanceScore = term.length <= 5 ? 0.97 : 1;
    } else if (!isAcronymStyleQuery && term.startsWith(q)) {
      matchType = "prefix";
      relevanceScore = 0.9 + titleSpecificityBoost(term, q, tokens.length);
    } else if (!isAcronymStyleQuery && tokens.some((token) => token.startsWith(q))) {
      matchType = "token-prefix";
      relevanceScore = 0.72;
    }

    if (matchType && relevanceScore > bestRelevanceScore) {
      bestMatchType = matchType;
      bestRelevanceScore = relevanceScore;
    }
  }

  // For acronym-like queries (e.g. CTO), only exact acronym/title matches are trusted.
  if (!bestMatchType) {
    return null;
  }
  if (isAcronymStyleQuery && bestMatchType !== "exact" && bestMatchType !== "acronym") {
    return null;
  }

  const priorityBoost = Math.min(entry.searchPriority, 100) / 5000;
  const mappingBoost = entry.mappingConfidence / 100;
  const matchConfidence = clamp(bestRelevanceScore * 0.96 + priorityBoost + mappingBoost);
  const rankingScore = Math.round(matchConfidence * 10000);

  if (matchConfidence < MIN_SEARCH_CONFIDENCE) {
    return null;
  }

  return {
    entry,
    rankingScore,
    matchConfidence,
    matchType: bestMatchType,
  };
}

function dedupeByMarketTitle(items: RankedMarketTitle[]): RankedMarketTitle[] {
  const byOccupation = new Map<string, RankedMarketTitle>();

  for (const item of items) {
    const key = item.entry.mappedOccupationCode;
    const existing = byOccupation.get(key);
    if (!existing || item.rankingScore > existing.rankingScore) {
      byOccupation.set(key, item);
    }
  }

  return [...byOccupation.values()];
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

  return dedupeByMarketTitle(
    MARKET_TITLE_INDEX.map((entry) => rankMarketTitle(entry, normalizedQuery)).filter(
      (item): item is RankedMarketTitle => Boolean(item)
    )
  )
    .sort(
      (a, b) =>
        b.rankingScore - a.rankingScore ||
        a.entry.marketTitle.localeCompare(b.entry.marketTitle)
    )
    .slice(0, limit)
    .map(({ entry, matchConfidence, matchType, rankingScore }) => ({
      marketTitle: entry.marketTitle,
      mappedOccupationCode: entry.mappedOccupationCode,
      mappingConfidence: entry.mappingConfidence,
      source: "profession-layer-final",
      searchPriority: entry.searchPriority,
      occupation: OCCUPATION_BY_CODE.get(entry.mappedOccupationCode) as OnetOccupation,
      matchConfidence,
      matchType,
      rankingScore,
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
