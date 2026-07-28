"use client"

import { useEffect, useRef, useState } from "react"
import type { TocItem } from "@/lib/topic-loader"

type TopicTocProps = {
  headings: TocItem[]
}

// Distância (px) do topo que comuta o heading ativo.
const ACTIVE_THRESHOLD = 120

export function TopicToc({ headings }: TopicTocProps) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? "")
  const [fillHeight, setFillHeight] = useState(0)

  const scrollRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map())
  const nodeRefs = useRef<Map<string, HTMLSpanElement>>(new Map())

  // Scroll-spy determinístico: ativo = último heading que passou a linha de corte.
  useEffect(() => {
    let raf = 0

    const update = () => {
      raf = 0
      const doc = document.documentElement
      const atBottom =
        window.innerHeight + window.scrollY >= doc.scrollHeight - 60
      if (atBottom && headings.length > 0) {
        setActiveId(headings[headings.length - 1].id)
        return
      }

      let current = headings[0]?.id ?? ""
      for (const heading of headings) {
        const el = document.getElementById(heading.id)
        if (el && el.getBoundingClientRect().top - ACTIVE_THRESHOLD <= 0) {
          current = heading.id
        }
      }
      setActiveId(current)
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [headings])

  // Linha temporal: preenche o rail até ao nó ativo e traz o nó para vista.
  useEffect(() => {
    const node = nodeRefs.current.get(activeId)
    const li = itemRefs.current.get(activeId)

    if (node) {
      setFillHeight(node.offsetTop + node.offsetHeight / 2)
    }

    const scroller = scrollRef.current
    if (li && scroller) {
      const box = scroller.getBoundingClientRect()
      const item = li.getBoundingClientRect()
      const margin = 12
      if (item.top < box.top + margin) {
        scroller.scrollTop -= box.top - item.top + margin
      } else if (item.bottom > box.bottom - margin) {
        scroller.scrollTop += item.bottom - box.bottom + margin
      }
    }
  }, [activeId])

  if (headings.length === 0) return null

  const activeIndex = headings.findIndex((h) => h.id === activeId)

  return (
    <nav
      aria-label="Índice do tópico"
      className="sticky top-24 hidden max-h-[calc(100vh-7rem)] flex-col lg:flex"
    >
      <p className="mb-4 shrink-0 text-xs uppercase tracking-wider text-muted-foreground">
        Neste tópico
      </p>

      <div
        ref={scrollRef}
        className="-mr-2 overflow-y-auto pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <ul ref={listRef} className="relative">
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-[6px] top-0 w-px bg-border"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute left-[6px] top-0 w-px bg-primary transition-[height] duration-300 ease-out"
            style={{ height: fillHeight }}
          />

          {headings.map((heading, index) => {
            const isActive = index === activeIndex
            const isDone = index < activeIndex
            const isH3 = heading.level === 3

            const dot =
              "rounded-full transition-colors " +
              (isH3 ? "h-1.5 w-1.5 " : "h-2 w-2 ") +
              (isActive
                ? "bg-primary ring-4 ring-primary/15"
                : isDone
                  ? "bg-primary/40"
                  : "bg-border")

            return (
              <li
                key={heading.id}
                ref={(el) => {
                  if (el) itemRefs.current.set(heading.id, el)
                  else itemRefs.current.delete(heading.id)
                }}
              >
                <a
                  href={`#${heading.id}`}
                  className={
                    "flex items-start gap-3 rounded-md py-2 pr-2 transition-colors " +
                    (isActive
                      ? "font-medium text-primary"
                      : "text-muted-foreground hover:text-foreground")
                  }
                  aria-current={isActive ? "true" : undefined}
                >
                  <span
                    ref={(el) => {
                      if (el) nodeRefs.current.set(heading.id, el)
                      else nodeRefs.current.delete(heading.id)
                    }}
                    className="mt-0.5 flex h-5 w-3 shrink-0 items-center justify-center"
                  >
                    <span aria-hidden className={dot} />
                  </span>
                  <span
                    className={
                      isH3 ? "text-[0.8rem] leading-snug" : "text-sm leading-snug"
                    }
                  >
                    {heading.text}
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
