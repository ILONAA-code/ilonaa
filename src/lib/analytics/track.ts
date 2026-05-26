"use client";

import { buildEventMetadata } from "@/lib/analytics/metadata";
import { getAnonymousSessionId } from "@/lib/analytics/session";
import type { EventMetadataPayload, ProductEventName } from "@/lib/analytics/types";
import { getSupabaseClient } from "@/lib/supabase/client";

let warnedInsertFailure = false;

/**
 * Sends anonymous product events to Supabase (EU-hosted recommended).
 * Fails silently in production — surfaces misconfiguration in development only.
 */
export function trackProductEvent(
  eventName: ProductEventName,
  metadata?: Partial<EventMetadataPayload>
): void {
  if (typeof window === "undefined") return;

  void sendEvent(eventName, metadata);
}

async function sendEvent(
  eventName: ProductEventName,
  metadata?: Partial<EventMetadataPayload>
): Promise<void> {
  try {
    const client = getSupabaseClient();
    const sessionId = getAnonymousSessionId();

    if (!client || !sessionId) {
      return;
    }

    const payload = buildEventMetadata(metadata);

    const { error, status } = await client.from("events").insert({
      session_id: sessionId,
      event_name: eventName,
      metadata: payload,
    });

    if (error) {
      logInsertFailure(eventName, error.message, status);
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development" && !warnedInsertFailure) {
      warnedInsertFailure = true;
      console.warn(
        "[ILONAA analytics] Unexpected tracking error:",
        error instanceof Error ? error.message : error
      );
    }
  }
}

function logInsertFailure(
  eventName: ProductEventName,
  message: string,
  status?: number
): void {
  if (process.env.NODE_ENV !== "development" || warnedInsertFailure) {
    return;
  }

  warnedInsertFailure = true;
  console.warn(
    `[ILONAA analytics] Failed to record "${eventName}" (${status ?? "unknown"}): ${message}`
  );
}
