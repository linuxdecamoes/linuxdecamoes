import type { MetadataRoute } from "next"
import { manuals } from "@/lib/manuals"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://linuxdecamoes.pt"

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/sobre`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/manuais`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ]

  const manualRoutes: MetadataRoute.Sitemap = manuals.map((manual) => ({
    url: `${SITE_URL}/manuais/${manual.code}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  const topicRoutes: MetadataRoute.Sitemap = manuals.flatMap((manual) =>
    manual.topics.map((topic) => ({
      url: `${SITE_URL}/manuais/${manual.code}/${topic.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  )

  return [...staticRoutes, ...manualRoutes, ...topicRoutes]
}
