import type { NarrativeCard } from "@/lib/assessment/types";
import type { PositioningDimension } from "@/lib/assessment/positioning";

type PositioningOverviewProps = {
  aiExposureScore: number;
  careerResilienceScore: number;
  positioningSummary: string;
  dimensions: PositioningDimension[];
};

function BalanceSpectrum({
  resilience,
  exposure,
}: {
  resilience: number;
  exposure: number;
}) {
  return (
    <div className="relative">
      <div className="mb-3 flex items-end justify-between gap-3 text-sm">
        <div className="text-left">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted/70">
            Your resilience
          </p>
          <p className="mt-1 font-display text-2xl tabular-nums text-foreground">
            {resilience}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted/70">
            Your AI exposure
          </p>
          <p className="mt-1 font-display text-2xl tabular-nums text-foreground">
            {exposure}
          </p>
        </div>
      </div>

      <div className="relative h-2 overflow-hidden rounded-full bg-black/[0.06]">
        <div
          className="score-bar-fill absolute inset-y-0 left-0 rounded-full bg-accent/25"
          style={{ width: `${resilience}%` }}
          aria-hidden="true"
        />
        <div
          className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white bg-accent shadow-sm"
          style={{ left: `calc(${resilience}% - 8px)` }}
          aria-hidden="true"
        />
      </div>

      <div className="mt-2 flex justify-between text-[0.6875rem] text-muted/60">
        <span>Higher exposure</span>
        <span>Stronger resilience</span>
      </div>
    </div>
  );
}

function CapabilityBar({ dimension }: { dimension: PositioningDimension }) {
  const isPressure = dimension.id === "exposure";

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-foreground">{dimension.label}</p>
        <p className="text-xs tabular-nums text-muted/80">{dimension.value}</p>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.05]">
        <div
          className={`score-bar-fill h-full rounded-full ${
            isPressure ? "bg-[#9CA3AF]" : "bg-accent/80"
          }`}
          style={{ width: `${dimension.value}%` }}
        />
      </div>
      <p className="mt-2 text-sm leading-snug text-muted">{dimension.insight}</p>
    </div>
  );
}

export function PositioningOverview({
  aiExposureScore,
  careerResilienceScore,
  positioningSummary,
  dimensions,
}: PositioningOverviewProps) {
  const capabilityDimensions = dimensions.filter(
    (dimension) => dimension.id !== "resilience" && dimension.id !== "exposure"
  );

  return (
    <section
      className="animate-fade-in-up-delay"
      data-analytics-section="positioning"
    >
      <p className="section-label">Your positioning at a glance</p>

      <div className="premium-card mt-5 space-y-8 p-6 sm:p-8">
        <BalanceSpectrum
          resilience={careerResilienceScore}
          exposure={aiExposureScore}
        />

        <p className="body-text border-t border-black/[0.05] pt-6 text-center sm:text-lg">
          {positioningSummary}
        </p>

        <div className="space-y-5 border-t border-black/[0.05] pt-6">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted/70">
            Your capabilities today
          </p>
          {capabilityDimensions.map((dimension) => (
            <CapabilityBar key={dimension.id} dimension={dimension} />
          ))}
        </div>
      </div>
    </section>
  );
}

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
  primaryType: string;
  secondaryType: string;
  explanation: string;
  confidenceLevel: "emerging" | "moderate" | "high";
  ilonaaRiskIndexScore: number;
  aiExposureScore: number;
  careerResilienceScore: number;
};

