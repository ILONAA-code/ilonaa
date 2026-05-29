import type { Question } from "./types";

export const QUESTIONS: Question[] = [
  {
    id: "repetitive-tasks",
    text: "How repetitive are your daily tasks?",
    subtitle: "Think about how predictable your typical work routines feel.",
    type: "slider",
    sliderLabels: { min: "Varied & dynamic", max: "Highly repetitive" },
    sliderSteps: 11,
  },
  {
    id: "human-interaction",
    text: "How much human interaction does your work require?",
    subtitle: "Consider conversations, collaboration, and interpersonal nuance.",
    type: "cards",
    options: [
      { label: "Minimal", description: "Mostly independent or async work", value: 20 },
      { label: "Moderate", description: "Regular touchpoints with others", value: 45 },
      { label: "Significant", description: "Collaboration is central to outcomes", value: 70 },
      { label: "Essential", description: "Relationships drive the work", value: 95 },
    ],
  },
  {
    id: "creativity",
    text: "How important is creativity in your role?",
    subtitle: "Original thinking, ideation, and novel approaches.",
    type: "slider",
    sliderLabels: { min: "Not important", max: "Critically important" },
    sliderSteps: 11,
  },
  {
    id: "strategic-decision",
    text: "How much strategic decision-making is involved?",
    subtitle: "Long-term thinking, trade-offs, and direction-setting.",
    type: "buttons",
    options: [
      { label: "Rarely", value: 20 },
      { label: "Sometimes", value: 45 },
      { label: "Often", value: 70 },
      { label: "Constantly", value: 95 },
    ],
  },
  {
    id: "specialized-expertise",
    text: "How dependent is your work on specialized expertise?",
    subtitle: "Depth of knowledge that takes time to develop.",
    type: "cards",
    options: [
      { label: "General skills", description: "Broad, transferable capabilities", value: 25 },
      { label: "Some specialization", description: "Focused but learnable domain", value: 45 },
      { label: "Deep expertise", description: "Years of focused development", value: 70 },
      { label: "Rare expertise", description: "Difficult to replicate knowledge", value: 95 },
    ],
  },
  {
    id: "ai-capable-today",
    text: "Could AI already perform parts of your work today?",
    subtitle: "Be honest about what tools could assist or replace tasks now.",
    type: "buttons",
    options: [
      { label: "Not yet", value: 15 },
      { label: "A few tasks", value: 40 },
      { label: "Many tasks", value: 65 },
      { label: "Significant portions", value: 85 },
    ],
  },
  {
    id: "trust-relationships",
    text: "How important is trust and relationship-building in your role?",
    subtitle: "Credibility, empathy, and sustained human connection.",
    type: "slider",
    sliderLabels: { min: "Not important", max: "Essential" },
    sliderSteps: 11,
  },
  {
    id: "industry-change",
    text: "How quickly is AI changing your industry?",
    subtitle: "The pace of transformation around you.",
    type: "cards",
    options: [
      { label: "Barely noticeable", description: "Change is slow or distant", value: 15 },
      { label: "Gradual shift", description: "Steady evolution over time", value: 40 },
      { label: "Noticeable acceleration", description: "Clear momentum building", value: 65 },
      { label: "Rapid transformation", description: "Industry is shifting quickly", value: 90 },
    ],
  },
  {
    id: "adaptability",
    text: "How adaptable are you to learning new tools?",
    subtitle: "Your openness to evolving how you work.",
    type: "buttons",
    options: [
      { label: "Prefer familiar tools", value: 25 },
      { label: "Open when needed", value: 50 },
      { label: "Enjoy learning", value: 75 },
      { label: "Actively seek new tools", value: 95 },
    ],
  },
  {
    id: "personal-judgment",
    text: "How much personal judgment is required in your work?",
    subtitle: "Context, nuance, and decisions only you can make.",
    type: "slider",
    sliderLabels: { min: "Very little", max: "A great deal" },
    sliderSteps: 11,
  },
];

export function sliderValueFromStep(step: number, steps: number): number {
  if (steps <= 1) return 50;
  return Math.round(((step - 1) / (steps - 1)) * 100);
}

export function stepFromSliderValue(value: number, steps: number): number {
  if (steps <= 1) return 1;
  return Math.round((value / 100) * (steps - 1)) + 1;
}
