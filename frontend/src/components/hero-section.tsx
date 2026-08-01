"use client"

import { useEffect, useSyncExternalStore, useState } from "react"
import { MeshGradient } from "@paper-design/shaders-react"
import Link from "next/link"
import { GraduationCap } from "lucide-react"

export function GithubIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

const HERO_COLORS = [
  "#4a7fb5",
  "#8ab4d8",
  "#d4956a",
  "#f0dcc8",
  "#6aad8c",
  "#e8d4a8",
]

export function HeroSection() {
  const [dimensions, setDimensions] = useState(() =>
    typeof window === "undefined"
      ? { width: 1280, height: 900 }
      : { width: window.innerWidth, height: Math.max(800, window.innerHeight) },
  )
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
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  return (
    <section
      id="projeto"
      className="hero-paper relative overflow-hidden"
      style={{ backgroundColor: "var(--background)" }}
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
        <p
          className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          aria-hidden="true"
          style={{
            color: "var(--foreground)",
            animation: "slideUp 0.6s ease-out 0.1s both",
          }}
        >
          Domine Sistemas Linux.
          <br />
          <span className="hero-slider-container">
            <span className="hero-slider text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-orange-500">
              <span>SysAdmin.</span>
              <span>DevOps.</span>
              <span>Cloud Native.</span>
              <span>Segurança.</span>
              <span aria-hidden="true">SysAdmin.</span>
            </span>
          </span>
        </p>

        <p
          className="mx-auto mt-6 max-w-2xl text-lg leading-8"
          style={{
            color: "var(--muted-foreground)",
            animation: "slideUp 0.6s ease-out 0.2s both",
          }}
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
            className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all hover:scale-[1.02] hover:shadow-lg"
            style={{
              backgroundColor: "var(--card-dark)",
              color: "white",
            }}
          >
            <GraduationCap className="h-4 w-4" />
            Começar a Aprender
          </Link>
          <a
            href="https://github.com/linuxdecamoes"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border px-6 py-3 text-sm font-semibold transition-all hover:scale-[1.02] hover:bg-black/5"
            style={{
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          >
            <GithubIcon className="h-4 w-4" />
            Contribuir no GitHub
          </a>
        </div>
      </div>
    </section>
  )
}
