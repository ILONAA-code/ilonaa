import type { Question } from "./types";

export const QUESTIONS: Question[] = [
  {
    id: "ai-tools-usage",
    text: "How often do you use AI tools in your work today?",
    type: "buttons",
    options: [
      { label: "Never or almost never", value: 0 },
      { label: "Occasionally", value: 25 },
      { label: "Regularly", value: 50 },
      { label: "Daily", value: 75 },
      { label: "AI is central to how I work", value: 100 },
    ],
  },
  {
    id: "tool-learning-speed",
    text: "How quickly do you learn new digital tools?",
    type: "buttons",
    options: [
      { label: "Slowly", value: 20 },
      { label: "Somewhat slowly", value: 40 },
      { label: "About average", value: 60 },
      { label: "Quickly", value: 80 },
      { label: "Very quickly", value: 100 },
    ],
  },
  {
    id: "human-uniqueness",
    text: "How much of your work depends on uniquely human strengths?",
    type: "buttons",
    options: [
      { label: "Very little", value: 20 },
      { label: "Some", value: 40 },
      { label: "A balanced mix", value: 60 },
      { label: "A lot", value: 80 },
      { label: "Almost all of it", value: 100 },
    ],
  },
  {
    id: "decision-consequence",
    text: "What could happen if a critical decision in your role goes wrong?",
    subtitle:
      "Choose the most serious realistic consequence — not the worst imaginable disaster.",
    type: "cards",
    options: [
      {
        label: "Minor friction",
        description: "Small delays, rework, or inconvenience.",
        value: 20,
      },
      {
        label: "Business impact",
        description: "Customer issues, project delays, or noticeable cost.",
        value: 40,
      },
      {
        label: "Major financial impact",
        description: "Large losses, failed contracts, or serious business damage.",
        value: 60,
      },
      {
        label: "Legal or compliance impact",
        description: "Audit findings, penalties, legal exposure, or regulatory issues.",
        value: 80,
      },
      {
        label: "Health or safety impact",
        description: "Potential harm to people, patients, users, or the public.",
        value: 100,
      },
    ],
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
