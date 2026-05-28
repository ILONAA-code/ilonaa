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

export type AssessmentResult = {
  aiExposureScore: number;
  careerResilienceScore: number;
  profile: {
    archetypeId: string;
    archetypeTitle: string;
    archetypeTagline: string;
    profileEssence: string;
    profileSummary: string;
    resilienceFraming: string;
    comparativeContext: string;
  };
  positioningSummary: string;
  positioningDimensions: {
    id: string;
    label: string;
    value: number;
    insight: string;
  }[];
  heroHeadline: string;
  heroNarrative: string;
  keyStrengths: NarrativeCard[];
  exposureAreas: NarrativeCard[];
  resilienceRecommendations: NarrativeCard[];
  benchmarkNarrative: string;
  summary: string;
  answers: Answers;
  completedAt: string;
};

export const STORAGE_KEY = "ilonaa-assessment-results";
