import Link from "next/link"

export function TerminalCard() {
  return (
    <Link href="/lab" className="group block h-full">
      <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card-dark p-6 shadow-bento transition-all hover:shadow-bento-hover lg:p-8">
        <div className="relative z-10">
          <h2 className="text-xl lg:text-2xl font-bold text-primary-foreground/90">Terminal Lab</h2>
          <p className="mt-1 text-sm text-primary-foreground/50">
            Prática comandos Linux num terminal real
          </p>
        </div>

        <div className="relative z-10 mt-6 flex flex-col gap-3 overflow-x-auto whitespace-pre">
          <div
            className="w-fit rounded-xl bg-primary-foreground/10 px-3 py-1.5 font-mono text-xs text-primary-foreground/80"
            style={{ animation: "float 3s ease-in-out infinite" }}
          >
            $ ls -la /etc/nginx
          </div>
          <div
            className="w-fit rounded-xl bg-primary-foreground/10 px-3 py-1.5 font-mono text-xs text-primary-foreground/80"
            style={{ animation: "float 3s ease-in-out infinite 1.2s" }}
          >
            $ grep -r &quot;server_name&quot; /etc
          </div>
          <div
            className="w-fit rounded-xl bg-primary-foreground/10 px-3 py-1.5 font-mono text-xs text-primary-foreground/80"
            style={{ animation: "float 3s ease-in-out infinite 2.4s" }}
          >
            $ chmod +x deploy.sh
          </div>
          <div className="font-mono text-xs text-primary-foreground/40">
            <span style={{ animation: "blink 1s step-end infinite" }}>_</span>
          </div>
        </div>

        <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-primary-foreground/5" />
        <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-primary-foreground/5" />
      </div>
    </Link>
  )
}
