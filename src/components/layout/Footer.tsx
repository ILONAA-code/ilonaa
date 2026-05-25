import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-black/[0.05] px-5 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
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
          <Link href="#start" className="transition-colors hover:text-foreground">
            Get Started
          </Link>
        </div>

        <p className="text-xs text-muted/70">
          © {new Date().getFullYear()} ILONAA. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
