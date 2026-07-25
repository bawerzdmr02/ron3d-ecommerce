"use client";

import type { ProductReview } from "@/lib/types/review";
import StarRating from "@/components/ui/StarRating";

interface Props {
  reviews: ProductReview[];
  averageRating: number;
  formatReviewer: (id: string) => string;
}

export default function ProductReviews({
  reviews,
  averageRating,
  formatReviewer,
}: Props) {
  return (
    <section className="mt-14 border-t border-slate-200 pt-10">
      <h2 className="text-xl font-extrabold text-slate-900">Değerlendirmeler</h2>
      <div className="mt-2">
        <StarRating
          value={averageRating}
          showValue
          count={reviews.length}
          countLabel="değerlendirme"
        />
      </div>

      <div className="mt-8 space-y-3">
        {reviews.length === 0 ? (
          <p className="text-sm text-slate-500">Henüz değerlendirme yok.</p>
        ) : (
          reviews.map((r) => (
            <article
              key={r.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex justify-between">
                <p className="text-sm font-semibold text-slate-800">
                  {formatReviewer(r.user_id)}
                </p>
                <time className="text-xs text-slate-400">
                  {new Date(r.created_at).toLocaleDateString("tr-TR")}
                </time>
              </div>
              <div className="mt-1">
                <StarRating value={r.rating} size="sm" />
              </div>
              <p className="mt-2 text-sm text-slate-600">{r.comment}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
