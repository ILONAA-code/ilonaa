import occupationsData from "@/data/onetOccupations.json";
import type { OnetOccupation, SelectedProfession } from "./onetTypes";

const OCCUPATIONS = occupationsData as OnetOccupation[];

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

function rankOccupation(occupation: OnetOccupation, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;

  const title = occupation.title.toLowerCase();
  const alternates = occupation.alternateTitles.map((item) => item.toLowerCase());

  if (title === q) return 1000;
  if (title.startsWith(q)) return 900;
  if (title.includes(q)) return 700;

  for (const alt of alternates) {
    if (alt === q) return 800;
    if (alt.startsWith(q)) return 650;
    if (alt.includes(q)) return 550;
  }

  const queryTerms = q.split(/\s+/).filter(Boolean);
  const titleTerms = title.split(/\s+/);
  const overlap = queryTerms.filter((term) =>
    titleTerms.some((t) => t.startsWith(term))
  ).length;

  if (overlap > 0) return 300 + overlap * 20;

  return 0;
}

export function getAllOccupations(): OnetOccupation[] {
  return OCCUPATIONS;
}

export function searchOccupations(query: string, limit = 10): OnetOccupation[] {
  if (!query.trim()) return OCCUPATIONS.slice(0, limit);

  return [...OCCUPATIONS]
    .map((occupation) => ({
      occupation,
      score: rankOccupation(occupation, query),
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
