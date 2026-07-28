"use client"

import dynamic from "next/dynamic"

const MermaidDiagram = dynamic(
  () => import("@/components/mermaid-diagram").then((mod) => mod.MermaidDiagram),
  { ssr: false }
)

interface MermaidSectionProps {
  chart: string
  className?: string
}

export function MermaidSection({ chart, className }: MermaidSectionProps) {
  return <MermaidDiagram chart={chart} className={className} />
}
