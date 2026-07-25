import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

function makeCode() {
  const chunk = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `RON-${chunk}`;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "login_required" }, { status: 401 });
  }

  let body: { product_id?: string; custom_text?: string };
  try {
    body = (await request.json()) as {
      product_id?: string;
      custom_text?: string;
    };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const productId = body.product_id?.trim();
  if (!productId) {
    return NextResponse.json({ error: "missing_product_id" }, { status: 400 });
  }

  const customText = body.custom_text?.trim() || null;
  const admin = createAdminClient();

  // Verify product exists
  const { data: product, error: productError } = await admin
    .from("products")
    .select("id, price, shopier_url")
    .eq("id", productId)
    .maybeSingle();

  if (productError || !product) {
    return NextResponse.json({ error: "product_not_found" }, { status: 404 });
  }

  if (!product.shopier_url) {
    return NextResponse.json({ error: "missing_shopier_url" }, { status: 400 });
  }

  let code = makeCode();
  let created = null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data, error } = await admin
      .from("checkout_intents")
      .insert({
        code,
        user_id: user.id,
        product_id: productId,
        custom_text: customText,
        expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      })
      .select("id, code")
      .single();

    if (!error && data) {
      created = data;
      break;
    }

    // Unique violation → retry with new code
    code = makeCode();
  }

  if (!created) {
    return NextResponse.json(
      { error: "intent_create_failed" },
      { status: 500 }
    );
  }

  const noteLines = [
    customText,
    `Ron3D kod: ${created.code}`,
  ].filter(Boolean);

  return NextResponse.json({
    ok: true,
    code: created.code,
    note: noteLines.join("\n"),
    shopier_url: product.shopier_url,
  });
}
