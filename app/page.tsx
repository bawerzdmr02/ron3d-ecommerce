import Navbar from "@/components/layout/Navbar";
import HeroBanner from "@/components/home/HeroBanner";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import ProductGrid from "@/components/home/ProductGrid";
import { getCategoryCards } from "@/lib/data/categories";
import { Box, Palette, Rotate3d, Shield } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function Fallback() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-8 h-10 w-48 skeleton rounded-xl" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[5/4] skeleton rounded-2xl" />
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  { icon: Rotate3d, title: "3D'de İncele", text: "Ürünü her açıdan döndürün." },
  { icon: Palette, title: "Kişiselleştir", text: "İsminizi veya metninizi ekleyin." },
  { icon: Shield, title: "Güvenle Öde", text: "Shopier ile hızlı ödeme." },
  { icon: Box, title: "Teslim Al", text: "Özel üretim, kapınıza gelsin." },
];

export default async function HomePage() {
  const categories = await getCategoryCards();

  return (
    <>
      <Navbar />
      <main>
        <HeroBanner />
        <Suspense fallback={<Fallback />}>
          <ProductGrid />
        </Suspense>
        <CategoryShowcase categories={categories} />

        <section id="about" className="scroll-mt-20 border-t border-slate-100 bg-slate-50 py-16 lg:py-20">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="text-center text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Nasıl Çalışır?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-center text-sm text-slate-500">
              Dört basit adımda kişiye özel 3D ürününüzü sipariş edin.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <div key={s.title} className="relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
                  <span className="absolute -top-3 left-5 flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <s.icon className="mt-2 h-6 w-6 text-sky-500" />
                  <h3 className="mt-3 font-bold text-slate-900">{s.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{s.text}</p>
                </div>
              ))}
            </div>
            <p className="mt-10 text-center">
              <Link
                href="/hakkimizda"
                className="text-sm font-semibold text-sky-600 hover:text-sky-700 hover:underline"
              >
                Ron3D hakkında daha fazla bilgi →
              </Link>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
