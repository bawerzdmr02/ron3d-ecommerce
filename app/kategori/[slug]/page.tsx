import CategoryProductBrowser from "@/components/home/CategoryProductBrowser";
import Navbar from "@/components/layout/Navbar";
import {
  getCategoryBySlug,
  getProductsByCategory,
} from "@/lib/data/categories";
import { CATEGORY_SLUGS } from "@/lib/constants/categories";
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
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Kategori" };
  return {
    title: category.name,
    description: `Ron3D ${category.name} kategorisindeki tüm 3D baskı ürünleri.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const products = await getProductsByCategory(category.name);

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
                  {category.name}
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  {products.length} ürün · filtreleyin ve 3D inceleyin
                </p>
              </div>

              {category.image_url ? (
                <div className="relative h-28 w-full max-w-xs overflow-hidden rounded-2xl border border-slate-200 shadow-sm sm:h-32">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={category.image_url}
                    alt={category.name}
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
              categoryName={category.name}
              products={products}
            />
          </div>
        </section>
      </main>
    </>
  );
}