export function ResultsHero({
  primaryType,
  secondaryType,
  explanation,
  confidenceLevel,
  ilonaaRiskIndexScore,
  aiExposureScore,
  careerResilienceScore,
}: ResultsHeroProps) {
  const confidenceLabel =
    confidenceLevel === "high"
      ? "High"
      : confidenceLevel === "moderate"
        ? "Moderate"
        : "Emerging";

  return (
    <header
      className="animate-fade-in-up"
      data-analytics-section="profile_outcome"
    >
      <p className="section-label">Your RIASEC career type</p>

      <div className="premium-card relative mt-5 overflow-hidden p-6 sm:p-8">
        <div
          className="hero-glow pointer-events-none absolute inset-0 opacity-80"
          aria-hidden="true"
        />

        <div className="relative text-center">
          <h1 className="font-display text-[2rem] leading-[1.12] tracking-tight text-foreground sm:text-[2.5rem] sm:leading-[1.1]">
            Primary: {primaryType}
          </h1>
          <p className="mt-3 text-sm font-medium tracking-wide text-accent sm:text-[0.9375rem]">
            Secondary: {secondaryType}
          </p>
        </div>

        <figure
          className="relative mt-6 rounded-2xl border border-accent/12 bg-white/85 px-5 py-6 text-center sm:mt-7 sm:px-7 sm:py-7"
          data-analytics-section="quotable_insight"
        >
          <figcaption className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted/70">
            Why this type fits
          </figcaption>
          <blockquote className="mt-3 font-display text-[1.3125rem] leading-[1.32] tracking-tight text-balance text-foreground sm:text-[1.5rem] sm:leading-[1.28]">
            {explanation}
          </blockquote>
          <p className="mt-2 text-xs uppercase tracking-[0.14em] text-muted/70">
            Confidence: {confidenceLabel}
          </p>
        </figure>

        <div className="relative mt-6 rounded-2xl border border-black/[0.05] bg-white/75 px-5 py-5 text-center sm:px-6 sm:py-6">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted/70">
            ILONAA AI Risk Index
          </p>
          <p className="mt-2 font-display text-[1.875rem] tabular-nums leading-none text-foreground sm:text-[2.25rem]">
            {ilonaaRiskIndexScore}
            <span className="ml-1 text-base text-muted/60">/100</span>
          </p>
        </div>

        <div className="relative mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-black/[0.05] bg-white/70 p-4 text-center">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted/70">
              AI Exposure Score
            </p>
            <p className="mt-1 font-display text-2xl tabular-nums text-foreground">
              {aiExposureScore}
            </p>
          </div>
          <div className="rounded-2xl border border-black/[0.05] bg-white/70 p-4 text-center">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted/70">
              Career Resilience Score
            </p>
            <p className="mt-1 font-display text-2xl tabular-nums text-foreground">
              {careerResilienceScore}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

type ComparativeInsightProps = {
  narrative: string;
};

export function ComparativeInsight({ narrative }: ComparativeInsightProps) {
  return (
    <section
      className="animate-fade-in-up"
      data-analytics-section="comparative_context"
    >
      <p className="section-label">What this means for you</p>
      <blockquote className="premium-card mt-5 border-l-2 border-l-accent/25 p-6 sm:p-7">
        <p className="font-display text-[1.125rem] leading-[1.5] text-foreground sm:text-lg sm:leading-[1.55]">
          {narrative}
        </p>
      </blockquote>
    </section>
  );
}

type NarrativeCardsProps = {
  label: string;
  items: NarrativeCard[];
  tone?: "strength" | "exposure" | "recommendation";
  sectionId?: string;
};

export function NarrativeCardsSection({
  label,
  items,
  tone = "strength",
  sectionId,
}: NarrativeCardsProps) {
  const accentClass = {
    strength: "border-black/[0.05] bg-white/65",
    exposure: "border-black/[0.04] bg-white/55",
    recommendation: "border-accent/10 bg-white/70",
  }[tone];

  return (
    <section
      className="animate-fade-in-up"
      {...(sectionId ? { "data-analytics-section": sectionId } : {})}
    >
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
            <p className="body-text mt-2.5 leading-[1.65]">{item.description}</p>
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
    <section className="animate-fade-in-up" data-analytics-section="benchmark">
      <p className="section-label">In context</p>
      <blockquote className="premium-card mt-5 border-l-2 border-l-accent/30 p-6 sm:p-7">
        <p className="font-display text-[1.125rem] leading-[1.5] text-foreground sm:text-lg sm:leading-[1.55]">
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
        <p className="section-label">Closing reflection</p>
        <p className="display-subhead mt-3 text-balance sm:text-[1.75rem]">
          {summary}
        </p>
      </div>
    </section>
  );
}
