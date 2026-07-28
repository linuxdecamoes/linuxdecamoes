import Link from "next/link"
import { BookOpen } from "lucide-react"

export function ManualsCard() {
  return (
    <Link href="/manuals" className="group block h-full">
      <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-bento transition-all hover:shadow-bento-hover lg:p-8">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Manuais LPI
            </h2>
            <p className="text-xs text-muted-foreground">
              114 tópicos pesquisáveis
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground transition-colors group-hover:text-foreground">
          Explorar manuais →
        </p>
      </div>
    </Link>
  )
}
