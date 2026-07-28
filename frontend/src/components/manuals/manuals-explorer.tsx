"use client"

import { useState, useMemo } from "react"
import { Search, X } from "lucide-react"
import type { Manual, ManualLevel } from "@/lib/manuals"
import { ManualCard } from "./manual-card"

type LevelFilter = "todos" | ManualLevel

type ManualsExplorerProps = {
  manuals: Manual[]
}

const FILTERS: { value: LevelFilter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "essentials", label: "Essentials" },
  { value: "lpic1", label: "LPIC-1" },
]

export function ManualsExplorer({ manuals }: ManualsExplorerProps) {
  const [query, setQuery] = useState("")
  const [level, setLevel] = useState<LevelFilter>("todos")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return manuals.filter((m) => {
      if (level !== "todos" && m.level !== level) return false
      if (!q) return true
      if (m.title.toLowerCase().includes(q)) return true
      if (m.description.toLowerCase().includes(q)) return true
      return m.topics.some((t) => t.title.toLowerCase().includes(q))
    })
  }, [manuals, query, level])

  const essentials = filtered.filter((m) => m.level === "essentials")
  const lpic1 = filtered.filter((m) => m.level === "lpic1")
  const noResults = filtered.length === 0

  return (
    <div>
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar manual ou tópico..."
            className="w-full rounded-lg border border-border bg-card px-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
            aria-label="Pesquisar manuais"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
              aria-label="Limpar pesquisa"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setLevel(f.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                level === f.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {noResults ? (
        <div className="rounded-3xl border border-dashed border-border py-20 text-center">
          <p className="text-lg font-medium text-foreground">Nenhum manual encontrado</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tenta pesquisar por outro termo.
          </p>
        </div>
      ) : (
        <div className="space-y-14">
          {essentials.length > 0 && (
            <LevelSection
              heading="Essentials"
              subheading="Fundamentos — principiantes e utilizadores gerais"
              cols="lg:grid-cols-4"
              manuals={essentials}
            />
          )}
          {lpic1.length > 0 && (
            <LevelSection
              heading="LPIC-1 · Certificação"
              subheading="Administração de sistemas — nível profissional"
              cols="lg:grid-cols-2"
              manuals={lpic1}
            />
          )}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          A mostrar {filtered.length} de {manuals.length} manuais
        </p>
      )}
    </div>
  )
}

function LevelSection({
  heading,
  subheading,
  cols,
  manuals,
}: {
  heading: string
  subheading: string
  cols: string
  manuals: Manual[]
}) {
  return (
    <section>
      <div className="mb-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-terracotta">
          {heading}
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{subheading}</p>
      </div>
      <div className={`stagger-list grid grid-cols-1 gap-4 sm:grid-cols-2 ${cols}`}>
        {manuals.map((manual, index) => (
          <ManualCard key={manual.code} manual={manual} index={index} />
        ))}
      </div>
    </section>
  )
}
