import Link from "next/link"
import { GraduationCap } from "lucide-react"
import { GithubIcon } from "@/components/icons"

export function HeroSection() {
  return (
    <section id="projeto" className="relative overflow-hidden border-b border-border bg-background">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-20 sm:py-28 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-16 lg:py-32">
        <div>
          <p
            className="font-mono text-xs uppercase tracking-[0.2em] text-primary"
            style={{ animation: "slideUp 0.6s ease-out 0s both" }}
          >
            $ cat /etc/motto
          </p>

          <h1
            className="mt-4 font-heading text-4xl font-bold leading-tight text-foreground sm:text-5xl"
            style={{ animation: "slideUp 0.6s ease-out 0.1s both" }}
          >
            Domine Sistemas Linux.
            <br />
            <span className="hero-slider-container" aria-hidden="true">
              <span className="hero-slider text-primary">
                <span>SysAdmin.</span>
                <span>DevOps.</span>
                <span>Cloud Native.</span>
                <span>Segurança.</span>
                <span aria-hidden="true">SysAdmin.</span>
              </span>
            </span>
            <span className="sr-only">SysAdmin, DevOps, Cloud Native, Segurança.</span>
          </h1>

          <p
            className="mt-6 max-w-md text-base leading-7 text-muted-foreground"
            style={{ animation: "slideUp 0.6s ease-out 0.2s both" }}
          >
            A plataforma de aprendizagem de Linux baseada nos manuais oficiais.
            Do universo ao marketplace — uma ponte entre formação certificada e experiência real.
          </p>

          <div
            className="mt-8 flex flex-col gap-3 sm:flex-row"
            style={{ animation: "slideUp 0.6s ease-out 0.3s both" }}
          >
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 border border-primary bg-primary px-6 py-3 font-mono text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <GraduationCap className="h-4 w-4" />
              $ começar --agora
            </Link>
            <a
              href="https://github.com/linuxdecamoes"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-border px-6 py-3 font-mono text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <GithubIcon className="h-4 w-4" />
              git clone --contribuir
            </a>
          </div>
        </div>

        <div
          className="hero-grid-bg relative h-72 overflow-hidden border border-border bg-card-dark sm:h-96 lg:h-[26rem] lg:w-[calc(100%+4rem)] lg:justify-self-end"
          aria-hidden="true"
        >
          <div className="relative flex h-full flex-col justify-center gap-3 px-6 font-mono text-sm text-white/80">
            <div style={{ animation: "float 3s ease-in-out infinite" }}>$ uname -a</div>
            <div className="text-primary" style={{ animation: "float 3s ease-in-out infinite 0.6s" }}>
              Linux camoes 6.8.0 x86_64 GNU/Linux
            </div>
            <div style={{ animation: "float 3s ease-in-out infinite 1.2s" }}>
              $ systemctl status linux-de-camoes
            </div>
            <div className="text-primary" style={{ animation: "float 3s ease-in-out infinite 1.8s" }}>
              ● active (learning)
            </div>
            <div className="text-white/40">
              <span style={{ animation: "blink 1s step-end infinite" }}>_</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
