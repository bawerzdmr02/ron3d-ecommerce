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
    return {
      error: NextResponse.json({ error: "unauthorized" }, { status: 401 }),
    };
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
      .from("products")
      .delete()
      .eq("id", id)
      .select("id, title")
      .maybeSingle();

    if (error) {
      console.error("[admin products delete]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: "Ürün bulunamadı veya zaten silinmiş." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, deleted: data });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Ürün silinemedi.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
