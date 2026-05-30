import occupationsData from "@/data/onetOccupations.json";
import ilonaaAliasesData from "@/data/ilonaaOccupationAliases.json";
import type { OnetOccupation, SelectedProfession } from "./onetTypes";

type SearchEntry = {
  occupationCode: string;
  canonicalTitle: string;
  normalizedTerm: string;
  normalizedTokens: string[];
  source: "original_onet_title" | "onet_alias" | "ilonaa_alias";
  alias?: string;
};

export type ProfessionSearchHit = {
  marketTitle: string;
  mappedOccupationCode: string;
  mappingConfidence: number;
  source: "original_onet_title" | "onet_alias" | "ilonaa_alias";
  searchPriority: number;
  occupation: OnetOccupation;
  matchConfidence: number;
  matchType: "canonical_title" | "onet_alias" | "ilonaa_alias";
  rankingScore: number;
  matchedAlias?: string;
};

export type ProfessionSearchCandidateDebug = {
  displayTitle: string;
  canonicalOnetTitle: string;
  onetCode: string;
  matchType: "canonical_title" | "onet_alias" | "ilonaa_alias";
  matchedAlias: string | null;
  confidenceScore: number;
  resultSource: "original_onet_title" | "onet_alias" | "ilonaa_alias";
  riasecPrimary: OnetOccupation["primaryRiasecType"];
  riasecSecondary: OnetOccupation["secondaryRiasecType"];
};

export type ProfessionSearchDebugResult = {
  rawInput: string;
  normalizedInput: string;
  bestDisplayTitle: string | null;
  canonicalOnetTitle: string | null;
  onetCode: string | null;
  matchType: "canonical_title" | "onet_alias" | "ilonaa_alias" | "no_match";
  matchedAlias: string | null;
  confidenceScore: number;
  topCandidates: ProfessionSearchCandidateDebug[];
  resultSource: "original_onet_title" | "onet_alias" | "ilonaa_alias" | "no_match";
  noConfidentMatch: boolean;
  riasecPrimary: OnetOccupation["primaryRiasecType"] | null;
  riasecSecondary: OnetOccupation["secondaryRiasecType"] | null;
};

type RankedOccupation = {
  occupation: OnetOccupation;
  matchType: "canonical_title" | "onet_alias" | "ilonaa_alias";
  source: "original_onet_title" | "onet_alias" | "ilonaa_alias";
  matchedAlias?: string;
  score: number;
  confidence: number;
};

const OCCUPATIONS = occupationsData as OnetOccupation[];
const OCCUPATION_BY_CODE = new Map(OCCUPATIONS.map((occupation) => [occupation.code, occupation]));
const ILONAA_ALIASES = ilonaaAliasesData as Array<{ alias: string; onetCode: string }>;
const ILONAA_ALIASES_BY_CODE = new Map<string, string[]>();
for (const item of ILONAA_ALIASES) {
  if (!OCCUPATION_BY_CODE.has(item.onetCode)) continue;
  const list = ILONAA_ALIASES_BY_CODE.get(item.onetCode) ?? [];
  list.push(item.alias.trim());
  ILONAA_ALIASES_BY_CODE.set(item.onetCode, list);
}

const MIN_SEARCH_CONFIDENCE = 0.58;
const TOKEN_OVERLAP_MIN_CONFIDENCE = 0.67;

function singularizeToken(token: string): string {
  if (token.length <= 4) return token;
  if (token.endsWith("ss") || token.endsWith("is") || token.endsWith("us")) return token;
  if (token.endsWith("ies") && token.length > 5) return `${token.slice(0, -3)}y`;
  if (token.endsWith("s")) return token.slice(0, -1);
  return token;
}

function normalizeSearchString(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[^\w\s]/g, " ")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map(singularizeToken)
    .join(" ")
    .trim();
}

function tokenize(input: string): string[] {
  return input.split(/\s+/).filter(Boolean);
}

