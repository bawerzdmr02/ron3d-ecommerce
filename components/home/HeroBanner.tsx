import { ArrowRight, Box, Palette, Shield, Zap } from "lucide-react";
import Link from "next/link";

const perks = [
  { icon: Box, label: "Canlı 3D", desc: "Her açıdan inceleyin" },
  { icon: Palette, label: "Kişiselleştir", desc: "İsminizi yazdırın" },
  { icon: Shield, label: "Güvenli Ödeme", desc: "Shopier altyapısı" },
  { icon: Zap, label: "Hızlı Üretim", desc: "Özel 3D baskı" },
];

export default function HeroBanner() {
  return (
    <section className="hero-pattern border-b border-sky-100">
      <div className="mx-auto max-w-6xl px-5 py-14 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-sky-700 shadow-sm ring-1 ring-sky-100">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
              Türkiye&apos;nin 3D Mağazası
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem]">
              Ürünleri satın almadan önce{" "}
              <span className="bg-gradient-to-r from-sky-600 to-teal-500 bg-clip-text text-transparent">
                deneyimleyin
              </span>
            </h1>

            <p className="mt-5 max-w-md text-base leading-relaxed text-slate-600">
              Ron3D ile özel tasarım 3D baskı ürünlerini döndürün, kişiselleştirin
              ve güvenle sipariş verin.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#products"
                className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-200 transition-transform hover:-translate-y-0.5 hover:bg-sky-700"
              >
                Alışverişe Başla
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/hakkimizda"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Hakkımızda
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/60">
              <div className="grid grid-cols-2 gap-4">
                {perks.map((perk) => (
                  <div
                    key={perk.label}
                    className="rounded-2xl bg-gradient-to-br from-slate-50 to-sky-50/50 p-4 ring-1 ring-slate-100"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm">
                      <perk.icon className="h-5 w-5" />
                    </span>
                    <p className="mt-3 text-sm font-bold text-slate-900">{perk.label}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{perk.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 -z-10 h-full w-full rounded-3xl bg-gradient-to-br from-sky-100 to-teal-100" />
          </div>
        </div>
      </div>
    </section>
  );
}
