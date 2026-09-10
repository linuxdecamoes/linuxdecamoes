"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { MenuIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { GithubIcon } from "@/components/icons"

type NavLink = {
  href: string
  label: string
  /** id da secção da home, para os links de âncora */
  section?: string
}

const navLinks: NavLink[] = [
  { href: "/#projeto", label: "Início", section: "projeto" },
  { href: "/#aprender", label: "Aprender", section: "aprender" },
  { href: "/#praticar", label: "Praticar", section: "praticar" },
  { href: "/#certificar", label: "Certificar", section: "certificar" },
  { href: "/#comunidade", label: "Comunidade", section: "comunidade" },
  { href: "/sobre", label: "Sobre" },
  { href: "/manuals", label: "Manuais" },
]

const SECTION_IDS = navLinks
  .map((l) => l.section)
  .filter((s): s is string => Boolean(s))

export function LandingHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  // Arranca a null (igual no servidor e no primeiro render do cliente) — ler
  // location.hash durante o render seria o mesmo tipo de bug de hidratação
  // que foi corrigido em e1b466f.
  const [activeSection, setActiveSection] = useState<string | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    // Fora da home não há secções para observar. Não se limpa o estado aqui
    // (setState síncrono num efeito provoca renders em cascata) — isActive()
    // já só lê activeSection quando pathname === "/".
    if (pathname !== "/") return

    const targets = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    )
    if (targets.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length === 0) return
        // A secção mais acima na viewport é a que conta.
        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top <= b.boundingClientRect.top ? a : b,
        )
        setActiveSection(topmost.target.id)
      },
      // 56px = altura do header (h-14); -60% no fundo faz com que a secção só
      // conte quando já ocupa a parte de cima do ecrã.
      { rootMargin: "-56px 0px -60% 0px" },
    )

    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [pathname])

  const isActive = (link: NavLink) => {
    if (link.section) {
      return pathname === "/" && activeSection === link.section
    }
    return pathname === link.href || pathname.startsWith(`${link.href}/`)
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-background transition-colors duration-200 ${
        scrolled ? "border-b-foreground/20" : "border-b-border"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-mono text-sm font-semibold tracking-tight text-foreground"
        >
          <img src="/linuxdecamoes_bk.svg" alt="" className="h-11 w-11" />
          <span className="hidden sm:inline">Linux de Camões</span>
        </Link>

        <nav className="hidden md:flex" aria-label="Navegação principal">
          <ul className="flex items-center">
            {navLinks.map((link) => {
              const active = isActive(link)
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="nav-link"
                    data-active={active || undefined}
                    aria-current={active ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <a
            href="https://github.com/linuxdecamoes"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghost" size="icon" aria-label="GitHub">
              <GithubIcon className="size-4" />
            </Button>
          </a>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 border border-primary bg-primary px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
          >
            $ dashboard
          </Link>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Menu"
              />
            }
          >
            <MenuIcon className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 border-r border-border shadow-none">
            <SheetHeader>
              <SheetTitle className="font-mono text-sm">$ menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col px-4" aria-label="Navegação principal">
              {navLinks.map((link) => {
                const active = isActive(link)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    data-active={active || undefined}
                    aria-current={active ? "page" : undefined}
                    className="border-l-2 border-transparent px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary hover:text-foreground data-[active]:border-primary data-[active]:text-primary"
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>
            <div className="flex flex-col gap-2 border-t border-border px-4 pt-4">
              <a
                href="https://github.com/linuxdecamoes"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-border px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <GithubIcon className="size-4" />
                GitHub
              </a>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-2 border border-primary bg-primary px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
              >
                $ dashboard
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
