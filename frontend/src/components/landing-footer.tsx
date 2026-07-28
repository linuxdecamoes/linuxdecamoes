import Link from "next/link"

const footerSections = [
  {
    title: "Projeto",
    links: [
      { href: "/sobre", label: "Sobre Nós" },
      { href: "#roadmap", label: "Roadmap" },
      { href: "#", label: "Licença MIT" },
    ],
  },
  {
    title: "Comunidade",
    links: [
      { href: "https://github.com/linuxdecamoes", label: "GitHub", external: true },
      { href: "#", label: "Guia de Contribuição" },
      { href: "#", label: "Discord / Chat" },
      { href: "#", label: "Reportar Issue" },
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
]

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-semibold text-foreground"
            >
              <img src="/linuxdecamoes.png" alt="" className="h-9 w-9" />
              <span>
                Linux de Camões
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Plataforma open-source de aprendizagem de Linux, baseada nos
              manuais oficiais de certificação LPI.
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-foreground">
                {section.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 Linux de Camões. Todos os direitos reservados.</p>
          <p className="mt-1">Desenvolvido pela comunidade</p>
        </div>
      </div>
    </footer>
  )
}
