import { BookOpen, Hash, Scale, Target } from "lucide-react"
import type { Accent } from "@/lib/manuals"
import { accentClasses } from "@/lib/manuals"
import { StatPill } from "./stat-pill"

type TopicHeroProps = {
  title: string
  code: string
  topicNumber: string
  objective: string
  weight: number
  pages: string
  areas?: string[]
  accent?: Accent
}

export function TopicHero({
  title,
  code,
  topicNumber,
  objective,
  weight,
  pages,
  areas,
  accent = "sage",
}: TopicHeroProps) {
  const a = accentClasses[accent]

  const watermarkDigits = topicNumber.replace(/^[^0-9]+/, "")
  const manualLabel =
    code === "010"
      ? "Linux Essentials"
      : code === "020"
        ? "Security Essentials"
        : code === "030"
          ? "Web Development Essentials"
          : code === "050"
            ? "Open Source Essentials"
            : code === "101"
              ? "LPIC-1 (parte 1)"
              : code === "102"
                ? "LPIC-1 (parte 2)"
                : "Manual"

  return (
    <header
      className={`relative mb-10 overflow-hidden rounded-3xl border border-border ${a.soft}`}
    >
      {/* Watermark tipográfico */}
      <span
        aria-hidden
        className={`pointer-events-none absolute -right-4 -top-8 select-none text-[12rem] font-black leading-none tracking-tighter opacity-[0.07] md:text-[16rem] ${a.strong}`}
      >
        {watermarkDigits}
      </span>

      {/* Orb desfocado */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[15%] top-[10%] h-[200px] w-[200px] rounded-full blur-[100px]"
        style={{ backgroundColor: "var(--primary)", opacity: 0.04 }}
      />

      {/* Dot pattern */}
      <div className="dot-pattern pointer-events-none absolute inset-0 opacity-10" aria-hidden />

      <div className="relative p-8 md:p-12">
        {/* Badge do manual */}
        <div
          className="mb-5"
          style={{ animation: "slideUp 0.5s ease-out both" }}
        >
          <span
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold ${a.badge}`}
          >
            <BookOpen className="h-3.5 w-3.5" aria-hidden />
            {code} · {manualLabel}
          </span>
        </div>

        {/* Título */}
        <h1
          className="max-w-3xl text-balance text-3xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-5xl"
          style={{ animation: "slideUp 0.5s ease-out 0.1s both" }}
        >
          {title}
        </h1>

        {/* Stats inline */}
        <div
          className="mt-6 flex flex-wrap items-center gap-2"
          style={{ animation: "slideUp 0.5s ease-out 0.2s both" }}
        >
          <StatPill icon={Hash} label="Tópico" value={topicNumber} variant="accent" />
          <StatPill icon={Target} label="Objetivo" value={objective} />
          <StatPill icon={Scale} label="Peso" value={weight} />
          <StatPill icon={BookOpen} label="Páginas" value={pages} />
        </div>

        {/* Áreas */}
        {areas && areas.length > 0 ? (
          <div
            className="mt-6 flex flex-wrap gap-2"
            style={{ animation: "slideUp 0.5s ease-out 0.3s both" }}
          >
            {areas.map((area) => (
              <span
                key={area}
                className={`inline-flex items-center rounded-full border border-border bg-background/60 px-3.5 py-1.5 text-xs font-medium backdrop-blur-sm ${a.strong}`}
              >
                {area}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </header>
  )
}
