import type { Manual, ManualLevel } from "@/lib/manuals"
import { ManualCard } from "./manual-card"

type ManualLevelGroupProps = {
  level: ManualLevel
  manuals: Manual[]
}

const LABELS: Record<ManualLevel, { heading: string; colsLg: string }> = {
  essentials: {
    heading: "Essentials",
    colsLg: "lg:grid-cols-4",
  },
  lpic1: {
    heading: "LPIC-1 · Certificação",
    colsLg: "lg:grid-cols-2",
  },
}

export function ManualLevelGroup({ level, manuals }: ManualLevelGroupProps) {
  const { heading, colsLg } = LABELS[level]
  return (
    <section className="mb-12">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-terracotta">
        {heading}
      </h2>
      <div className={`stagger-list grid grid-cols-1 gap-4 sm:grid-cols-2 ${colsLg}`}>
        {manuals.map((manual, index) => (
          <ManualCard key={manual.code} manual={manual} index={index} />
        ))}
      </div>
    </section>
  )
}
