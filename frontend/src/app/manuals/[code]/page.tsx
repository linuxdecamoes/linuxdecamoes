import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, BookOpen, Layers, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { accentClasses, getManual, manuals } from "@/lib/manuals"
import { TopicAccordion } from "@/components/manuals/topic-accordion"

export function generateStaticParams() {
  return manuals.map((m) => ({ code: m.code }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>
}): Promise<Metadata> {
  const { code } = await params
  const manual = getManual(code)

  if (!manual) {
    return { title: "Manual não encontrado" }
  }

  const levelLabel = manual.level === "essentials" ? "Linux Essentials" : "LPIC-1"

  return {
    title: manual.title,
    description: `${manual.description} — ${manual.topics.length} tópicos do manual oficial ${manual.code} do LPI (${levelLabel}).`,
    keywords: [
      "manuais LPI", manual.title, `LPI ${manual.code}`, levelLabel,
      "certificação Linux", "tópicos Linux", "estudo Linux", "PT-PT",
    ],
    robots: { index: true, follow: true },
    alternates: { canonical: `/manuals/${code}` },
    openGraph: {
      title: `${manual.title} — Manuais LPI`,
      description: `${manual.description} — ${manual.topics.length} tópicos do manual oficial ${manual.code} da certificação ${levelLabel}.`,
      type: "website",
      locale: "pt_PT",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: manual.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${manual.title} — Manuais LPI`,
      description: `${manual.description} — ${manual.topics.length} tópicos de estudo.`,
      images: ["/opengraph-image"],
    },
  }
}

export default async function ManualDetailPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const manual = getManual(code)

  if (!manual) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-foreground">Manual não encontrado</h1>
        <Link href="/manuals" className="mt-4 inline-block">
          <Button variant="outline">Voltar aos Manuais</Button>
        </Link>
      </div>
    )
  }

  const accent = accentClasses[manual.accent]
  const objectiveCount = manual.topics.filter(
    (t) => t.objective || /^\d{3}/.test(t.slug)
  ).length

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
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <section
        className={`relative overflow-hidden border-b border-border ${accent.soft}`}
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" aria-hidden />
        <div
          className="absolute right-[5%] top-[10%] h-[300px] w-[300px] rounded-full blur-[120px]"
          style={{ backgroundColor: "var(--primary)", opacity: 0.06 }}
          aria-hidden
        />
        <div className="dot-pattern absolute inset-0 opacity-15" aria-hidden />

        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:py-20">
          <Link
            href="/manuals"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Todos os Manuais
          </Link>

          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold ${accent.badge}`}
            >
              <BookOpen className="h-3.5 w-3.5" aria-hidden />
              {manual.code}
            </span>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {manual.level === "essentials" ? "Essentials" : "LPIC-1 · Certificação"}
            </span>
          </div>

          <h1
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
            style={{ animation: "slideUp 0.6s ease-out 0.1s both" }}
          >
            {manual.title}
          </h1>

          <p
            className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
            style={{ animation: "slideUp 0.6s ease-out 0.2s both" }}
          >
            {manual.description}
          </p>

          <div
            className="mt-6 flex flex-wrap items-center gap-3"
            style={{ animation: "slideUp 0.6s ease-out 0.3s both" }}
          >
            <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/80 px-4 py-2 text-sm backdrop-blur-sm">
              <FileText className="h-4 w-4 text-primary" aria-hidden />
              <span className="font-semibold text-foreground">{manual.topics.length}</span>
              <span className="text-muted-foreground">tópicos</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/80 px-4 py-2 text-sm backdrop-blur-sm">
              <Layers className="h-4 w-4 text-primary" aria-hidden />
              <span className="font-semibold text-foreground">{objectiveCount}</span>
              <span className="text-muted-foreground">objetivos</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <TopicAccordion manual={manual} />
      </section>
    </>
  )
}
