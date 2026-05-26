import Link from "next/link";
import { FooterCopyright } from "@/components/layout/FooterCopyright";
import { TrustSection } from "@/components/trust/TrustSection";

export function Footer() {
  return (
    <footer className="border-t border-black/[0.05] px-5 py-12 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row sm:items-start">
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium tracking-[0.08em] text-foreground">
              ILONAA
            </p>
            <p className="mt-1 text-sm text-muted">
              Structured clarity for important decisions.
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted">
            <Link href="#why" className="transition-colors hover:text-foreground">
              About
            </Link>
            <Link href="#process" className="transition-colors hover:text-foreground">
              Process
            </Link>
            <Link href="/assessment" className="transition-colors hover:text-foreground">
              Start Assessment
            </Link>
          </div>
        </div>

        <div className="mt-8 sm:mt-10">
          <TrustSection variant="compact" />
        </div>

        <FooterCopyright />
      </div>
    </footer>
  );
}
