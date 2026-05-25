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

export type AssessmentResult = {
  aiExposureScore: number;
  careerResilienceScore: number;
  insights: string[];
  protectionFactors: string[];
  futureProofSkills: string[];
  summary: string;
  answers: Answers;
  completedAt: string;
};

export const STORAGE_KEY = "ilonaa-assessment-results";
