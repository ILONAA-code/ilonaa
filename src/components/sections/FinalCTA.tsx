import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";

export function FinalCTA() {
  return (
    <Section id="start" className="pb-28 md:pb-36">
      <div className="relative overflow-hidden rounded-[2rem] border border-black/[0.05] bg-white/70 px-6 py-16 text-center shadow-[0_8px_40px_-12px_rgba(31,41,55,0.1)] sm:px-12 sm:py-20 md:py-24">
        <div className="gradient-soft absolute inset-0 opacity-60" />

        <div className="relative mx-auto max-w-2xl">
          <p className="section-label mb-4">Begin Today</p>

          <h2 className="display-subhead text-balance sm:text-4xl md:text-5xl md:leading-[1.14]">
            Clarity begins with understanding.
          </h2>

          <p className="body-text mx-auto mt-5 max-w-md sm:text-lg">
            Take ten minutes to understand where you stand — and where your
            career can grow stronger.
          </p>

          <div className="mt-10 flex justify-center">
            <Button
              href="/assessment"
              size="default"
              className="w-[7rem] shrink-0 justify-center whitespace-nowrap px-5 shadow-sm hover:shadow-sm"
              trackCta="start_analysis"
              trackLocation="final_cta"
            >
              Start
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
