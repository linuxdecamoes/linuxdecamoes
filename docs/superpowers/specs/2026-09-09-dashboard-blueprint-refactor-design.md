# Refactor visual do dashboard — de "widgets SaaS genéricos" para "esquemático Blueprint Técnico"

## Contexto

A spec [2026-09-08-redesign-blueprint-tecnico-design.md](2026-09-08-redesign-blueprint-tecnico-design.md) já trocou paleta (verde-petróleo), tipografia (Merriweather/JetBrains Mono) e superfícies (`.surface-card`, borda 1px sólida, sem sombra/blur) em todo o site, incluindo o dashboard. Isso já foi implementado.

O que ficou por resolver: o **conteúdo visual dentro de cada card** do dashboard ainda usa padrões de qualquer template SaaS genérico, validados como problema durante uma sessão de brainstorming com companion visual:

- `terminal-card.tsx`: pills de comando flutuantes (`animation: float`) + círculos blur decorativos (blobs) nos cantos.
- `chat-card.tsx`: bolhas de chat arredondadas (`rounded-2xl rounded-br-sm`/`rounded-bl-sm`) — idêntico a qualquer app de mensagens.
- `quizzes-card.tsx`: anel de progresso circular (donut) — o widget de KPI mais comum de dashboards SaaS.
- `streak-card.tsx`: pills circulares por dia da semana — clone do padrão "streak" do Duolingo/GitHub.
- `manuals-card.tsx`: ícone Lucide dentro de caixa arredondada + "explorar →" — padrão "feature card" de landing page.

Nenhum destes é específico ao tema do produto (Linux, terminal, documentação técnica/LPI). Objetivo desta spec: substituir estes 5 padrões por uma linguagem visual "esquemática" (desenho técnico/blueprint) coerente com o resto do produto, e soltar o layout do bento atual (que espelha 1:1 a disposição anterior) para uma composição mais intencional.

**Fora de âmbito**: `/lab` (placeholder dos pods Kubernetes) não é tocado nesta spec — é tratado à parte. Nenhuma mudança de dados/API; `getUserGlobalProgress` e a shape de `GlobalProgress` mantêm-se. Sem emojis em nenhum lugar do resultado — ícones ficam a cargo de `lucide-react` (já usado no projeto) ou símbolos tipográficos mono.

## Direção visual — "esquemático"

Validada no companion visual (3 rondas: diagnóstico → 3 direções → refinamento → composição de grid):

- **Corner-ticks**: cada card ganha marcas em ângulo reto (7×7px, 1px, `opacity: .15`) nos cantos superior-esquerdo e inferior-direito, cor `var(--primary)`. Substituem qualquer sombra/blob/glow. Decorativos — `pointer-events: none`, não competem com o conteúdo (por isso a opacidade baixa; validado em 2 iterações que baixaram a opacidade de 100%→35%→15%).
- **Label de canto**: texto mono pequeno (`8px`, `font-weight: 600`, `letter-spacing: .05em`) no canto superior-direito de cada card, cor `var(--primary)` sobre fundo claro ou `oklch(0.72 0.10 150)` (verde mais claro, para contraste) sobre o card escuro do Terminal. Ex.: `LAB-01`, `SEQ-06`, `QZ-04`, `FIG-02`, `REF-05`, `CHAT-03`. Puramente decorativo (evoca legendas de desenho técnico), string fixa por card, sem lógica de numeração.
- **Métrica por widget, não widget de SaaS genérico**:
  - Quizzes: donut completo → **dial em arco** (semicírculo, `stroke-linecap` reto, sem cap arredondado) com a percentagem no centro.
  - Sequência: pills circulares por dia → **linha de tempo pontilhada** com pontos preenchidos (`var(--primary)`) nos dias com atividade e um marcador vazado a `var(--coral)` para "hoje".
  - Chat: bolhas arredondadas → **duas colunas Q/A** com sublinhado pontilhado (`border-bottom: 1px dotted var(--border)`), sem `border-radius` de bolha.
  - Estudo: barra de progresso `rounded-full` → **barra fina reta** (sem arredondamento), mantendo o sistema de cor por manual já existente (`accentClasses` de `@/lib/manuals`) — não se flatten para uma cor única.
  - Manuais: ícone-em-caixa+seta → texto simples (título + contagem + "explorar →"), sem badge de ícone.
  - Terminal: pills flutuantes com comandos soltos → **prompt real** `aluno@linuxdecamoes:~$ <comando>`, cores diferenciadas por segmento (utilizador, caminho, comando) via `<span>`, sem blobs decorativos.

## Layout do bento

Deixa de espelhar a grelha 12 colunas atual (8+4, depois 6+6, depois 6+6). Nova composição, validada como "Layout 1" no companion:

