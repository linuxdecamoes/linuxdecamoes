"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { MenuIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { GithubIcon } from "@/components/icons"

const navLinks = [
  { href: "/#projeto", label: "Início" },
  { href: "/#lpi", label: "Funcionalidades" },
  { href: "/#stack", label: "Stack" },
  { href: "/#comunidade", label: "Comunidade" },
  { href: "/sobre", label: "Sobre" },
  { href: "/manuals", label: "Manuais" },
]

export function LandingHeader() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 transition-shadow ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-foreground"
        >
          <img src="/linuxdecamoes_bk.svg" alt="" className="h-11 w-11" />
          <span className="hidden sm:inline">
            Linux de Camões
          </span>
        </Link>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navLinks.map((link) => (
              <NavigationMenuItem key={link.href}>
                <Link href={link.href} className={navigationMenuTriggerStyle()}>
                  {link.label}
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

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
          <Link href="/dashboard">
            <Button
              className="bg-cta text-cta-foreground hover:bg-cta/90"
              size="lg"
            >
              Aceder ao Dashboard
            </Button>
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
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-2 border-t border-border px-4 pt-4">
              <a
                href="https://github.com/linuxdecamoes"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="w-full">
                  <GithubIcon className="mr-2 size-4" />
                  GitHub
                </Button>
              </a>
              <Link href="/dashboard" onClick={() => setOpen(false)}>
                <Button className="w-full bg-cta text-cta-foreground hover:bg-cta/90">
                  Aceder ao Dashboard
                </Button>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
