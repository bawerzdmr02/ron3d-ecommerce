"use client";

import Toast from "@/components/ui/Toast";
import StarRating from "@/components/ui/StarRating";
import { useShopierPurchase } from "@/lib/hooks/useShopierPurchase";
import type { Product } from "@/lib/types/product";
import type { ProductReview } from "@/lib/types/review";
import { createClient } from "@/utils/supabase/client";
import { ExternalLink, Loader2, ShieldCheck, Sparkles, Truck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import MobileBuyBar from "./MobileBuyBar";
import ProductMediaGallery from "./ProductMediaGallery";
import ProductReviews from "./ProductReviews";

interface ProductDetailProps {
  product: Product;
  initialReviews: ProductReview[];
  averageRating: number;
}

function formatReviewer(userId: string) {
  return `Müşteri •••${userId.slice(-6)}`;
}

export default function ProductDetail({
  product,
  initialReviews,
  averageRating,
}: ProductDetailProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { customText, setCustomText, redirecting, handleBuy, toast, setToast, showCustomization } =
    useShopierPurchase(product);

  const [reviews] = useState(initialReviews);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasReviewed, setHasReviewed] = useState(false);
  const category = product.category ?? "Diğer";
  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : averageRating;

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) =>
      setUserId(s?.user?.id ?? null)
    );
    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    let cancelled = false;

    async function checkReviewed(uid: string | null) {
      if (!uid) {
        if (!cancelled) setHasReviewed(false);
        return;
      }

      const { data } = await supabase
        .from("product_reviews")
        .select("id")
        .eq("product_id", product.id)
        .eq("user_id", uid)
        .maybeSingle();

      if (!cancelled) setHasReviewed(Boolean(data));
    }

    checkReviewed(userId);

    return () => {
      cancelled = true;
    };
  }, [product.id, supabase, userId]);

  async function handleReviewSubmit(e: FormEvent<HTMLFormElement>, rating: number, comment: string) {
    e.preventDefault();
    if (!userId) {
      router.push(`/giris?redirect=/products/${product.id}`);
      return;
    }
    const { error } = await supabase
      .from("product_reviews")
      .insert({
        product_id: product.id,
        user_id: userId,
        rating,
        comment: comment.trim(),
        is_approved: false,
      });
    if (error) {
      setToast({
        message: error.code === "23505" ? "Bu ürüne zaten yorum yaptınız." : error.message,
        type: "error",
      });
      return;
    }
    setHasReviewed(true);
    setToast({
      message: "Yorumunuz alındı, yönetici onayından sonra yayınlanacaktır.",
      type: "success",
    });
    router.refresh();
  }

  return (
    <div className="bg-white pb-28 lg:pb-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-5 py-3 text-sm text-slate-500">
          <Link href="/" className="hover:text-sky-600">Ana Sayfa</Link>
          <span className="mx-2">/</span>
          <Link href="/#products" className="hover:text-sky-600">{category}</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-800">{product.title}</span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-8 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <ProductMediaGallery product={product} customText={showCustomization ? customText : undefined} />

          <div className="lg:sticky lg:top-20">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-lg bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">{category}</span>
                {product.is_customizable && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                    <Sparkles className="h-3 w-3" /> Özelleştirilebilir
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-2xl font-extrabold text-slate-900 sm:text-3xl">{product.title}</h1>
              <div className="mt-3">
                <StarRating value={avg} showValue count={reviews.length} countLabel="değerlendirme" />
              </div>
              <p className="mt-5 text-3xl font-extrabold text-slate-900">
                ₺{product.price.toLocaleString("tr-TR")}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">{product.description}</p>

              {showCustomization && (
                <div className="mt-5">
                  <label htmlFor="custom-text" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Özel Yazı
                  </label>
                  <input
                    id="custom-text"
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Yazınızı girin…"
                    maxLength={32}
                    disabled={redirecting}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:opacity-50"
                  />
                </div>
              )}

              <div className="mt-6 hidden lg:block">
                {product.shopier_url ? (
                  <button
                    type="button"
                    onClick={handleBuy}
                    disabled={redirecting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 py-4 text-base font-bold text-white shadow-lg shadow-sky-200 hover:bg-sky-700 disabled:opacity-60"
                  >
                    {redirecting ? (
                      <><Loader2 className="h-5 w-5 animate-spin" /> Yönlendiriliyor…</>
                    ) : (
                      <><ExternalLink className="h-5 w-5" /> Satın Al</>
                    )}
                  </button>
                ) : (
                  <p className="rounded-xl border border-dashed border-slate-200 py-4 text-center text-sm text-slate-500">
                    Ödeme bağlantısı henüz eklenmemiş.
                  </p>
                )}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
                    <ShieldCheck className="h-4 w-4 text-teal-500" /> Güvenli ödeme
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
                    <Truck className="h-4 w-4 text-sky-500" /> Özel üretim
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ProductReviews
          productId={product.id}
          reviews={reviews}
          averageRating={avg}
          userId={userId}
          hasReviewed={hasReviewed}
          onSubmit={handleReviewSubmit}
          formatReviewer={formatReviewer}
        />
      </div>

      <MobileBuyBar price={product.price} onBuy={handleBuy} redirecting={redirecting} disabled={!product.shopier_url} />
    </div>
  );
}
