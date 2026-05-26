import { cn } from "@/lib/utils";

type SectionProps = {
  id?: string;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
};

export function Section({
  id,
  children,
  className,
  containerClassName,
}: SectionProps) {
  return (
    <section id={id} className={cn("section-padding", className)}>
      <div className={cn("mx-auto w-full max-w-6xl", containerClassName)}>
        {children}
      </div>
    </section>
  );
}

type SectionHeaderProps = {
  label?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeader({
  label,
  title,
  description,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-12 md:mb-16",
        align === "center" && "mx-auto max-w-2xl text-center",
        className
      )}
    >
      {label && <p className="section-label mb-4">{label}</p>}
      <h2 className="display-subhead text-balance sm:text-4xl md:text-[2.75rem] md:leading-[1.14]">
        {title}
      </h2>
      {description && (
        <p className="body-text mt-5 sm:text-lg sm:leading-[1.75]">
          {description}
        </p>
      )}
    </div>
  );
}