function safeTokenPrefixMatch(termToken: string, queryToken: string): boolean {
  if (termToken === queryToken) return true;
  if (!termToken.startsWith(queryToken)) return false;
  return termToken.length - queryToken.length <= 2;
}

const SEARCH_ENTRIES: SearchEntry[] = OCCUPATIONS.flatMap((occupation) => {
  const canonicalNormalized = normalizeSearchString(occupation.title);
  const aliasSet = new Set<string>();

  for (const alias of occupation.alternateTitles ?? []) {
    const normalized = normalizeSearchString(alias);
    if (!normalized || normalized === canonicalNormalized) continue;
    aliasSet.add(alias.trim());
  }

  for (const term of occupation.searchTerms ?? []) {
    const normalized = normalizeSearchString(term);
    if (!normalized || normalized === canonicalNormalized) continue;
    aliasSet.add(term.trim());
  }

  for (const alias of ILONAA_ALIASES_BY_CODE.get(occupation.code) ?? []) {
    const normalized = normalizeSearchString(alias);
    if (!normalized || normalized === canonicalNormalized) continue;
    aliasSet.add(alias.trim());
  }

  const aliasEntries: SearchEntry[] = [...aliasSet].map((alias) => {
    const normalizedAlias = normalizeSearchString(alias);
    const curatedForOccupation = (ILONAA_ALIASES_BY_CODE.get(occupation.code) ?? []).includes(alias);
    return {
      occupationCode: occupation.code,
      canonicalTitle: occupation.title,
      normalizedTerm: normalizedAlias,
      normalizedTokens: tokenize(normalizedAlias),
      source: curatedForOccupation ? "ilonaa_alias" : "onet_alias",
      alias,
    };
  });

  return [
    {
      occupationCode: occupation.code,
      canonicalTitle: occupation.title,
      normalizedTerm: canonicalNormalized,
      normalizedTokens: tokenize(canonicalNormalized),
      source: "original_onet_title",
    } satisfies SearchEntry,
    ...aliasEntries,
  ];
});

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

function rankEntry(queryNormalized: string, queryTokens: string[], entry: SearchEntry): RankedOccupation | null {
  const occupation = OCCUPATION_BY_CODE.get(entry.occupationCode);
  if (!occupation) return null;

  const isCanonical = entry.source === "original_onet_title";
  const termTokens = entry.normalizedTokens;
  const term = entry.normalizedTerm;

  let score = 0;
  let matchType: "canonical_title" | "onet_alias" | "ilonaa_alias" = isCanonical
    ? "canonical_title"
    : entry.source === "ilonaa_alias"
      ? "ilonaa_alias"
      : "onet_alias";
  let matched = false;

  if (term === queryNormalized) {
    score = isCanonical ? 1.0 : 0.95;
    matched = true;
  } else if (term.startsWith(queryNormalized)) {
    score = isCanonical ? 0.88 : 0.84;
    matched = true;
  } else {
    const tokenPrefixMatches = queryTokens.filter((queryToken) =>
      termTokens.some((token) => safeTokenPrefixMatch(token, queryToken))
    ).length;

    if (tokenPrefixMatches === queryTokens.length && queryTokens.length > 0) {
      score = isCanonical ? 0.74 : 0.7;
      matched = true;
    } else {
      const overlap = queryTokens.filter((queryToken) => termTokens.includes(queryToken)).length;
      const overlapRatio = queryTokens.length > 0 ? overlap / queryTokens.length : 0;
      if (overlap >= 2 && overlapRatio >= 0.75) {
        score = isCanonical ? 0.66 : 0.62;
        matched = true;
      }
    }
  }

  if (!matched) return null;

  const lengthPenalty = Math.min(0.14, Math.abs(term.length - queryNormalized.length) * 0.008);
  const confidence = clamp(score - lengthPenalty);
  const minimumConfidence =
    score <= 0.66 ? TOKEN_OVERLAP_MIN_CONFIDENCE : MIN_SEARCH_CONFIDENCE;

  if (confidence < minimumConfidence) return null;

  return {
    occupation,
    matchType,
    source: entry.source,
    matchedAlias: entry.alias,
    score,
    confidence,
  };
}

