type LoadingStateProps = {
  message?: string;
};

export function LoadingState({
  message = "Preparing your profile…",
}: LoadingStateProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-5">
      <div className="gradient-soft pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative flex flex-col items-center gap-5 text-center">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <div className="absolute inset-0 animate-pulse rounded-full bg-accent/10" />
          <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
        </div>
        <p className="text-sm text-muted">{message}</p>
      </div>
    </div>
  );
}
