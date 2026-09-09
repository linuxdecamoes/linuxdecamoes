import Link from "next/link"
import { AuthAwareNavLink } from "@/components/auth-aware-nav-link"

const footerSections = [
  {
    title: "Projeto",
    links: [
      { href: "/sobre", label: "Sobre Nós" },
      { href: "/changelog", label: "Atualizações" },
      {
        href: "https://github.com/linuxdecamoes/linuxdecamoes/blob/main/LICENSE",
        label: "Licença MIT",
        external: true,
      },
    ],
  },
  {
    title: "Comunidade",
    links: [
      { href: "https://github.com/linuxdecamoes", label: "GitHub", external: true },
      {
        href: "https://github.com/linuxdecamoes/linuxdecamoes#readme",
        label: "Guia de Contribuição",
        external: true,
      },
      {
        href: "https://github.com/linuxdecamoes/linuxdecamoes/issues/new",
        label: "Reportar Issue",
        external: true,
      },
    ],
  },
  {
    title: "Recursos",
    links: [
      { href: "/manuals", label: "Manuais LPI" },
      { href: "/lab", label: "Sandbox Kubernetes" },
      { href: "/dashboard/chat", label: "Motor RAG" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacidade", label: "Política de Privacidade" },
    ],
  },
]

const linkClass =
  "font-mono text-[0.8125rem] text-muted-foreground transition-colors hover:text-primary"

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono text-sm font-semibold tracking-tight text-foreground"
            >
              <img src="/linuxdecamoes_bk.svg" alt="" className="h-11 w-11" />
              <span>Linux de Camões</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Plataforma open-source de aprendizagem de Linux, baseada nos
              manuais oficiais de certificação LPI.
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {section.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <Link
                        href={link.href}
                        className={linkClass}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <AuthAwareNavLink
                        href={link.href}
                        className={linkClass}
                        activeClassName="text-primary"
                      >
                        {link.label}
                      </AuthAwareNavLink>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center font-mono text-xs text-muted-foreground">
          <p>$ echo &quot;&copy; {new Date().getFullYear()} Linux de Camões&quot;</p>
          <p className="mt-1"># desenvolvido pela comunidade</p>
        </div>
      </div>
    </footer>
  )
}
