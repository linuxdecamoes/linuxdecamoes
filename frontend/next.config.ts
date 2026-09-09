import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import path from "node:path";

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://*.clerk.accounts.dev https://*.clerk.com https://clerk.linuxdecamoes.com https://accounts.linuxdecamoes.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://img.clerk.com https://*.clerk.com https://clerk.linuxdecamoes.com https://accounts.linuxdecamoes.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://clerk.linuxdecamoes.com https://accounts.linuxdecamoes.com https://clerk-telemetry.com https://api.github.com",
  "frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://clerk.linuxdecamoes.com https://accounts.linuxdecamoes.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ")

const nextConfig: NextConfig = {
  output: "standalone",
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ]
  },
};

const calloutPlugin = path.join(__dirname, "src/lib/remark-callout.mjs");

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: ["remark-gfm", calloutPlugin],
    rehypePlugins: ["rehype-slug"],
  },
});

export default withMDX(nextConfig);
