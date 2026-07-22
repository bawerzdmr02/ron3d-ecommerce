import { createClient } from "@/utils/supabase/server";
import { isAdminUser } from "@/lib/auth/admin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const safeNext = next.startsWith("/") ? next : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        `${origin}/admin?error=${encodeURIComponent(error.message)}`
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (safeNext.startsWith("/admin") && !isAdminUser(user)) {
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/admin?error=unauthorized`);
    }
  }

  return NextResponse.redirect(`${origin}${safeNext}`);
}
