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
      <h2 className="display-subhead text-[1.625rem] sm:text-[2rem]">{title}</h2>
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
              <h1 className="display-headline mt-3 text-[2.25rem] sm:text-[3rem]">
                How ILONAA Works
              </h1>
              <p className="body-text mt-5 sm:text-lg">
                ILONAA helps people understand how their current work may be
                affected by AI-driven automation and augmentation using a
                framework that separates occupational identity from AI risk.
              </p>
            </header>

            <MethodSection title="1. What ILONAA does">
              <p>
                ILONAA is a decision-support reflection for AI-era career
                planning. It uses ten structured inputs to estimate AI exposure,
                career resilience, and likely pressure points in evolving work.
              </p>
            </MethodSection>

            <MethodSection title="2. Career type classification">
              <p>
                ILONAA uses a career type layer inspired by the Holland/RIASEC
                framework: Realistic, Investigative, Artistic, Social,
                Enterprising, and Conventional.
              </p>
              <p>
                Our career type layer is inspired by one of the most established
                models in vocational psychology and aligned with occupational
                structures commonly used in O*NET-style analysis.
              </p>
            </MethodSection>

            <MethodSection title="3. O*NET reference">
              <p>
                O*NET is a widely used occupational information framework that
                describes occupations through work activities, skills,
                knowledge, interests, work styles, and context.
              </p>
              <p>
                ILONAA does not ask users to trust a black-box archetype
                invented from scratch. Instead, the career identity layer is
                aligned with established occupational categories and the RIASEC
                tradition.
              </p>
            </MethodSection>

            <MethodSection title="4. The ILONAA AI Risk Index">
              <p>
                The ILONAA AI Risk Index is ILONAA&apos;s proprietary layer. It
                estimates how strongly a role may be exposed to AI-driven
                substitution, augmentation, or workflow disruption.
              </p>
              <p>
                It combines signals including repetitiveness, current AI task
                capability, pace of industry change, human interaction, trust
                dependency, creativity, strategic decision-making, specialized
                expertise, personal judgment, and adaptability.
              </p>
            </MethodSection>

            <MethodSection title="5. AI Exposure vs AI Replacement Risk">
              <p>
                AI exposure does not mean automatic job loss. A role can be
                highly exposed and still resilient if the human layer remains
                valuable.
              </p>
              <p>
                Exposure is not a verdict. Risk is not destiny. ILONAA is
                designed as a decision-support tool, not a prediction machine.
              </p>
            </MethodSection>

            <MethodSection title="6. Career Resilience">
              <p>
                Career resilience reflects the human, contextual, and adaptive
                strengths that may make a person or role more robust in an
                AI-transformed labor market.
              </p>
            </MethodSection>

            <MethodSection title="7. What ILONAA does not claim">
              <ul className="list-disc space-y-2 pl-5">
                <li>ILONAA does not guarantee employment outcomes.</li>
                <li>
                  ILONAA does not provide legal, financial, or career counseling.
                </li>
                <li>ILONAA is not an official O*NET product.</li>
                <li>
                  ILONAA is not endorsed by O*NET, the U.S. Department of
                  Labor, or any university.
                </li>
                <li>
                  ILONAA provides structured orientation based on user input and
                  occupational frameworks.
                </li>
              </ul>
            </MethodSection>

            <MethodSection title="8. Why this matters">
              <p>
                Many AI career tools either overpromise or remain too generic.
                ILONAA separates established occupational identity from
                proprietary AI risk interpretation. That separation is the core
                product architecture.
              </p>
              <p>
                <Link
                  href="/assessment"
                  className="text-accent transition-colors hover:text-foreground"
                >
                  Start the assessment
                </Link>{" "}
                to see your RIASEC type and ILONAA AI Risk Index together.
              </p>
            </MethodSection>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
