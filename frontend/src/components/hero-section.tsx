"use client"

import { useEffect, useSyncExternalStore, useState } from "react"
import { MeshGradient } from "@paper-design/shaders-react"
import Link from "next/link"
import { GraduationCap } from "lucide-react"
import { GithubIcon } from "@/components/icons"

const HERO_COLORS = [
  "#4a7fb5",
  "#8ab4d8",
  "#d4956a",
  "#f0dcc8",
  "#6aad8c",
  "#e8d4a8",
]

export function HeroSection() {
  // Stable default on server and first client render (mounted gates actual
  // usage below, so the real viewport size never needs to match SSR output).
  const [dimensions, setDimensions] = useState({ width: 1280, height: 900 })
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  useEffect(() => {
    const update = () =>
      setDimensions({
        width: window.innerWidth,
        height: Math.max(800, window.innerHeight),
      })
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  return (
    <section
      id="projeto"
      className="hero-paper relative overflow-hidden bg-background"
    >
      <div className="absolute inset-0 [&>canvas]:h-full [&>canvas]:w-full">
        {mounted && (
          <MeshGradient
            width={dimensions.width}
            height={dimensions.height}
            colors={HERO_COLORS}
            distortion={0.8}
            swirl={0.6}
            grainMixer={0}
            grainOverlay={0}
            speed={0.42}
            offsetX={0.08}
          />
        )}
      </div>
      <div className="absolute inset-0 bg-white/25 pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-24 text-center sm:py-32 lg:py-40">
        <h1
          className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          style={{ animation: "slideUp 0.6s ease-out 0.1s both" }}
        >
          Domine Sistemas Linux.
          <br />
          <span className="hero-slider-container" aria-hidden="true">
            <span className="hero-slider text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-orange-500">
              <span>SysAdmin.</span>
              <span>DevOps.</span>
              <span>Cloud Native.</span>
              <span>Segurança.</span>
              <span aria-hidden="true">SysAdmin.</span>
            </span>
          </span>
          <span className="sr-only">SysAdmin, DevOps, Cloud Native, Segurança.</span>
        </h1>

        <p
          className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground"
          style={{ animation: "slideUp 0.6s ease-out 0.2s both" }}
        >
          A plataforma de aprendizagem de Linux baseada nos manuais oficiais.
          Do universo ao marketplace — uma ponte entre formação certificada e experiência real.
        </p>

        <div
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          style={{ animation: "slideUp 0.6s ease-out 0.3s both" }}
        >
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-lg bg-card-dark px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-lg"
          >
            <GraduationCap className="h-4 w-4" />
            Começar a Aprender
          </Link>
          <a
            href="https://github.com/linuxdecamoes"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground transition-all hover:scale-[1.02] hover:bg-black/5"
          >
            <GithubIcon className="h-4 w-4" />
            Contribuir no GitHub
          </a>
        </div>
      </div>
    </section>
  )
}
