"use client";

import { createClient } from "@/utils/supabase/client";
import { Loader2, Lock, Mail, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

export default function CustomerAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const supabase = useMemo(() => createClient(), []);

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (mode === "login") {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setError(err.message); setLoading(false); return; }
      router.push(redirectTo);
      router.refresh();
      return;
    }

    const { error: err } = await supabase.auth.signUp({ email, password });
    if (err) { setError(err.message); setLoading(false); return; }
    setMessage("Hesap oluşturuldu. E-posta doğrulaması gerekebilir.");
    setMode("login");
    setLoading(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex rounded-xl bg-slate-100 p-1">
        <button type="button" onClick={() => setMode("login")} className={`flex-1 rounded-lg py-2.5 text-sm font-semibold ${mode === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
          Giriş Yap
        </button>
        <button type="button" onClick={() => setMode("signup")} className={`flex-1 rounded-lg py-2.5 text-sm font-semibold ${mode === "signup" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
          Üye Ol
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-slate-700">E-posta</label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@email.com" disabled={loading} className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" />
          </div>
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-medium text-slate-700">Şifre</label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" />
          </div>
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {message && <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-800">{message}</p>}
        <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 py-3 text-sm font-bold text-white hover:bg-sky-700 disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "login" ? <Lock className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
          {loading ? "İşleniyor…" : mode === "login" ? "Giriş Yap" : "Hesap Oluştur"}
        </button>
      </form>
      <p className="text-center text-sm text-slate-500">
        <Link href={redirectTo} className="font-semibold text-sky-600 hover:underline">Alışverişe dön</Link>
      </p>
    </div>
  );
}
