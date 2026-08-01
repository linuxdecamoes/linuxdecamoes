import type { MetadataRoute } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://linuxdecamoes.pt"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/lab/", "/sign-in/", "/sign-up/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
