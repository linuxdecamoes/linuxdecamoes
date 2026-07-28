import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Terminal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "010 - Linux Essentials", active: false },
  { label: "020 - Security Essentials", active: false },
  { label: "030 - Web Development", active: false },
  { label: "101 - LPIC-1 Parte 1", active: true },
  { label: "102 - LPIC-1 Parte 2", active: false },
];

export default async function LabPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Terminal className="h-4 w-4 text-primary" />
            Laboratório
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Manuais LPI
          </p>
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                item.active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <Button variant="outline" size="sm" className="w-full">
            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
            A aguardar pod...
          </Button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-10 border-b border-border bg-card flex items-center px-4 gap-4">
          <span className="text-xs font-medium text-muted-foreground">Terminal</span>
          <div className="flex-1" />
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            A aguardar conexão ao Kubernetes...
          </span>
        </div>

        {/* Terminal + Chat */}
        <div className="flex-1 flex">
          {/* Terminal */}
          <div className="flex-1 bg-[#0E1525] p-4 font-mono text-sm text-green-400">
            <p className="text-gray-500">$ # Terminal será conectado ao Kubernetes</p>
            <p className="text-gray-500">$ # Em breve: pods efémeros com xterm.js</p>
            <p className="text-gray-500">$ # Cada utilizador terá o seu próprio pod Linux</p>
            <p className="mt-4">
              <span className="text-green-400">$</span> _
            </p>
          </div>

          {/* Chat IA */}
          <div className="w-80 border-l border-border bg-card flex flex-col">
            <div className="p-3 border-b border-border">
              <h3 className="text-sm font-medium text-foreground">Chat IA</h3>
              <p className="text-xs text-muted-foreground">Baseado nos manuais LPI</p>
            </div>
            <div className="flex-1 p-4 flex items-center justify-center">
              <p className="text-xs text-muted-foreground text-center">
                Chat RAG integrado —{" "}
                <a href="/dashboard/chat" className="text-primary hover:underline">
                  Abrir Chat
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
