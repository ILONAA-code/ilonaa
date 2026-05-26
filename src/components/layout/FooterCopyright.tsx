type FooterCopyrightProps = {
  className?: string;
};

export function FooterCopyright({ className = "" }: FooterCopyrightProps) {
  return (
    <p
      className={`mt-8 text-center text-xs text-muted/70 sm:text-left ${className}`}
    >
      © {new Date().getFullYear()} ILONAA. All rights reserved.
    </p>
  );
}
