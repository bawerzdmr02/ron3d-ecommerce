import Navbar from "@/components/layout/Navbar";
import type { Order } from "@/lib/types/order";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";

async function getOrders(email: string): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("orders").select("*").eq("user_email", email).order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []).map((r) => ({ ...r, amount: Number(r.amount) }));
}

const labels: Record<string, string> = { beklemede: "Beklemede", tamamlandi: "Tamamlandı", iptal: "İptal" };

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) redirect("/giris?redirect=/hesabim/siparislerim");

  const orders = await getOrders(user.email);

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
              <p className="mt-4 font-semibold text-slate-700">Henüz sipariş yok</p>
              <Link href="/#products" className="mt-4 inline-block rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-bold text-white">
                Alışverişe Başla
              </Link>
            </div>
          ) : (
            <div className="mt-8 space-y-3">
              {orders.map((o) => (
                <article key={o.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex justify-between">
                    <p className="font-semibold text-slate-900">{o.product_title || "Ürün"}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{labels[o.status] ?? o.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{new Date(o.created_at).toLocaleString("tr-TR")}</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">₺{o.amount.toLocaleString("tr-TR")}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
