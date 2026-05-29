import { useEffect, useMemo, useState } from "react";
import { searchOccupations } from "@/lib/assessment/occupations";
import type { ProfessionSearchHit } from "@/lib/assessment/occupations";

type ProfessionSelectProps = {
  value: ProfessionSearchHit | null;
  onSelect: (occupation: ProfessionSearchHit) => void;
};

export function ProfessionSelect({ value, onSelect }: ProfessionSelectProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);

    return () => window.clearTimeout(timer);
  }, [query]);

  const matches = useMemo(() => {
    if (debouncedQuery.trim().length < 2) return [];
    return searchOccupations(debouncedQuery, 20);
  }, [debouncedQuery]);

  return (
    <div className="space-y-5">
      <h1 className="display-subhead text-balance">Search your profession</h1>
      <p className="body-text">
        Choose the closest match. ILONAA uses this as a professional baseline and
        adjusts it with your answers.
      </p>

      <div className="rounded-2xl border border-black/[0.08] bg-white/80 p-3 shadow-sm">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Type a profession (e.g. Product Manager, Nurse, Electrician)"
          className="w-full rounded-xl border border-black/[0.06] bg-background px-4 py-3 text-[15px] text-foreground outline-none transition focus:border-accent/40"
        />
      </div>

      {query.trim().length > 0 && query.trim().length < 2 && (
        <p className="text-sm text-muted">Type at least 2 characters to search.</p>
      )}

      <div className="max-h-[19rem] space-y-2 overflow-y-auto pr-1">
        {matches.map((occupation) => {
          const selected = value?.mappedOccupationCode === occupation.mappedOccupationCode;

          return (
            <button
              key={`${occupation.mappedOccupationCode}-${occupation.marketTitle}`}
              type="button"
              onClick={() => onSelect(occupation)}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                selected
                  ? "border-accent bg-accent/10"
                  : "border-black/[0.06] bg-white/70 hover:border-accent/20 hover:bg-white"
              }`}
            >
              <p className="font-medium text-foreground">{occupation.marketTitle}</p>
              <p className="mt-1 text-sm text-muted">{occupation.occupation.description}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.12em] text-accent/80">
                {occupation.occupation.primaryRiasecType} · {occupation.occupation.secondaryRiasecType}
              </p>
            </button>
          );
        })}
      </div>

      {value && (
        <div className="rounded-2xl border border-black/[0.05] bg-white/70 p-4">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted/70">
            Selected Profession
          </p>
          <p className="mt-2 font-medium text-foreground">{value.marketTitle}</p>
          <p className="mt-1 text-sm text-muted">
            RIASEC:
            <br />
            {value.occupation.primaryRiasecType} / {value.occupation.secondaryRiasecType}
          </p>
          <p className="mt-2 text-xs text-muted/80">
            This profession provides the occupational baseline used by ILONAA.
          </p>
        </div>
      )}
    </div>
  );
}
