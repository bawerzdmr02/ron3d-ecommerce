"use client";

import {
  DEFAULT_PRODUCT_CATEGORY,
  PRODUCT_CATEGORIES,
} from "@/lib/constants/categories";
import Toast, { type ToastType } from "@/components/ui/Toast";
import type { Product } from "@/lib/types/product";
import {
  assertValidUploadFile,
  getFileExtension,
  readFileForUpload,
  resolveContentType,
} from "@/lib/storage/upload";
import { createClient } from "@/utils/supabase/client";
import {
  ArrowLeft,
  Box,
  ClipboardList,
  ImagePlus,
  Link2,
  Loader2,
  LogOut,
  MessageSquareWarning,
  Package,
  Pencil,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Order } from "@/lib/types/order";
import type { CategoryMeta } from "@/lib/types/category";
import AdminCategoryPanel from "./AdminCategoryPanel";
import AdminOrderPanel from "./AdminOrderPanel";
import AdminReviewPanel, {
  type PendingReview,
} from "./AdminReviewPanel";

const BUCKET = "product-assets";

interface AdminDashboardProps {
  initialProducts: Product[];
  initialPendingReviews: PendingReview[];
  initialOrders: Order[];
  initialCategories: CategoryMeta[];
}

type AdminTab = "products" | "reviews" | "orders" | "categories";

function pickFile(files: FileList | null): File | null {
  if (!files || files.length === 0) return null;
  return files.item(0);
}

