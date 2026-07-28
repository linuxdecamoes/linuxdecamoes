import Link from "next/link"
import { ArrowRight, BookText } from "lucide-react"
import { accentClasses, type Manual } from "@/lib/manuals"

type ManualCardProps = {
  manual: Manual
  index: number
}

export function ManualCard({ manual, index }: ManualCardProps) {
  const accent = accentClasses[manual.accent]
  const delay = Math.min(index * 60, 480)
  const previewTopics = manual.topics.slice(0, 3)
  const extraCount = manual.topics.length - previewTopics.length

  return (
    <Link
      href={`/manuals/${manual.code}`}
      className="glass-card stagger-child group relative flex flex-col overflow-hidden rounded-3xl p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span
        className={`absolute inset-x-0 top-0 h-1 ${accent.soft} opacity-60 transition-opacity duration-200 group-hover:opacity-100`}
        aria-hidden
      />

      <div className="mb-4 flex items-start justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${accent.badge}`}
        >
          <BookText className="h-3 w-3" aria-hidden />
          {manual.code}
        </span>
        <ArrowRight
          className="h-4 w-4 -translate-x-1 shrink-0 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-primary"
          aria-hidden
        />
      </div>

      <h3 className="text-lg font-bold leading-snug text-foreground">
        {manual.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
        {manual.description}
      </p>

      {previewTopics.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {previewTopics.map((t) => (
            <li
              key={t.slug}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${accent.dot}`} aria-hidden />
              <span className="truncate">{t.title}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs font-medium text-muted-foreground">
          {manual.topics.length} tópicos
        </span>
        {extraCount > 0 && (
          <span className="text-xs text-muted-foreground">
            +{extraCount} mais
          </span>
        )}
      </div>
    </Link>
  )
}
