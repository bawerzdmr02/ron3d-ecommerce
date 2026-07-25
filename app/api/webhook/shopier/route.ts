import { createAdminClient } from "@/utils/supabase/admin";
import {
  getHeader,
  getShopierWebhookToken,
  verifyShopierSignature,
} from "@/lib/shopier/verify";
import { NextResponse } from "next/server";

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonRecord;
  }
  return null;
}

function asString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
}

function pickString(obj: JsonRecord | null, keys: string[]): string | undefined {
  if (!obj) return undefined;
  for (const key of keys) {
    const value = asString(obj[key]);
    if (value) return value;
  }
  return undefined;
}

function parsePrice(raw: unknown): number {
  if (typeof raw === "number" && Number.isFinite(raw) && raw >= 0) return raw;
  if (typeof raw !== "string") return 0;
  const normalized = raw.replace(",", ".").replace(/[^\d.-]/g, "");
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function extractRonCode(note: string | undefined): string | null {
  if (!note) return null;
  const match = note.match(/\bRON-[A-Z0-9]{4,12}\b/i);
  return match ? match[0].toUpperCase() : null;
}

function parseCustomBlob(raw: string | undefined): {
  user_id?: string;
  product_id?: string;
  custom_text?: string;
} {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    const rec = asRecord(parsed);
    if (rec) {
      return {
        user_id: pickString(rec, ["user_id", "userId"]),
        product_id: pickString(rec, ["product_id", "productId"]),
        custom_text: pickString(rec, ["custom_text", "customText", "text"]),
      };
    }
  } catch {
    // ignore
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

async function resolveCheckoutIntent(note: string | undefined): Promise<{
  user_id?: string;
  product_id?: string | null;
  custom_text?: string | null;
  code?: string;
} | null> {
  const code = extractRonCode(note);
  if (!code) return null;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("checkout_intents")
    .select("id, code, user_id, product_id, custom_text, consumed_at, expires_at")
    .eq("code", code)
    .maybeSingle();

  if (error || !data) {
    console.warn("[shopier webhook] checkout intent not found", { code, error });
    return null;
  }

  if (data.consumed_at) {
    console.warn("[shopier webhook] checkout intent already consumed", { code });
    // Still return mapping so duplicate webhook retries can resolve user/product
    return {
      user_id: data.user_id,
      product_id: data.product_id,
      custom_text: data.custom_text,
      code: data.code,
    };
  }

  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
    console.warn("[shopier webhook] checkout intent expired", { code });
  }

  await admin
    .from("checkout_intents")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", data.id)
    .is("consumed_at", null);

  return {
    user_id: data.user_id,
    product_id: data.product_id,
    custom_text: data.custom_text,
    code: data.code,
  };
}

async function findUserIdByEmail(
  email: string
): Promise<string | null> {
  const admin = createAdminClient();
  const normalized = email.trim().toLowerCase();

  for (let page = 1; page <= 5; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) {
      console.error("[shopier webhook] listUsers failed", error.message);
      return null;
    }
    const found = data.users.find(
      (u) => u.email?.toLowerCase() === normalized
    );
    if (found) return found.id;
    if (data.users.length < 200) break;
  }
  return null;
}

function extractOrderFields(payload: unknown) {
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? root;
  const shipping = asRecord(data?.shippingAddress) ?? asRecord(data?.shipping);
  const buyer = asRecord(data?.buyer) ?? asRecord(data?.customer);

  const note =
    pickString(data, [
      "customerNote",
      "customer_note",
      "note",
      "customNote",
      "message",
      "custom_text",
    ]) ??
    pickString(root, ["customerNote", "customer_note", "note"]);

  const custom = parseCustomBlob(note);

  const email =
    pickString(data, ["email", "buyerEmail", "buyer_email"]) ??
    pickString(buyer, ["email"]) ??
    pickString(shipping, ["email"]);

  const orderId =
    pickString(data, ["id", "orderId", "order_id", "platform_order_id"]) ??
    pickString(root, ["id", "orderId"]);

  const price = parsePrice(
    data?.totalPrice ??
      data?.total_price ??
      data?.price ??
      data?.amount ??
      data?.total ??
      root?.price
  );

  const productId =
    custom.product_id ??
    pickString(data, ["productId", "product_id"]) ??
    (() => {
      const items = data?.lineItems ?? data?.line_items ?? data?.products;
      if (Array.isArray(items) && items.length > 0) {
        const first = asRecord(items[0]);
        return pickString(first, ["productId", "product_id", "id"]);
      }
      return undefined;
    })();

  return {
    orderId,
    email,
    price,
    userId: custom.user_id,
    productId: productId || null,
    customText: custom.custom_text ?? note ?? null,
  };
}

