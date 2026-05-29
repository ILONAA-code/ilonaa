import { Button } from "@/components/ui/Button";

function ScorePreview() {
  const replacementRisk = 42;
  const profession = "Product Manager";

  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="hero-glow absolute inset-0 rounded-3xl" />

      <div className="relative overflow-hidden rounded-3xl border border-black/[0.06] bg-white/70 p-6 shadow-[0_8px_40px_-12px_rgba(31,41,55,0.12)] backdrop-blur-sm sm:p-8">
        <div className="mb-5 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
            Your Result
          </p>
          <p className="mt-2 font-display text-[1.7rem] leading-snug text-foreground sm:text-[2rem]">
            {profession}
          </p>
        </div>

        <div className="rounded-2xl border border-black/[0.05] bg-white/75 px-4 py-5 text-center sm:px-5 sm:py-6">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted/70">
            AI Replacement Risk
          </p>
          <p className="mt-2 font-display text-[2.2rem] tabular-nums leading-none text-foreground sm:text-[2.5rem]">
            {replacementRisk}
            <span className="ml-1 text-base text-muted/60">/100</span>
          </p>
          <p className="mt-2 text-sm font-medium text-muted/90">Medium</p>
          <p className="mt-2 text-xs leading-relaxed text-muted/80">
            Risk is not destiny. Exposure does not automatically imply replacement.
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
              AI replacement risk assessment
            </p>

            <h1 className="animate-fade-in-up display-headline">
              AI can automate tasks.
              <span className="block text-muted/80">
                Can it replace your profession?
              </span>
            </h1>

            <p className="animate-fade-in-up-delay body-text mt-6 sm:text-lg">
              Understand your AI Replacement Risk and the factors that may
              protect your profession — in calm, structured clarity.
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
              <p className="body-text flex flex-wrap items-center justify-center gap-x-1.5 text-muted/80">
                <span className="whitespace-nowrap">Free assessment</span>
                <span aria-hidden="true">·</span>
                <span className="whitespace-nowrap">
                  Profession baseline + 4 questions
                </span>
                <span aria-hidden="true">·</span>
                <span className="whitespace-nowrap">~5 min</span>
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
