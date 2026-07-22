import Navbar from "@/components/layout/Navbar";
import {
  ArrowRight,
  Box,
  Heart,
  Layers,
  MessageCircle,
  Palette,
  Rotate3d,
  Shield,
  Sparkles,
  Truck,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "Ron3D hakkında bilgi edinin. Kişiye özel 3D baskı, canlı önizleme ve güvenli alışveriş deneyimimizi keşfedin.",
  alternates: { canonical: "/hakkimizda" },
};

const values = [
  {
    icon: Rotate3d,
    title: "Canlı 3D Deneyim",
    text: "Satın almadan önce ürünleri her açıdan inceleyin. Tahmin yok — gördüğünüz ürün, aldığınız ürün.",
  },
  {
    icon: Palette,
    title: "Kişiselleştirme",
    text: "Anahtarlık, figür ve dekoratif ürünlerde isminizi veya özel metninizi anında önizleyin.",
  },
  {
    icon: Layers,
    title: "Özenli Üretim",
    text: "Her sipariş tek tek, kaliteli filament ve profesyonel 3D yazıcılarla üretilir.",
  },
  {
    icon: Shield,
    title: "Güvenli Ödeme",
    text: "Shopier altyapısı ile hızlı, güvenilir ve Türkiye'ye uygun ödeme seçenekleri.",
  },
];

const steps = [
  {
    step: "01",
    title: "Keşfedin",
    text: "Koleksiyonumuzdan size uygun ürünü seçin ve canlı 3D önizlemede inceleyin.",
  },
  {
    step: "02",
    title: "Kişiselleştirin",
    text: "Özelleştirilebilir ürünlerde metninizi girin; model üzerinde anında görün.",
  },
  {
    step: "03",
    title: "Sipariş Verin",
    text: "Shopier üzerinden güvenle ödeme yapın. Özel notunuzu sipariş açıklamasına ekleyin.",
  },
  {
    step: "04",
    title: "Teslim Alın",
    text: "Ürününüz özenle basılır, kontrol edilir ve adresinize gönderilir.",
  },
];

const stats = [
  { value: "360°", label: "3D Önizleme" },
  { value: "100%", label: "Özel Üretim" },
  { value: "7/24", label: "Online Mağaza" },
  { value: "TR", label: "Yerli Hizmet" },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="bg-white">
        {/* Hero */}
        <section className="hero-pattern border-b border-sky-100">
          <div className="mx-auto max-w-6xl px-5 py-16 lg:py-24">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-sky-700 shadow-sm ring-1 ring-sky-100">
              <Sparkles className="h-3.5 w-3.5" />
              Ron3D Hakkında
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              3D baskıyı alışverişin{" "}
              <span className="bg-gradient-to-r from-sky-600 to-teal-500 bg-clip-text text-transparent">
                en akıllı
              </span>{" "}
              haliyle sunuyoruz
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              Ron3D, kişiye özel 3D baskı ürünlerini canlı önizleme ile sunan modern bir
              e-ticaret platformudur. Amacımız; sürpriz yaşamadan, güvenle ve keyifle alışveriş
              yapmanızı sağlamak.
            </p>
          </div>
        </section>

        {/* Hikaye */}
        <section className="py-16 lg:py-20">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Neden Ron3D?
              </h2>
              <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-600">
                <p>
                  Geleneksel e-ticarette ürünü yalnızca bir fotoğrafla görürsünüz. 3D baskı
                  ürünlerinde ise form, detay ve kişiselleştirme çok önemlidir — bu yüzden Ron3D
                  farklı bir yol seçti.
                </p>
                <p>
                  Platformumuzda her ürün interaktif 3D görüntüleyici ile sunulur. Döndürür,
                  yakınlaştırır, kişiselleştirme seçeneklerini denersiniz; sonra güvenle sipariş
                  verirsiniz.
                </p>
                <p>
                  Anahtarlıktan dekoratif objelere, figürlerden özel tasarım parçalara kadar geniş
                  bir koleksiyon sunuyoruz. Her sipariş özenle, talebinize göre üretilir.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-gradient-to-br from-sky-50 to-teal-50 p-6 ring-1 ring-sky-100"
                >
                  <p className="text-3xl font-extrabold text-sky-600">{stat.value}</p>
                  <p className="mt-1 text-sm font-medium text-slate-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Değerler */}
        <section className="border-y border-slate-100 bg-slate-50 py-16 lg:py-20">
          <div className="mx-auto max-w-6xl px-5">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Bizi farklı kılan ne?
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-slate-500">
                Sadece ürün satmıyoruz — size özel bir alışveriş deneyimi tasarlıyoruz.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80 transition-shadow hover:shadow-md"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Süreç */}
        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="text-center text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Nasıl çalışır?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-center text-slate-500">
              Dört adımda kişiye özel 3D ürününüz kapınızda.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((item) => (
                <div
                  key={item.step}
                  className="relative rounded-2xl border border-slate-200 bg-white p-6 pt-8"
                >
                  <span className="absolute -top-3 left-5 rounded-full bg-sky-600 px-3 py-1 text-xs font-bold text-white">
                    {item.step}
                  </span>
                  <h3 className="font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Taahhüt */}
        <section className="border-t border-slate-100 bg-slate-50 py-16 lg:py-20">
          <div className="mx-auto max-w-6xl px-5">
            <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 lg:p-12">
              <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="flex items-center gap-2 text-sky-600">
                    <Heart className="h-5 w-5" />
                    <span className="text-sm font-semibold uppercase tracking-wider">
                      Müşteri odaklı
                    </span>
                  </div>
                  <h2 className="mt-3 text-2xl font-extrabold text-slate-900">
                    Kalite ve memnuniyet taahhüdümüz
                  </h2>
                  <p className="mt-4 max-w-xl text-slate-600 leading-relaxed">
                    Her baskıda yüzey kalitesi, dayanıklılık ve tasarım doğruluğuna dikkat ediyoruz.
                    Sipariş öncesi sorularınız için WhatsApp ve e-posta üzerinden bize ulaşabilirsiniz —
                    size en uygun ürünü seçmenize yardımcı olmaktan memnuniyet duyarız.
                  </p>
                  <ul className="mt-6 space-y-3">
                    {[
                      { icon: Box, text: "Geniş ürün yelpazesi ve düzenli yeni koleksiyonlar" },
                      { icon: Truck, text: "Özel üretim — stok değil, size göre baskı" },
                      { icon: Users, text: "Şeffaf iletişim ve sipariş takibi" },
                    ].map((item) => (
                      <li key={item.text} className="flex items-start gap-3 text-sm text-slate-600">
                        <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" />
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <Link
                    href="/#products"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-200 hover:bg-sky-700"
                  >
                    Koleksiyonu İncele
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href="https://wa.me/905466293402"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <MessageCircle className="h-4 w-4 text-teal-500" />
                    WhatsApp ile Yazın
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
