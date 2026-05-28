type TrustSectionProps = {
  variant?: "compact" | "full";
  className?: string;
};

const trustPoints = [
  "No account.",
  "European infrastructure.",
  "No personal identity stored.",
  "No tracking of personal data.",
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
        <p className="section-label">Privacy by design</p>
        <p className="body-text mt-2">
          No accounts. European-hosted analytics. Your assessment stays with you.
        </p>
      </div>
    );
  }

  return (
    <section
      className={`rounded-[1.75rem] border border-black/[0.05] bg-white/50 p-6 sm:p-8 ${className}`}
    >
      <p className="section-label">Built on trust</p>
      <h2 className="display-subhead mt-3">
        Privacy-first by intention, not afterthought.
      </h2>
      <ul className="mt-6 space-y-3.5">
        {trustPoints.map((point) => (
          <li key={point} className="flex items-start gap-3 body-text">
            <span
              className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-accent"
              aria-hidden="true"
            />
            {point}
          </li>
        ))}
      </ul>
    </section>
  );
}
