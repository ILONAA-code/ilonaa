"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProgressBar } from "@/components/assessment/ProgressBar";
import { QuestionScreen } from "@/components/assessment/QuestionScreen";
import { TrustSection } from "@/components/trust/TrustSection";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { analytics } from "@/lib/analytics/events";
import { QUESTIONS, sliderValueFromStep } from "@/lib/assessment/questions";
import { calculateResults, saveResults } from "@/lib/assessment/scoring";
import type { Answers } from "@/lib/assessment/types";

export function AssessmentFlow() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [animating, setAnimating] = useState(false);
  const [completing, setCompleting] = useState(false);
  const startedTracked = useRef(false);
  const questionShownAt = useRef(Date.now());
  const completedRef = useRef(false);
  const abandonedSent = useRef(false);

  const question = QUESTIONS[currentIndex];
  const currentValue = answers[question.id] ?? null;
  const isLastQuestion = currentIndex === QUESTIONS.length - 1;

  useEffect(() => {
    if (startedTracked.current) return;
    analytics.assessmentStarted();
    startedTracked.current = true;
  }, []);

  useEffect(() => {
    questionShownAt.current = Date.now();
  }, [question.id]);

  useEffect(() => {
    if (question.type !== "slider") return;

    setAnswers((prev) => {
      if (prev[question.id] !== undefined) return prev;

      const defaultValue = sliderValueFromStep(
        Math.ceil((question.sliderSteps ?? 5) / 2),
        question.sliderSteps ?? 5
      );

      return { ...prev, [question.id]: defaultValue };
    });
  }, [question.id, question.type, question.sliderSteps]);

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
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      analytics.backButtonUsed(currentIndex + 1);
      transitionTo(currentIndex - 1);
    }
  };

  const handleContinue = () => {
    if (currentValue === null) return;

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
      const result = calculateResults(finalAnswers);

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
              current={currentIndex + 1}
              total={QUESTIONS.length}
              className="mb-8 sm:mb-10"
            />

            <div className="min-h-[280px] sm:min-h-[320px]">
              <QuestionScreen
                key={question.id}
                question={question}
                questionNumber={currentIndex + 1}
                value={currentValue}
                onChange={handleChange}
                animating={animating}
              />
            </div>

            <div className="mt-8 flex items-center gap-3 border-t border-black/[0.05] pt-6 sm:mt-10 sm:pt-8">
              <Button
                variant="secondary"
                onClick={handleBack}
                disabled={currentIndex === 0}
                className="shrink-0 px-5"
              >
                Back
              </Button>

              <Button
                onClick={handleContinue}
                disabled={currentValue === null}
                className="min-w-0 flex-1"
                trackCta={isLastQuestion ? "view_results" : "continue"}
                trackLocation="assessment"
              >
                {isLastQuestion ? "View Results" : "Continue"}
              </Button>
            </div>
          </div>

          <TrustSection variant="compact" className="mt-5 sm:mt-6" />
        </div>
      </main>
    </div>
  );
}
