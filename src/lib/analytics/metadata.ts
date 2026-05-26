import type { EventMetadataPayload } from "@/lib/analytics/types";
import type { Question } from "@/lib/assessment/types";
import { getSessionTimestamps, touchSessionActivity } from "@/lib/analytics/session";

export type DeviceType = "mobile" | "tablet" | "desktop";

const ALLOWED_METADATA_KEYS = new Set<string>([
  "question_number",
  "question_id",
  "time_spent_ms",
  "device_type",
  "screen_width",
  "timestamp",
  "session_started_at",
  "session_last_activity_at",
  "scroll_depth_percent",
  "time_on_page_ms",
  "cta_id",
  "location",
  "section_id",
  "ai_exposure_score",
  "resilience_score",
  "abandoned_at_question",
  "engagement_type",
  "selected_option",
  "selected_option_index",
  "slider_value",
]);

export function getDeviceType(): DeviceType {
  if (typeof window === "undefined") return "desktop";

  const width = window.innerWidth;

  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

export function getScreenWidth(): number {
  if (typeof window === "undefined") return 0;
  return Math.round(window.innerWidth);
}

function optionKey(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

/** Structured anonymous answer values — predefined options only, never free text. */
export function resolveAnswerMetadata(
  question: Question,
  selectedValue: number
): Pick<
  EventMetadataPayload,
  "selected_option" | "selected_option_index" | "slider_value"
> {
  if (question.type === "slider") {
    return { slider_value: Math.round(selectedValue) };
  }

  const options = question.options ?? [];
  const index = options.findIndex((option) => option.value === selectedValue);
  const option = index >= 0 ? options[index] : null;

  if (!option) {
    return {
      selected_option: "unknown",
      selected_option_index: -1,
    };
  }

  return {
    selected_option: optionKey(option.label),
    selected_option_index: index,
  };
}

/** Anonymous question_completed payload — structured answers only, no identity. */
export function buildQuestionCompletedMetadata(
  question: Question,
  questionNumber: number,
  timeSpentMs: number,
  selectedValue: number
): Partial<EventMetadataPayload> {
  return {
    question_id: question.id,
    question_number: questionNumber,
    time_spent_ms: Math.max(0, Math.round(timeSpentMs)),
    device_type: getDeviceType(),
    ...resolveAnswerMetadata(question, selectedValue),
  };
}

export function buildEventMetadata(
  metadata?: Partial<EventMetadataPayload>
): Record<string, string | number | boolean> {
  touchSessionActivity();

  const { startedAt, lastActivityAt } = getSessionTimestamps();

  const base: Record<string, string | number | boolean> = {
    device_type: getDeviceType(),
    screen_width: getScreenWidth(),
    timestamp: new Date().toISOString(),
    session_started_at: startedAt,
    session_last_activity_at: lastActivityAt,
  };

  if (!metadata) {
    return base;
  }

  for (const [key, value] of Object.entries(metadata)) {
    if (value === undefined) continue;
    if (!ALLOWED_METADATA_KEYS.has(key)) continue;
    base[key] = value;
  }

  return base;
}
