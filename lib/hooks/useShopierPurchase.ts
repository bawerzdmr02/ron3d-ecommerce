"use client";

import type { Product } from "@/lib/types/product";
import type { ToastType } from "@/components/ui/Toast";
import { useEffect, useRef, useState } from "react";

const REDIRECT_DELAY_MS = 2500;

const CLIPBOARD_SUCCESS_MESSAGE =
  'Tasarladığınız metin kopyalandı! Lütfen Shopier ödeme sayfasındaki "Sipariş Notu" kısmına yapıştırmayı unutmayın.';

export function useShopierPurchase(product: Product) {
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

    const trimmedText = customText.trim();
    const shouldCopyText = showCustomization && trimmedText.length > 0;

    if (shouldCopyText) {
      setRedirecting(true);
      try {
        await navigator.clipboard.writeText(trimmedText);
        setToast({ message: CLIPBOARD_SUCCESS_MESSAGE, type: "success" });
      } catch {
        setToast({
          message:
            'Metin kopyalanamadı. Lütfen metninizi not alın ve Shopier\'de "Sipariş Notu" alanına yapıştırın.',
          type: "error",
        });
      }
      redirectTimeoutRef.current = setTimeout(() => {
        window.location.href = product.shopier_url;
      }, REDIRECT_DELAY_MS);
      return;
    }

    window.location.href = product.shopier_url;
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
