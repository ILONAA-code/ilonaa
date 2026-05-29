import type { NarrativeCard } from "@/lib/assessment/types";

type ResultsHeroProps = {
  professionTitle: string;
  primaryType: string;
  secondaryType: string;
  explanation: string;
  ilonaaRiskIndexScore: number;
};

export function ResultsHero({
  professionTitle,
  primaryType,
  secondaryType,
  explanation,
  ilonaaRiskIndexScore,
}: ResultsHeroProps) {
  const riskLevel =
    ilonaaRiskIndexScore < 35
      ? "Low"
      : ilonaaRiskIndexScore < 60
        ? "Medium"
        : ilonaaRiskIndexScore < 80
          ? "High"
          : "Very high";

  return (
    <header
      className="animate-fade-in-up"
      data-analytics-section="profile_outcome"
    >
      <p className="section-label text-center">RIASEC context</p>

      <div className="premium-card relative mt-5 overflow-hidden p-6 sm:p-8">
        <div
          className="hero-glow pointer-events-none absolute inset-0 opacity-80"
          aria-hidden="true"
        />

        <div className="relative rounded-2xl border border-black/[0.05] bg-white/90 px-5 py-5 text-center sm:px-6 sm:py-6">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted/70">
            AI Replacement Risk
          </p>
          <p className="mt-2 font-display text-[2.45rem] tabular-nums leading-none text-foreground sm:text-[3.1rem]">
            {ilonaaRiskIndexScore}
            <span className="ml-1 text-base text-muted/60">/100</span>
          </p>
          <p className="mt-2 text-sm font-medium text-muted/90">{riskLevel}</p>
          <p className="mt-2 text-xs leading-relaxed text-muted/80">
            Risk is not destiny. Exposure does not automatically imply replacement.
          </p>
        </div>

        <div className="relative mt-6 text-center">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted/70">
            Selected profession
          </p>
          <p className="mt-1 text-sm font-medium text-foreground/80">{professionTitle}</p>
          <h1 className="font-display text-[1.9rem] leading-[1.12] tracking-tight text-foreground sm:text-[2.35rem] sm:leading-[1.1]">
            RIASEC Type: {primaryType}
          </h1>
          <p className="mt-2 text-sm tracking-wide text-muted/90 sm:text-[0.9375rem]">
            Secondary orientation: {secondaryType}
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
        </figure>
      </div>
    </header>
  );
}

type RiskWhySectionProps = {
  riskScore: number;
  summary: string;
  humanAdvantageFactors: NarrativeCard[];
  riskDrivers: NarrativeCard[];
};

function riskLabel(score: number): string {
  if (score < 35) return "Low";
  if (score < 60) return "Medium";
  if (score < 80) return "High";
  return "Very high";
}

export function RiskWhySection({
  riskScore,
  summary,
  humanAdvantageFactors,
  riskDrivers,
}: RiskWhySectionProps) {
  return (
    <section className="animate-fade-in-up-delay" data-analytics-section="risk_reasoning">
      <p className="section-label">Why this risk level</p>
      <div className="premium-card mt-5 space-y-6 p-6 sm:p-8">
        <h2 className="font-display text-[1.5rem] leading-[1.2] text-foreground sm:text-[1.95rem]">
          Why Your Risk Is {riskLabel(riskScore)}
        </h2>
        <p className="body-text">{summary}</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-black/[0.05] bg-white/70 p-4 sm:p-5">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted/70">
              Human Advantage Factors
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {humanAdvantageFactors.map((item) => (
                <span
                  key={item.title}
                  className="rounded-full border border-accent/20 bg-accent-light/60 px-3 py-1.5 text-xs font-medium text-foreground"
                >
                  {item.title}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-black/[0.05] bg-white/70 p-4 sm:p-5">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted/70">
              Risk Drivers
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {riskDrivers.map((item) => (
                <span
                  key={item.title}
                  className="rounded-full border border-black/[0.08] bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground"
                >
                  {item.title}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
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
