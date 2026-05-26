"use client";

import type { Question } from "@/lib/assessment/types";
import {
  ButtonChoices,
  ChoiceCards,
  SliderInput,
} from "./QuestionInput";

type QuestionScreenProps = {
  question: Question;
  questionNumber: number;
  value: number | null;
  onChange: (value: number) => void;
  animating: boolean;
};

export function QuestionScreen({
  question,
  questionNumber,
  value,
  onChange,
  animating,
}: QuestionScreenProps) {
  return (
    <div
      className={`transition-all duration-300 ${
        animating ? "animate-question-out" : "animate-question-in"
      }`}
    >
      <p className="section-label">
        Question {String(questionNumber).padStart(2, "0")}
      </p>

      <h1 className="display-subhead mt-4 text-balance">
        {question.text}
      </h1>

      {question.subtitle && (
        <p className="body-text mt-4 max-w-lg">
          {question.subtitle}
        </p>
      )}

      <div className="mt-8 sm:mt-10">
        {question.type === "slider" && question.sliderLabels && (
          <SliderInput
            value={value}
            onChange={onChange}
            minLabel={question.sliderLabels.min}
            maxLabel={question.sliderLabels.max}
            steps={question.sliderSteps}
          />
        )}

        {question.type === "cards" && question.options && (
          <ChoiceCards
            options={question.options}
            value={value}
            onChange={onChange}
          />
        )}

        {question.type === "buttons" && question.options && (
          <ButtonChoices
            options={question.options}
            value={value}
            onChange={onChange}
          />
        )}
      </div>
    </div>
  );
}
