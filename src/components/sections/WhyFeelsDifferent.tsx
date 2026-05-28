import { Section, SectionHeader } from "@/components/ui/Section";

const principles = [
  {
    title: "Privacy-first by architecture",
    description:
      "No accounts. No resume uploads. No hidden data marketplace.",
  },
  {
    title: "European-hosted infrastructure",
    description:
      "Built on privacy-conscious European data infrastructure.",
  },
  {
    title: "Work patterns—not job titles",
    description:
      "AI changes tasks before it replaces careers; ILONAA reads how you actually work.",
  },
  {
    title: "Calm reflection, not panic scoring",
    description:
      "Designed for thoughtful career decisions—not fear-driven dashboards.",
  },
  {
    title: "Human judgment still matters",
    description:
      "The future favors people who combine adaptability with context and trust.",
  },
  {
    title: "Clarity without overwhelm",
    description:
      "Minimal friction. Clear reflection. Perspective you can act on.",
  },
];

export function WhyFeelsDifferent() {
  return (
    <Section id="different" className="bg-white/40">
      <SectionHeader
        label="Trust & intention"
        title="Why ILONAA feels different"
        description="A privacy-first future-of-work assessment—calm, intentional, and built for professional reflection."
        align="center"
      />

      <ul className="grid gap-4 sm:grid-cols-2 lg:gap-5">
        {principles.map((principle) => (
          <li
            key={principle.title}
            className="rounded-2xl border border-black/[0.05] bg-background/80 px-5 py-5 transition-shadow duration-300 hover:shadow-[0_4px_24px_-8px_rgba(31,41,55,0.08)] sm:px-6 sm:py-6"
          >
            <h3 className="body-text-emphasis leading-snug">{principle.title}</h3>
            <p className="mt-2 text-[0.9375rem] leading-[1.6] text-muted sm:text-base sm:leading-[1.65]">
              {principle.description}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
