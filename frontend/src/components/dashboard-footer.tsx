import { AuthAwareNavLink } from "@/components/auth-aware-nav-link"

const footerLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/study", label: "Estudar" },
  { href: "/manuals", label: "Manuais" },
  { href: "/dashboard/chat", label: "Chat IA" },
  { href: "/dashboard/quizzes", label: "Quizzes" },
  { href: "/lab", label: "Lab" },
  { href: "/changelog", label: "Atualizações" },
  { href: "/privacidade", label: "Privacidade" },
]

export function DashboardFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto w-full max-w-[1560px] 2xl:max-w-[1920px] px-4 md:px-8 xl:px-12 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <img src="/linuxdecamoes_bk.svg" alt="" width={28} height={28} className="h-7 w-7" />
            <span className="font-mono text-sm font-semibold text-foreground">Linux de Camões</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-mono text-[0.6875rem] uppercase tracking-wider text-muted-foreground">
            {footerLinks.map((link) => (
              <AuthAwareNavLink
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-primary"
                activeClassName="text-primary"
              >
                {link.label}
              </AuthAwareNavLink>
            ))}
          </nav>
          <p className="font-mono text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Linux de Camões
          </p>
        </div>
      </div>
    </footer>
  )
}
