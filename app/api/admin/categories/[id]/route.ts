import { isAdminUser } from "@/lib/auth/admin";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminUser(user)) {
    return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }

  return { user };
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("categories")
      .delete()
      .eq("id", id)
      .select("id, name")
      .maybeSingle();

    if (error) {
      console.error("[admin categories delete]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: "Kategori bulunamadı veya zaten silinmiş." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, deleted: data });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Kategori silinemedi.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (typeof body.image_url === "string") patch.image_url = body.image_url;
  if (typeof body.is_visible === "boolean") patch.is_visible = body.is_visible;
  if (typeof body.name === "string") patch.name = body.name;
  if (typeof body.slug === "string") patch.slug = body.slug;
  if (typeof body.sort_order === "number") patch.sort_order = body.sort_order;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("categories")
      .update(patch)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, category: data });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Kategori güncellenemedi.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
