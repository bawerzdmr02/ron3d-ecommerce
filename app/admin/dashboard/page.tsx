import AdminDashboard from "@/components/admin/AdminDashboard";
import type { PendingReview } from "@/components/admin/AdminReviewPanel";
import type { Order } from "@/lib/types/order";
import type { CategoryMeta } from "@/lib/types/category";
import type { Product } from "@/lib/types/product";
import { createClient } from "@/utils/supabase/server";

async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Ürünler yüklenemedi:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    ...row,
    price: Number(row.price),
    category: row.category ?? "Diğer",
  }));
}

async function getPendingReviews(): Promise<PendingReview[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_reviews")
    .select("*, products(title)")
    .eq("is_approved", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Bekleyen yorumlar yüklenemedi:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    product_id: row.product_id,
    user_id: row.user_id,
    rating: Number(row.rating),
    comment: row.comment,
    created_at: row.created_at,
    is_approved: Boolean(row.is_approved),
    product_title: Array.isArray(row.products)
      ? row.products[0]?.title
      : (row.products as { title?: string } | null)?.title,
  }));
}

async function getOrders(): Promise<Order[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*, products(title)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Siparişler yüklenemedi:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    product_id: row.product_id,
    custom_text: row.custom_text,
    status: row.status,
    price: Number(row.price),
    created_at: row.created_at,
    product_title: Array.isArray(row.products)
      ? row.products[0]?.title
      : (row.products as { title?: string } | null)?.title,
  }));
}

async function getCategories(): Promise<CategoryMeta[]> {
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

export default async function AdminDashboardPage() {
  const [
    initialProducts,
    initialPendingReviews,
    initialOrders,
    initialCategories,
  ] = await Promise.all([
    getProducts(),
    getPendingReviews(),
    getOrders(),
    getCategories(),
  ]);

  return (
    <AdminDashboard
      initialProducts={initialProducts}
      initialPendingReviews={initialPendingReviews}
      initialOrders={initialOrders}
      initialCategories={initialCategories}
    />
  );
}
