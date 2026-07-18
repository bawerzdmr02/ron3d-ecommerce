import Navbar from "@/components/layout/Navbar";
import { orderStatusBadgeClass, type Order } from "@/lib/types/order";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";

async function getOrders(userId: string): Promise<Order[]> {
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

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) redirect("/giris?redirect=/hesabim/siparislerim");

  const orders = await getOrders(user.id);

  return (
    <>
      <Navbar />
      <main className="min-h-[60vh] bg-white">
        <div className="mx-auto max-w-lg px-5 py-12">
          <h1 className="text-2xl font-extrabold text-slate-900">Siparişlerim</h1>
          <p className="mt-1 text-sm text-slate-500">Geçmiş siparişleriniz</p>

          {orders.length === 0 ? (
            <div className="mt-10 rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
              <Package className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-4 font-semibold text-slate-700">
                Henüz bir siparişiniz bulunmuyor.
              </p>
              <Link
                href="/#products"
                className="mt-4 inline-block rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-bold text-white"
              >
                Alışverişe Başla
              </Link>
            </div>
          ) : (
            <div className="mt-8 space-y-3">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {order.product_title || "Ürün"}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(order.created_at).toLocaleString("tr-TR")}
                      </p>
                      {order.custom_text && (
                        <p className="mt-2 text-sm text-slate-600">
                          Özel yazı: {order.custom_text}
                        </p>
                      )}
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${orderStatusBadgeClass(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-3 text-lg font-bold text-slate-900">
                    ₺{order.price.toLocaleString("tr-TR")}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
