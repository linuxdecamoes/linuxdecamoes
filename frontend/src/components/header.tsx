"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { UserButton, useAuth } from "@clerk/nextjs"
import { MenuIcon, BookOpen, LayoutDashboard, FlaskConical, MessageSquare, GraduationCap } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
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

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/manuals", label: "Manuais", icon: BookOpen },
  { href: "/lab", label: "Lab", icon: FlaskConical },
  { href: "/dashboard/chat", label: "Chat IA", icon: MessageSquare },
  { href: "/dashboard/quizzes", label: "Quizzes", icon: GraduationCap },
]

export function Header() {
  const { isSignedIn } = useAuth()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 transition-shadow ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <div className="mx-auto flex h-14 max-w-[1560px] 2xl:max-w-[1920px] items-center justify-between px-4 md:px-8 xl:px-12">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-foreground"
        >
          <img src="/linuxdecamoes.png" alt="" className="h-9 w-9" />
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

        <div className="flex items-center gap-3">
          {isSignedIn && (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                },
              }}
            />
          )}
          {!isSignedIn && (
            <>
              <Link href="/sign-in" className={buttonVariants({ variant: "ghost" })}>
                Entrar
              </Link>
              <Link href="/sign-up" className={buttonVariants({ variant: "default" })}>
                Começar
              </Link>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu" />
            }
          >
            <MenuIcon className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {navLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {link.label}
                  </Link>
                )
              })}
            </nav>
            <div className="flex flex-col gap-2 border-t border-border px-4 pt-4">
              <a href="https://github.com/linuxdecamoes" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full">
                  GitHub
                </Button>
              </a>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
