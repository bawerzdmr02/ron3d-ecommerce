"use client";

import type { ProductReview } from "@/lib/types/review";
import StarRating from "@/components/ui/StarRating";
import { Loader2, Star } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";

interface Props {
  productId: string;
  reviews: ProductReview[];
  averageRating: number;
  userId: string | null;
  hasReviewed: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>, rating: number, comment: string) => Promise<void>;
  formatReviewer: (id: string) => string;
}

export default function ProductReviews({
  productId,
  reviews,
  averageRating,
  userId,
  hasReviewed,
  onSubmit,
  formatReviewer,
}: Props) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    await onSubmit(e, rating, comment);
    setComment("");
    setRating(5);
    setSubmitting(false);
  }

  return (
    <section className="mt-14 border-t border-slate-200 pt-10">
      <h2 className="text-xl font-extrabold text-slate-900">Değerlendirmeler</h2>
      <div className="mt-2">
        <StarRating value={averageRating} showValue count={reviews.length} countLabel="değerlendirme" />
      </div>

      {userId && !hasReviewed ? (
        <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-800">Yorum Yap</p>
          <div className="mt-3 flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
              const v = i + 1;
              return (
                <button key={v} type="button" onClick={() => setRating(v)} aria-label={`${v} yıldız`}>
                  <Star className={`h-6 w-6 ${v <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                </button>
              );
            })}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            required
            maxLength={500}
            placeholder="Deneyiminizi paylaşın…"
            className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
          <button
            type="submit"
            disabled={submitting || !comment.trim()}
            className="mt-3 rounded-xl bg-sky-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-sky-700 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="inline h-4 w-4 animate-spin" /> : "Gönder"}
          </button>
        </form>
      ) : userId && hasReviewed ? (
        <p className="mt-6 rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-800">
          Bu ürün için değerlendirmenizi zaten paylaştınız.
        </p>
      ) : (
        <p className="mt-6 text-sm text-slate-600">
          <Link href={`/giris?redirect=/products/${productId}`} className="font-semibold text-sky-600 hover:underline">
            Yorum yapmak için giriş yapın
          </Link>
        </p>
      )}

      <div className="mt-8 space-y-3">
        {reviews.length === 0 ? (
          <p className="text-sm text-slate-500">Henüz değerlendirme yok.</p>
        ) : (
          reviews.map((r) => (
            <article key={r.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex justify-between">
                <p className="text-sm font-semibold text-slate-800">{formatReviewer(r.user_id)}</p>
                <time className="text-xs text-slate-400">
                  {new Date(r.created_at).toLocaleDateString("tr-TR")}
                </time>
              </div>
              <div className="mt-1"><StarRating value={r.rating} size="sm" /></div>
              <p className="mt-2 text-sm text-slate-600">{r.comment}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
