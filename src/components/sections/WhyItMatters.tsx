import { Section } from "@/components/ui/Section";

export function WhyItMatters() {
  return (
    <Section id="why" className="bg-white/40">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 lg:items-center">
        <div>
          <p className="section-label mb-4">Why It Matters</p>
          <h2 className="display-subhead text-balance md:text-[2.75rem] md:leading-[1.14]">
            Automation risk is not the same for every career.
          </h2>
        </div>

        <div className="space-y-5">
          <p className="body-text sm:text-lg">
            AI will not impact all professions equally.
          </p>
          <p className="body-text sm:text-lg">
            Some careers are highly exposed to automation. Others gain value
            through human judgment, leadership and complex decision making.
          </p>
          <p className="body-text-emphasis sm:text-lg">
            ILONAA helps you understand the difference.
          </p>
        </div>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "Automation risk varies",
            description:
              "AI exposure differs across roles, industries, and how your work is actually performed.",
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
            <h3 className="body-text-emphasis">{item.title}</h3>
            <p className="body-text mt-2.5">{item.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
