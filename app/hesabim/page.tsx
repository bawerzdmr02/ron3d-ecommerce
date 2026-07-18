import Navbar from "@/components/layout/Navbar";
import { createClient } from "@/utils/supabase/server";
import {
  ArrowRight,
  LogOut,
  MessageSquare,
  Package,
  UserRound,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Hesabım | Ron3D",
  description: "Ron3D hesap bilgileriniz, siparişleriniz ve değerlendirmeleriniz.",
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/giris?redirect=/hesabim");
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] bg-gradient-to-b from-sky-50/60 via-white to-white">
        <div className="mx-auto max-w-3xl px-5 py-12 lg:py-16">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-sky-600">
            Hesabım
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            Hoş geldiniz
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Hesap bilgilerinizi ve alışveriş geçmişinizi buradan yönetebilirsiniz.
          </p>

          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-xl font-extrabold text-sky-700">
                {user.email[0]?.toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-slate-500">
                  <UserRound className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Hesap
                  </span>
                </div>
                <p className="mt-1 truncate text-lg font-bold text-slate-900">
                  {user.email}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Üyelik:{" "}
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString("tr-TR")
                    : "—"}
                </p>
              </div>
            </div>
          </section>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Link
              href="/hesabim/siparislerim"
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition-colors group-hover:bg-sky-600 group-hover:text-white">
                <Package className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-base font-bold text-slate-900">
                Geçmiş Siparişlerim
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Önceki siparişlerinizi görüntüleyin ve durumlarını takip edin.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sky-600">
                Siparişlere git
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <MessageSquare className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-base font-bold text-slate-900">
                Değerlendirmelerim
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Ürünlere bıraktığınız yorumlar burada listelenecek. Onay sonrası
                vitrinde yayınlanır.
              </p>
              <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
                Yakında · Şimdilik ürün sayfalarından yorum bırakabilirsiniz.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/#products"
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white hover:bg-sky-700"
            >
              Alışverişe Devam Et
              <ArrowRight className="h-4 w-4" />
            </Link>
            <form
              action={async () => {
                "use server";
                const client = await createClient();
                await client.auth.signOut();
                redirect("/");
              }}
            >
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" />
                Çıkış Yap
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
