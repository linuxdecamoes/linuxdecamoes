import Link from "next/link"

export function ManualsCard() {
  return (
    <Link href="/manuals" className="group block h-full">
      <div className="surface-card">
        <div className="corner-tick corner-tick--tl" />
        <div className="corner-tick corner-tick--br" />
        <span className="card-tag" aria-hidden="true">REF-05</span>

        <div>
          <h2 className="text-lg font-bold text-foreground">
            Manuais LPI
          </h2>
          <p className="text-xs text-muted-foreground">
            114 tópicos pesquisáveis
          </p>
        </div>

        <p className="mt-4 text-sm text-muted-foreground transition-colors group-hover:text-foreground">
          Explorar manuais →
        </p>
      </div>
    </Link>
  )
}
