const FALLBACK_SITE_URL = "https://ron3d.com";

export function getSiteUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

  if (fromEnv) {
    const withProtocol = fromEnv.startsWith("http")
      ? fromEnv
      : `https://${fromEnv}`;
    return withProtocol.replace(/\/+$/, "");
  }

  return FALLBACK_SITE_URL;
}

export const SITE_NAME = "Ron3D";
export const SITE_TAGLINE = "Özel Tasarım 3D Ürünler";
export const SITE_DESCRIPTION =
  "Ron3D ile kişiye özel 3D baskı ürünlerini canlı önizleyin, kişiselleştirin ve güvenle sipariş edin. Anahtarlık, lithophane, figür ve daha fazlası.";
