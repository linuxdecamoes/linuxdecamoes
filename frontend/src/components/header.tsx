"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { UserButton, useAuth } from "@clerk/nextjs"
import { MenuIcon, BookOpen, LayoutDashboard, FlaskConical, MessageSquare, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { clerkAppearance } from "@/lib/clerk-appearance"

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/manuals", label: "Manuais", icon: BookOpen },
  { href: "/lab", label: "Lab", icon: FlaskConical },
  { href: "/dashboard/chat", label: "Chat IA", icon: MessageSquare },
  { href: "/dashboard/quizzes", label: "Quizzes", icon: GraduationCap },
]

export function Header() {
  const { isSignedIn } = useAuth()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // /dashboard exige igualdade exata, senão ficaria ativo em /dashboard/chat
  // e /dashboard/quizzes ao mesmo tempo que esses. Os restantes usam prefixo,
  // para que /manuals continue ativo em /manuals/010/001-....
  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-background transition-colors duration-200 ${
        scrolled ? "border-b-foreground/20" : "border-b-border"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-[1560px] 2xl:max-w-[1920px] items-center justify-between px-4 md:px-8 xl:px-12">
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
              const active = isActive(link.href)
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

        <Sheet open={open} onOpenChange={setOpen}>
          {/* Hambúrguer e perfil no mesmo agrupamento à direita — antes o Sheet
              era irmão do bloco de auth dentro do justify-between, o que punha
              o menu depois do avatar em ecrãs pequenos. */}
          <div className="flex items-center gap-3">
            {isSignedIn && (
              <UserButton
                appearance={{
                  variables: clerkAppearance.variables,
                  elements: {
                    avatarBox: "h-8 w-8 border border-border",
                    userButtonTrigger:
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]",
                    userButtonPopoverCard: "border border-border shadow-none",
                  },
                }}
              />
            )}
            {!isSignedIn && (
              <>
                <Link href="/sign-in" className="nav-link">
                  Entrar
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-2 border border-primary bg-primary px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  $ começar
                </Link>
              </>
            )}
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu" />
              }
            >
              <MenuIcon className="size-5" />
            </SheetTrigger>
          </div>

          <SheetContent side="left" className="w-72 border-r border-border shadow-none">
            <SheetHeader>
              <SheetTitle className="font-mono text-sm">$ menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col px-4" aria-label="Navegação principal">
              {navLinks.map((link) => {
                const Icon = link.icon
                const active = isActive(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    data-active={active || undefined}
                    aria-current={active ? "page" : undefined}
                    className="flex items-center gap-3 border-l-2 border-transparent px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary hover:text-foreground data-[active]:border-primary data-[active]:text-primary"
                  >
                    <Icon className="h-4 w-4" />
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
                GitHub
              </a>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
