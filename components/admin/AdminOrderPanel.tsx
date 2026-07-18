"use client";

import {
  ORDER_STATUSES,
  orderStatusBadgeClass,
  type Order,
} from "@/lib/types/order";
import { createClient } from "@/utils/supabase/client";
import { ClipboardList, Loader2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

interface AdminOrderPanelProps {
  initialOrders: Order[];
  onToast: (message: string, type: "success" | "error") => void;
}

export default function AdminOrderPanel({
  initialOrders,
  onToast,
}: AdminOrderPanelProps) {
  const supabase = useMemo(() => createClient(), []);
  const [orders, setOrders] = useState(initialOrders);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, products(title)")
      .order("created_at", { ascending: false });

    if (error) {
      onToast(`Siparişler yüklenemedi: ${error.message}`, "error");
      return;
    }

    setOrders(
      (data ?? []).map((row) => ({
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
      }))
    );
  }, [onToast, supabase]);

  async function updateStatus(orderId: string, status: string) {
    setBusyId(orderId);
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) {
      onToast(`Durum güncellenemedi: ${error.message}`, "error");
      setBusyId(null);
      return;
    }

    onToast("Sipariş durumu güncellendi.", "success");
    await refresh();
    setBusyId(null);
  }

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.08)]">
      <div className="mb-6 flex items-center gap-2">
        <ClipboardList className="h-4 w-4 text-sky-500" />
        <h2 className="text-base font-semibold text-slate-900">Sipariş Yönetimi</h2>
        <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
          {orders.length}
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-14 text-center">
          <p className="text-sm font-medium text-slate-700">Henüz sipariş yok.</p>
          <p className="mt-1 text-xs text-slate-500">
            Shopier webhook bağlandığında siparişler burada görünecek.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const busy = busyId === order.id;
            return (
              <article
                key={order.id}
                className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {order.product_title || "Ürün"}
                      </p>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${orderStatusBadgeClass(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Kullanıcı •••{order.user_id.slice(-6)} ·{" "}
                      {new Date(order.created_at).toLocaleString("tr-TR")}
                    </p>
                    {order.custom_text && (
                      <p className="mt-2 text-sm text-slate-600">
                        <span className="font-medium text-slate-500">Özel yazı:</span>{" "}
                        {order.custom_text}
                      </p>
                    )}
                    <p className="mt-2 text-base font-bold text-slate-900">
                      ₺{order.price.toLocaleString("tr-TR")}
                    </p>
                  </div>

                  <div className="shrink-0 sm:w-52">
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Durum
                    </label>
                    <div className="relative">
                      <select
                        value={order.status}
                        disabled={busy}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="w-full appearance-none rounded-xl border border-zinc-200 bg-white px-3 py-2.5 pr-8 text-sm font-medium text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:opacity-50"
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      {busy && (
                        <Loader2 className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-sky-500" />
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
