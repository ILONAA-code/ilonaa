"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { loadResults } from "@/lib/assessment/scoring";
import type { AssessmentResult } from "@/lib/assessment/types";

function ScoreBar({
  label,
  score,
  tone,
}: {
  label: string;
  score: number;
  tone: "exposure" | "resilience";
}) {
  return (
    <div className="rounded-[1.75rem] border border-black/[0.06] bg-white/70 p-6 shadow-[0_4px_24px_-8px_rgba(31,41,55,0.08)] backdrop-blur-sm sm:p-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h3 className="text-sm font-medium leading-snug text-muted">{label}</h3>
        <p className="font-display text-4xl tabular-nums leading-none text-foreground">
          {score}
          <span className="ml-1 text-base text-muted/60">/100</span>
        </p>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.05]">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${
            tone === "exposure" ? "bg-[#9CA3AF]" : "bg-accent"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function InsightSection({
  label,
  items,
}: {
  label: string;
  items: string[];
}) {
  return (
    <section>
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-accent">
        {label}
      </p>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-2xl border border-black/[0.05] bg-white/60 px-5 py-4 text-sm leading-relaxed text-muted sm:text-[15px]"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ResultsView() {
  const router = useRouter();
  const [result, setResult] = useState<AssessmentResult | null>(null);

  useEffect(() => {
    const stored = loadResults();
    if (!stored) {
      router.replace("/assessment");
      return;
    }
    setResult(stored);
  }, [router]);

  if (!result) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-background">
        <div className="gradient-soft pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative h-8 w-8 animate-pulse rounded-full bg-accent/20" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background">
      <div className="gradient-soft pointer-events-none absolute inset-0" aria-hidden="true" />

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
        <div className="animate-fade-in-up mb-10 sm:mb-14">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-accent">
            Your Career Resilience Profile
          </p>
          <h1 className="font-display text-3xl text-balance text-foreground sm:text-4xl md:text-[2.75rem] md:leading-[1.12]">
            Here is what your responses reveal.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            These scores reflect patterns in your work — not predictions. Use
            them as a calm starting point for thoughtful career decisions.
          </p>
        </div>

        <div className="animate-fade-in-up-delay mb-12 grid gap-4 sm:grid-cols-2 sm:gap-5">
          <ScoreBar
            label="AI Exposure Score"
            score={result.aiExposureScore}
            tone="exposure"
          />
          <ScoreBar
            label="Career Resilience Score"
            score={result.careerResilienceScore}
            tone="resilience"
          />
        </div>

        <div className="animate-fade-in-up-delay space-y-10 sm:space-y-12">
          <InsightSection label="Key Insights" items={result.insights} />
          <InsightSection
            label="Your Protection Factors"
            items={result.protectionFactors}
          />
          <InsightSection
            label="Future-Proof Skills to Develop"
            items={result.futureProofSkills}
          />
        </div>

        <div className="animate-fade-in-up-delay-2 relative mt-12 overflow-hidden rounded-[2rem] border border-black/[0.05] bg-white/70 p-8 text-center shadow-[0_8px_40px_-12px_rgba(31,41,55,0.1)] backdrop-blur-sm sm:p-10">
          <div className="gradient-soft pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />

          <div className="relative">
            <p className="font-display text-2xl text-balance leading-snug text-foreground sm:text-3xl">
              {result.summary}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/assessment" variant="primary" size="large">
                Retake Assessment
              </Button>
              <Button href="/" variant="secondary" size="large">
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
