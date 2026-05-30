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

type CorrectionCandidate = {
  occupationCode: string;
  term: string;
  normalizedTerm: string;
  source: SearchEntry["source"];
  alias?: string;
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

function matchTypePriority(matchType: RankedOccupation["matchType"]): number {
  if (matchType === "canonical_title") return 3;
  if (matchType === "ilonaa_alias") return 2;
  return 1;
}

function damerauLevenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix: number[][] = Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );

      if (
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + 1);
      }
    }
  }

  return matrix[a.length][b.length];
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
      matchTypePriority(b.matchType) - matchTypePriority(a.matchType) ||
      a.occupation.title.localeCompare(b.occupation.title)
  );
}

const CORRECTION_CANDIDATES: CorrectionCandidate[] = (() => {
  const seen = new Set<string>();
  const candidates: CorrectionCandidate[] = [];

  for (const entry of SEARCH_ENTRIES) {
    if (entry.normalizedTerm.length < 4) continue;
    const occupation = OCCUPATION_BY_CODE.get(entry.occupationCode);
    if (!occupation) continue;

    const term = entry.alias?.trim() || occupation.title.trim();
    if (!term) continue;

    const key = `${entry.occupationCode}::${entry.normalizedTerm}`;
    if (seen.has(key)) continue;
    seen.add(key);

    candidates.push({
      occupationCode: entry.occupationCode,
      term,
      normalizedTerm: entry.normalizedTerm,
      source: entry.source,
      alias: entry.alias,
    });
  }

  return candidates;
})();

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

export function suggestProfessionCorrection(query: string): ProfessionSearchHit | null {
  const normalizedQuery = normalizeSearchString(query);
  if (normalizedQuery.length < 4) return null;

  const currentTop = searchOccupations(query, 1)[0];
  if (currentTop && currentTop.matchConfidence >= 0.85) return null;

  const queryTokenCount = tokenize(normalizedQuery).length;

  const scored = CORRECTION_CANDIDATES.map((candidate) => {
    const distance = damerauLevenshtein(normalizedQuery, candidate.normalizedTerm);
    const maxLength = Math.max(normalizedQuery.length, candidate.normalizedTerm.length);
    const similarity = maxLength === 0 ? 0 : 1 - distance / maxLength;
    const tokenDelta = Math.abs(tokenize(candidate.normalizedTerm).length - queryTokenCount);
    return { candidate, distance, similarity, tokenDelta };
  })
    .filter((row) => row.distance <= 2 && row.similarity >= 0.82 && row.tokenDelta <= 1)
    .sort(
      (a, b) =>
        b.similarity - a.similarity ||
        a.distance - b.distance ||
        (a.candidate.alias ? -1 : 1) - (b.candidate.alias ? -1 : 1)
    );

  if (scored.length === 0) return null;
  const best = scored[0];
  const runnerUp = scored[1];
  if (best.similarity < 0.86) return null;
  if (runnerUp && best.similarity - runnerUp.similarity < 0.05) return null;

  const resolved =
    searchOccupations(best.candidate.term, 5).find(
      (result) => result.mappedOccupationCode === best.candidate.occupationCode
    ) ?? null;

  if (resolved) {
    return {
      ...resolved,
      marketTitle: best.candidate.term,
      matchedAlias: best.candidate.alias ?? resolved.matchedAlias,
    };
  }

  const occupation = OCCUPATION_BY_CODE.get(best.candidate.occupationCode);
  if (!occupation) return null;

  return {
    marketTitle: best.candidate.term,
    mappedOccupationCode: occupation.code,
    mappingConfidence: Number(best.similarity.toFixed(2)),
    source: best.candidate.source,
    searchPriority: Math.round(best.similarity * 100),
    occupation,
    matchConfidence: Number(best.similarity.toFixed(3)),
    matchType:
      best.candidate.source === "original_onet_title"
        ? "canonical_title"
        : best.candidate.source === "ilonaa_alias"
          ? "ilonaa_alias"
          : "onet_alias",
    rankingScore: Math.round(best.similarity * 10000),
    matchedAlias: best.candidate.alias,
  };
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