async function handleOrderCreated(payload: unknown) {
  const fields = extractOrderFields(payload);
  const intent = await resolveCheckoutIntent(fields.customText ?? undefined);

  let userId = intent?.user_id ?? fields.userId ?? null;
  const productId = intent?.product_id ?? fields.productId ?? null;

  let displayNote = intent?.custom_text ?? null;
  if (!displayNote && fields.customText) {
    const cleaned = fields.customText
      .replace(/\bRon3D kod:\s*RON-[A-Z0-9]+\b/gi, "")
      .replace(/\bRON-[A-Z0-9]{4,12}\b/gi, "")
      .trim();
    displayNote = cleaned || null;
  }

  if (!userId && fields.email) {
    userId = await findUserIdByEmail(fields.email);
  }

  if (!userId) {
    console.warn("[shopier webhook] order.created skipped: no user_id/email match", {
      orderId: fields.orderId,
      email: fields.email,
      intentCode: intent?.code,
    });
    return {
      ok: true,
      skipped: true,
      reason: "missing_user",
    } as const;
  }

  const supabase = createAdminClient();

  // Idempotency: avoid duplicate inserts for the same Shopier order note marker
  if (fields.orderId) {
    const marker = `[shopier:${fields.orderId}]`;
    const { data: existing } = await supabase
      .from("orders")
      .select("id")
      .ilike("custom_text", `%${marker}%`)
      .limit(1)
      .maybeSingle();

    if (existing) {
      return { ok: true, skipped: true, reason: "duplicate" } as const;
    }

    const noteParts = [
      displayNote,
      intent?.code ? `Ron3D kod: ${intent.code}` : null,
      marker,
    ].filter(Boolean);

    const { error } = await supabase.from("orders").insert({
      user_id: userId,
      product_id: productId,
      custom_text: noteParts.join("\n"),
      status: "Hazırlanıyor",
      price: fields.price,
    });

    if (error) {
      console.error("[shopier webhook] insert failed", error);
      return { ok: false, error: "insert_failed" } as const;
    }

    return { ok: true, matched_intent: Boolean(intent?.code) } as const;
  }

  const noteParts = [
    displayNote,
    intent?.code ? `Ron3D kod: ${intent.code}` : null,
  ].filter(Boolean);

  const { error } = await supabase.from("orders").insert({
    user_id: userId,
    product_id: productId,
    custom_text: noteParts.length ? noteParts.join("\n") : null,
    status: "Hazırlanıyor",
    price: fields.price,
  });

  if (error) {
    console.error("[shopier webhook] insert failed", error);
    return { ok: false, error: "insert_failed" } as const;
  }

  return { ok: true, matched_intent: Boolean(intent?.code) } as const;
}

async function handleRefundUpdated(payload: unknown) {
  const fields = extractOrderFields(payload);
  if (!fields.orderId) {
    return { ok: true, skipped: true, reason: "missing_order_id" } as const;
  }

  const supabase = createAdminClient();
  const marker = `[shopier:${fields.orderId}]`;
  const { data, error } = await supabase
    .from("orders")
    .update({ status: "İptal" })
    .ilike("custom_text", `%${marker}%`)
    .select("id");

  if (error) {
    console.error("[shopier webhook] refund update failed", error);
    return { ok: false, error: "update_failed" } as const;
  }

  return {
    ok: true,
    updated: data?.length ?? 0,
  } as const;
}

export async function POST(request: Request) {
  const token = getShopierWebhookToken();
  if (!token) {
    console.error("[shopier webhook] Missing SHOPIER_WEBHOOK_TOKEN");
    return NextResponse.json(
      { ok: false, error: "server_misconfigured" },
      { status: 500 }
    );
  }

  try {
    const rawBody = await request.text();
    const signature = getHeader(request.headers, "shopier-signature");

    if (!verifyShopierSignature(token, rawBody, signature)) {
      return NextResponse.json(
        { ok: false, error: "invalid_signature" },
        { status: 401 }
      );
    }

    const eventType =
      getHeader(request.headers, "shopier-event")?.trim() ||
      "order.created";

    let payload: unknown = {};
    if (rawBody) {
      try {
        payload = JSON.parse(rawBody);
      } catch {
        return NextResponse.json(
          { ok: false, error: "invalid_json" },
          { status: 400 }
        );
      }
    }

    if (eventType === "order.created") {
      const result = await handleOrderCreated(payload);
      if (!result.ok) {
        return NextResponse.json(result, { status: 500 });
      }
      return NextResponse.json(result, { status: 200 });
    }

    if (eventType === "refund.updated") {
      const result = await handleRefundUpdated(payload);
      if (!result.ok) {
        return NextResponse.json(result, { status: 500 });
      }
      return NextResponse.json(result, { status: 200 });
    }

    return NextResponse.json(
      { ok: true, skipped: true, reason: "unhandled_event", eventType },
      { status: 200 }
    );
  } catch (err) {
    console.error("[shopier webhook] Unexpected error", err);
    return NextResponse.json(
      { ok: false, error: "internal_error" },
      { status: 500 }
    );
  }
}
