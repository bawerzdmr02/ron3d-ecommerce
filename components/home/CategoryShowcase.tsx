import type { CategoryCard } from "@/lib/types/category";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface CategoryShowcaseProps {
  categories: CategoryCard[];
}

export default function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  return (
    <section id="kategoriler" className="scroll-mt-20 border-b border-slate-100 bg-slate-50 py-14 lg:py-16">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Kategoriler
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              İstediğiniz ürün grubuna tıklayarak tüm ürünleri inceleyin.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/kategori/${cat.slug}`}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                {cat.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-sky-50 to-teal-50 px-3 text-center text-sm font-semibold text-sky-700/70">
                    {cat.name}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 px-3.5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">{cat.name}</p>
                  <p className="text-xs text-slate-500">
                    {cat.product_count ?? 0} ürün
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-sky-500 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
