"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { Lock } from "lucide-react"

const PROTECTED_PREFIXES = ["/dashboard", "/lab"]

function isProtectedRoute(href: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => href === prefix || href.startsWith(`${prefix}/`))
}

type AuthAwareNavLinkProps = {
  href: string
  className?: string
  /** Classes extra quando este link corresponde à rota atual. */
  activeClassName?: string
  children: React.ReactNode
}

export function AuthAwareNavLink({
  href,
  className,
  activeClassName,
  children,
}: AuthAwareNavLinkProps) {
  const { isSignedIn } = useAuth()
  const pathname = usePathname()
  const needsLoginNotice = isProtectedRoute(href) && isSignedIn === false

  // Mesma regra dos headers: /dashboard exige igualdade exata para não ficar
  // ativo ao mesmo tempo que /dashboard/chat; os restantes casam por prefixo.
  const isActive =
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      className={[className, isActive ? activeClassName : null]
        .filter(Boolean)
        .join(" ")}
      aria-current={isActive ? "page" : undefined}
      title={needsLoginNotice ? "Requer conta" : undefined}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {needsLoginNotice && (
          <>
            <Lock className="h-3 w-3 shrink-0 text-muted-foreground/70" aria-hidden />
            <span className="sr-only">(requer conta)</span>
          </>
        )}
      </span>
    </Link>
  )
}
