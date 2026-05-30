"use client";

import { useMemo, useState } from "react";
import { debugProfessionSearch } from "@/lib/assessment/occupations";

export function ProfessionSearchDebugPage() {
  const [input, setInput] = useState("");
  const result = useMemo(() => debugProfessionSearch(input), [input]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-foreground">Profession Search Debug</h1>
      <p className="mt-2 text-sm text-muted">
        Development-only diagnostic for ONET title + ONET alias matching.
      </p>

      <div className="mt-6 rounded-2xl border border-black/[0.08] bg-white/80 p-4">
        <label htmlFor="profession-debug-input" className="text-xs font-semibold uppercase tracking-[0.12em] text-muted/80">
          Test profession query
        </label>
        <input
          id="profession-debug-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Type e.g. CEO, Product Manager, Physicist"
          className="mt-2 w-full rounded-xl border border-black/[0.06] bg-background px-4 py-3 text-[15px] text-foreground outline-none transition focus:border-accent/40"
        />
      </div>

      <div className="mt-6 grid gap-4 rounded-2xl border border-black/[0.08] bg-white/80 p-4 sm:grid-cols-2">
        <DebugItem label="Raw input" value={result.rawInput || "(empty)"} />
        <DebugItem label="Normalized input" value={result.normalizedInput || "(empty)"} />
        <DebugItem label="Best display title" value={result.bestDisplayTitle ?? "none"} />
        <DebugItem label="Canonical ONET title" value={result.canonicalOnetTitle ?? "none"} />
        <DebugItem label="ONET code" value={result.onetCode ?? "none"} />
        <DebugItem label="Match type" value={result.matchType} />
        <DebugItem label="Matched alias" value={result.matchedAlias ?? "none"} />
        <DebugItem label="Confidence score" value={result.confidenceScore.toFixed(3)} />
        <DebugItem label="Result source" value={result.resultSource} />
        <DebugItem label="No confident match" value={String(result.noConfidentMatch)} />
        <DebugItem label="RIASEC primary" value={result.riasecPrimary ?? "none"} />
        <DebugItem label="RIASEC secondary" value={result.riasecSecondary ?? "none"} />
      </div>

      <div className="mt-6 rounded-2xl border border-black/[0.08] bg-white/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted/80">Top 5 candidates</p>
        {result.topCandidates.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No candidates above confidence threshold.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {result.topCandidates.map((candidate, index) => (
              <div key={`${candidate.onetCode}-${index}`} className="rounded-xl border border-black/[0.06] bg-background/70 p-3">
                <p className="font-medium text-foreground">{candidate.displayTitle}</p>
                <p className="mt-1 text-sm text-muted">
                  {candidate.onetCode} · {candidate.matchType} · {candidate.resultSource}
                </p>
                <p className="mt-1 text-sm text-muted">
                  Alias: {candidate.matchedAlias ?? "none"} · Confidence: {candidate.confidenceScore.toFixed(3)}
                </p>
                <p className="mt-1 text-sm text-muted">
                  RIASEC: {candidate.riasecPrimary} / {candidate.riasecSecondary}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function DebugItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted/80">{label}</p>
      <p className="mt-1 text-sm text-foreground">{value}</p>
    </div>
  );
}
