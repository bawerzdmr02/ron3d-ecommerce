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
