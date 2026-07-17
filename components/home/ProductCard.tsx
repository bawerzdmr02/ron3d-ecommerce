"use client";

import Toast from "@/components/ui/Toast";
import { useShopierPurchase } from "@/lib/hooks/useShopierPurchase";
import type { Product } from "@/lib/types/product";
import { ArrowRight, Box, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

const ProductViewer3D = dynamic(() => import("./ProductViewer3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-100">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-sky-500" />
    </div>
  ),
});

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const {
    customText,
    setCustomText,
    redirecting,
    handleBuy,
    toast,
    setToast,
    showCustomization,
  } = useShopierPurchase(product);

  const showViewer = Boolean(product.model_url);
  const category = product.category ?? "Diğer";

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/80">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="relative aspect-[5/4] overflow-hidden bg-slate-100">
        {showViewer ? (
          <div className="absolute inset-0">
            <ProductViewer3D
              modelUrl={product.model_url}
              customText={showCustomization ? customText : undefined}
            />
          </div>
        ) : product.image_url ? (
          <Link href={`/products/${product.id}`} className="block h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image_url}
              alt={product.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>
        ) : (
          <Link href={`/products/${product.id}`} className="flex h-full items-center justify-center text-slate-300">
            <Box className="h-10 w-10" />
          </Link>
        )}
        {product.is_customizable && (
          <span className="pointer-events-none absolute left-3 top-3 rounded-lg bg-teal-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            Özel
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-sky-600">{category}</p>
          <Link href={`/products/${product.id}`}>
            <h3 className="mt-1 line-clamp-2 text-base font-bold text-slate-900 group-hover:text-sky-700">
              {product.title}
            </h3>
          </Link>
        </div>

        {showCustomization && (
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Özel yazı…"
            maxLength={32}
            disabled={redirecting}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:opacity-50"
          />
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <p className="text-xl font-extrabold text-slate-900">
            ₺{product.price.toLocaleString("tr-TR")}
          </p>
          <div className="flex gap-2">
            <Link
              href={`/products/${product.id}`}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              aria-label="Detay"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
            {product.shopier_url && (
              <button
                type="button"
                onClick={handleBuy}
                disabled={redirecting}
                className="rounded-lg bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-700 disabled:opacity-60"
              >
                {redirecting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Satın Al"}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
