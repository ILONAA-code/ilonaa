import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="text-lg font-medium tracking-[0.08em] text-foreground transition-opacity hover:opacity-70"
        >
          ILONAA
        </Link>

        <nav
          className="hidden items-center gap-8 sm:flex"
          aria-label="Primary"
        >
          <Link
            href="#why"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            Why It Matters
          </Link>
          <Link
            href="#receive"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            What You Receive
          </Link>
          <Link
            href="#process"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            How It Works
          </Link>
        </nav>

        <Button
          href="/assessment"
          size="default"
          className="w-[7rem] shrink-0 justify-center whitespace-nowrap px-5 shadow-sm hover:shadow-sm"
          trackCta="start_analysis"
          trackLocation="navbar"
        >
          Start
        </Button>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
    </header>
  );
}
