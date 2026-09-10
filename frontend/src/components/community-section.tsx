import { GithubIcon } from "@/components/icons"

export function CommunitySection() {
  return (
    <section id="comunidade" className="border-t border-border bg-background py-24">
      <div className="mx-auto max-w-4xl px-4">
        <div className="relative overflow-hidden border border-border bg-card p-8 text-center sm:p-12">
          <GithubIcon className="absolute -right-8 -top-8 h-64 w-64 text-foreground opacity-[0.03]" />

          <div className="relative">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              $ git clone community
            </p>
            <span className="mt-4 inline-block border border-primary bg-primary px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-primary-foreground">
              Licença MIT
            </span>

            <h2 className="mt-6 font-heading text-2xl font-bold text-foreground sm:text-3xl">
              Open-source, feito pela comunidade.
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              Usa, aprende, e se quiseres, contribui.
            </p>

            <div className="mt-8 flex justify-center">
              <a
                href="https://github.com/linuxdecamoes"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-card-dark px-6 py-3 text-sm font-semibold text-white transition-colors"
              >
                <GithubIcon className="h-4 w-4" />
                Repositório no GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