function rankOccupations(query: string): RankedOccupation[] {
  const normalizedQuery = normalizeSearchString(query);
  if (normalizedQuery.length < 2) return [];
  const queryTokens = tokenize(normalizedQuery);

  const bestByCode = new Map<string, RankedOccupation>();
  for (const entry of SEARCH_ENTRIES) {
    const ranked = rankEntry(normalizedQuery, queryTokens, entry);
    if (!ranked) continue;
    const current = bestByCode.get(ranked.occupation.code);
    if (!current || ranked.confidence > current.confidence || ranked.score > current.score) {
      bestByCode.set(ranked.occupation.code, ranked);
    }
  }

  return [...bestByCode.values()].sort(
    (a, b) =>
      b.confidence - a.confidence ||
      b.score - a.score ||
      a.occupation.title.localeCompare(b.occupation.title)
  );
}

function toSelectedProfession(occupation: OnetOccupation, displayTitle?: string): SelectedProfession {
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
  return rankOccupations(query)
    .slice(0, limit)
    .map((ranked) => ({
      marketTitle: ranked.occupation.title,
      mappedOccupationCode: ranked.occupation.code,
      mappingConfidence: Number(ranked.confidence.toFixed(2)),
      source: ranked.source,
      searchPriority: Math.round(ranked.confidence * 100),
      occupation: ranked.occupation,
      matchConfidence: Number(ranked.confidence.toFixed(3)),
      matchType: ranked.matchType,
      rankingScore: Math.round(ranked.confidence * 10000),
      matchedAlias: ranked.matchedAlias,
    }));
}

export function debugProfessionSearch(query: string): ProfessionSearchDebugResult {
  const normalizedQuery = normalizeSearchString(query);
  const ranked = rankOccupations(query).slice(0, 5);

  if (ranked.length === 0) {
    return {
      rawInput: query,
      normalizedInput: normalizedQuery,
      bestDisplayTitle: null,
      canonicalOnetTitle: null,
      onetCode: null,
      matchType: "no_match",
      matchedAlias: null,
      confidenceScore: 0,
      topCandidates: [],
      resultSource: "no_match",
      noConfidentMatch: true,
      riasecPrimary: null,
      riasecSecondary: null,
    };
  }

  const topCandidates: ProfessionSearchCandidateDebug[] = ranked.map((row) => ({
    displayTitle: row.occupation.title,
    canonicalOnetTitle: row.occupation.title,
    onetCode: row.occupation.code,
    matchType: row.matchType,
    matchedAlias: row.matchedAlias ?? null,
    confidenceScore: Number(row.confidence.toFixed(3)),
    resultSource: row.source,
    riasecPrimary: row.occupation.primaryRiasecType,
    riasecSecondary: row.occupation.secondaryRiasecType,
  }));

  const best = topCandidates[0];
  return {
    rawInput: query,
    normalizedInput: normalizedQuery,
    bestDisplayTitle: best.displayTitle,
    canonicalOnetTitle: best.canonicalOnetTitle,
    onetCode: best.onetCode,
    matchType: best.matchType,
    matchedAlias: best.matchedAlias,
    confidenceScore: best.confidenceScore,
    topCandidates,
    resultSource: best.resultSource,
    noConfidentMatch: false,
    riasecPrimary: best.riasecPrimary,
    riasecSecondary: best.riasecSecondary,
  };
}

export function getOccupationByCode(code: string): OnetOccupation | null {
  return OCCUPATION_BY_CODE.get(code) ?? null;
}

export function toProfessionSelection(occupation: OnetOccupation, displayTitle?: string): SelectedProfession {
  return toSelectedProfession(occupation, displayTitle);
}
