import AdminLoginForm from "@/components/admin/AdminLoginForm";
import Link from "next/link";
import { ArrowLeft, Box } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Mağazaya dön
        </Link>

        <div className="mb-8 space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
            <Box className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Yönetici Girişi
          </h1>
          <p className="text-sm leading-relaxed text-slate-500">
            Ürün yönetim paneline güvenli erişim.
          </p>
        </div>

        <AdminLoginForm />
      </div>
    </div>
  );
}
