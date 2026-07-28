---
tipo: controlo
titulo: docs/README — Índice da Documentação de Arquitetura
projeto: Linux de Camões
data_criacao: 2026-07-17
---

# 📐 Documentação de Arquitetura — Linux de Camões

Este directório é a **fonte de verdade** das decisões arquiteturais do frontend.
O `AGENTS.md` (raiz do projeto) mantém o diário de bordo de execução; aqui ficam os
documentos estruturais de longo prazo.

> **Nota de identidade:** o nome de produto público (e único) é **Linux de Camões**,
> presente em toda a UI (header, footer, metadata, chat). O repositório mantém o
> identificador técnico `linuxdecamoes` (folder / package). O antigo codename
> "KubeAI" foi extinto a 2026-07-17 — ver
> [_Norma 03 — Identidade de Marca e Comentários_](./Norma%2003%20-%20Identidade%20de%20Marca%20e%20Comentários.md).

---

## 📑 Índice

| Documento | Descrição |
|-----------|-----------|
| [ADR-001 — Abordagem A](./ADR-001%20-%20Abordagem%20A%20-%20CSS%20puro%20e%20SVG%20inline.md) | Decisão: CSS puro + Tailwind + SVG inline, zero libs de animação (Framer Motion). |
| [Norma 01 — Sistema de Tokens e Cores](./Norma%2001%20-%20Sistema%20de%20Tokens%20e%20Cores.md) | Regras obrigatórias: OKLCH único, zero cores inline em `.tsx`, token = definição + exposição em `@theme inline`. |
| [Norma 02 — Layout Bento e Grelha](./Norma%2002%20-%20Layout%20Bento%20e%20Grelha.md) | Regras obrigatórias: grelha de 12 col mobile-first, soma por linha = 12, `row-span-2` só com conteúdo, alturas mínimas anti-layout-shift. |
| [Norma 03 — Identidade de Marca e Comentários](./Norma%2003%20-%20Identidade%20de%20Marca%20e%20Comentários.md) | Naming canónico ("Linux de Camões"; KubeAI extinto) + comentários de código em PT-PT. |
| [Design System — OKLCH, Grid e Responsividade](./Design%20System%20-%20OKLCH%2C%20Grid%20e%20Responsividade.md) | Tokens de cor OKLCH, grelha assimétrica de 12 colunas, breakpoints Mobile→4K. |
| [Arquitetura dos Manuais](./Arquitetura%20dos%20Manuais.md) | Modelo de dados, rotas `/manuals`, mapeamento acento→token, contrato futuro FastAPI + RAG. |
| [Roadmap — Pendentes](./Roadmap%20-%20Pendentes.md) | Lista única e consolidada do trabalho por fazer (estado + prioridade). |

---

## 🗂 Mapa do Frontend (estado atual)

```
linuxdecamoes/frontend/
├─ mockup-dashboard.html        ← fonte de verdade visual (HTML/CSS estático, OKLCH)
├─ src/
│  ├─ app/
│  │  ├─ globals.css            ← tokens OKLCH (:root) + @theme inline (shadcn)
│  │  ├─ layout.tsx             ← ClerkProvider + fontes IBM Plex (Sans + Mono)
│  │  ├─ page.tsx               ← landing page (hero + features + CTA)
│  │  ├─ (auth)/                ← sign-in / sign-up (Clerk)
│  │  └─ (dashboard)/
│  │     ├─ layout.tsx          ← Header + <main>
│  │     ├─ dashboard/page.tsx  ← Bento Grid (12 colunas)
│  │     ├─ lab/page.tsx        ← futuro host do xterm.js
│  │     ├─ dashboard/chat/
│  │     └─ dashboard/quizzes/
│  └─ components/
│     ├─ header.tsx
│     ├─ ui/                    ← shadcn (base-nova): button, card, input
│     └─ dashboard/             ← 7 cartões Bento (terminal, topics, chat,
│                               │   quizzes, progress, manuals, streak)
└─ components.json              ← shadcn config (style: base-nova)
```

---

## 🔭 Princípios Aprovados

1. **Performance first.** O orçamento de CPU/GPU é reservado para o **xterm.js** e
   para o **streaming das respostas RAG**. A UI decorativa não pode competir por esse
   orçamento.
2. **Zero dependências de runtime** para animação. Só `tw-animate-css` (utilitário
   leve) e keyframes CSS próprios.
3. **OKLCH como modelo de cor único.** Nenhuma cor hex/rgb fora de exceções
   documentadas (ex.: paleta canónica do xterm.js, que vive dentro do canvas).
4. **Acessibilidade não-negociável.** `prefers-reduced-motion` respeitado;
   foco visível em todos os elementos interativos; `aria-live` nos estados de
   provisionamento.

---

## 📋 Lista de Pendentes (documentação)

- [ ] ADR-002: estratégia de dados do dashboard (server components → FastAPI)
- [ ] ADR-003: WebSocket vs SSE para o terminal xterm.js
- [x] ~~Unificar naming~~ — feito 2026-07-17 (UI unificada para "Linux de Camões"; ver [_Norma 03_](./Norma%2003%20-%20Identidade%20de%20Marca%20e%20Comentários.md))
