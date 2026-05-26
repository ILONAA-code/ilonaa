"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/analytics/events";

type ButtonBaseProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "large";
  className?: string;
  disabled?: boolean;
  trackCta?: string;
  trackLocation?: string;
};

type LinkButtonProps = ButtonBaseProps & {
  href: string;
  onClick?: never;
  type?: never;
};

type ActionButtonProps = ButtonBaseProps & {
  href?: never;
  onClick?: () => void;
  type?: "button" | "submit";
};

export type ButtonProps = LinkButtonProps | ActionButtonProps;

const baseStyles =
  "inline-flex items-center justify-center font-sans font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40";

const variants = {
  primary:
    "bg-accent text-white shadow-sm hover:bg-accent-hover hover:shadow-md active:scale-[0.98]",
  secondary:
    "bg-white/80 text-foreground border border-black/[0.06] shadow-sm hover:bg-white hover:shadow-md active:scale-[0.98]",
  ghost: "text-muted hover:text-foreground hover:bg-black/[0.03]",
};

const sizes = {
  default: "h-11 px-6 text-base rounded-full sm:text-[0.9375rem]",
  large: "h-12 px-8 text-base rounded-full sm:text-[1.0625rem]",
};

function trackCtaClick(trackCta?: string, trackLocation?: string) {
  if (trackCta && trackLocation) {
    analytics.ctaInteraction(trackCta, trackLocation);
  }
}

export function Button({
  children,
  variant = "primary",
  size = "default",
  className,
  disabled = false,
  trackCta,
  trackLocation,
  ...props
}: ButtonProps) {
  const classes = cn(
    baseStyles,
    variants[variant],
    sizes[size],
    className
  );

  if ("href" in props && props.href) {
    return (
      <Link
        href={props.href}
        className={classes}
        onClick={() => trackCtaClick(trackCta, trackLocation)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      onClick={() => {
        trackCtaClick(trackCta, trackLocation);
        props.onClick?.();
      }}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
}
