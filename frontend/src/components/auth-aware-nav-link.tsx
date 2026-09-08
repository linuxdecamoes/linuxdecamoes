"use client"

import Link from "next/link"
import { useAuth } from "@clerk/nextjs"
import { Lock } from "lucide-react"

const PROTECTED_PREFIXES = ["/dashboard", "/lab"]

function isProtectedRoute(href: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => href === prefix || href.startsWith(`${prefix}/`))
}

type AuthAwareNavLinkProps = {
  href: string
  className?: string
  children: React.ReactNode
}

export function AuthAwareNavLink({ href, className, children }: AuthAwareNavLinkProps) {
  const { isSignedIn } = useAuth()
  const needsLoginNotice = isProtectedRoute(href) && isSignedIn === false

  return (
    <Link
      href={href}
      className={className}
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
