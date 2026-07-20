import { createClient } from "@/utils/supabase/server";
import {
  CATEGORY_SLUGS,
  type ProductCategory,
} from "@/lib/constants/categories";
import type { CategoryCard, CategoryMeta } from "@/lib/types/category";
import type { Product } from "@/lib/types/product";

export async function getCategoryMetas(): Promise<CategoryMeta[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Kategoriler yüklenemedi:", error.message);
    return [];
  }

  return (data ?? []) as CategoryMeta[];
}

export async function getCategoryCards(): Promise<CategoryCard[]> {
  const metas = await getCategoryMetas();
  const bySlug = new Map(metas.map((m) => [m.slug, m]));

  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("category, image_url");

  const counts = new Map<string, number>();
  const fallbackImages = new Map<string, string>();

  for (const row of products ?? []) {
    const name = (row.category as string | null)?.trim() || "Diğer";
    counts.set(name, (counts.get(name) ?? 0) + 1);
    if (row.image_url && !fallbackImages.has(name)) {
      fallbackImages.set(name, row.image_url as string);
    }
  }

  return CATEGORY_SLUGS.map(({ name, slug }) => {
    const meta = bySlug.get(slug);
    return {
      name,
      slug,
      image_url: meta?.image_url || fallbackImages.get(name) || "",
      product_count: counts.get(name) ?? 0,
    };
  });
}

export async function getProductsByCategory(
  category: ProductCategory
): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Kategori ürünleri yüklenemedi:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    ...row,
    price: Number(row.price),
    category: row.category ?? "Diğer",
  }));
}

export async function getPopularProducts(limit = 9): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Popüler ürünler yüklenemedi:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    ...row,
    price: Number(row.price),
    category: row.category ?? "Diğer",
  }));
}
