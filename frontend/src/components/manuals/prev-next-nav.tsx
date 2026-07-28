import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import type { ManualTopic } from "@/lib/manuals"

type PrevNextNavProps = {
  prev?: ManualTopic
  next?: ManualTopic
  manualCode: string
}

export function PrevNextNav({ prev, next, manualCode }: PrevNextNavProps) {
  return (
    <nav className="grid grid-cols-2 gap-3" aria-label="Navegação entre tópicos">
      {prev ? (
        <Link
          href={`/manuals/${manualCode}/${prev.slug}`}
          className="glass-card group flex flex-col gap-1 rounded-xl p-4 transition-all hover:shadow-float hover:translate-x-[-2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" aria-hidden />
            Anterior
          </div>
          <p className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-primary">
            {prev.title}
          </p>
        </Link>
      ) : (
        <div aria-hidden />
      )}
      {next ? (
        <Link
          href={`/manuals/${manualCode}/${next.slug}`}
          className="glass-card group flex flex-col gap-1 rounded-xl p-4 text-right transition-all hover:shadow-float hover:translate-x-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex items-center justify-end gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Seguinte
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </div>
          <p className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-primary">
            {next.title}
          </p>
        </Link>
      ) : (
        <div aria-hidden />
      )}
    </nav>
  )
}
