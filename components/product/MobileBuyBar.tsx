"use client";

import { ExternalLink, Loader2 } from "lucide-react";

export default function MobileBuyBar({
  price,
  onBuy,
  redirecting,
  disabled = false,
}: {
  price: number;
  onBuy: () => void;
  redirecting: boolean;
  disabled?: boolean;
}) {
  if (disabled) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-4 backdrop-blur-lg lg:hidden">
      <div className="mx-auto flex max-w-6xl items-center gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase text-slate-400">Fiyat</p>
          <p className="text-xl font-extrabold text-slate-900">₺{price.toLocaleString("tr-TR")}</p>
        </div>
        <button
          type="button"
          onClick={onBuy}
          disabled={redirecting}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-600 py-3.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {redirecting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Yönlendiriliyor…</>
          ) : (
            <><ExternalLink className="h-4 w-4" /> Satın Al</>
          )}
        </button>
      </div>
    </div>
  );
}
