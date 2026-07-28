import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { accentClasses, type Accent, type ManualTopic } from "@/lib/manuals"

type TopicRowProps = {
  topic: ManualTopic
  index: number
  manualCode: string
  accent: Accent
}

export function TopicRow({ topic, index, manualCode, accent }: TopicRowProps) {
  const a = accentClasses[accent]
  const paddedNumber = String(index + 1).padStart(2, "0")

  return (
    <Link
      href={`/manuals/${manualCode}/${topic.slug}`}
      className="group flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex items-center gap-3">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${a.soft} ${a.strong}`}
        >
          {paddedNumber}
        </span>
        <span className="text-sm font-medium text-foreground">
          {topic.title}
        </span>
      </span>
      <ChevronRight
        className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
        aria-hidden
      />
    </Link>
  )
}
