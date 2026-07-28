"use client"

import { useEffect, useState } from "react"

export function ReadingProgress() {
  // Estado espelha o valor da CSS var `--progress` para expor `aria-valuenow`
  // (APG spec: progressbar determinate exige valuemin/max/valuenow).
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement
      const scrollTop = window.scrollY
      const height = doc.scrollHeight - window.innerHeight
      const next = height > 0 ? Math.min(100, (scrollTop / height) * 100) : 0
      doc.style.setProperty("--progress", `${next}%`)
      setProgress(next)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div
      role="progressbar"
      aria-label="Progresso de leitura"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      className="fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent"
    >
      <div
        className="h-full transition-[width] duration-100 ease-out"
        style={{
          width: "var(--progress, 0%)",
          background: "var(--gradient-accent)",
        }}
      />
    </div>
  )
}
