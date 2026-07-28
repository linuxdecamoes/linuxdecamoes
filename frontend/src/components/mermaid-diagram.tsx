"use client"

import { useEffect, useRef, useState } from "react"

interface MermaidDiagramProps {
  chart: string
  className?: string
}

export function MermaidDiagram({ chart, className }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function render() {
      try {
        const mermaid = (await import("mermaid")).default
        mermaid.initialize({
          startOnLoad: false,
          theme: "neutral",
          securityLevel: "loose",
          fontFamily: "var(--font-sans)",
        })

        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`
        const { svg: rendered } = await mermaid.render(id, chart)

        if (!cancelled) {
          setSvg(rendered)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Erro ao renderizar diagrama"
          )
        }
      }
    }

    render()
    return () => {
      cancelled = true
    }
  }, [chart])

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Erro ao renderizar diagrama: {error}
      </div>
    )
  }

  if (!svg) {
    return (
      <div
        className="flex h-32 items-center justify-center rounded-lg border border-border bg-muted/30"
        aria-busy="true"
      >
        <span className="text-sm text-muted-foreground">
          A carregar diagrama...
        </span>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={className}
      role="img"
      aria-label="Diagrama ilustrativo"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
