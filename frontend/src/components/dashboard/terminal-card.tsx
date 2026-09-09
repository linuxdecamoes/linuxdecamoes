import Link from "next/link"

export function TerminalCard() {
  return (
    <Link href="/lab" className="group block h-full">
      <div className="surface-card bg-card-dark">
        <div className="corner-tick corner-tick--tl" />
        <div className="corner-tick corner-tick--br" />
        <span className="card-tag card-tag--dark" aria-hidden="true">LAB-01</span>

        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-primary-foreground/90">Terminal Lab</h2>
          <p className="mt-1 text-sm text-primary-foreground/50">
            Prática comandos Linux num terminal real
          </p>
        </div>

        <div className="mt-6 overflow-x-auto whitespace-pre font-mono text-xs leading-7">
          <p>
            <span className="text-primary-foreground/70">aluno@linuxdecamoes</span>
            <span className="text-primary-foreground/40">:~$ </span>
            <span className="text-primary-foreground/90">ls -la /etc/nginx</span>
          </p>
          <p>
            <span className="text-primary-foreground/70">aluno@linuxdecamoes</span>
            <span className="text-primary-foreground/40">:~$ </span>
            <span className="text-primary-foreground/90">chmod +x deploy.sh</span>
          </p>
          <p>
            <span className="text-primary-foreground/70">aluno@linuxdecamoes</span>
            <span className="text-primary-foreground/40">:~$ </span>
            <span className="text-sage" style={{ animation: "blink 1s step-end infinite" }}>_</span>
          </p>
        </div>
      </div>
    </Link>
  )
}
