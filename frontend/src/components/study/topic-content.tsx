"use client";

import { useState } from "react";
import type { TopicContent as TopicContentType } from "@/lib/api";

type TopicContentProps = {
  content: TopicContentType;
};

const TIPO_LABELS: Record<string, string> = {
  resumo: "Resumo",
  "exercicio-guiado": "Exercício Guiado",
  "exercicio-exploratorio": "Exercício Exploratório",
  "visao-geral": "Visão Geral",
  outro: "Secção",
};

export function TopicContent({ content }: TopicContentProps) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const toggle = (idx: number) =>
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));

  return (
    <div className="space-y-4">
      <div className="border-l-2 border-primary bg-muted/40 p-6">
        <h2 className="mb-2 font-heading text-xl font-bold">{content.title}</h2>
        <p className="font-mono text-xs text-muted-foreground">
          Módulo {content.objective}
        </p>
      </div>

      {content.sections.map((s, idx) => (
        <div key={idx} className="surface-static overflow-hidden">
          <button
            onClick={() => toggle(idx)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="border border-border px-2 py-0.5 font-mono text-xs uppercase tracking-wider">
                {TIPO_LABELS[s.tipo] ?? s.tipo}
              </span>
              <span className="text-sm font-semibold">{s.secao}</span>
            </div>
            <span className="text-muted-foreground text-lg">
              {expanded[idx] ? "−" : "+"}
            </span>
          </button>
          {expanded[idx] && (
            <div className="px-5 pb-4 text-sm leading-relaxed whitespace-pre-wrap">
              {s.texto}
            </div>
          )}
        </div>
      ))}

      {content.sections.length === 0 && (
        <div className="surface-static p-8 text-center">
          <p className="text-muted-foreground">
            Sem conteúdo RAG disponível para este tópico.
          </p>
        </div>
      )}
    </div>
  );
}
