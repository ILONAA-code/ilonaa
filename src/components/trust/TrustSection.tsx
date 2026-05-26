type TrustSectionProps = {
  variant?: "compact" | "full";
  className?: string;
};

const trustPoints = [
  "No accounts required.",
  "Designed with privacy-first architecture.",
  "Assessments are intentionally separated from personal identity.",
  "No aggressive tracking.",
];

export function TrustSection({
  variant = "full",
  className = "",
}: TrustSectionProps) {
  if (variant === "compact") {
    return (
      <div
        className={`rounded-2xl border border-black/[0.04] bg-white/50 px-5 py-4 ${className}`}
      >
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
          Privacy by design
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          No accounts. No identity linkage. Your assessment stays with you.
        </p>
      </div>
    );
  }

  return (
    <section
      className={`rounded-[1.75rem] border border-black/[0.05] bg-white/50 p-6 sm:p-8 ${className}`}
    >
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
        Built on trust
      </p>
      <h2 className="mt-3 font-display text-xl text-foreground sm:text-2xl">
        Privacy-first by intention, not afterthought.
      </h2>
      <ul className="mt-6 space-y-3">
        {trustPoints.map((point) => (
          <li
            key={point}
            className="flex items-start gap-3 text-sm leading-relaxed text-muted sm:text-[15px]"
          >
            <span
              className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent"
              aria-hidden="true"
            />
            {point}
          </li>
        ))}
      </ul>
    </section>
  );
}
