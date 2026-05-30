import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  searchOccupations,
  suggestProfessionCorrection,
} from "@/lib/assessment/occupations";
import type { ProfessionSearchHit } from "@/lib/assessment/occupations";

type ProfessionSelectProps = {
  onResolved: (occupation: ProfessionSearchHit) => void;
};

type MediumConfidenceOption = {
  id: string;
  label: string;
  hit: ProfessionSearchHit;
};

const HIGH_CONFIDENCE_THRESHOLD = 0.85;
const MEDIUM_CONFIDENCE_THRESHOLD = 0.65;

function toTitleCase(input: string): string {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function singularizeWord(word: string): string {
  const lower = word.toLowerCase();
  if (lower.length <= 4) return word;
  if (lower.endsWith("ss") || lower.endsWith("is") || lower.endsWith("us")) return word;
  if (lower.endsWith("ies") && lower.length > 5) return `${word.slice(0, -3)}y`;
  if (lower.endsWith("s")) return word.slice(0, -1);
  return word;
}

function toSingularTitleCase(input: string): string {
  const words = input
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => singularizeWord(word));
  return toTitleCase(words.join(" "));
}

function normalizeLabel(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function isLikelyAcronym(input: string): boolean {
  return /^[A-Z]{2,6}$/.test(input.trim());
}

function isIncompleteSuggestionLabel(label: string, query: string): boolean {
  const normalizedLabel = normalizeLabel(label);
  const normalizedQuery = normalizeLabel(query);

  if (!normalizedLabel) return true;
  if (normalizedLabel === normalizedQuery && normalizedQuery.length <= 5) return true;

  const tokens = normalizedLabel.split(" ").filter(Boolean);
  if (tokens.length === 1 && tokens[0].length <= 4 && !isLikelyAcronym(label)) return true;

  return false;
}

function getFriendlyProfessionLabel(hit: ProfessionSearchHit, query: string): string {
  const alias = hit.matchedAlias?.trim();
  if (alias && !isIncompleteSuggestionLabel(alias, query)) return alias;

  return toSingularTitleCase(hit.occupation.title);
}

function withFriendlyTitle(hit: ProfessionSearchHit, query: string): ProfessionSearchHit {
  return {
    ...hit,
    marketTitle: getFriendlyProfessionLabel(hit, query),
  };
}

function buildMediumConfidenceOptions(
  matches: ProfessionSearchHit[],
  query: string
): MediumConfidenceOption[] {
  const deduped = new Map<string, MediumConfidenceOption>();

  for (const hit of matches) {
    if (hit.matchConfidence < MEDIUM_CONFIDENCE_THRESHOLD) continue;
    const label = getFriendlyProfessionLabel(hit, query);
    if (isIncompleteSuggestionLabel(label, query)) continue;
    const normalizedKey = label.toLowerCase();
    if (deduped.has(normalizedKey)) continue;

    deduped.set(normalizedKey, {
      id: normalizedKey,
      label,
      hit: withFriendlyTitle(hit, query),
    });
    if (deduped.size === 3) break;
  }

  return [...deduped.values()];
}

export function ProfessionSelect({ onResolved }: ProfessionSelectProps) {
  const [query, setQuery] = useState("");
  const [lowConfidence, setLowConfidence] = useState(false);
  const [mediumOptions, setMediumOptions] = useState<MediumConfidenceOption[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [spellingCorrection, setSpellingCorrection] = useState<ProfessionSearchHit | null>(null);

  const mode: "idle" | "medium" | "low" = useMemo(() => {
    if (mediumOptions.length > 0) return "medium";
    if (lowConfidence) return "low";
    return "idle";
  }, [mediumOptions.length, lowConfidence]);

  const selectedOption =
    mode === "medium"
      ? mediumOptions.find((option) => option.id === selectedOptionId) ?? null
      : null;

  const resetDecisionState = () => {
    setLowConfidence(false);
    setMediumOptions([]);
    setSelectedOptionId(null);
    setSpellingCorrection(null);
  };

  const handleSubmit = () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    if (mode === "medium" && selectedOption) {
      onResolved(selectedOption.hit);
      return;
    }

    const matches = searchOccupations(trimmed, 6);
    const best = matches[0];

    if (!best || best.matchConfidence < MEDIUM_CONFIDENCE_THRESHOLD) {
      setLowConfidence(true);
      setMediumOptions([]);
      setSelectedOptionId(null);
      setSpellingCorrection(suggestProfessionCorrection(trimmed));
      return;
    }

    if (best.matchConfidence >= HIGH_CONFIDENCE_THRESHOLD) {
      onResolved(withFriendlyTitle(best, trimmed));
      return;
    }

    const options = buildMediumConfidenceOptions(matches, trimmed);
    if (options.length === 0) {
      setLowConfidence(true);
      setMediumOptions([]);
      setSelectedOptionId(null);
      setSpellingCorrection(suggestProfessionCorrection(trimmed));
      return;
    }

    setLowConfidence(false);
    setMediumOptions(options);
    setSelectedOptionId(null);
    setSpellingCorrection(null);
  };

  return (
    <div className="space-y-5">
      <h1 className="display-subhead text-balance">What is your profession?</h1>

      <div className="rounded-2xl border border-black/[0.08] bg-white/80 p-3 shadow-sm">
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            if (mode !== "idle") resetDecisionState();
          }}
          placeholder="Type your profession"
          className="w-full rounded-xl border border-black/[0.06] bg-background px-4 py-3 text-[15px] text-foreground outline-none transition focus:border-accent/40"
        />
      </div>

      {mode === "medium" && (
        <div className="space-y-3 rounded-2xl border border-black/[0.06] bg-white/70 p-4">
          <p className="text-sm font-medium text-foreground">We found a few possible matches.</p>
          <div className="space-y-2">
            {mediumOptions.map((option) => {
              const selected = selectedOptionId === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedOptionId(option.id)}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                    selected
                      ? "border-accent bg-accent/10"
                      : "border-black/[0.06] bg-white/90 hover:border-accent/25"
                  }`}
                >
                  <p className="font-medium text-foreground">{option.label}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {mode === "low" && (
        <div className="rounded-2xl border border-black/[0.06] bg-white/70 p-4 text-sm text-muted">
          <p className="font-medium text-foreground">
            We couldn&apos;t confidently identify this profession.
          </p>
          <p className="mt-1">
            Please check the spelling or try a closely related profession title.
          </p>

          {spellingCorrection && (
            <div className="mt-4 rounded-xl border border-black/[0.06] bg-white/85 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted/80">
                Did you mean:
              </p>
              <button
                type="button"
                onClick={() => onResolved(spellingCorrection)}
                className="mt-2 w-full rounded-lg border border-black/[0.06] bg-white px-3 py-2 text-left font-medium text-foreground transition hover:border-accent/25"
              >
                {getFriendlyProfessionLabel(spellingCorrection, query)}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="pt-2">
        <Button
          onClick={handleSubmit}
          disabled={mode === "medium" ? selectedOption === null : query.trim().length === 0}
          className="w-full justify-center"
          trackCta={mode === "medium" ? "continue_after_profession_choice" : "continue_after_profession"}
          trackLocation="assessment"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
