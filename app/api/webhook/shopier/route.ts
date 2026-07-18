import { createAdminClient } from "@/utils/supabase/admin";
import { NextResponse } from "next/server";

/**
 * ---------------------------------------------------------------------------
 * Shopier signature validation (TODO — enable once API keys are active)
 * ---------------------------------------------------------------------------
 * Shopier payment callbacks typically include a signature / hash field derived
 * from the payload and your shop secret (SHOPIER_API_SECRET).
 *
 * Planned verification steps:
 *  1. Read `SHOPIER_API_SECRET` from process.env.
 *  2. Reconstruct the signed string from the documented field order
 *     (commonly random_nr + platform_order_id + total_order_value + currency,
 *     or HMAC-SHA256 over the raw body for REST webhooks — confirm against
 *     Shopier's current docs for your account type).
 *  3. Compare the computed digest to the provided `signature` / `hash` /
 *     `Shopier-Signature` header using a constant-time equality check
 *     (e.g. crypto.timingSafeEqual).
 *  4. Reject the request with 401 if the signature does not match.
 *
 * Until keys are available we intentionally skip verification so the insert
 * path can be tested with mocked POSTs. Do NOT deploy this endpoint publicly
 * without enabling signature checks.
 * ---------------------------------------------------------------------------
 */

type CustomParams = {
  user_id?: string;
  product_id?: string;
  custom_text?: string;
};

function firstValue(
  form: FormData,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = form.get(key);
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function parseCustomParams(raw: string | undefined): CustomParams {
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as CustomParams;
    }
  } catch {
    // Fall through to query-string style: user_id=...&product_id=...
  }

  try {
    const params = new URLSearchParams(raw);
    return {
      user_id: params.get("user_id") ?? undefined,
      product_id: params.get("product_id") ?? undefined,
      custom_text: params.get("custom_text") ?? undefined,
    };
  } catch {
    return {};
  }
}

function isSuccessfulPayment(status: string | undefined): boolean {
  if (!status) return false;
  const normalized = status.trim().toLowerCase();
  return (
    normalized === "success" ||
    normalized === "successful" ||
    normalized === "1" ||
    normalized === "true"
  );
}

function parsePrice(raw: string | undefined): number {
  if (!raw) return 0;
  const normalized = raw.replace(",", ".").replace(/[^\d.-]/g, "");
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

export async function POST(request: Request) {
  // Referenced for future signature validation — see comment block above.
  const _shopierApiSecret = process.env.SHOPIER_API_SECRET;

  try {
    const form = await request.formData();

    const status = firstValue(form, "status", "payment_status");
    const orderNo = firstValue(
      form,
      "order_no",
      "platform_order_id",
      "payment_id",
      "invoice_id"
    );
    const customParamsRaw = firstValue(
      form,
      "custom_params",
      "customparams",
      "modul",
      "product_list"
    );
    const priceRaw = firstValue(
      form,
      "total_order_value",
      "total",
      "price",
      "amount"
    );
    const customTextFallback = firstValue(
      form,
      "custom_text",
      "buyer_note",
      "message",
      "note"
    );

    // MOCK: skip signature validation while Shopier account / keys are inactive.
    void _shopierApiSecret;
    void orderNo;

    if (!isSuccessfulPayment(status)) {
      return NextResponse.json(
        { ok: true, skipped: true, reason: "non_success_status" },
        { status: 200 }
      );
    }

    const customParams = parseCustomParams(customParamsRaw);
    const userId =
      customParams.user_id ?? firstValue(form, "user_id", "buyer_id");
    const productId =
      customParams.product_id ?? firstValue(form, "product_id");
    const customText =
      customParams.custom_text ?? customTextFallback ?? null;
    const price = parsePrice(priceRaw);

    if (!userId) {
      console.error("[shopier webhook] Missing user_id in payload", {
        orderNo,
        customParamsRaw,
      });
      return NextResponse.json(
        { ok: false, error: "missing_user_id" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase.from("orders").insert({
      user_id: userId,
      product_id: productId || null,
      custom_text: customText,
      status: "Hazırlanıyor",
      price,
    });

    if (error) {
      console.error("[shopier webhook] Order insert failed", error);
      return NextResponse.json(
        { ok: false, error: "insert_failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[shopier webhook] Unexpected error", err);
    return NextResponse.json(
      { ok: false, error: "internal_error" },
      { status: 500 }
    );
  }
}
