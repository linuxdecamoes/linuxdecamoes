import { Terminal, Timer } from "lucide-react"

export function PracticeSection() {
  return (
    <section id="praticar" className="border-t border-border bg-card/40 py-24">
      <div className="mx-auto max-w-6xl px-4">
        <p className="mb-4 text-center font-mono text-xs uppercase tracking-[0.2em] text-primary">
          $ ./quiz --run
        </p>
        <h2 className="mb-4 text-center font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Pratica o que aprendeste
        </h2>
        <p className="mb-12 text-center text-base text-muted-foreground">
          Teoria sem prática esquece-se depressa — por isso a plataforma ajuda-te a fixar e a aplicar.
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="border border-border bg-card p-6">
            <div className="mb-3 flex items-center gap-2">
              <Timer aria-hidden="true" className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Quizzes SM-2</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Fixa o que aprendeste com quizzes inteligentes — o sistema adapta-se
              ao teu ritmo e volta a perguntar nos dias certos para não esqueceres
              nada antes do exame.
            </p>
          </div>

          <div className="border border-dashed border-border bg-secondary p-6">
            <div className="mb-3 flex items-center gap-2">
              <Terminal aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">Labs Kubernetes</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Pratica comandos reais num ambiente isolado — sem medo de quebrar
              nada. Ideal para quem quer ganhar confiança antes de tocar num
              servidor de produção.
            </p>
            <span className="mt-3 inline-block border border-border px-2.5 py-0.5 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Em breve
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
