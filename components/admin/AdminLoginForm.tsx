"use client";

import { isAdminUser } from "@/lib/auth/admin";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type Step = "email" | "otp";

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "unauthorized"
      ? "Bu hesap yönetici yetkisine sahip değil."
      : searchParams.get("error")
  );
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function ensureAdminOrSignOut() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!isAdminUser(user)) {
      await supabase.auth.signOut();
      setError("Bu hesap yönetici yetkisine sahip değil.");
      setStep("email");
      setOtp("");
      return false;
    }
    return true;
  }

  async function sendOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const redirectTo = `${window.location.origin}/auth/callback?next=/admin/dashboard`;

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: false,
        emailRedirectTo: redirectTo,
      },
    });

    setLoading(false);

    if (otpError) {
      setError(
        otpError.message.includes("Signups not allowed") ||
          otpError.message.toLowerCase().includes("user not found")
          ? "Bu e-posta ile kayıtlı yönetici hesabı bulunamadı."
          : otpError.message
      );
      return;
    }

    setStep("otp");
    setMessage(
      "Doğrulama kodu e-postanıza gönderildi. Kod ile devam edin veya e-postadaki bağlantıya tıklayın."
    );
  }

  async function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp.trim(),
      type: "email",
    });

    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
      return;
    }

    const ok = await ensureAdminOrSignOut();
    setLoading(false);
    if (!ok) return;

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <div className="space-y-5 rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.08)]">
      <div className="flex items-start gap-3 rounded-xl border border-sky-100 bg-sky-50 px-3.5 py-3 text-sm text-sky-900">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
        <p>
          Yönetici girişi yalnızca yetkili hesaplar içindir. Her girişte e-posta
          ile doğrulama kodu gönderilir; yeni hesap bu formdan açılamaz.
        </p>
      </div>

      {step === "email" ? (
        <form onSubmit={sendOtp} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-800">
              E-posta
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ron3d.com"
                disabled={loading}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 py-3 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-900/5 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Kod gönderiliyor…" : "Doğrulama Kodu Gönder"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="otp" className="text-sm font-medium text-slate-800">
              E-posta doğrulama kodu
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                minLength={6}
                maxLength={8}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\s/g, ""))}
                placeholder="6 haneli kod"
                disabled={loading}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 py-3 pl-10 pr-4 text-sm tracking-widest outline-none transition-all placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-900/5 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
            <p className="text-xs text-slate-500">{email}</p>
          </div>

          {message && (
            <p className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2.5 text-sm text-teal-800">
              {message}
            </p>
          )}
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Doğrulanıyor…" : "Giriş Yap"}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setStep("email");
              setOtp("");
              setError(null);
              setMessage(null);
            }}
            className="w-full text-center text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            Farklı e-posta kullan
          </button>
        </form>
      )}
    </div>
  );
}
