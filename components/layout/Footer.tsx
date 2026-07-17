"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/brand/Logo";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <Logo size="footer" href="/" />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500">
              Kişiye özel 3D baskı ürünleri. Canlı önizleme, özelleştirme ve güvenli ödeme.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Mağaza</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href="/#products" className="hover:text-sky-600">Koleksiyon</Link></li>
              <li><Link href="/hakkimizda" className="hover:text-sky-600">Hakkımızda</Link></li>
            </ul>
          </div>
          <div id="contact">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">İletişim</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><a href="https://wa.me/905466293402" target="_blank" rel="noopener noreferrer" className="hover:text-sky-600">WhatsApp</a></li>
              <li><a href="mailto:info@ron3d.com" className="hover:text-sky-600">info@ron3d.com</a></li>
              <li><a href="https://instagram.com/ron3d" target="_blank" rel="noopener noreferrer" className="hover:text-sky-600">Instagram</a></li>
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Ron3D · Tüm hakları saklıdır
        </p>
      </div>
    </footer>
  );
}
