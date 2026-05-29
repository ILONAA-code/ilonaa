import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { methodologyMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = methodologyMetadata;

function MethodSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="premium-card p-6 sm:p-8">
      <h2 className="display-subhead text-[1.5rem] sm:text-[1.85rem]">{title}</h2>
      <div className="mt-4 space-y-4 text-base leading-[1.75] text-muted sm:text-[1.0625rem]">
        {children}
      </div>
    </section>
  );
}

export default function MethodologyPage() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden bg-background pt-24">
        <div className="gradient-soft pointer-events-none absolute inset-0" />

        <div className="section-padding relative">
          <div className="mx-auto max-w-4xl space-y-8">
            <header className="premium-card p-6 sm:p-8">
              <p className="section-label">Methodology</p>
              <h1 className="display-headline mt-3 text-[2.2rem] sm:text-[2.9rem]">
                How ILONAA Works
              </h1>
              <p className="body-text mt-5 sm:text-lg">
                ILONAA combines a profession baseline, a RIASEC identity layer,
                and a proprietary AI Risk Index to support better career
                decisions in AI-driven labor market change.
              </p>
            </header>

            <MethodSection title="1. Profession-based baseline">
              <p>
                ILONAA starts with a searchable profession selection. This
                selected profession provides a local occupational baseline for
                expected exposure, resilience, and risk context.
              </p>
              <p>
                If an exact title is not available, users choose the closest
                professional match. This baseline is then adjusted by four
                ILONAA-specific questions.
              </p>
            </MethodSection>

            <MethodSection title="2. O*NET-inspired occupational data">
              <p>
                ILONAA uses an O*NET-inspired occupational data structure,
                aligned with publicly established occupational frameworks and
                normalized into a compact local dataset.
              </p>
              <p>
                This design avoids live O*NET calls during assessment and avoids
                shipping full raw occupational databases to the browser.
              </p>
            </MethodSection>

            <MethodSection title="3. Holland/RIASEC career type">
              <p>
                Career identity is represented through the Holland/RIASEC
                framework: Realistic, Investigative, Artistic, Social,
                Enterprising, and Conventional.
              </p>
              <p>
                RIASEC describes occupational identity. It does not determine AI
                risk by itself.
              </p>
            </MethodSection>

            <MethodSection title="4. Four ILONAA-specific adjustment questions">
              <p>After profession selection, ILONAA asks four focused questions:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Current AI usage in daily work</li>
                <li>Speed of learning new digital tools</li>
                <li>Dependence on uniquely human strengths</li>
                <li>Consequence level if a critical decision goes wrong</li>
              </ul>
              <p>
                These answers adjust the profession baseline instead of trying to
                infer occupational identity from scratch.
              </p>
            </MethodSection>

            <MethodSection title="5. ILONAA AI Risk Index">
              <p>
                The ILONAA AI Risk Index is ILONAA&apos;s proprietary score. It
                combines profession baseline factors with user-specific
                adjustment signals to estimate near-term AI disruption pressure.
              </p>
              <p>
                The score is designed for interpretability by normal users and
                data analysts. It is a structured estimate, not an outcome
                guarantee.
              </p>
            </MethodSection>

            <MethodSection title="6. AI exposure vs AI replacement risk">
              <p>
                AI exposure does not mean automatic replacement. A role may be
                highly exposed while still resilient if human accountability,
                judgment, and context remain central.
              </p>
              <p>
                Exposure is not a verdict. Risk is not destiny. ILONAA is a
                decision-support tool.
              </p>
            </MethodSection>

            <MethodSection title="7. Decision consequence and accountability">
              <p>
                High-consequence roles may still use AI extensively. However,
                organizations often retain human oversight where mistakes carry
                legal, safety, compliance, or major financial consequences.
              </p>
              <p>
                ILONAA incorporates this consequence-sensitive accountability
                signal in its risk interpretation layer.
              </p>
            </MethodSection>

            <MethodSection title="8. What ILONAA does not claim">
              <ul className="list-disc space-y-2 pl-5">
                <li>ILONAA does not guarantee employment outcomes.</li>
                <li>
                  ILONAA does not provide legal, financial, or career counseling.
                </li>
                <li>ILONAA is not an official O*NET product.</li>
                <li>
                  ILONAA is not endorsed by O*NET, the U.S. Department of Labor,
                  any university, or John Holland.
                </li>
              </ul>
              <p>
                ILONAA is based on publicly established occupational frameworks
                and provides structured orientation from selected profession and
                user input.
              </p>
              <p>
                <Link
                  href="/assessment"
                  className="text-accent transition-colors hover:text-foreground"
                >
                  Start assessment
                </Link>
              </p>
            </MethodSection>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
