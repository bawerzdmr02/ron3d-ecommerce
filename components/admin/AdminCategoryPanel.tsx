"use client";

import type { CategoryMeta } from "@/lib/types/category";
import {
  assertValidUploadFile,
  getFileExtension,
  readFileForUpload,
  resolveContentType,
} from "@/lib/storage/upload";
import { CATEGORY_SLUGS } from "@/lib/constants/categories";
import { createClient } from "@/utils/supabase/client";
import { ImagePlus, Loader2, Upload } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

const BUCKET = "product-assets";

interface AdminCategoryPanelProps {
  initialCategories: CategoryMeta[];
  onToast: (message: string, type: "success" | "error") => void;
}

type RowState = {
  name: string;
  slug: string;
  image_url: string;
  sort_order: number;
  id?: string;
  saving?: boolean;
  file?: File | null;
};

export default function AdminCategoryPanel({
  initialCategories,
  onToast,
}: AdminCategoryPanelProps) {
  const supabase = useMemo(() => createClient(), []);

  const [rows, setRows] = useState<RowState[]>(() => {
    const bySlug = new Map(initialCategories.map((c) => [c.slug, c]));
    return CATEGORY_SLUGS.map(({ name, slug }, index) => {
      const existing = bySlug.get(slug);
      return {
        id: existing?.id,
        name,
        slug,
        image_url: existing?.image_url ?? "",
        sort_order: existing?.sort_order ?? index + 1,
        file: null,
      };
    });
  });

  const setFile = useCallback((slug: string, file: File | null) => {
    setRows((prev) =>
      prev.map((row) => (row.slug === slug ? { ...row, file } : row))
    );
  }, []);

  const saveRow = useCallback(
    async (slug: string) => {
      const row = rows.find((r) => r.slug === slug);
      if (!row) return;

      setRows((prev) =>
        prev.map((r) => (r.slug === slug ? { ...r, saving: true } : r))
      );

      try {
        let imageUrl = row.image_url;

        if (row.file) {
          assertValidUploadFile(row.file, "Kategori görseli");
          const ext = getFileExtension(row.file.name) || "jpg";
          const path = `categories/${slug}-${Date.now()}.${ext}`;
          const body = await readFileForUpload(row.file);
          const contentType = resolveContentType(row.file, "image");

          const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(path, body, { contentType, upsert: true });

          if (uploadError) {
            throw new Error(uploadError.message);
          }

          const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
          imageUrl = data.publicUrl;
        }

        const payload = {
          name: row.name,
          slug: row.slug,
          image_url: imageUrl,
          sort_order: row.sort_order,
          updated_at: new Date().toISOString(),
        };

        let savedId = row.id;

        if (row.id) {
          const { error } = await supabase
            .from("categories")
            .update(payload)
            .eq("id", row.id);
          if (error) throw new Error(error.message);
        } else {
          const { data, error } = await supabase
            .from("categories")
            .upsert(payload, { onConflict: "slug" })
            .select("id")
            .single();
          if (error) throw new Error(error.message);
          savedId = data.id;
        }

        setRows((prev) =>
          prev.map((r) =>
            r.slug === slug
              ? {
                  ...r,
                  id: savedId,
                  image_url: imageUrl,
                  file: null,
                  saving: false,
                }
              : r
          )
        );
        onToast(`“${row.name}” görseli kaydedildi.`, "success");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Kategori kaydedilemedi.";
        onToast(message, "error");
        setRows((prev) =>
          prev.map((r) => (r.slug === slug ? { ...r, saving: false } : r))
        );
      }
    },
    [onToast, rows, supabase]
  );

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.08)]">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-slate-900">
          Kategori Görselleri
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Ana sayfadaki kategori kartlarının görsellerini buradan
          güncelleyebilirsiniz.
        </p>
      </div>

      <ul className="space-y-4">
        {rows.map((row) => (
          <li
            key={row.slug}
            className="flex flex-col gap-4 rounded-2xl border border-zinc-200 p-4 sm:flex-row sm:items-center"
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
              <p className="font-semibold text-slate-900">{row.name}</p>
              <p className="text-xs text-slate-500">/kategori/{row.slug}</p>
              <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-sky-700 hover:text-sky-800">
                <Upload className="h-4 w-4" />
                Görsel seç
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) =>
                    setFile(row.slug, e.target.files?.item(0) ?? null)
                  }
                />
              </label>
              {row.file && (
                <p className="mt-1 truncate text-xs text-slate-500">
                  {row.file.name}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => saveRow(row.slug)}
              disabled={row.saving || !row.file}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {row.saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Kaydet
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
