import Link from "next/link"
import { AuthAwareNavLink } from "@/components/auth-aware-nav-link"

export function DashboardFooter() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="mx-auto w-full max-w-[1560px] 2xl:max-w-[1920px] px-4 md:px-8 xl:px-12 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <img src="/linuxdecamoes_bk.svg" alt="" width={28} height={28} className="h-7 w-7" />
            <span className="text-sm font-semibold text-foreground">Linux de Camões</span>
          </div>
          <nav className="flex items-center gap-4 text-xs text-muted-foreground">
            <AuthAwareNavLink href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </AuthAwareNavLink>
            <AuthAwareNavLink href="/dashboard/study" className="hover:text-foreground transition-colors">
              Estudar
            </AuthAwareNavLink>
            <Link href="/manuals" className="hover:text-foreground transition-colors">
              Manuais
            </Link>
            <AuthAwareNavLink href="/dashboard/chat" className="hover:text-foreground transition-colors">
              Chat IA
            </AuthAwareNavLink>
            <AuthAwareNavLink href="/dashboard/quizzes" className="hover:text-foreground transition-colors">
              Quizzes
            </AuthAwareNavLink>
            <AuthAwareNavLink href="/lab" className="hover:text-foreground transition-colors">
              Lab
            </AuthAwareNavLink>
            <Link href="/privacidade" className="hover:text-foreground transition-colors">
              Privacidade
            </Link>
          </nav>
          <p className="text-xs text-muted-foreground">
            &copy; 2026 Linux de Camões
          </p>
        </div>
      </div>
    </footer>
  )
}
