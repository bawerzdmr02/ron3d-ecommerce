import type { MetadataRoute } from "next";
import { getCategoryMetas } from "@/lib/data/categories";
import { getSiteUrl } from "@/lib/seo/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/hakkimizda`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/giris`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const metas = await getCategoryMetas();
  const categoryPages: MetadataRoute.Sitemap = metas
    .filter((m) => m.is_visible)
    .map((m) => ({
      url: `${base}/kategori/${m.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

  return [...staticPages, ...categoryPages];
}
