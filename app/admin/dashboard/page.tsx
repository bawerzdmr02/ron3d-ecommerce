import AdminDashboard from "@/components/admin/AdminDashboard";
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

export default async function AdminDashboardPage() {
  const initialProducts = await getProducts();
  return <AdminDashboard initialProducts={initialProducts} />;
}
