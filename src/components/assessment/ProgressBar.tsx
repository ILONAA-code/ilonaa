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
      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
          Question {current} of {total}
        </p>
        <p className="text-xs tabular-nums text-muted">{Math.round(progress)}%</p>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.05]">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label={`Assessment progress: question ${current} of ${total}`}
        />
      </div>
    </div>
  );
}
