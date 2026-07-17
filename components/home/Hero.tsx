import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="border-b border-zinc-100 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-20">
        <div className="max-w-xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-100 bg-zinc-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            <Sparkles className="h-3.5 w-3.5 text-[#f27a1a]" />
            İnteraktif 3D Alışveriş
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
              Kişiye Özel 3D Tasarımlar
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-slate-500 sm:text-lg">
              Özenle seçilmiş 3D baskı ürünlerini canlı önizleyin, kişiselleştirin
              ve güvenle sipariş verin.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="#products"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f27a1a] px-7 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#e56f12]"
            >
              Ürünleri İncele
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#about"
              className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-zinc-50"
            >
              Daha Fazla Bilgi
            </Link>
          </div>
        </div>

        <div className="relative aspect-square w-full max-w-md justify-self-center lg:max-w-none">
          <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50 p-8 shadow-sm">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
              <span className="text-2xl font-bold text-[#f27a1a]">3D</span>
            </div>
            <p className="text-center text-sm font-semibold text-slate-800">
              Canlı 3D Önizleme
            </p>
            <p className="mt-2 max-w-[240px] text-center text-xs leading-relaxed text-slate-500">
              Ürünleri döndürün, yakınlaştırın ve kişiselleştirilmiş metninizi
              anında görün.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
