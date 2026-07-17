import { createClient } from "@/utils/supabase/server";
import type { Product } from "@/lib/types/product";
import ProductCatalog from "./ProductCatalog";

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

export default async function ProductGrid() {
  const products = await getProducts();

  return <ProductCatalog products={products} />;
}
