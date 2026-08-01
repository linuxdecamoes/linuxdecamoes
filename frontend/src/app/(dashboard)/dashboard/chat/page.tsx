"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, ExternalLink } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendChatMessage } from "@/lib/api";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ topic: string; score: number; excerpt: string }>;
}

function ChatContent() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Olá! Sou o assistente IA do Linux de Camões. Posso ajudar-te com dúvidas sobre Linux baseadas nos manuais oficiais LPI. Pergunta o que quiseres!",
    },
  ]);
  const searchParams = useSearchParams();
  // Pré-preenche a pergunta quando o utilizador chega via CTA de um tópico (?q=).
  // Lazy initial state (sem effect) — evita cascading renders e cumpre a regra
  // react-hooks/set-state-in-effect.
  const [input, setInput] = useState(() => searchParams.get("q") ?? "");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = input.trim();
    if (!query || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: query }]);
    setLoading(true);

    try {
      const data = await sendChatMessage(query);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          sources: data.sources.map((s) => ({
            topic: s.topico,
            score: s.score,
            excerpt: s.texto,
          })),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Desculpa, ocorreu um erro ao processar a tua pergunta. Verifica se o backend está a correr e se a chave Groq está configurada.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-3xl space-y-4 py-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
            >
              {msg.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border"
                }`}
              >
                <div className="chat-markdown">
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </Markdown>
                </div>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 border-t border-border pt-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Fontes:
                    </p>
                    <div className="space-y-1">
                      {msg.sources.map((src, j) => (
                        <div
                          key={j}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          <ExternalLink className="h-3 w-3 shrink-0" />
                          <span className="font-medium">{src.topic}</span>
                          <span>•</span>
                          <span>{Math.round(src.score * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-xl border border-border bg-card px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-border bg-card p-4">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-3xl items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunta sobre Linux..."
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={loading || !input.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

// O Suspense é obrigatório pelo Next 16: useSearchParams() não pode ser
// pré-renderizado estaticamente sem um boundary (CSR bailout).
export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatContent />
    </Suspense>
  );
}
