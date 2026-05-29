import occupationsData from "@/data/onetOccupations.json";
import type { OnetOccupation, SelectedProfession } from "./onetTypes";

const OCCUPATIONS = occupationsData as OnetOccupation[];

type OccupationSearchIndex = {
  occupation: OnetOccupation;
  normalizedTitle: string;
  normalizedAliasTerms: string[];
};

function normalizeSearchString(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[^\w\s&/+-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function getSearchTerms(occupation: OnetOccupation): string[] {
  const merged = new Set<string>([occupation.title, ...occupation.alternateTitles]);
  for (const term of occupation.searchTerms ?? []) {
    merged.add(term);
  }
  return [...merged];
}

const OCCUPATION_INDEX: OccupationSearchIndex[] = OCCUPATIONS.map((occupation) => {
  const normalizedTitle = normalizeSearchString(occupation.title);
  const normalizedAliasTerms = getSearchTerms(occupation)
    .map(normalizeSearchString)
    .filter((term) => Boolean(term) && term !== normalizedTitle);

  return {
    occupation,
    normalizedTitle,
    normalizedAliasTerms,
  };
});

function toSelectedProfession(occupation: OnetOccupation): SelectedProfession {
  return {
    code: occupation.code,
    title: occupation.title,
    primaryRiasecType: occupation.primaryRiasecType,
    secondaryRiasecType: occupation.secondaryRiasecType,
    baselineAiExposure: occupation.baseline.baselineAiExposure,
    baselineCareerResilience: occupation.baseline.baselineCareerResilience,
    baselineRiskIndex: occupation.baseline.baselineRiskIndex,
    keyOccupationalFactors: occupation.factors,
  };
}

function rankOccupation(indexEntry: OccupationSearchIndex, query: string): number {
  const q = normalizeSearchString(query);
  if (!q) return 0;

  const title = indexEntry.normalizedTitle;
  const aliases = indexEntry.normalizedAliasTerms;

  if (title === q) return 1000;
  if (title.startsWith(q)) return 900;

  if (aliases.some((alias) => alias === q)) return 800;
  if (aliases.some((alias) => alias.startsWith(q))) return 750;

  if (title.includes(q)) return 700;
  if (aliases.some((alias) => alias.includes(q))) return 650;

  return 0;
}

export function getAllOccupations(): OnetOccupation[] {
  return OCCUPATIONS;
}

export function searchOccupations(query: string, limit = 20): OnetOccupation[] {
  const normalizedQuery = normalizeSearchString(query);
  if (normalizedQuery.length < 2) return [];

  return OCCUPATION_INDEX
    .map((entry) => ({
      occupation: entry.occupation,
      score: rankOccupation(entry, normalizedQuery),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.occupation.title.localeCompare(b.occupation.title))
    .slice(0, limit)
    .map((entry) => entry.occupation);
}

export function getOccupationByCode(code: string): OnetOccupation | null {
  return OCCUPATIONS.find((occupation) => occupation.code === code) ?? null;
}

export function toProfessionSelection(occupation: OnetOccupation): SelectedProfession {
  return toSelectedProfession(occupation);
}
