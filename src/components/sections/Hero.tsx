import { Button } from "@/components/ui/Button";

function ScorePreview() {
  const scores = [
    { label: "Your resilience", value: 78, tone: "calm" },
    { label: "Your AI exposure", value: 42, tone: "warm" },
  ];

  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="hero-glow absolute inset-0 rounded-3xl" />

      <div className="relative overflow-hidden rounded-3xl border border-black/[0.06] bg-white/70 p-6 shadow-[0_8px_40px_-12px_rgba(31,41,55,0.12)] backdrop-blur-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
              Your personal profile
            </p>
            <p className="mt-1 font-display text-[1.375rem] leading-snug text-foreground sm:text-2xl">
              Human-Centered Strategist
            </p>
            <p className="mt-1.5 text-sm font-medium tracking-wide text-accent">
              Judgment, amplified by trust
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-light">
            <svg
              className="h-4 w-4 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
              />
            </svg>
          </div>
        </div>

        <div className="space-y-5">
          {scores.map((score) => (
            <div key={score.label}>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="body-text">{score.label}</span>
                <span className="body-text-emphasis tabular-nums">
                  {score.value}
                  <span className="text-muted/60">/100</span>
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.04]">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    score.tone === "warm" ? "bg-[#9CA3AF]" : "bg-accent"
                  }`}
                  style={{ width: `${score.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-accent-light/60 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-accent">
            Your insight
          </p>
          <p className="mt-2 font-display text-[1.0625rem] leading-snug text-foreground">
            Your advantage grows where ambiguity still needs a person in the room.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted/80">
            Strategic judgment · Human-centered strengths · Adaptability
          </p>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-16">
      <div className="gradient-soft absolute inset-0" />

      <div className="section-padding relative">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl">
            <p className="animate-fade-in mb-6 text-xs font-medium uppercase tracking-[0.2em] text-accent">
              AI career resilience assessment
            </p>

            <h1 className="animate-fade-in-up display-headline">
              How resilient is your career
              <span className="block text-muted/80">
                in the age of AI and automation risk?
              </span>
            </h1>

            <p className="animate-fade-in-up-delay body-text mt-6 sm:text-lg">
              Ten thoughtful questions to map your automation risk, resilience,
              and future-of-work positioning—in calm, structured clarity.
            </p>

            <div className="animate-fade-in-up-delay-2 mt-8 flex flex-col items-center gap-3 text-center">
              <Button
                href="/assessment"
                size="default"
                className="w-[7rem] shrink-0 justify-center whitespace-nowrap px-5 shadow-sm hover:shadow-sm"
                trackCta="start_analysis"
                trackLocation="hero"
              >
                Start
              </Button>
              <p className="body-text text-muted/80">
                Free · 10 questions · ~10 minutes
              </p>
            </div>
          </div>

          <div className="animate-fade-in-up-delay lg:justify-self-end">
            <ScorePreview />
          </div>
        </div>
      </div>
    </section>
  );
}
