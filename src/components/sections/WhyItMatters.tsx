import { Section } from "@/components/ui/Section";

export function WhyItMatters() {
  return (
    <Section id="why" className="bg-white/40">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 lg:items-center">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-accent">
            Why It Matters
          </p>
          <h2 className="font-display text-3xl text-balance text-foreground sm:text-4xl md:text-[2.75rem] md:leading-[1.15]">
            Not all careers face the same future.
          </h2>
        </div>

        <div className="space-y-5 text-base leading-relaxed text-muted sm:text-lg">
          <p>
            AI will not impact all professions equally.
          </p>
          <p>
            Some careers are highly exposed to automation. Others gain value
            through human judgment, leadership and complex decision making.
          </p>
          <p className="text-foreground font-medium">
            ILONAA helps you understand the difference.
          </p>
        </div>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "Exposure varies",
            description:
              "Automation risk differs dramatically across roles, industries, and skill sets.",
          },
          {
            title: "Human value persists",
            description:
              "Judgment, empathy, and strategic thinking remain deeply human strengths.",
          },
          {
            title: "Clarity reduces anxiety",
            description:
              "Understanding your position replaces uncertainty with informed action.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-black/[0.05] bg-background/80 p-6 transition-shadow duration-300 hover:shadow-[0_4px_24px_-8px_rgba(31,41,55,0.08)]"
          >
            <h3 className="text-sm font-medium text-foreground">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
