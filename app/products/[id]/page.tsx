import Navbar from "@/components/layout/Navbar";
import ProductDetail from "@/components/product/ProductDetail";
import type { Product } from "@/lib/types/product";
import type { ProductReview } from "@/lib/types/review";
import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  return {
    ...data,
    price: Number(data.price),
    category: data.category ?? "Diğer",
  };
}

async function getReviews(productId: string): Promise<ProductReview[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Yorumlar yüklenemedi:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    ...row,
    rating: Number(row.rating),
  }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return { title: "Ürün Bulunamadı | Ron3D" };
  }

  return {
    title: `${product.title} | Ron3D`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  const reviews = await getReviews(product.id);
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ProductDetail
          product={product}
          initialReviews={reviews}
          averageRating={averageRating}
        />
      </main>
    </>
  );
}
