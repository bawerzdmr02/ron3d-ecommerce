import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

export default function ProductNotFound() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 items-center justify-center bg-white px-6 py-24">
        <div className="text-center">
          <p className="text-5xl font-extrabold text-sky-200">404</p>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Ürün bulunamadı</h1>
          <p className="mt-2 text-sm text-slate-500">Bağlantı hatalı veya ürün kaldırılmış olabilir.</p>
          <Link href="/#products" className="mt-6 inline-block rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-bold text-white">
            Koleksiyona dön
          </Link>
        </div>
      </main>
    </>
  );
}
