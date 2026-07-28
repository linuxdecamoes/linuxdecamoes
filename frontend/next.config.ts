import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import path from "node:path";

const nextConfig: NextConfig = {
  output: "standalone",
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
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
