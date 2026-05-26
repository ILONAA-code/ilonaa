const PLACEHOLDER_MARKERS = ["your-project", "your-anon-key"];

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    return null;
  }

  const isPlaceholder = PLACEHOLDER_MARKERS.some(
    (marker) => url.includes(marker) || anonKey.includes(marker)
  );

  if (isPlaceholder || !url.includes(".supabase.co")) {
    return null;
  }

  const isSupportedKey =
    anonKey.startsWith("eyJ") || anonKey.startsWith("sb_publishable_");

  if (!isSupportedKey) {
    return null;
  }

  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}
