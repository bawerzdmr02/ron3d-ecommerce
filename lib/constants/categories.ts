export const PRODUCT_CATEGORIES = [
  "Anahtarlık",
  "Oyuncak & Figür",
  "Motor & Araç Aksesuarı",
  "3D Lithophane",
  "Dekoratif & Ev",
  "Yedek Parça & Tamir",
  "Kutu & Organizatör",
  "Maket & Minyatür",
  "Kişiye Özel",
  "Diğer",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const DEFAULT_PRODUCT_CATEGORY: ProductCategory = "Diğer";

const TR_MAP: Record<string, string> = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
};

/** URL-safe slug from a Turkish category name. */
export function categoryToSlug(name: string): string {
  return name
    .trim()
    .split("")
    .map((ch) => TR_MAP[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const CATEGORY_SLUGS = PRODUCT_CATEGORIES.map((name) => ({
  name,
  slug: categoryToSlug(name),
}));

export function slugToCategory(slug: string): string | null {
  const found = CATEGORY_SLUGS.find((c) => c.slug === slug);
  return found?.name ?? null;
}

export function isProductCategory(value: string): value is ProductCategory {
  return (PRODUCT_CATEGORIES as readonly string[]).includes(value);
}
