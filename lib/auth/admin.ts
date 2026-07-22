import type { User } from "@supabase/supabase-js";

/**
 * Admin yetkisi yalnızca app_metadata içinde tutulur.
 * user_metadata kullanıcı tarafından değiştirilebilir — asla kullanılmaz.
 */
export function isAdminUser(user: User | null | undefined): boolean {
  if (!user) return false;
  const role = user.app_metadata?.role;
  return role === "admin";
}
