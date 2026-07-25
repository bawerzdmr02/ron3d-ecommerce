"use client";

import type { Product } from "@/lib/types/product";
import type { ToastType } from "@/components/ui/Toast";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const REDIRECT_DELAY_MS = 2800;

const NOTE_TOAST =
  'Sipariş kodunuz kopyalandı. Shopier ödeme sayfasındaki "Sipariş Notu" alanına yapıştırın, sonra ödemeye devam edin.';

export function useShopierPurchase(product: Product) {
  const router = useRouter();
  const pathname = usePathname();
  const [customText, setCustomText] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showCustomization = Boolean(product.model_url) && product.is_customizable;

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
    };
  }, []);

  async function handleBuy() {
    if (!product.shopier_url || redirecting) return;

    setRedirecting(true);
    setToast(null);

    try {
      const res = await fetch("/api/checkout/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          custom_text: customText.trim() || undefined,
        }),
      });

      const payload = (await res.json().catch(() => ({}))) as {
        error?: string;
        note?: string;
        shopier_url?: string;
      };

      if (res.status === 401) {
        setToast({
          message: "Satın almak için önce giriş yapın.",
          type: "error",
        });
        setRedirecting(false);
        const redirect = pathname || `/products/${product.id}`;
        router.push(`/giris?redirect=${encodeURIComponent(redirect)}`);
        return;
      }

      if (!res.ok || !payload.note || !payload.shopier_url) {
        throw new Error(payload.error || "Ödeme hazırlanamadı.");
      }

      try {
        await navigator.clipboard.writeText(payload.note);
        setToast({ message: NOTE_TOAST, type: "success" });
      } catch {
        setToast({
          message: `Metin kopyalanamadı. Shopier "Sipariş Notu"na şunu yapıştırın:\n${payload.note}`,
          type: "error",
        });
      }

      redirectTimeoutRef.current = setTimeout(() => {
        window.location.href = payload.shopier_url!;
      }, REDIRECT_DELAY_MS);
    } catch (err) {
      setToast({
        message:
          err instanceof Error ? err.message : "Ödeme başlatılamadı.",
        type: "error",
      });
      setRedirecting(false);
    }
  }

  return {
    customText,
    setCustomText,
    redirecting,
    handleBuy,
    toast,
    setToast,
    showCustomization,
  };
}
