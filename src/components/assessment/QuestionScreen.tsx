"use client";

import type { Question } from "@/lib/assessment/types";
import {
  ButtonChoices,
  ChoiceCards,
  SliderInput,
} from "./QuestionInput";

type QuestionScreenProps = {
  question: Question;
  value: number | null;
  onChange: (value: number) => void;
  animating: boolean;
};

export function QuestionScreen({
  question,
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
      <div className="mx-auto max-w-2xl">
        <h1 className="text-balance text-center text-[1.42rem] font-semibold leading-[1.32] tracking-[-0.01em] text-foreground sm:text-[1.78rem]">
          {question.text}
        </h1>

        {question.subtitle && (
          <p className="body-text mx-auto mt-3 max-w-xl text-center">
            {question.subtitle}
          </p>
        )}

        <div className="mt-6 pb-2 sm:mt-8 sm:pb-4">
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
    </div>
  );
}
