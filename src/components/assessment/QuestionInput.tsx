"use client";

import { cn } from "@/lib/utils";
import {
  sliderValueFromStep,
  stepFromSliderValue,
} from "@/lib/assessment/questions";

type SliderInputProps = {
  value: number | null;
  onChange: (value: number) => void;
  minLabel: string;
  maxLabel: string;
  steps?: number;
};

export function SliderInput({
  value,
  onChange,
  minLabel,
  maxLabel,
  steps = 5,
}: SliderInputProps) {
  const currentStep = value === null ? 3 : stepFromSliderValue(value, steps);
  const displayValue = value ?? sliderValueFromStep(currentStep, steps);
  const fillPercent = displayValue;

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-accent-light/40 px-5 py-6 sm:px-6">
        <div className="relative px-1 py-2">
          <div
            className="pointer-events-none absolute inset-x-1 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-black/[0.06]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute left-1 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-accent/35 transition-all duration-300"
            style={{ width: `calc(${fillPercent}% - 8px)` }}
            aria-hidden="true"
          />
          <input
            type="range"
            min={1}
            max={steps}
            step={1}
            value={currentStep}
            onChange={(event) =>
              onChange(sliderValueFromStep(Number(event.target.value), steps))
            }
            className="slider-elegant"
            aria-valuemin={1}
            aria-valuemax={steps}
            aria-valuenow={currentStep}
          />
        </div>

        <div className="mt-6 flex items-start justify-between gap-4 text-sm leading-snug text-muted">
          <span className="max-w-[44%] text-left">{minLabel}</span>
          <span className="max-w-[44%] text-right">{maxLabel}</span>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="inline-flex items-baseline gap-1.5 rounded-full border border-black/[0.05] bg-white/80 px-5 py-2.5 shadow-sm">
          <span className="font-display text-2xl tabular-nums text-foreground">
            {displayValue}
          </span>
          <span className="text-sm text-muted/70">/ 100</span>
        </div>
      </div>
    </div>
  );
}

type ChoiceCardsProps = {
  options: { label: string; description?: string; value: number }[];
  value: number | null;
  onChange: (value: number) => void;
};

export function ChoiceCards({ options, value, onChange }: ChoiceCardsProps) {
  return (
    <div className="grid gap-3">
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <button
            key={option.label}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "choice-option px-5 py-4",
              selected
                ? "border-accent/25 bg-white shadow-[0_4px_24px_-8px_rgba(74,98,116,0.18)]"
                : "border-black/[0.06] bg-white/60 hover:border-accent/15 hover:bg-white/90"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p
                  className={cn(
                    "text-[15px] font-medium leading-snug",
                    selected ? "text-foreground" : "text-foreground/90"
                  )}
                >
                  {option.label}
                </p>
                {option.description && (
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    {option.description}
                  </p>
                )}
              </div>
              <span
                className={cn(
                  "mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-colors",
                  selected
                    ? "border-accent bg-accent"
                    : "border-black/10 bg-white"
                )}
                aria-hidden="true"
              >
                {selected && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

type ButtonChoicesProps = {
  options: { label: string; value: number }[];
  value: number | null;
  onChange: (value: number) => void;
};

export function ButtonChoices({ options, value, onChange }: ButtonChoicesProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <button
            key={option.label}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "choice-option px-5 py-4 text-center text-[15px] font-medium sm:text-left",
              selected
                ? "border-accent bg-accent text-white shadow-[0_4px_16px_-4px_rgba(74,98,116,0.35)]"
                : "border-black/[0.06] bg-white/70 text-foreground hover:border-accent/15 hover:bg-white"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
