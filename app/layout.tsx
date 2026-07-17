import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Ron3D — Özel Tasarım 3D Ürünler",
  description:
    "Kişiselleştirilebilir 3D baskı ürünleri keşfedin, canlı önizleyin ve güvenle sipariş verin.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${jakarta.variable} h-full`}>
      <body className={`${jakarta.className} min-h-full flex flex-col bg-white text-slate-800`}>
        {children}
        <Footer />
      </body>
    </html>
  );
}
