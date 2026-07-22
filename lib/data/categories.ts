import { createClient } from "@/utils/supabase/server";
import type { CategoryCard, CategoryMeta } from "@/lib/types/category";
import type { Product } from "@/lib/types/product";

function normalizeMeta(row: Record<string, unknown>): CategoryMeta {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    image_url: String(row.image_url ?? ""),
    sort_order: Number(row.sort_order ?? 0),
    is_visible: row.is_visible !== false,
    updated_at: String(row.updated_at ?? new Date().toISOString()),
  };
}

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

  return (data ?? []).map((row) => normalizeMeta(row as Record<string, unknown>));
}

export async function getCategoryBySlug(
  slug: string
): Promise<CategoryMeta | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Kategori yüklenemedi:", error.message);
    return null;
  }

  return data ? normalizeMeta(data as Record<string, unknown>) : null;
}

/** Homepage cards — only visible categories. */
export async function getCategoryCards(): Promise<CategoryCard[]> {
  const metas = await getCategoryMetas();
  const visible = metas.filter((m) => m.is_visible);

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

  return visible.map((meta) => ({
    name: meta.name,
    slug: meta.slug,
    image_url: meta.image_url || fallbackImages.get(meta.name) || "",
    product_count: counts.get(meta.name) ?? 0,
    is_visible: meta.is_visible,
  }));
}

export async function getProductsByCategory(
  categoryName: string
): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", categoryName)
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
