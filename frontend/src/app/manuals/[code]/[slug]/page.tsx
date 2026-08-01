import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { getManual, manuals } from "@/lib/manuals"
import type { TocItem } from "@/lib/topic-loader"
import { ReadingProgress } from "@/components/manuals/reading-progress"
import { TopicToc } from "@/components/manuals/topic-toc"
import { TopicMeta } from "@/components/manuals/topic-meta"
import { PrevNextNav } from "@/components/manuals/prev-next-nav"
import { getMdxTopics } from "@/lib/mdx-auto-register"

// Auto-descoberta: todos os .mdx em content/manuals/ são registados aqui.
const mdxTopics = getMdxTopics()

// Pré-gera todas as páginas de tópico no build.
export function generateStaticParams() {
  return manuals.flatMap((manual) =>
    manual.topics.map((topic) => ({ code: manual.code, slug: topic.slug })),
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string; slug: string }>
}): Promise<Metadata> {
  const { code, slug } = await params
  const manual = getManual(code)

  if (!manual) {
    return { title: "Tópico não encontrado" }
  }

  const topic = manual.topics.find((t) => t.slug === slug)
  if (!topic) {
    return { title: "Tópico não encontrado" }
  }

  const mdxKey = `${code}/${slug}`
  const mdxEntry = mdxTopics[mdxKey]
  const tags = mdxEntry?.meta?.tags ?? []
  const levelLabel = manual.level === "essentials" ? "Linux Essentials" : "LPIC-1"

  return {
    title: topic.title,
    description: `Estuda "${topic.title}" — tópico do manual ${manual.code} "${manual.title}" da certificação ${levelLabel}. Conteúdo detalhado com exemplos práticos e comandos reais.`,
    keywords: [
      "Linux", "LPI", levelLabel, manual.code, topic.title,
      "tópicos Linux", "estudo Linux", "certificação", "PT-PT",
      ...tags,
    ],
    robots: { index: true, follow: true },
    alternates: { canonical: `/manuals/${code}/${slug}` },
    openGraph: {
      title: `${topic.title} — ${manual.title}`,
      description: `Estuda "${topic.title}" — tópico do manual ${manual.code} "${manual.title}" da certificação ${levelLabel}.`,
      type: "article",
      locale: "pt_PT",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: topic.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${topic.title} — ${manual.title}`,
      description: `Tópico do manual ${manual.code} de ${levelLabel}.`,
      images: ["/opengraph-image"],
    },
  }
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ code: string; slug: string }>
}) {
  const { code, slug } = await params
  const manual = getManual(code)

  if (!manual) {
    notFound()
  }

  const topicIndex = manual.topics.findIndex((t) => t.slug === slug)
  if (topicIndex === -1) {
    notFound()
  }

  const topic = manual.topics[topicIndex]
  const prev = topicIndex > 0 ? manual.topics[topicIndex - 1] : undefined
  const next =
    topicIndex < manual.topics.length - 1
      ? manual.topics[topicIndex + 1]
      : undefined

  const mdxKey = `${code}/${slug}`
  const mdxEntry = mdxTopics[mdxKey]

  if (!mdxEntry) {
    notFound()
  }

  const MDXContent = mdxEntry.Component
  const headings: TocItem[] = mdxEntry.toc
  const frontmatter = {
    ...mdxEntry.meta,
    title: topic.title,
  }

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://linuxdecamoes.pt"
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Manuais LPI",
        item: `${SITE_URL}/manuais`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: manual.title,
        item: `${SITE_URL}/manuais/${code}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: topic.title,
        item: `${SITE_URL}/manuais/${code}/${slug}`,
      },
    ],
  }

  return (
    <>
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 2xl:max-w-[1600px] 2xl:px-6">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:shadow-lg"
        >
          Saltar para o conteúdo
        </a>

        {/* Breadcrumb */}
        <nav
          aria-label="Caminho de navegação"
          className="mb-8 flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Link href="/manuals" className="transition-colors hover:text-foreground">
            Manuais
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <Link
            href={`/manuals/${code}`}
            className="transition-colors hover:text-foreground"
          >
            {manual.title}
          </Link>
        </nav>

        {/* 3-zone grid */}
        <div className="grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)] xl:grid-cols-[14rem_minmax(0,1fr)_16rem]">
          {/* TOC (sticky esquerda) */}
          <TopicToc headings={headings} />

          {/* Conteúdo central */}
          <article
            id="main-content"
            className="min-w-0"
            tabIndex={-1}
          >
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8 lg:p-10">
              <MDXContent />
            </div>

            {/* Prev/Next — sempre no final do conteúdo */}
            <div className="mt-12 border-t border-border pt-8">
              <PrevNextNav prev={prev} next={next} manualCode={code} />
            </div>
          </article>

          {/* Meta (sticky direita) */}
          <TopicMeta
            frontmatter={frontmatter}
            prev={prev}
            next={next}
            manualCode={code}
            topicSlug={slug}
            topicTitle={topic.title}
          />
        </div>
      </div>
    </>
  )
}
