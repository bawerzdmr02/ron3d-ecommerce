import { isAdminUser } from "@/lib/auth/admin";
import { categoryToSlug } from "@/lib/constants/categories";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminUser(user)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { name?: string; is_visible?: boolean };
  try {
    body = (await request.json()) as { name?: string; is_visible?: boolean };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const slug = categoryToSlug(name);
  if (!name || !slug) {
    return NextResponse.json({ error: "invalid_name" }, { status: 400 });
  }

  try {
    const admin = createAdminClient();

    const { data: existing } = await admin
      .from("categories")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1);

    const sortOrder = Number(existing?.[0]?.sort_order ?? 0) + 1;

    const { data, error } = await admin
      .from("categories")
      .insert({
        name,
        slug,
        image_url: "",
        sort_order: sortOrder,
        is_visible: body.is_visible !== false,
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, category: data });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Kategori eklenemedi.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
