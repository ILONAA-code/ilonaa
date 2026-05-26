import type { EventMetadataPayload } from "@/lib/analytics/types";
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

/** Required anonymous fields for question_completed events (no answers, no identity). */
export function buildQuestionCompletedMetadata(
  questionId: string,
  questionNumber: number,
  timeSpentMs: number
): Partial<EventMetadataPayload> {
  return {
    question_id: questionId,
    question_number: questionNumber,
    time_spent_ms: Math.max(0, Math.round(timeSpentMs)),
    device_type: getDeviceType(),
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
