import { notFound } from "next/navigation"
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

  return (
    <>
      <ReadingProgress />

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
