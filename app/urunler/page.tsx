import CategoryProductBrowser from "@/components/home/CategoryProductBrowser";
import Navbar from "@/components/layout/Navbar";
import { getAllProducts } from "@/lib/data/categories";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tüm Ürünler",
  description:
    "Ron3D koleksiyonundaki tüm 3D baskı ürünleri. Filtreleyin, sıralayın ve inceleyin.",
};

interface ProductsPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AllProductsPage({
  searchParams,
}: ProductsPageProps) {
  const { q } = await searchParams;
  const products = await getAllProducts();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <section className="border-b border-slate-100 bg-slate-50">
          <div className="mx-auto max-w-6xl px-5 py-10 lg:py-12">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-sky-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Anasayfa
            </Link>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-sky-600">
                Mağaza
              </p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Tüm Ürünler
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                {products.length} ürün · ara, filtrele ve incele
                {q ? ` · arama: “${q}”` : ""}
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-6xl px-5">
            <CategoryProductBrowser
              products={products}
              searchPlaceholder="Ürün veya kategori ara…"
              emptyTitle="Henüz ürün eklenmemiş"
              emptyHint="Yakında yeni ürünler eklenecek."
              initialQuery={q?.trim() ?? ""}
            />
          </div>
        </section>
      </main>
    </>
  );
}
