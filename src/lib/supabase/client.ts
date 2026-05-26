"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase/config";

let client: SupabaseClient | null = null;
let warnedMisconfigured = false;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();

  if (!config) {
    if (
      process.env.NODE_ENV === "development" &&
      !warnedMisconfigured
    ) {
      warnedMisconfigured = true;
      console.warn(
        "[ILONAA analytics] Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local, then restart the dev server."
      );
    }
    return null;
  }

  if (!client) {
    client = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  return client;
}

export { isSupabaseConfigured } from "@/lib/supabase/config";