1. **Terminal** — faixa larga de abertura, `lg:col-span-12`, altura reduzida (banda, não quadrado alto).
2. **4 widgets pequenos em linha** — Sequência, Quizzes, Estudo, Manuais, cada um `md:col-span-3 lg:col-span-3` (2 por linha em `md`, 4 em `lg`, stack em mobile).
3. **Chat** — segunda faixa larga, `lg:col-span-12`, abaixo da linha de widgets.

O hero de saudação ("Olá, {firstName}") no topo da página não muda — já usa `.surface-static`-like (borda 1px, sem sombra) e não foi identificado como problema.

## Componentes afetados

Todos em `frontend/src/components/dashboard/`, mais `frontend/src/app/(dashboard)/dashboard/page.tsx`. Sem mudanças de props/dados — só de markup/CSS.

### `terminal-card.tsx`
Remove os 3 `<div>` de pills com `animation: float` e os 2 blobs (`rounded-full bg-primary-foreground/5`). Novo conteúdo: 2-3 linhas de prompt real (`aluno@linuxdecamoes:~$ <comando>`) com cursor a piscar no fim (reaproveita `@keyframes blink` já existente, se aplicável, ou mantém texto estático — decidir no plano). Adiciona corner-ticks + tag `LAB-01`.

### `chat-card.tsx`
Remove as 3 bolhas (`rounded-2xl`, `animation: pop-in`). Novo conteúdo: layout de 2 colunas (`grid-cols-2` ou `flex` com `gap`), uma linha "Q" e uma linha "A" com sublinhado pontilhado, sem fundo colorido por mensagem. Adiciona corner-ticks + tag `CHAT-03`. **Nota**: `pop-in` continua a ser usado noutros ficheiros (`not-found.tsx`, `globals.css:784`) — não remover o keyframe, só parar de o referenciar aqui.

### `quizzes-card.tsx`
Substitui o `<circle>` completo (donut) por um `<path>` em arco (semicírculo) com `stroke-linecap="butt"` (não `round`). Mantém a animação de preenchimento reaproveitando `@keyframes ring-fill` (ou equivalente para `stroke-dashoffset` de path). Adiciona corner-ticks + tag `QZ-04`.

### `streak-card.tsx`
Remove os pills circulares por dia e o ícone de chama (`@keyframes flicker` — confirmar via grep que fica órfão após esta mudança e remover o keyframe do `globals.css` se sim). Novo conteúdo: `<svg>` com linha pontilhada horizontal, pontos preenchidos para dias ativos, marcador vazado a `--coral` no dia de hoje. **Deixa de ser link** (já não era) — mas troca `.surface-card` por `.surface-static` (classe já existente em `globals.css`, sem `:hover` de borda) para não sugerir clicabilidade que não existe.

### `manuals-card.tsx`
Remove o `<span>` com ícone `BookOpen` em caixa `rounded-lg bg-primary/10`. Novo conteúdo: só texto (título, contagem de tópicos, "explorar →"). Adiciona corner-ticks + tag `REF-05`.

### `study-card.tsx` / `topics-card.tsx`
Troca `rounded-full` das barras de progresso por barra reta (`h-1` ou `h-[3px]`, sem `border-radius`). Mantém `accentClasses` por manual (sistema de cor já usado no resto do site). Adiciona corner-ticks + tag `FIG-02`.

### `frontend/src/app/(dashboard)/dashboard/page.tsx`
Reescreve o grid conforme a secção "Layout do bento" acima. `StudyCard`/`TopicsCard` e os outros 3 widgets pequenos entram na linha de 4; `TerminalCard` e `ChatCard` tornam-se faixas largas.

### `frontend/src/app/globals.css`
Novo par de classes utilitárias (nome a decidir no plano, ex. `.corner-tick`) para os corner-ticks — 4 pseudo-elementos ou 2 `<div>` reutilizáveis via classe, para não repetir o CSS inline em 6 componentes. Tag de canto como classe `.card-tag` (posição absoluta, tipografia mono, cor `var(--primary)`, variante `.card-tag--dark` para o Terminal). Remove `@keyframes flicker` se confirmado órfão (grep pós-implementação).

## Verificação

- `npm run build` (frontend) sem erros; `npx tsc --noEmit` limpo.
- `npm run dev` e visitar `/dashboard` autenticado: confirmar visualmente — sem blobs/pills flutuantes, sem bolhas de chat, sem donut completo, sem pills de dia circulares, sem ícone-em-caixa nos Manuais; corner-ticks discretos (não chamam atenção antes do conteúdo); todos os cards exceto Sequência navegam para a respetiva página ao clicar; Sequência não parece clicável (sem hover de borda a mudar de cor).
- Grep pós-implementação: `rounded-full.*bg-(primary|muted)|animation:\s*["']?(float|flicker)` nos 6 ficheiros de `components/dashboard/` deve devolver zero resultados.
- Testar em mobile (`< md`): 4 widgets em stack vertical, Terminal e Chat mantêm-se largura total.
