"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProgressBar } from "@/components/assessment/ProgressBar";
import { ProfessionSelect } from "@/components/assessment/ProfessionSelect";
import { QuestionScreen } from "@/components/assessment/QuestionScreen";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { analytics } from "@/lib/analytics/events";
import { QUESTIONS } from "@/lib/assessment/questions";
import { calculateResults, saveResults } from "@/lib/assessment/scoring";
import type { Answers } from "@/lib/assessment/types";
import type { OnetOccupation } from "@/lib/assessment/onetTypes";
import { toProfessionSelection } from "@/lib/assessment/occupations";

export function AssessmentFlow() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [answers, setAnswers] = useState<Answers>({});
  const [selectedOccupation, setSelectedOccupation] = useState<OnetOccupation | null>(
    null
  );
  const [animating, setAnimating] = useState(false);
  const [completing, setCompleting] = useState(false);
  const startedTracked = useRef(false);
  const questionShownAt = useRef(Date.now());
  const completedRef = useRef(false);
  const abandonedSent = useRef(false);

  const question = currentIndex >= 0 ? QUESTIONS[currentIndex] : null;
  const currentValue = question ? answers[question.id] ?? null : null;
  const isLastQuestion = currentIndex === QUESTIONS.length - 1;

  useEffect(() => {
    if (startedTracked.current) return;
    analytics.assessmentStarted();
    startedTracked.current = true;
  }, []);

  useEffect(() => {
    if (!question) return;
    questionShownAt.current = Date.now();
  }, [question]);

  const reportAbandonment = useCallback(() => {
    if (completedRef.current || abandonedSent.current || completing) return;
    abandonedSent.current = true;
    analytics.assessmentAbandoned(currentIndex + 1);
  }, [currentIndex, completing]);

  useEffect(() => {
    const handlePageHide = () => reportAbandonment();
    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, [reportAbandonment]);

  const transitionTo = useCallback((nextIndex: number) => {
    setAnimating(true);
    window.setTimeout(() => {
      setCurrentIndex(nextIndex);
      setAnimating(false);
    }, 280);
  }, []);

  const handleChange = (value: number) => {
    if (!question) return;
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const handleBack = () => {
    if (currentIndex > -1) {
      analytics.backButtonUsed(Math.max(currentIndex + 1, 1));
      transitionTo(currentIndex - 1);
    }
  };

  const handleContinue = () => {
    if (currentIndex < 0) {
      if (!selectedOccupation) return;
      transitionTo(0);
      return;
    }

    if (currentValue === null || !question) return;

    const timeSpentMs = Date.now() - questionShownAt.current;
    analytics.questionCompleted(
      question,
      currentIndex + 1,
      timeSpentMs,
      currentValue
    );

    if (isLastQuestion) {
      setCompleting(true);
      completedRef.current = true;
      const finalAnswers = { ...answers, [question.id]: currentValue };
      if (!selectedOccupation) return;
      const result = calculateResults(
        toProfessionSelection(selectedOccupation),
        finalAnswers
      );

      analytics.assessmentCompleted(
        result.aiExposureScore,
        result.careerResilienceScore
      );

      saveResults(result);

      window.setTimeout(() => {
        router.push("/assessment/results");
      }, 500);

      return;
    }

    transitionTo(currentIndex + 1);
  };

  if (completing) {
    return <LoadingState message="Analyzing your responses…" />;
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div
        className="gradient-soft pointer-events-none absolute inset-0"
        aria-hidden="true"
      />

      <header className="relative z-50 border-b border-black/[0.04] bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link
            href="/"
            className="text-lg font-medium tracking-[0.08em] text-foreground transition-opacity hover:opacity-70"
          >
            ILONAA
          </Link>
          <Link
            href="/"
            onClick={reportAbandonment}
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            Exit
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-8 sm:px-8 sm:py-12">
        <div className="relative w-full max-w-xl">
          <div
            className="hero-glow pointer-events-none absolute inset-0 rounded-[2rem]"
            aria-hidden="true"
          />

          <div className="assessment-card">
            <ProgressBar
              current={Math.max(currentIndex + 2, 1)}
              total={QUESTIONS.length + 1}
              className="mb-8 sm:mb-10"
            />

            <div className="min-h-[280px] sm:min-h-[320px]">
              {currentIndex < 0 ? (
                <ProfessionSelect
                  value={selectedOccupation}
                  onSelect={setSelectedOccupation}
                />
              ) : question ? (
                <QuestionScreen
                  key={question.id}
                  question={question}
                  value={currentValue}
                  onChange={handleChange}
                  animating={animating}
                />
              ) : null}
            </div>

            <div className="mt-10 flex justify-center border-t border-black/[0.05] pt-8 sm:mt-12 sm:pt-10">
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="secondary"
                  onClick={handleBack}
                  disabled={currentIndex <= -1}
                  className="w-[5.75rem] shrink-0 justify-center px-5 shadow-none hover:shadow-sm"
                >
                  Back
                </Button>

                <Button
                  onClick={handleContinue}
                  disabled={
                    currentIndex < 0
                      ? selectedOccupation === null
                      : currentValue === null
                  }
                  className="w-[11.5rem] shrink-0 justify-center px-6 shadow-sm hover:shadow-sm"
                  trackCta={
                    currentIndex < 0
                      ? "continue_after_profession"
                      : isLastQuestion
                        ? "view_results"
                        : "continue"
                  }
                  trackLocation="assessment"
                >
                  {currentIndex < 0
                    ? "Continue"
                    : isLastQuestion
                      ? "View Results"
                      : "Continue"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
