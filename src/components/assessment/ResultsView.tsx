"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import {
  BenchmarkNarrative,
  NarrativeCardsSection,
  ResultsClosing,
  ResultsHero,
  ScoreOverview,
} from "@/components/assessment/results/ResultsSections";
import { TrustSection } from "@/components/trust/TrustSection";
import { analytics } from "@/lib/analytics/events";
import { loadResults } from "@/lib/assessment/scoring";
import type { AssessmentResult } from "@/lib/assessment/types";

export function ResultsView() {
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [ready, setReady] = useState(false);
  const tracked = useRef(false);

  useEffect(() => {
    const stored = loadResults();

    if (!stored) {
      window.location.replace("/assessment");
      return;
    }

    const timer = window.setTimeout(() => {
      setResult(stored);
      setReady(true);
    }, 600);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!result || tracked.current) return;

    analytics.resultsViewed(
      result.aiExposureScore,
      result.careerResilienceScore
    );
    tracked.current = true;
  }, [result]);

  if (!ready || !result) {
    return <LoadingState message="Crafting your resilience profile…" />;
  }

  return (
    <div className="relative min-h-screen bg-background">
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
            href="/assessment"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            Retake
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14 lg:py-16">
        <div className="space-y-12 sm:space-y-16">
          <ResultsHero
            headline={result.heroHeadline}
            narrative={result.heroNarrative}
          />

          <div className="animate-fade-in-up-delay">
            <ScoreOverview
              aiExposureScore={result.aiExposureScore}
              careerResilienceScore={result.careerResilienceScore}
            />
          </div>

          <NarrativeCardsSection
            label="Key Strengths"
            items={result.keyStrengths}
            tone="strength"
          />

          <NarrativeCardsSection
            label="AI Exposure Areas"
            items={result.exposureAreas}
            tone="exposure"
          />

          <NarrativeCardsSection
            label="Future Resilience Recommendations"
            items={result.resilienceRecommendations}
            tone="recommendation"
          />

          <BenchmarkNarrative narrative={result.benchmarkNarrative} />

          <ResultsClosing summary={result.summary} />

          <TrustSection className="animate-fade-in-up-delay" />

          <div className="animate-fade-in-up-delay-2 flex flex-col items-center gap-3 pb-6 sm:flex-row sm:justify-center sm:pb-8">
            <Button href="/assessment" variant="primary" size="large">
              Retake Assessment
            </Button>
            <Button href="/" variant="secondary" size="large">
              Back to Home
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
