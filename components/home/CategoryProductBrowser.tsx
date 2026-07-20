"use client";

import type { Product } from "@/lib/types/product";
import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";

type SortKey = "newest" | "price-asc" | "price-desc" | "title";

interface CategoryProductBrowserProps {
  categoryName: string;
  products: Product[];
}

export default function CategoryProductBrowser({
  categoryName,
  products,
}: CategoryProductBrowserProps) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [customOnly, setCustomOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => {
      if (customOnly && !p.is_customizable) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "title":
          return a.title.localeCompare(b.title, "tr");
        case "newest":
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });

    return list;
  }, [products, query, sort, customOnly]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block min-w-0 flex-1">
          <span className="sr-only">Ürün ara</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`${categoryName} içinde ara…`}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={customOnly}
              onChange={(e) => setCustomOnly(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            Kişiselleştirilebilir
          </label>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          >
            <option value="newest">En yeni</option>
            <option value="price-asc">Fiyat: düşük → yüksek</option>
            <option value="price-desc">Fiyat: yüksek → düşük</option>
            <option value="title">İsme göre</option>
          </select>
        </div>
      </div>

      <p className="mb-6 text-sm text-slate-500">
        {filtered.length} / {products.length} ürün gösteriliyor
      </p>

      {products.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 py-20 text-center">
          <p className="font-semibold text-slate-700">
            Bu kategoride henüz ürün yok
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Yakında yeni ürünler eklenecek.
          </p>
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
          <p className="mt-1 text-sm text-slate-500">
            Filtreleri değiştirmeyi deneyin.
          </p>
        </div>
      )}
    </div>
  );
}
