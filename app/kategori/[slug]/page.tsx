import CategoryProductBrowser from "@/components/home/CategoryProductBrowser";
import Navbar from "@/components/layout/Navbar";
import {
  CATEGORY_SLUGS,
  slugToCategory,
} from "@/lib/constants/categories";
import {
  getCategoryCards,
  getProductsByCategory,
} from "@/lib/data/categories";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return CATEGORY_SLUGS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = slugToCategory(slug);
  if (!category) return { title: "Kategori | Ron3D" };
  return {
    title: `${category} | Ron3D`,
    description: `Ron3D ${category} kategorisindeki tüm 3D baskı ürünleri.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = slugToCategory(slug);
  if (!category) notFound();

  const [products, cards] = await Promise.all([
    getProductsByCategory(category),
    getCategoryCards(),
  ]);

  const card = cards.find((c) => c.slug === slug);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <section className="border-b border-slate-100 bg-slate-50">
          <div className="mx-auto max-w-6xl px-5 py-10 lg:py-12">
            <Link
              href="/#kategoriler"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-sky-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Tüm kategoriler
            </Link>

            <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-sky-600">
                  Kategori
                </p>
                <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                  {category}
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  {products.length} ürün · filtreleyin ve 3D inceleyin
                </p>
              </div>

              {card?.image_url ? (
                <div className="relative h-28 w-full max-w-xs overflow-hidden rounded-2xl border border-slate-200 shadow-sm sm:h-32">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.image_url}
                    alt={category}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-6xl px-5">
            <CategoryProductBrowser
              categoryName={category}
              products={products}
            />
          </div>
        </section>
      </main>
    </>
  );
}
