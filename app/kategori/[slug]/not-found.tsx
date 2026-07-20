import Navbar from "@/components/layout/Navbar";
import Link from "next/link";

export default function CategoryNotFound() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-5 py-20 text-center">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Kategori bulunamadı
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Bu kategori mevcut değil veya kaldırılmış olabilir.
        </p>
        <Link
          href="/#kategoriler"
          className="mt-6 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
        >
          Kategorilere dön
        </Link>
      </main>
    </>
  );
}
