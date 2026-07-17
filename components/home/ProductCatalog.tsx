"use client";

import type { Product } from "@/lib/types/product";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";

const ALL = "Tümü";

interface ProductCatalogProps {
  products: Product[];
}

function cat(p: Product) {
  return p.category?.trim() || "Diğer";
}

export default function ProductCatalog({ products }: ProductCatalogProps) {
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const [active, setActive] = useState(ALL);

  const categories = useMemo(() => {
    const u = Array.from(new Set(products.map(cat))).sort((a, b) => a.localeCompare(b, "tr"));
    return [ALL, ...u];
  }, [products]);

  const filtered = useMemo(() => {
    let list = active === ALL ? products : products.filter((p) => cat(p) === active);
    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          cat(p).toLowerCase().includes(q)
      );
    }
    return list;
  }, [active, products, q]);

  const title = q
    ? `"${searchParams.get("q")}" sonuçları`
    : active === ALL
      ? "Popüler Ürünler"
      : active;

  return (
    <section id="products" className="scroll-mt-20 bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{title}</h2>
            <p className="mt-2 text-sm text-slate-500">
              {filtered.length > 0
                ? `${filtered.length} ürün · 3D önizleme · Güvenli ödeme`
                : "Ürün bulunamadı."}
            </p>
          </div>
        </div>

        {products.length > 0 && (
          <div className="scrollbar-hide -mx-5 mb-8 flex gap-2 overflow-x-auto px-5 pb-2">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setActive(c)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  active === c
                    ? "bg-sky-600 text-white shadow-md shadow-sky-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

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
