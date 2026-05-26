export type DeviceType = "mobile" | "tablet" | "desktop";

const ALLOWED_METADATA_KEYS = new Set([
  "question_number",
  "question_id",
  "device_type",
  "timestamp",
  "ai_exposure_score",
  "resilience_score",
  "cta_id",
  "location",
]);

export function getDeviceType(): DeviceType {
  if (typeof window === "undefined") return "desktop";

  const width = window.innerWidth;

  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

export function buildEventMetadata(
  metadata?: Record<string, string | number | boolean | undefined>
): Record<string, string | number | boolean> {
  const base: Record<string, string | number | boolean> = {
    device_type: getDeviceType(),
    timestamp: new Date().toISOString(),
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
