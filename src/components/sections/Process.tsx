import { Section, SectionHeader } from "@/components/ui/Section";

const steps = [
  {
    number: "01",
    title: "Answer 10 Questions",
    description:
      "Thoughtfully designed questions about your role, skills, and professional context.",
  },
  {
    number: "02",
    title: "AI analyzes your profession",
    description:
      "Our model evaluates your responses against current labor market and automation trends.",
  },
  {
    number: "03",
    title: "Receive your personalized career resilience profile",
    description:
      "Get your scores, insights, and skill recommendations in a clear, readable report.",
  },
];

export function Process() {
  return (
    <Section id="process" className="bg-white/40">
      <SectionHeader
        label="How It Works"
        title="Three simple steps to clarity."
        align="center"
      />

      <div className="relative">
        <div
          className="absolute left-8 top-0 hidden h-full w-px bg-gradient-to-b from-accent/30 via-accent/10 to-transparent md:left-1/2 md:block md:-translate-x-1/2"
          aria-hidden="true"
        />

        <div className="space-y-8 md:space-y-12">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`relative flex flex-col gap-6 md:flex-row md:items-center ${
                index % 2 === 1 ? "md:flex-row-reverse" : ""
              }`}
            >
              <div
                className={`flex-1 ${
                  index % 2 === 0 ? "md:pr-16 md:text-right" : "md:pl-16"
                }`}
              >
                <span className="text-xs font-medium tabular-nums tracking-widest text-accent">
                  Step {step.number}
                </span>
                <h3 className="mt-2 font-display text-2xl text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                  {step.description}
                </p>
              </div>

              <div className="relative z-10 flex shrink-0 items-center justify-center md:w-16">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/20 bg-background shadow-sm">
                  <span className="font-display text-lg text-accent">
                    {step.number.replace("0", "")}
                  </span>
                </div>
              </div>

              <div className="hidden flex-1 md:block" />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
