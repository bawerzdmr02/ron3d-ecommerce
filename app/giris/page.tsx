import CustomerAuthForm from "@/components/auth/CustomerAuthForm";
import Logo from "@/components/brand/Logo";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";

export default function CustomerAuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-teal-50 px-5 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-sky-600">
          <ArrowLeft className="h-4 w-4" /> Ana sayfa
        </Link>
        <div className="mb-6">
          <Logo size="auth" href="/" />
          <h1 className="mt-6 text-xl font-bold text-slate-900">Giriş Yap veya Üye Ol</h1>
          <p className="mt-1 text-sm text-slate-500">Siparişlerinizi takip edin, yorum bırakın.</p>
        </div>
        <Suspense fallback={<div className="h-64 skeleton rounded-2xl" />}>
          <CustomerAuthForm />
        </Suspense>
      </div>
    </div>
  );
}
