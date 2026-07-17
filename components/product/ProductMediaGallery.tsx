"use client";

import type { Product } from "@/lib/types/product";
import { Box, Loader2, Maximize2, Rotate3d } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

const ProductViewer3D = dynamic(() => import("@/components/home/ProductViewer3D"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
      <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
    </div>
  ),
});

type Mode = "3d" | "image";

export default function ProductMediaGallery({
  product,
  customText,
}: {
  product: Product;
  customText?: string;
}) {
  const has3d = Boolean(product.model_url);
  const hasImg = Boolean(product.image_url);
  const [mode, setMode] = useState<Mode>(has3d ? "3d" : "image");
  const [zoom, setZoom] = useState(false);

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
        {mode === "3d" && has3d ? (
          <div className="relative aspect-square w-full">
            <ProductViewer3D
              modelUrl={product.model_url}
              customText={customText}
              className="absolute inset-0"
            />
            <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-[11px] font-medium text-slate-600 shadow-sm backdrop-blur-sm">
              <Rotate3d className="h-3.5 w-3.5 text-sky-500" />
              Sürükleyerek döndürün
            </div>
          </div>
        ) : hasImg ? (
          <div className="relative aspect-square">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image_url}
              alt={product.title}
              className={`h-full w-full object-contain p-4 transition-transform ${zoom ? "scale-125" : ""}`}
              onClick={() => setZoom((z) => !z)}
            />
            <button
              type="button"
              onClick={() => setZoom((z) => !z)}
              className="absolute bottom-3 right-3 rounded-lg bg-white p-2 shadow-md"
              aria-label="Yakınlaştır"
            >
              <Maximize2 className="h-4 w-4 text-slate-600" />
            </button>
          </div>
        ) : (
          <div className="flex aspect-square items-center justify-center text-slate-300">
            <Box className="h-14 w-14" />
          </div>
        )}
      </div>

      {has3d && hasImg && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setMode("3d"); setZoom(false); }}
            className={`rounded-lg px-4 py-2 text-xs font-bold ${mode === "3d" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600"}`}
          >
            3D Görünüm
          </button>
          <button
            type="button"
            onClick={() => setMode("image")}
            className={`h-10 w-10 overflow-hidden rounded-lg ring-2 ${mode === "image" ? "ring-sky-500" : "ring-transparent"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.image_url} alt="" className="h-full w-full object-cover" />
          </button>
        </div>
      )}
    </div>
  );
}