export default function AdminDashboard({
  initialProducts,
  initialPendingReviews,
  initialOrders,
  initialCategories,
}: AdminDashboardProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<AdminTab>("products");
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categoryOptions, setCategoryOptions] = useState<string[]>(() => {
    const fromDb = initialCategories.map((c) => c.name);
    const merged = Array.from(
      new Set([...fromDb, ...PRODUCT_CATEGORIES])
    ).sort((a, b) => a.localeCompare(b, "tr"));
    return merged.length > 0 ? merged : [...PRODUCT_CATEGORIES];
  });

  useEffect(() => {
    const fromDb = initialCategories.map((c) => c.name);
    const merged = Array.from(
      new Set([...fromDb, ...PRODUCT_CATEGORIES])
    ).sort((a, b) => a.localeCompare(b, "tr"));
    setCategoryOptions(merged.length > 0 ? merged : [...PRODUCT_CATEGORIES]);
  }, [initialCategories]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [shopierUrl, setShopierUrl] = useState("");
  const [category, setCategory] = useState<string>(DEFAULT_PRODUCT_CATEGORY);
  const [isCustomizable, setIsCustomizable] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const isEditing = editingProduct !== null;

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type });
  }, []);

  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      showToast(`Ürünler yüklenemedi: ${error.message}`, "error");
      return;
    }

    setProducts(
      (data ?? []).map((row) => ({
        ...row,
        price: Number(row.price),
        category: row.category ?? "Diğer",
      }))
    );
  }, [showToast, supabase]);

  function resetForm() {
    setEditingProduct(null);
    setTitle("");
    setDescription("");
    setPrice("");
    setShopierUrl("");
    setCategory(DEFAULT_PRODUCT_CATEGORY);
    setIsCustomizable(false);
    setImageFile(null);
    setModelFile(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (modelInputRef.current) modelInputRef.current.value = "";
  }

  function startEdit(product: Product) {
    setEditingProduct(product);
    setTitle(product.title);
    setDescription(product.description ?? "");
    setPrice(String(product.price));
    setShopierUrl(product.shopier_url ?? "");
    setCategory(product.category ?? DEFAULT_PRODUCT_CATEGORY);
    setIsCustomizable(Boolean(product.is_customizable));
    setImageFile(null);
    setModelFile(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (modelInputRef.current) modelInputRef.current.value = "";

    window.scrollTo({ top: 0, behavior: "auto" });
  }

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/admin");
    router.refresh();
  }

  async function handleDelete(productId: string, productTitle: string) {
    if (!confirm(`"${productTitle}" silinsin mi? Bu işlem geri alınamaz.`)) return;

    const { error } = await supabase.from("products").delete().eq("id", productId);

    if (error) {
      showToast(`Silme başarısız: ${error.message}`, "error");
      return;
    }

    if (editingProduct?.id === productId) {
      resetForm();
    }

    showToast(`"${productTitle}" silindi.`, "success");
    fetchProducts();
  }

  async function uploadAsset(
    productId: string,
    file: File,
    kind: "image" | "model"
  ) {
    assertValidUploadFile(file, kind === "image" ? "Görsel" : "3D model");

    const ext = getFileExtension(file.name) || (kind === "model" ? "glb" : "bin");
    const path = `${productId}/${kind}.${ext}`;
    const contentType = resolveContentType(file, kind);
    const body = await readFileForUpload(file);

    const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
      cacheControl: "3600",
      upsert: true,
      contentType,
    });

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(path);

    return `${publicUrl}?t=${Date.now()}`;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedPrice = Number(price);
    if (!title.trim() || Number.isNaN(parsedPrice) || parsedPrice < 0) {
      showToast("Başlık ve geçerli bir fiyat gereklidir.", "error");
      return;
    }

    setSubmitting(true);

    try {
      if (isEditing && editingProduct) {
        let imageUrl = editingProduct.image_url;
        let modelUrl = editingProduct.model_url;

        if (imageFile) {
          assertValidUploadFile(imageFile, "Görsel");
          imageUrl = await uploadAsset(editingProduct.id, imageFile, "image");
        }

        if (modelFile) {
          assertValidUploadFile(modelFile, "3D model");
          modelUrl = await uploadAsset(editingProduct.id, modelFile, "model");
        }

        const { error } = await supabase
          .from("products")
          .update({
            title: title.trim(),
            description: description.trim(),
            price: parsedPrice,
            image_url: imageUrl,
            model_url: modelUrl,
            shopier_url: shopierUrl.trim(),
            category,
            is_customizable: isCustomizable,
          })
          .eq("id", editingProduct.id);

        if (error) throw error;

        showToast(`"${title.trim()}" güncellendi.`, "success");
        resetForm();
        fetchProducts();
        return;
      }

      assertValidUploadFile(imageFile, "Görsel");
      assertValidUploadFile(modelFile, "3D model");

      const productId = crypto.randomUUID();

      const [imageUrl, modelUrl] = await Promise.all([
        uploadAsset(productId, imageFile, "image"),
        uploadAsset(productId, modelFile, "model"),
      ]);

      const { error } = await supabase.from("products").insert({
        id: productId,
        title: title.trim(),
        description: description.trim(),
        price: parsedPrice,
        image_url: imageUrl,
        model_url: modelUrl,
        shopier_url: shopierUrl.trim(),
        category,
        is_customizable: isCustomizable,
      });

      if (error) throw error;

      showToast(`"${title.trim()}" başarıyla eklendi.`, "success");
      resetForm();
      fetchProducts();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Bir şeyler ters gitti.";
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <header className="border-b border-zinc-200/80 bg-white shadow-[0_1px_0_0_rgba(0,0,0,0.03)]">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <Box className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-sm font-semibold tracking-tight text-slate-900">
                Yönetim Paneli
              </p>
              <p className="text-xs text-slate-500">Ürün yönetimi</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Mağaza
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-600 transition-all hover:border-zinc-300 hover:text-slate-900 disabled:opacity-50"
            >
              {signingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              Çıkış Yap
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Yönetim
          </h1>
          <p className="text-sm text-slate-500">
            Ürünleri ve müşteri yorumlarını yönetin.
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-sm sm:flex-row">
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === "products"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-zinc-50"
            }`}
          >
            <Package className="h-4 w-4" />
            Ürünler
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === "orders"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-zinc-50"
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            Sipariş Yönetimi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("categories")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === "categories"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-zinc-50"
            }`}
          >
            <ImagePlus className="h-4 w-4" />
            Kategoriler
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === "reviews"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-zinc-50"
            }`}
          >
            <MessageSquareWarning className="h-4 w-4" />
            Yorum Yönetimi
          </button>
        </div>

        {activeTab === "reviews" ? (
          <AdminReviewPanel
            initialPending={initialPendingReviews}
            onToast={showToast}
          />
        ) : activeTab === "orders" ? (
          <AdminOrderPanel initialOrders={initialOrders} onToast={showToast} />
        ) : activeTab === "categories" ? (
          <AdminCategoryPanel
            initialCategories={initialCategories}
            onToast={showToast}
          />
        ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.08)]">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-slate-400" />
                <h2 className="text-base font-semibold text-slate-900">
                  {isEditing ? "Ürünü Güncelle" : "Yeni Ürün"}
                </h2>
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-zinc-50 disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Düzenlemeyi Kapat
                </button>
              )}
            </div>

            {isEditing && (
              <div className="mb-5 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                Düzenleniyor: <span className="font-semibold">{editingProduct.title}</span>
                <span className="mt-1 block text-xs text-sky-700/80">
                  Görsel veya 3D model seçmezseniz mevcut dosyalar korunur.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium text-slate-800">
                  Başlık
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ör. Minimal Masa Düzenleyici"
                  disabled={submitting}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm outline-none transition-all focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-900/5 disabled:opacity-60"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-slate-800">
                  Açıklama
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ürün açıklaması..."
                  disabled={submitting}
                  className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm outline-none transition-all focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-900/5 disabled:opacity-60"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium text-slate-800">
                  Kategori
                </label>
                <select
                  id="category"
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={submitting}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm outline-none transition-all focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-900/5 disabled:opacity-60"
                >
                  {categoryOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="price" className="text-sm font-medium text-slate-800">
                    Fiyat (₺)
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="1299"
                    disabled={submitting}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm outline-none transition-all focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-900/5 disabled:opacity-60"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="shopier_url" className="text-sm font-medium text-slate-800">
                    Shopier Bağlantısı
                  </label>
                  <div className="relative">
                    <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="shopier_url"
                      name="shopier_url"
                      type="url"
                      value={shopierUrl}
                      onChange={(e) => setShopierUrl(e.target.value)}
                      placeholder="https://shopier.com/..."
                      disabled={submitting}
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-900/5 disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="is_customizable"
                  name="is_customizable"
                  type="checkbox"
                  checked={isCustomizable}
                  onChange={(e) => setIsCustomizable(e.target.checked)}
                  disabled={submitting}
                  className="h-4 w-4 rounded border-zinc-300 text-slate-900"
                />
                <label htmlFor="is_customizable" className="text-sm font-medium text-slate-800">
                  Özelleştirilebilir ürün
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800">
                    Ürün Görseli{isEditing ? " (opsiyonel)" : ""}
                  </label>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    disabled={submitting}
                    onChange={(e) => setImageFile(pickFile(e.target.files))}
                  />
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={submitting}
                    className="flex min-h-[140px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 px-4 py-6 text-center transition-colors hover:border-zinc-400 hover:bg-zinc-100/80 disabled:opacity-60"
                  >
                    {isEditing && !imageFile && editingProduct.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={editingProduct.image_url}
                        alt={editingProduct.title}
                        className="mb-2 h-16 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <ImagePlus className="mb-2 h-6 w-6 text-slate-400" />
                    )}
                    <p className="text-xs font-medium text-slate-800">
                      {imageFile
                        ? imageFile.name
                        : isEditing
                          ? "Yeni görsel seç (veya mevcut kalsın)"
                          : "Görsel yükle"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">JPEG, PNG, WebP</p>
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800">
                    3D Model (.glb){isEditing ? " (opsiyonel)" : ""}
                  </label>
                  <input
                    ref={modelInputRef}
                    type="file"
                    accept=".glb,model/gltf-binary"
                    className="hidden"
                    disabled={submitting}
                    onChange={(e) => setModelFile(pickFile(e.target.files))}
                  />
                  <button
                    type="button"
                    onClick={() => modelInputRef.current?.click()}
                    disabled={submitting}
                    className="flex min-h-[140px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 px-4 py-6 text-center transition-colors hover:border-zinc-400 hover:bg-zinc-100/80 disabled:opacity-60"
                  >
                    <Upload className="mb-2 h-6 w-6 text-slate-400" />
                    <p className="text-xs font-medium text-slate-800">
                      {modelFile
                        ? modelFile.name
                        : isEditing
                          ? "Yeni .glb seç (veya mevcut kalsın)"
                          : ".glb dosyası yükle"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {isEditing && editingProduct.model_url && !modelFile
                        ? "Mevcut model korunacak"
                        : "Yalnızca GLB formatı"}
                    </p>
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {submitting
                    ? "Kaydediliyor…"
                    : isEditing
                      ? "Değişiklikleri Kaydet"
                      : "Ürünü Kaydet"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={submitting}
                  className="rounded-xl border border-zinc-200 px-6 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-zinc-50 disabled:opacity-50"
                >
                  {isEditing ? "İptal" : "Temizle"}
                </button>
              </div>
            </form>
          </section>

          <aside className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.08)]">
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Mevcut Ürünler
            </h2>

            {products.length === 0 ? (
              <p className="text-sm text-slate-500">Henüz ürün eklenmemiş.</p>
            ) : (
              <div className="space-y-3">
                {products.map((product) => {
                  const selected = editingProduct?.id === product.id;

                  return (
                    <div
                      key={product.id}
                      className={`rounded-xl border px-4 py-3 transition-colors ${
                        selected
                          ? "border-sky-300 bg-sky-50"
                          : "border-zinc-200 bg-zinc-50/80"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(product)}
                          disabled={submitting}
                          className="min-w-0 flex-1 text-left disabled:opacity-60"
                        >
                          <p className="truncate text-sm font-medium text-slate-800">
                            {product.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {product.category ?? "Diğer"} · ₺
                            {product.price.toLocaleString("tr-TR")}
                          </p>
                          {selected && (
                            <p className="mt-1 text-[11px] font-semibold text-sky-700">
                              Düzenleniyor
                            </p>
                          )}
                        </button>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(product)}
                            disabled={submitting}
                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-sky-100 hover:text-sky-700 disabled:opacity-50"
                            aria-label={`${product.title} düzenle`}
                            title="Düzenle"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(product.id, product.title)}
                            disabled={submitting}
                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            aria-label={`${product.title} sil`}
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </aside>
        </div>
        )}
      </main>
    </div>
  );
}
