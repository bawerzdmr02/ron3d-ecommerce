"use client";

import type { CategoryMeta } from "@/lib/types/category";
import { categoryToSlug } from "@/lib/constants/categories";
import {
  assertValidUploadFile,
  getFileExtension,
  readFileForUpload,
  resolveContentType,
} from "@/lib/storage/upload";
import { createClient } from "@/utils/supabase/client";
import {
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { FormEvent, useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const BUCKET = "product-assets";

interface AdminCategoryPanelProps {
  initialCategories: CategoryMeta[];
  onToast: (message: string, type: "success" | "error") => void;
}

type RowState = CategoryMeta & {
  saving?: boolean;
  toggling?: boolean;
  clearing?: boolean;
  file?: File | null;
};

function toRows(categories: CategoryMeta[]): RowState[] {
  return categories
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, "tr"))
    .map((c) => ({
      ...c,
      is_visible: c.is_visible !== false,
      file: null,
    }));
}

export default function AdminCategoryPanel({
  initialCategories,
  onToast,
}: AdminCategoryPanelProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [rows, setRows] = useState<RowState[]>(() => toRows(initialCategories));
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  const setFile = useCallback((id: string, file: File | null) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, file } : row))
    );
  }, []);

  const saveImage = useCallback(
    async (id: string) => {
      const row = rows.find((r) => r.id === id);
      if (!row?.file) return;

      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, saving: true } : r))
      );

      try {
        assertValidUploadFile(row.file, "Kategori görseli");
        const ext = getFileExtension(row.file.name) || "jpg";
        const path = `categories/${row.slug}-${Date.now()}.${ext}`;
        const body = await readFileForUpload(row.file);
        const contentType = resolveContentType(row.file, "image");

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, body, { contentType, upsert: true });
        if (uploadError) throw new Error(uploadError.message);

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        const imageUrl = data.publicUrl;

        const { error } = await supabase
          .from("categories")
          .update({
            image_url: imageUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
        if (error) throw new Error(error.message);

        setRows((prev) =>
          prev.map((r) =>
            r.id === id
              ? { ...r, image_url: imageUrl, file: null, saving: false }
              : r
          )
        );
        onToast(`“${row.name}” görseli kaydedildi.`, "success");
        router.refresh();
      } catch (err) {
        onToast(
          err instanceof Error ? err.message : "Görsel kaydedilemedi.",
          "error"
        );
        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, saving: false } : r))
        );
      }
    },
    [onToast, router, rows, supabase]
  );

  const clearImage = useCallback(
    async (id: string) => {
      const row = rows.find((r) => r.id === id);
      if (!row || (!row.image_url && !row.file)) return;

      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, clearing: true } : r))
      );

      try {
        const { error } = await supabase
          .from("categories")
          .update({
            image_url: "",
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
        if (error) throw new Error(error.message);

        setRows((prev) =>
          prev.map((r) =>
            r.id === id
              ? { ...r, image_url: "", file: null, clearing: false }
              : r
          )
        );
        onToast(`“${row.name}” görseli silindi.`, "success");
        router.refresh();
      } catch (err) {
        onToast(
          err instanceof Error ? err.message : "Görsel silinemedi.",
          "error"
        );
        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, clearing: false } : r))
        );
      }
    },
    [onToast, router, rows, supabase]
  );

  const toggleVisible = useCallback(
    async (id: string) => {
      const row = rows.find((r) => r.id === id);
      if (!row) return;

      const next = !row.is_visible;
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, toggling: true } : r))
      );

      try {
        const { error } = await supabase
          .from("categories")
          .update({
            is_visible: next,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
        if (error) throw new Error(error.message);

        setRows((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, is_visible: next, toggling: false } : r
          )
        );
        onToast(
          next
            ? `“${row.name}” ana sayfada gösterilecek.`
            : `“${row.name}” ana sayfadan gizlendi.`,
          "success"
        );
        router.refresh();
      } catch (err) {
        onToast(
          err instanceof Error ? err.message : "Görünürlük güncellenemedi.",
          "error"
        );
        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, toggling: false } : r))
        );
      }
    },
    [onToast, router, rows, supabase]
  );

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;

    const slug = categoryToSlug(name);
    if (!slug) {
      onToast("Geçerli bir kategori adı girin.", "error");
      return;
    }

    if (rows.some((r) => r.slug === slug || r.name.toLowerCase() === name.toLowerCase())) {
      onToast("Bu kategori zaten var.", "error");
      return;
    }

    setAdding(true);
    try {
      const sortOrder =
        rows.reduce((max, r) => Math.max(max, r.sort_order), 0) + 1;

      const { data, error } = await supabase
        .from("categories")
        .insert({
          name,
          slug,
          image_url: "",
          sort_order: sortOrder,
          is_visible: true,
          updated_at: new Date().toISOString(),
        })
        .select("*")
        .single();

      if (error) throw new Error(error.message);

      const created: CategoryMeta = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        image_url: data.image_url ?? "",
        sort_order: Number(data.sort_order ?? sortOrder),
        is_visible: data.is_visible !== false,
        updated_at: data.updated_at,
      };

      setRows((prev) => toRows([...prev, created]));
      setNewName("");
      onToast(`“${name}” kategorisi eklendi.`, "success");
      router.refresh();
    } catch (err) {
      onToast(
        err instanceof Error ? err.message : "Kategori eklenemedi.",
        "error"
      );
    } finally {
      setAdding(false);
    }
  }

  return (
    <section className="space-y-6">
      <form
        onSubmit={handleAdd}
        className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.08)]"
      >
        <h2 className="text-base font-semibold text-slate-900">
          Yeni Kategori Ekle
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Eklenen kategori ürün formunda da seçilebilir hale gelir.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="ör. Duvar Dekoru"
            disabled={adding}
            className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-900/5 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={adding || !newName.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {adding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Ekle
          </button>
        </div>
        {newName.trim() && (
          <p className="mt-2 text-xs text-slate-500">
            URL: /kategori/{categoryToSlug(newName) || "…"}
          </p>
        )}
      </form>

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.08)]">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-slate-900">
            Kategori Yönetimi
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Görsel yükle/sil, ana sayfada göster veya gizle.
          </p>
        </div>

        {rows.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-200 py-10 text-center text-sm text-slate-500">
            Henüz kategori yok. Yukarıdan ekleyin.
          </p>
        ) : (
          <ul className="space-y-4">
            {rows.map((row) => (
              <li
                key={row.id}
                className="flex flex-col gap-4 rounded-2xl border border-zinc-200 p-4 lg:flex-row lg:items-center"
              >
                <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-zinc-100 sm:h-20 sm:w-32">
                  {row.file ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={URL.createObjectURL(row.file)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : row.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={row.image_url}
                      alt={row.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-400">
                      <ImagePlus className="h-6 w-6" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">{row.name}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        row.is_visible
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {row.is_visible ? "Ana sayfada" : "Gizli"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">/kategori/{row.slug}</p>
                  <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-sky-700 hover:text-sky-800">
                    <Upload className="h-4 w-4" />
                    Görsel seç
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) =>
                        setFile(row.id, e.target.files?.item(0) ?? null)
                      }
                    />
                  </label>
                  {row.file && (
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {row.file.name}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => toggleVisible(row.id)}
                    disabled={row.toggling}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-zinc-50 disabled:opacity-50"
                    title={
                      row.is_visible
                        ? "Ana sayfadan gizle"
                        : "Ana sayfada göster"
                    }
                  >
                    {row.toggling ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : row.is_visible ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    {row.is_visible ? "Gizle" : "Göster"}
                  </button>

                  <button
                    type="button"
                    onClick={() => clearImage(row.id)}
                    disabled={
                      row.clearing || (!row.image_url && !row.file)
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    {row.clearing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Görseli Sil
                  </button>

                  <button
                    type="button"
                    onClick={() => saveImage(row.id)}
                    disabled={row.saving || !row.file}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    {row.saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    Kaydet
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
