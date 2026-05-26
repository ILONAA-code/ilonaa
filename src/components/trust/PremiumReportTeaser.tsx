type PremiumReportTeaserProps = {
  className?: string;
};

export function PremiumReportTeaser({ className = "" }: PremiumReportTeaserProps) {
  return (
    <section
      className={`premium-card border-accent/10 p-6 sm:p-8 ${className}`}
    >
      <p className="section-label">Extended Analysis</p>
      <h3 className="display-subhead mt-4 text-balance">
        Extended private reports are currently in preparation.
      </h3>
      <p className="body-text mt-4 max-w-xl">
        A deeper perspective on your career resilience — designed for
        thoughtful professional planning, with the same calm intelligence you
        experience here.
      </p>
    </section>
  );
}
