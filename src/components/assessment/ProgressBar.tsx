import { cn } from "@/lib/utils";

type ProgressBarProps = {
  current: number;
  total: number;
  className?: string;
};

export function ProgressBar({ current, total, className }: ProgressBarProps) {
  const progress = Math.min(100, Math.max(0, (current / total) * 100));

  return (
    <div className={cn("w-full", className)}>
      <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.05]">
        <div
          className="score-bar-fill h-full rounded-full bg-accent"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label={`Assessment progress: question ${current} of ${total}`}
        />
      </div>

      <p className="mt-3 text-center text-sm leading-none text-muted/80">
        Question {current} of {total}
      </p>
    </div>
  );
}
