/**
 * Auto-registo de ficheiros MDX em content/manuals/.
 *
 * O barrel file (index.ts) é gerado automaticamente pelo script
 * scripts/convert-vault-to-mdx.ts — NÃO EDITAR À MÃO.
 *
 * Cada ficheiro .mdx exporta um React component default.
 * O TOC é extraído do barrel file (mdxTocRegistry) em build time.
 */

import { mdxRegistry, mdxTocRegistry, mdxMetaRegistry } from "@/content/manuals"
import type { TocItem, TopicFrontmatter } from "./topic-loader"

type MdxEntry = {
  Component: React.ComponentType
  toc: TocItem[]
  meta: TopicFrontmatter
}

/**
 * Gera o mapa de tópicos MDX a partir do barrel file.
 * Chamado uma vez em module scope do page.tsx.
 */
export function getMdxTopics(): Record<string, MdxEntry> {
  const topics: Record<string, MdxEntry> = {}

  for (const [slug, Component] of Object.entries(mdxRegistry)) {
    const tocData = mdxTocRegistry[slug] ?? []
    const toc: TocItem[] = tocData.map((item) => ({
      id: item.id,
      level: item.level as 2 | 3,
      text: item.text,
    }))
    const meta: TopicFrontmatter = mdxMetaRegistry[slug] ?? {
      title: slug,
    }
    topics[slug] = { Component, toc, meta }
  }

  return topics
}
