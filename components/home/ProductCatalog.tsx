"use client";

import type { Product } from "@/lib/types/product";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";

interface ProductCatalogProps {
  products: Product[];
}

function matchesQuery(p: Product, q: string) {
  const category = p.category?.trim() || "Diğer";
  return (
    p.title.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q) ||
    category.toLowerCase().includes(q)
  );
}

export default function ProductCatalog({ products }: ProductCatalogProps) {
  const searchParams = useSearchParams();
  const qRaw = searchParams.get("q")?.trim() ?? "";
  const q = qRaw.toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return products;
    return products.filter((p) => matchesQuery(p, q));
  }, [products, q]);

  const title = q ? `"${qRaw}" sonuçları` : "Popüler Ürünler";

  return (
    <section id="products" className="scroll-mt-20 bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {title}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {filtered.length > 0
                ? `${filtered.length} ürün · 3D önizleme · Güvenli ödeme`
                : "Ürün bulunamadı."}
            </p>
          </div>
          {!q && (
            <Link
              href="/#kategoriler"
              className="text-sm font-semibold text-sky-600 hover:text-sky-700 hover:underline"
            >
              Tüm kategoriler →
            </Link>
          )}
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 py-20 text-center">
            <p className="font-semibold text-slate-700">Henüz ürün eklenmemiş</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
            <p className="font-semibold text-slate-700">Sonuç bulunamadı</p>
            <p className="mt-1 text-sm text-slate-500">Farklı bir arama deneyin.</p>
          </div>
        )}
      </div>
    </section>
  );
}
