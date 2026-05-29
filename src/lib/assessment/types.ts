export type QuestionInputType = "slider" | "cards" | "buttons";

export type QuestionOption = {
  label: string;
  description?: string;
  value: number;
};

export type Question = {
  id: string;
  text: string;
  subtitle?: string;
  type: QuestionInputType;
  options?: QuestionOption[];
  sliderLabels?: { min: string; max: string };
  sliderSteps?: number;
};

export type Answers = Record<string, number>;

export type NarrativeCard = {
  title: string;
  description: string;
};

export type RiasecType =
  | "Realistic"
  | "Investigative"
  | "Artistic"
  | "Social"
  | "Enterprising"
  | "Conventional";

export type RiasecProfile = {
  primaryType: RiasecType;
  secondaryType: RiasecType;
  scores: Record<RiasecType, number>;
  explanation: string;
  confidenceLevel: "emerging" | "moderate" | "high";
};

export type IlonaaRiskIndex = {
  score: number;
  explanation: string;
  components: {
    aiExposure: number;
    inverseResilience: number;
    industryChange: number;
    aiCapableToday: number;
    repetitiveTasks: number;
  };
};

export type AssessmentResult = {
  riasecProfile: RiasecProfile;
  ilonaaRiskIndex: IlonaaRiskIndex;
  aiExposureScore: number;
  careerResilienceScore: number;
  positioningSummary: string;
  positioningDimensions: {
    id: string;
    label: string;
    value: number;
    insight: string;
  }[];
  humanAdvantageFactors: NarrativeCard[];
  keyRiskDrivers: NarrativeCard[];
  recommendedNextMoves: NarrativeCard[];
  modelDistinctionNarrative: string;
  benchmarkNarrative: string;
  summary: string;
  answers: Answers;
  completedAt: string;
};

export const STORAGE_KEY = "ilonaa-assessment-results";
