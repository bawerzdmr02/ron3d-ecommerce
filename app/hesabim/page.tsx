import Navbar from "@/components/layout/Navbar";
import { orderStatusBadgeClass, type Order } from "@/lib/types/order";
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
  title: "Hesabım",
  description: "Ron3D hesap bilgileriniz, siparişleriniz ve değerlendirmeleriniz.",
  robots: { index: false, follow: false },
};

async function getUserOrders(userId: string): Promise<Order[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*, products(title)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Siparişler yüklenemedi:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    product_id: row.product_id,
    custom_text: row.custom_text,
    status: row.status,
    price: Number(row.price),
    created_at: row.created_at,
    product_title: Array.isArray(row.products)
      ? row.products[0]?.title
      : (row.products as { title?: string } | null)?.title,
  }));
}

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/giris?redirect=/hesabim");
  }

  const orders = await getUserOrders(user.id);

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

          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-sky-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Geçmiş Siparişlerim
                </h2>
              </div>
              <Link
                href="/hesabim/siparislerim"
                className="text-xs font-semibold text-sky-600 hover:underline"
              >
                Tümünü gör
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center">
                <Package className="mx-auto h-9 w-9 text-slate-300" />
                <p className="mt-3 text-sm font-medium text-slate-700">
                  Henüz bir siparişiniz bulunmuyor.
                </p>
                <Link
                  href="/#products"
                  className="mt-4 inline-flex rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-700"
                >
                  Alışverişe Başla
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <article
                    key={order.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">
                          {order.product_title || "Ürün"}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {new Date(order.created_at).toLocaleString("tr-TR")}
                        </p>
                        {order.custom_text && (
                          <p className="mt-2 text-sm text-slate-600">
                            <span className="text-slate-400">Özel yazı:</span>{" "}
                            {order.custom_text}
                          </p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${orderStatusBadgeClass(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-3 text-lg font-extrabold text-slate-900">
                      ₺{order.price.toLocaleString("tr-TR")}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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
