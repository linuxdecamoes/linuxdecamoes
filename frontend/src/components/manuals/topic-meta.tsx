import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, Tag } from "lucide-react"
import type { ManualTopic, TopicFrontmatter } from "@/lib/manuals"

type TopicMetaProps = {
  frontmatter: TopicFrontmatter
  prev?: ManualTopic
  next?: ManualTopic
  manualCode: string
  topicSlug: string
  topicTitle: string
}

export function TopicMeta({
  frontmatter,
  topicTitle,
  manualCode,
}: TopicMetaProps) {
  const chatQuery = encodeURIComponent(
    `Explica o tópico "${topicTitle}" do manual ${manualCode}.`
  )
  const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : []

  return (
    <aside className="sticky top-24 hidden h-fit w-64 shrink-0 xl:block">
      <div className="glass-card rounded-2xl p-5">
        <p className="mb-4 flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
          Meta do Tópico
        </p>
        <dl className="space-y-3 text-sm">
          {frontmatter.weight !== undefined && (
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">Peso</dt>
              <dd className="font-semibold text-foreground">
                {String(frontmatter.weight)}
              </dd>
            </div>
          )}
          {frontmatter.topic && (
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">Tópico</dt>
              <dd className="font-semibold text-foreground">
                {frontmatter.topic}
              </dd>
            </div>
          )}
        </dl>

        {tags.length > 0 && (
          <div className="mt-4 border-t border-border pt-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Tag className="h-3 w-3" aria-hidden />
              Tags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <Link
          href={`/dashboard/chat?q=${chatQuery}`}
          className="mt-5 block"
        >
          <Button className="w-full gap-2">
            <Sparkles className="h-4 w-4" />
            Perguntar à IA
          </Button>
        </Link>
      </div>
    </aside>
  )
}
