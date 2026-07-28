# Spec: Página "/sobre" — Linux de Camões

**Data:** 2026-07-24
**Estado:** Aprovado
**Autor:** opencode (big-pickle)

---

## 1. Resumo

Criar uma página standalone `/sobre` que explica o conceito do projeto Linux de Camões, acessível via link "Sobre Nós" no rodapé da landing page. A página inclui diagramas Mermaid.js, tabelas de stack tecnológica, roadmap visual e secção de comunidade.

## 2. Decisões de Design

### 2.1 Abordagem: Server Component + Mermaid Client (Abordagem A)

- **Página principal:** Server Component (`/sobre/page.tsx`) — SEO-friendly, renderiza conteúdo estático
- **Mermaid:** Client Component isolado (`<MermaidDiagram />`) — lazy-loaded via `next/dynamic({ ssr: false })`
- **Razão:** Mantém padrão Server Components do Next.js 16, Mermaid não impacta bundle principal, conteúdo 100% indexável

### 2.2 Mermaid.js como dependência runtime

- Pacote `mermaid` (~200KB) lazy-loaded apenas quando o componente Mermaid entra no viewport
- **Justificação:** Mermaid.js é lib de renderização, não animação. ADR-001 restringe dependências de animação (Framer Motion, Lottie, GSAP). Mermaid não viola esta restrição.
- Diagramas definidos como strings no server, passados como props ao client component

### 2.3 Rota e Layout

- **Rota:** `/sobre` (standalone, fora do grupo `(dashboard)`)
- **Layout:** Reutiliza `LandingHeader` + `LandingFooter`
- **Largura:** `max-w-5xl` (consistente com landing page)
- **Footer:** Link "Sobre Nós" atualizado de `#sobre` para `/sobre`

## 3. Secções da Página

### 3.1 Hero / Introdução

- **Título:** "O Linux de Camões"
- **Subtítulo:** Explicação do trocadilho (Camões + Linux) e missão do projeto
- **Badges:** "Open Source · MIT License · PT-PT"
- **Grid Bento 3 colunas** com cards:
  - **Missão** — preparar para certificações LPI
  - **Público** — estudantes, professores, comunidade
  - **Filosofia** — 100% open-source, custo zero

### 3.2 Stack Tecnológica

- **Tabela interativa** com 3 categorias: Frontend | Backend | DevOps & IA
- Cada linha: Tecnologia | Estado (✅ / ⏳) | Descrição
- ~45 tecnologias ativas + planeadas
- Design: tokens `--table-header-bg`, `--table-border`, alternância de linhas com `--muted`

### 3.3 Roadmap / Fases

- **Diagrama Mermaid `gantt`** mostrando 7 fases (0-6) — escolhido `gantt` porque representa melhor a progressão temporal do roadmap
- Cada fase com badge de estado: ✅ Concluído / 🟡 Parcial / ⏳ Pendente
- Timeline vertical com cards por fase
- Dados das fases (extraídos do agents.md §8.1):
  - Fase 0 — Cofre de Contexto ✅
  - Fase 1 — Init Repo ✅
  - Fase 2 — Frontend Base ✅
  - Fase 3 — Backend API ✅
  - Fase 4 — RAG ✅
  - Fase 5 — Terminal K8s ⏳
  - Fase 6 — Quizzes 🟡 Parcial

### 3.4 Comunidade & Contribuição

- **Grid 2x2** com cards:
  - **Tecnologias de Ponta** — stack moderna para portfolio
  - **Custo Zero** — filosofia arquitetural
  - **Língua Portuguesa** — PT-PT em tudo
  - **Material LPI integrado** — exposição ao conteúdo de certificação
- **CTA final:** "Contribui no GitHub" + link externo

## 4. Componentes

### 4.1 Componentes novos

| Componente | Tipo | Ficheiro | Descrição |
|---|---|---|---|
| `MermaidDiagram` | Client (`"use client"`) | `src/components/mermaid-diagram.tsx` | Wrapper Mermaid.js. Recebe `chart` (string) como prop. Renderiza SVG via `mermaid.render()`. Inclui fallback de loading e tratamento de erros. Lazy-loaded via `next/dynamic({ ssr: false })`. |
| `StackTable` | Server | Integrado na página | Tabela da stack tecnológica. Dados hardcoded. Design OKLCH com tokens existentes. |
| `PhaseTimeline` | Server | Integrado na página | Timeline vertical das fases do roadmap. Cards com badge de estado. |
| `CommunityCard` | Server | Integrado na página | Card reutilizável para a secção de comunidade. |

### 4.2 Ficheiros a modificar

| Ficheiro | Ação | Detalhe |
|---|---|---|
| `src/components/landing-footer.tsx` | Editar | Link "Sobre Nós": `#sobre` → `/sobre` |

### 4.3 Ficheiros a criar

| Ficheiro | Descrição |
|---|---|
| `src/app/sobre/page.tsx` | Server Component principal da página |
| `src/components/mermaid-diagram.tsx` | Client Component para renderização Mermaid |

## 5. Dependências

| Pacote | Versão | Impacto | Justificação |
|---|---|---|---|
| `mermaid` | `^11.x` | ~200KB lazy-loaded | Renderização de diagramas (gantt, flowchart). Não é dependência de animação. |

## 6. SEO e Metadata

```typescript
export const metadata: Metadata = {
  title: "Sobre — Linux de Camões",
  description: "Conhece o projeto Linux de Camões: plataforma open-source de aprendizagem de Linux, baseada nos manuais oficiais de certificação LPI.",
  openGraph: {
    title: "Sobre — Linux de Camões",
    description: "Plataforma open-source de aprendizagem de Linux com IA interativa.",
    type: "website",
  },
};
```

## 7. Acessibilidade

- `prefers-reduced-motion` respeitado (já global via CSS em `globals.css`)
- Mermaid com `role="img"` + `aria-label` descritivo
- Tabelas com `<caption>` e headers semânticos (`<th scope="col">`)
- Cards com contraste adequado (tokens OKLCH verificados)
- Navegação por teclado funcional

## 8. Design System

- **Tokens OKLCH:** reutiliza tokens existentes (`--primary`, `--muted`, `--border`, `--card`, etc.)
- **Bento Grid:** hero section usa grid 3 colunas (consistente com Norma 02)
- **Glassmorphism:** cards usam `glass-card` class (consistente com landing page)
- **Sem dependências de animação:** ADR-001 respeitado
- **Zero cores inline:** tudo via tokens `:root` + `@theme inline`

## 9. Fluxo de Implementação

1. Instalar `mermaid` no frontend
2. Criar `src/components/mermaid-diagram.tsx` (Client Component)
3. Criar `src/app/sobre/page.tsx` (Server Component com todas as secções)
4. Atualizar `src/components/landing-footer.tsx` (link "Sobre Nós" → `/sobre`)
5. Verificar: `cmd /c "npm run lint"` + `cmd /c "npm run build"`
6. Commit com mensagem convencional

## 10. Restrições

- PT-PT em todo o conteúdo
- Zero cores inline em `.tsx` (Norma 01)
- Zero dependências de animação runtime (ADR-001)
- Mermaid é a única nova dependência runtime (aceite pelo user)
- Build deve passar 131/131 páginas SSG
