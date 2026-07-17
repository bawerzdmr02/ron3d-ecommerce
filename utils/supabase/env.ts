function normalizeSupabaseUrl(raw: string): string {
  let url = raw.trim();

  // Users sometimes copy the REST endpoint instead of the project URL.
  url = url.replace(/\/rest\/v1\/?$/i, "");
  url = url.replace(/\/+$/, "");

  return url;
}

export function getSupabaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!raw) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL. Set it in .env.local to your project root, e.g. https://<ref>.supabase.co"
    );
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
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Set it in .env.local from Supabase → Project Settings → API."
    );
  }

  return key;
}
