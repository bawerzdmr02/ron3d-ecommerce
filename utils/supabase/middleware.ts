import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminUser } from "@/lib/auth/admin";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  hasSupabaseEnv,
} from "./env";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (!hasSupabaseEnv()) {
    return supabaseResponse;
  }

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdmin = isAdminUser(user);

  if (pathname.startsWith("/hesabim") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/giris";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // /admin/dashboard — yalnızca admin
  if (pathname.startsWith("/admin/dashboard")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // /admin giriş sayfası — zaten admin ise panele al
  if (pathname === "/admin" && isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
