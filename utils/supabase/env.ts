function normalizeSupabaseUrl(raw: string): string {
  let url = raw.trim();

  // Users sometimes copy the REST endpoint instead of the project URL.
  url = url.replace(/\/rest\/v1\/?$/i, "");
  url = url.replace(/\/+$/, "");

  return url;
}

/** True when public Supabase env vars are present (needed for real API calls). */
export function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );
}

/**
 * Never throw during static prerender (Navbar/Footer SSR).
 * Missing values use placeholders so `next build` can finish; runtime
 * requests still need real Vercel/env vars.
 */
export function getSupabaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!raw?.trim()) {
    return "https://placeholder.supabase.co";
  }

  const url = normalizeSupabaseUrl(raw);

  try {
    new URL(url);
  } catch {
    throw new Error(
      `Invalid NEXT_PUBLIC_SUPABASE_URL: "${raw}". Use the project root URL only (no /rest/v1 path).`
    );
  }

  return url;
}

export function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!key) {
    return "public-anon-key-missing";
  }

  return key;
}
