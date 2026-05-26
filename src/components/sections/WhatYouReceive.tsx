import { Section, SectionHeader } from "@/components/ui/Section";

const deliverables = [
  {
    title: "AI Exposure Score",
    description:
      "A clear measure of how susceptible your current role is to automation and AI-driven change.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
      </svg>
    ),
  },
  {
    title: "Career Resilience Score",
    description:
      "An assessment of your professional adaptability based on skills, experience, and market positioning.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
  {
    title: "Future Skill Recommendations",
    description:
      "Personalized guidance on capabilities that strengthen your long-term career trajectory.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
  },
];

export function WhatYouReceive() {
  return (
    <Section id="receive">
      <SectionHeader
        label="What You Receive"
        title="A complete picture of your career resilience."
        description="Three focused insights designed to replace uncertainty with actionable clarity."
        align="center"
      />

      <div className="grid gap-5 md:grid-cols-3">
        {deliverables.map((item, index) => (
          <article
            key={item.title}
            className="group relative overflow-hidden rounded-3xl border border-black/[0.05] bg-white/60 p-8 transition-all duration-300 hover:border-accent/20 hover:shadow-[0_8px_40px_-12px_rgba(74,98,116,0.15)]"
          >
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-light text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
              {item.icon}
            </div>

            <span className="text-xs font-medium tabular-nums text-muted/50">
              0{index + 1}
            </span>
            <h3 className="mt-2 font-display text-[1.375rem] leading-snug text-foreground sm:text-xl">
              {item.title}
            </h3>
            <p className="body-text mt-3">
              {item.description}
            </p>
          </article>
        ))}
      </div>
    </Section>
  );
}
