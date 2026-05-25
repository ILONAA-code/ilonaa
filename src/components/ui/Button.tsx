import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonBaseProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "large";
  className?: string;
  disabled?: boolean;
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
  "inline-flex items-center justify-center font-sans font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40";

const variants = {
  primary:
    "bg-accent text-white shadow-sm hover:bg-accent-hover hover:shadow-md active:scale-[0.98]",
  secondary:
    "bg-white/80 text-foreground border border-black/[0.06] shadow-sm hover:bg-white hover:shadow-md active:scale-[0.98]",
  ghost: "text-muted hover:text-foreground hover:bg-black/[0.03]",
};

const sizes = {
  default: "h-11 px-6 text-sm rounded-full",
  large: "h-12 px-8 text-[15px] rounded-full",
};

export function Button({
  children,
  variant = "primary",
  size = "default",
  className,
  disabled = false,
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
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      onClick={props.onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
}
