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
                ILONAA is a decision-support tool for understanding AI-related
                career pressure. It is built for users, journalists, recruiters,
                HR teams, investors, and search systems that need a calm,
                transparent explanation of what the model does and does not do.
              </p>
            </header>

            <MethodSection title="1. Why ILONAA Exists">
              <p>
                Most discussions about AI focus on what AI can do. ILONAA starts
                from a different question: what parts of human work remain
                difficult to replace even as AI becomes more capable?
              </p>
              <p>
                Many people feel uncertainty about their profession, their
                future, AI, and career decisions. Yet much of the public
                conversation is sensational, overly optimistic, overly
                pessimistic, or not personalized enough to support practical
                choices.
              </p>
              <p>
                ILONAA exists to provide a structured, transparent, and balanced
                interpretation of this transition.
              </p>
            </MethodSection>

            <MethodSection title="2. Why Accountability Matters">
              <p>
                Many AI discussions focus on task automation. But organizations
                do not only automate tasks. They also have to decide who remains
                accountable when something goes wrong.
              </p>
              <p>
                This is critical in situations such as a missed diagnosis, a
                regulatory violation, a safety failure, a multimillion-dollar
                business decision, a legal mistake, or a strategic choice with
                major consequences.
              </p>
              <p>
                AI may assist. AI may automate parts of work. But accountability
                often remains human. This principle is one of the foundations of
                the ILONAA interpretation layer.
              </p>
            </MethodSection>

            <MethodSection title="3. What ILONAA does">
              <p>
                ILONAA helps people interpret how AI may affect a selected
                profession. The model combines occupational structure, role
                identity, and user-specific context to estimate one primary
                user-facing outcome:
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>AI Replacement Risk</li>
              </ul>
              <p>
                Supporting interpretation includes human advantage factors,
                occupational structure signals, and contextual career insights.
                The goal is not to predict destiny. The goal is to provide
                structured orientation for better decisions.
              </p>
            </MethodSection>

            <MethodSection title="4. Why You Can Trust This Approach">
              <p>
                ILONAA does not start with personality quizzes. It starts with
                established occupational frameworks and role context.
              </p>
              <p>
                The methodology is built on profession-specific occupational
                structure, Holland/RIASEC occupational identity, O*NET-inspired
                occupational data, and user-specific adjustment signals.
              </p>
              <p>
                Instead of asking users to trust an opaque black box, ILONAA is
                aligned with occupational concepts that have been used and
                studied for decades.
              </p>
            </MethodSection>

            <MethodSection title="5. Profession Selection">
              <p>
                ILONAA starts with a searchable profession selection. The
                selected profession provides the occupational baseline used by
                the model.
              </p>
              <p>
                If an exact title is not available, users choose the closest
                available match. This gives ILONAA a practical baseline before
                user-specific adjustments are applied.
              </p>
            </MethodSection>

            <MethodSection title="6. O*NET-inspired Occupational Layer">
              <p>
                ILONAA uses occupational structures inspired by publicly
                established frameworks such as O*NET and the Holland/RIASEC
                model.
              </p>
              <p>
                These frameworks help describe the nature of work.
                ILONAA&apos;s proprietary contribution is its AI Risk and Career
                Resilience interpretation layer.
              </p>
              <p>
                This design avoids live API calls during assessment and avoids
                shipping large raw occupational databases to the browser.
              </p>
            </MethodSection>

            <MethodSection title="7. Holland / RIASEC Identity Layer">
              <p>
                Career identity is represented through the Holland/RIASEC
                framework: Realistic, Investigative, Artistic, Social,
                Enterprising, and Conventional.
              </p>
              <p>
                RIASEC describes occupational identity. It does not determine AI
                risk by itself, and it is not used as a standalone replacement
                prediction mechanism.
              </p>
            </MethodSection>

            <MethodSection title="8. Four ILONAA Questions">
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

            <MethodSection title="9. ILONAA Interpretation Layer">
              <p>
                ILONAA uses multiple analytical dimensions internally, but
                presents a single primary outcome to users: AI Replacement Risk.
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong>AI Replacement Risk (primary):</strong> how likely
                  core human responsibility could be substituted in practice.
                </li>
                <li>
                  <strong>Occupational structure signals:</strong> routine work,
                  process structure, and AI-capable task context.
                </li>
                <li>
                  <strong>Human advantage factors:</strong> judgment,
                  accountability, relationship depth, adaptability, and physical
                  presence where relevant.
                </li>
                <li>
                  <strong>Internal analytical dimensions:</strong> AI Exposure
                  and Career Resilience are used by the model as supporting
                  interpretation layers.
                </li>
              </ul>
            </MethodSection>

            <MethodSection title="10. AI Replacement Risk (Primary Outcome)">
              <p>
                ILONAA surfaces AI Replacement Risk as the dominant user-facing
                result so users do not need to choose between competing scores.
              </p>
              <p>
                AI Exposure and Career Resilience remain internal analytical
                dimensions used by the model to support interpretation, but they
                are not presented as equal first-class outputs.
              </p>
            </MethodSection>

            <MethodSection title="11. AI Exposure vs AI Replacement Risk">
              <p>
                AI exposure does not mean automatic replacement. A role may be
                highly exposed while still resilient if human accountability,
                judgment, and context remain central.
              </p>
              <p>
                AI Replacement Risk does not mean inevitable replacement. Risk
                is not destiny. Exposure does not automatically imply
                replacement.
              </p>
            </MethodSection>

            <MethodSection title="12. Examples">
              <div className="space-y-5">
                <div className="rounded-xl border border-black/[0.08] bg-white/70 p-4">
                  <h3 className="text-base font-semibold text-foreground">
                    Financial Controller
                  </h3>
                  <p className="mt-2">
                    Typical profile signals include high accountability, high
                    financial consequence, and moderate AI exposure.
                  </p>
                  <p className="mt-2">
                    Potential interpretation: AI may automate parts of reporting
                    and analysis. However, accountability, financial
                    responsibility, and decision ownership remain important human
                    factors.
                  </p>
                </div>
                <div className="rounded-xl border border-black/[0.08] bg-white/70 p-4">
                  <h3 className="text-base font-semibold text-foreground">
                    Teacher
                  </h3>
                  <p className="mt-2">
                    Typical profile signals include high human interaction, high
                    trust, and strong relationship depth.
                  </p>
                  <p className="mt-2">
                    Potential interpretation: AI can support preparation and
                    administration. But teaching relies heavily on human
                    interaction, trust, and social context.
                  </p>
                </div>
                <div className="rounded-xl border border-black/[0.08] bg-white/70 p-4">
                  <h3 className="text-base font-semibold text-foreground">
                    Data Scientist
                  </h3>
                  <p className="mt-2">
                    Typical profile signals include high AI exposure, high
                    adaptability, and high technical expertise.
                  </p>
                  <p className="mt-2">
                    Potential interpretation: AI is transforming the profession
                    rapidly. People who adapt and work with AI may remain highly
                    resilient.
                  </p>
                </div>
              </div>
            </MethodSection>

            <MethodSection title="13. What ILONAA Does Not Claim">
              <ul className="list-disc space-y-2 pl-5">
                <li>ILONAA does not predict the future.</li>
                <li>ILONAA does not guarantee employment outcomes.</li>
                <li>ILONAA is not career counseling.</li>
                <li>
                  ILONAA does not provide legal or financial advice.
                </li>
                <li>ILONAA is not an official O*NET product.</li>
                <li>
                  ILONAA is not endorsed by O*NET, the U.S. Department of Labor,
                  any university, or John Holland.
                </li>
                <li>ILONAA is a decision-support tool.</li>
              </ul>
              <p>
                ILONAA is based on publicly established occupational frameworks
                and provides structured orientation from profession context and
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
