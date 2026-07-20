"use client";

import { createClient } from "@/utils/supabase/client";
import Logo from "@/components/brand/Logo";
import { ChevronDown, LogOut, Menu, Package, Search, User, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const menuRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserEmail(user?.email ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUserEmail(s?.user?.email ?? null));
    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/?q=${encodeURIComponent(q)}#products` : "/#products");
    setMobileOpen(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="relative z-50 border-b border-slate-200/80 bg-white">
      <div className="mx-auto flex min-h-[5.5rem] max-w-6xl items-center gap-3 px-4 py-2 sm:min-h-[6.5rem] sm:gap-5 sm:px-5 md:min-h-[7.5rem]">
        <Logo size="nav" priority />

        <nav className="hidden items-center gap-6 lg:flex">
          <Link href="/#kategoriler" className="text-sm font-medium text-slate-600 hover:text-sky-600">
            Kategoriler
          </Link>
          <Link href="/#products" className="text-sm font-medium text-slate-600 hover:text-sky-600">
            Popüler
          </Link>
          <Link href="/hakkimizda" className="text-sm font-medium text-slate-600 hover:text-sky-600">
            Hakkımızda
          </Link>
        </nav>

        <form onSubmit={handleSearch} className="mx-auto hidden max-w-sm flex-1 md:block lg:max-w-xs xl:max-w-sm">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ne arıyorsunuz?"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />
          </div>
        </form>

        <div className="relative z-50 ml-auto flex items-center gap-2">
          {userEmail ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-xs font-bold text-sky-700">
                  {userEmail[0]?.toUpperCase()}
                </span>
                <span className="hidden sm:inline">Hesabım</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 z-[60] mt-2 w-52 rounded-xl border border-slate-200 bg-white py-1 shadow-xl shadow-slate-200/50">
                  <p className="truncate px-4 py-2 text-xs text-slate-500">{userEmail}</p>
                  <div className="border-t border-slate-100">
                    <Link href="/hesabim" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                      <User className="h-4 w-4 text-sky-500" /> Hesabım
                    </Link>
                    <Link href="/hesabim/siparislerim" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                      <Package className="h-4 w-4 text-sky-500" /> Siparişlerim
                    </Link>
                    <button type="button" onClick={signOut} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50">
                      <LogOut className="h-4 w-4 text-slate-400" /> Çıkış Yap
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/giris" className="hidden items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-sky-200 hover:bg-sky-700 sm:flex">
              <User className="h-4 w-4" /> Giriş / Üye Ol
            </Link>
          )}
          <button type="button" onClick={() => setMobileOpen((o) => !o)} className="rounded-xl border border-slate-200 p-2.5 md:hidden" aria-label="Menü">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="relative z-50 border-t border-slate-100 bg-white px-5 py-4 md:hidden">
          <form onSubmit={handleSearch} className="mb-3">
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ürün ara…" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-400" />
          </form>
          <Link href="/#kategoriler" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-50">Kategoriler</Link>
          <Link href="/#products" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-50">Popüler Ürünler</Link>
          <Link href="/hakkimizda" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-50">Hakkımızda</Link>
          {userEmail ? (
            <>
              <Link href="/hesabim" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-50">Hesabım</Link>
              <Link href="/hesabim/siparislerim" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-50">Siparişlerim</Link>
            </>
          ) : (
            <Link href="/giris" onClick={() => setMobileOpen(false)} className="mt-2 block rounded-xl bg-sky-600 px-4 py-2.5 text-center text-sm font-semibold text-white">Giriş / Üye Ol</Link>
          )}
        </div>
      )}
    </header>
  );
}
