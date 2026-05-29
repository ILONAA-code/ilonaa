import type { RiasecType, SelectedProfession as BaseSelectedProfession } from "./types";

export type OnetRiasecScores = Record<RiasecType, number>;

export type OnetOccupationFactors = {
  routineRepetitive: number;
  informationProcessing: number;
  dataAnalysis: number;
  administrativeStructure: number;
  humanInteraction: number;
  creativityInnovation: number;
  decisionJudgment: number;
  consequenceResponsibility: number;
  physicalPracticality: number;
  adaptabilityLearning: number;
};

export type OnetOccupationBaseline = {
  baselineAiExposure: number;
  baselineCareerResilience: number;
  baselineRiskIndex: number;
};

export type OnetOccupation = {
  code: string;
  title: string;
  alternateTitles: string[];
  description: string;
  riasecScores: OnetRiasecScores;
  primaryRiasecType: RiasecType;
  secondaryRiasecType: RiasecType;
  workActivities: string[];
  workStyles: string[];
  skills: string[];
  abilities: string[];
  workContext: string[];
  factors: OnetOccupationFactors;
  baseline: OnetOccupationBaseline;
};

export type SelectedProfession = BaseSelectedProfession;
