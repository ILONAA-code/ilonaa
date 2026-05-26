import type { NarrativeCard } from "@/lib/assessment/types";

type ScoreOverviewProps = {
  aiExposureScore: number;
  careerResilienceScore: number;
};

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
    <div className="premium-card p-6 sm:p-7">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h3 className="body-text-emphasis">{label}</h3>
        <p className="font-display text-[2rem] tabular-nums leading-none text-foreground sm:text-4xl">
          {score}
          <span className="ml-1 text-base text-muted/60">/100</span>
        </p>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.05]">
        <div
          className={`score-bar-fill h-full rounded-full ${
            tone === "exposure" ? "bg-[#9CA3AF]" : "bg-accent"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function ScoreOverview({
  aiExposureScore,
  careerResilienceScore,
}: ScoreOverviewProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
      <ScoreBar
        label="AI Exposure Score"
        score={aiExposureScore}
        tone="exposure"
      />
      <ScoreBar
        label="Career Resilience Score"
        score={careerResilienceScore}
        tone="resilience"
      />
    </div>
  );
}

type ResultsHeroProps = {
  headline: string;
  narrative: string;
};

export function ResultsHero({ headline, narrative }: ResultsHeroProps) {
  return (
    <header className="animate-fade-in-up">
      <p className="section-label">Your Career Resilience Profile</p>
      <h1 className="display-subhead mt-4 text-balance md:text-[2.75rem] md:leading-[1.14]">
        {headline}
      </h1>
      <p className="body-text mt-5 max-w-2xl sm:text-lg">
        {narrative}
      </p>
    </header>
  );
}

type NarrativeCardsProps = {
  label: string;
  items: NarrativeCard[];
  tone?: "strength" | "exposure" | "recommendation";
};

export function NarrativeCardsSection({
  label,
  items,
  tone = "strength",
}: NarrativeCardsProps) {
  const accentClass = {
    strength: "border-black/[0.05] bg-white/65",
    exposure: "border-black/[0.04] bg-white/55",
    recommendation: "border-accent/10 bg-white/70",
  }[tone];

  return (
    <section className="animate-fade-in-up">
      <p className="section-label">{label}</p>
      <div className="mt-5 space-y-3 sm:space-y-4">
        {items.map((item, index) => (
          <article
            key={item.title}
            className={`premium-card p-5 transition-shadow duration-300 hover:shadow-[0_6px_28px_-10px_rgba(31,41,55,0.1)] sm:p-6 ${accentClass}`}
          >
            <span className="text-[0.8125rem] font-semibold tabular-nums tracking-widest text-accent/60">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-2 font-display text-[1.375rem] leading-snug text-foreground sm:text-xl">
              {item.title}
            </h3>
            <p className="body-text mt-3">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

type BenchmarkNarrativeProps = {
  narrative: string;
};

export function BenchmarkNarrative({ narrative }: BenchmarkNarrativeProps) {
  return (
    <section className="animate-fade-in-up">
      <p className="section-label">What This Means</p>
      <blockquote className="premium-card mt-5 border-l-2 border-l-accent/30 p-6 sm:p-8">
        <p className="font-display text-[1.25rem] leading-[1.55] text-foreground sm:text-xl sm:leading-[1.6]">
          {narrative}
        </p>
      </blockquote>
    </section>
  );
}

type ResultsClosingProps = {
  summary: string;
};

export function ResultsClosing({ summary }: ResultsClosingProps) {
  return (
    <section className="animate-fade-in-up-delay-2 relative overflow-hidden rounded-[2rem] border border-black/[0.05] bg-white/70 p-8 text-center shadow-[0_8px_40px_-12px_rgba(31,41,55,0.1)] backdrop-blur-sm sm:p-10">
      <div
        className="gradient-soft pointer-events-none absolute inset-0 opacity-60"
        aria-hidden="true"
      />
      <div className="relative">
        <p className="section-label">Closing Reflection</p>
        <p className="display-subhead mt-4 text-balance sm:text-2xl">
          {summary}
        </p>
      </div>
    </section>
  );
}
