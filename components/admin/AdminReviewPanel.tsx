"use client";

import StarRating from "@/components/ui/StarRating";
import type { ProductReview } from "@/lib/types/review";
import { createClient } from "@/utils/supabase/client";
import { Check, Loader2, MessageSquareWarning, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

export interface PendingReview extends ProductReview {
  product_title?: string;
}

interface AdminReviewPanelProps {
  initialPending: PendingReview[];
  onToast: (message: string, type: "success" | "error") => void;
}

export default function AdminReviewPanel({
  initialPending,
  onToast,
}: AdminReviewPanelProps) {
  const supabase = useMemo(() => createClient(), []);
  const [pending, setPending] = useState(initialPending);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from("product_reviews")
      .select("*, products(title)")
      .eq("is_approved", false)
      .order("created_at", { ascending: false });

    if (error) {
      onToast(`Yorumlar yüklenemedi: ${error.message}`, "error");
      return;
    }

    setPending(
      (data ?? []).map((row) => ({
        id: row.id,
        product_id: row.product_id,
        user_id: row.user_id,
        rating: Number(row.rating),
        comment: row.comment,
        created_at: row.created_at,
        is_approved: Boolean(row.is_approved),
        product_title: Array.isArray(row.products)
          ? row.products[0]?.title
          : (row.products as { title?: string } | null)?.title,
      }))
    );
  }, [onToast, supabase]);

  async function approve(id: string) {
    setBusyId(id);
    const { error } = await supabase
      .from("product_reviews")
      .update({ is_approved: true })
      .eq("id", id);

    if (error) {
      onToast(`Onay başarısız: ${error.message}`, "error");
      setBusyId(null);
      return;
    }

    onToast("Yorum onaylandı ve yayınlandı.", "success");
    await refresh();
    setBusyId(null);
  }

  async function reject(id: string) {
    if (!confirm("Bu yorum silinsin mi? Bu işlem geri alınamaz.")) return;

    setBusyId(id);
    const { error } = await supabase.from("product_reviews").delete().eq("id", id);

    if (error) {
      onToast(`Silme başarısız: ${error.message}`, "error");
      setBusyId(null);
      return;
    }

    onToast("Yorum reddedildi ve silindi.", "success");
    await refresh();
    setBusyId(null);
  }

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.08)]">
      <div className="mb-6 flex items-center gap-2">
        <MessageSquareWarning className="h-4 w-4 text-amber-500" />
        <h2 className="text-base font-semibold text-slate-900">
          Onay Bekleyen Yorumlar
        </h2>
        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
          {pending.length}
        </span>
      </div>

      {pending.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-14 text-center">
          <p className="text-sm font-medium text-slate-700">
            Onay bekleyen yorum yok.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Yeni gelen değerlendirmeler burada listelenir.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((review) => {
            const busy = busyId === review.id;
            return (
              <article
                key={review.id}
                className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {review.product_title || "Ürün"}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Kullanıcı •••{review.user_id.slice(-6)} ·{" "}
                      {new Date(review.created_at).toLocaleString("tr-TR")}
                    </p>
                    <div className="mt-2">
                      <StarRating value={review.rating} size="sm" />
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {review.comment}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => approve(review.id)}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-teal-700 disabled:opacity-50"
                    >
                      {busy ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      Onayla
                    </button>
                    <button
                      type="button"
                      onClick={() => reject(review.id)}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Reddet / Sil
                    </button>
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
