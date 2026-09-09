# Refactor visual esquemático do dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir os 5 padrões visuais genéricos de SaaS nos cards do dashboard (blobs/pills flutuantes, bolhas de chat, donut de progresso, streak-pills, ícone-em-caixa) por uma linguagem "esquemático/blueprint" (corner-ticks, labels mono, dial em arco, linha de tempo pontilhada, Q/A com sublinhado), e reorganizar o bento grid numa composição em faixas (Terminal → 4 widgets → Chat) em vez de espelhar o layout atual.

**Architecture:** Mudança puramente de apresentação (markup + CSS) em `frontend/src/components/dashboard/*.tsx` e `frontend/src/app/(dashboard)/dashboard/page.tsx`. Duas classes utilitárias novas (`.corner-tick`, `.card-tag`) em `globals.css`, reaproveitando o contrato de superfície `.surface-card`/`.surface-static` já existente. Sem mudanças de props, tipos, dados ou rotas.

**Tech Stack:** Next.js 16 (App Router, Server Components), Tailwind CSS v4 (`@theme inline` + `:root` tokens, sem `tailwind.config`), SVG inline para os widgets gráficos. Projeto sem framework de testes configurado (`package.json` só tem `dev`/`build`/`start`/`lint`) — verificação é `npx tsc --noEmit`, `npm run lint`, `npm run build` e checagem visual manual via dev server.

---

## Task 1: Classes utilitárias `.corner-tick` / `.card-tag` em `globals.css`

**Files:**
- Modify: `frontend/src/app/globals.css:588-617` (contrato de superfície) e `:262-265` (keyframe `ring-fill`)

- [ ] **Step 1: Adicionar `position: relative` ao contrato de superfície**

Em `frontend/src/app/globals.css`, o bloco atual (linhas 585-617) é:

```css
  /* Contrato de superfície Blueprint: borda 1px sólida, sem sombra,
     hover = border-primary. Sem layout nem padding impostos, para poder
     servir painéis que não são células de bento. */
  .surface,
  .surface-card {
    border: 1px solid var(--border);
    background: var(--card);
    transition: border-color 0.2s ease;
  }
  .surface:hover,
  .surface-card:hover {
    border-color: var(--primary);
  }

  /* Painel não-interativo: mesma superfície, sem afordância de hover. */
  .surface-static {
    border: 1px solid var(--border);
    background: var(--card);
  }

  /* Célula do bento do dashboard — layout por cima de .surface. */
  .surface-card {
    display: flex;
    height: 100%;
    flex-direction: column;
    justify-content: space-between;
    padding: 1.5rem;
  }
  @media (min-width: 1024px) {
    .surface-card {
      padding: 2rem;
    }
  }
```

Substitui por (adiciona `position: relative` aos dois seletores base, para ancorar os corner-ticks/tags absolutos que vamos introduzir):

```css
  /* Contrato de superfície Blueprint: borda 1px sólida, sem sombra,
     hover = border-primary. Sem layout nem padding impostos, para poder
     servir painéis que não são células de bento. position: relative
     ancora .corner-tick/.card-tag quando presentes. */
  .surface,
  .surface-card {
    position: relative;
    border: 1px solid var(--border);
    background: var(--card);
    transition: border-color 0.2s ease;
  }
  .surface:hover,
  .surface-card:hover {
    border-color: var(--primary);
  }

  /* Painel não-interativo: mesma superfície, sem afordância de hover. */
  .surface-static {
    position: relative;
    border: 1px solid var(--border);
    background: var(--card);
  }

  /* Célula do bento do dashboard — layout por cima de .surface. */
  .surface-card {
    display: flex;
    height: 100%;
    flex-direction: column;
    justify-content: space-between;
    padding: 1.5rem;
  }
  @media (min-width: 1024px) {
    .surface-card {
      padding: 2rem;
    }
  }

  /* Marca de canto tipo desenho técnico — decorativa, substitui
     sombra/blob/glow. Opacidade baixa de propósito: não deve competir
     com o conteúdo do card (validado em brainstorming visual). */
  .corner-tick {
    position: absolute;
    width: 7px;
    height: 7px;
    border-color: var(--primary);
    opacity: 0.15;
    pointer-events: none;
  }
  .corner-tick--tl {
    top: -1px;
    left: -1px;
    border-top: 1px solid;
    border-left: 1px solid;
  }
  .corner-tick--br {
    bottom: -1px;
    right: -1px;
    border-bottom: 1px solid;
    border-right: 1px solid;
  }

  /* Legenda de canto tipo desenho técnico — string fixa por card,
     puramente decorativa (evoca referência de desenho técnico). */
  .card-tag {
    position: absolute;
    top: 0.375rem;
    right: 0.5rem;
    font-family: var(--font-mono);
    font-size: 8px;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: var(--primary);
    pointer-events: none;
  }
  .card-tag--dark {
    color: var(--sage);
  }
```

- [ ] **Step 2: Verificar**

Run: `cd frontend && npx tsc --noEmit`
Expected: sem erros (mudança é só CSS).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/globals.css
git commit -m "$(cat <<'EOF'
style(dashboard): adiciona corner-tick e card-tag esquematicos

Duas classes utilitarias reutilizaveis por todos os cards do dashboard,
substituindo sombra/blob/glow por marcas de canto e legenda tipo
desenho tecnico.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: `terminal-card.tsx` — blobs/pills flutuantes → prompt real

**Files:**
- Modify: `frontend/src/components/dashboard/terminal-card.tsx` (reescrita completa)

- [ ] **Step 1: Reescrever o ficheiro**

Substitui todo o conteúdo de `frontend/src/components/dashboard/terminal-card.tsx` por:

```tsx
import Link from "next/link"

export function TerminalCard() {
  return (
    <Link href="/lab" className="group block h-full">
      <div className="surface-card bg-card-dark">
        <div className="corner-tick corner-tick--tl" />
        <div className="corner-tick corner-tick--br" />
        <span className="card-tag card-tag--dark">LAB-01</span>

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
```

- [ ] **Step 2: Verificar**

Run: `cd frontend && npx tsc --noEmit && npm run lint`
Expected: sem erros, sem warnings novos.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/dashboard/terminal-card.tsx
git commit -m "$(cat <<'EOF'
style(dashboard): terminal-card com prompt real em vez de pills+blobs

Remove os balões de comando flutuantes (animation: float) e os blobs
decorativos nos cantos. Novo conteudo: 3 linhas de prompt real
(aluno@linuxdecamoes:~$) com cursor a piscar, corner-tick e tag LAB-01.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: `chat-card.tsx` — bolhas de chat → colunas Q/A

**Files:**
- Modify: `frontend/src/components/dashboard/chat-card.tsx` (reescrita completa)

- [ ] **Step 1: Reescrever o ficheiro**

```tsx
import Link from "next/link"

export function ChatCard() {
  return (
    <Link href="/dashboard/chat" className="group block h-full">
      <div className="surface-card">
        <div className="corner-tick corner-tick--tl" />
        <div className="corner-tick corner-tick--br" />
        <span className="card-tag">CHAT-03</span>

        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-foreground">
            Chat IA
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tira dúvidas com IA baseada nos manuais
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div className="flex gap-2">
            <span className="font-mono text-xs font-semibold text-primary">Q</span>
            <p className="border-b border-dotted border-border pb-1 text-foreground">
              O que é o <code className="font-mono">chmod 755</code>?
            </p>
          </div>
          <div className="flex gap-2">
            <span className="font-mono text-xs font-semibold text-muted-foreground">A</span>
            <p className="border-b border-dotted border-border pb-1 text-foreground">
              Define permissões: owner rwx, grupo r-x, outros r-x
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Verificar**

Run: `cd frontend && npx tsc --noEmit && npm run lint`
Expected: sem erros. Nota: `pop-in` deixa de ser referenciado aqui mas continua definido em `globals.css` e usado por `not-found.tsx` — não remover o keyframe.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/dashboard/chat-card.tsx
git commit -m "$(cat <<'EOF'
style(dashboard): chat-card com colunas Q/A em vez de bolhas

Remove as 3 bolhas de chat (rounded-2xl, animation: pop-in) — padrao
identico a qualquer app de mensagens. Novo conteudo: layout de 2
colunas com pergunta e resposta separadas por sublinhado pontilhado,
corner-tick e tag CHAT-03.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: `quizzes-card.tsx` — donut → dial em arco

**Files:**
- Modify: `frontend/src/app/globals.css:262-265` (keyframe `ring-fill`)
- Modify: `frontend/src/components/dashboard/quizzes-card.tsx` (reescrita completa)

- [ ] **Step 1: Redefinir o keyframe `ring-fill` para ser reutilizável com qualquer percentagem**

Em `frontend/src/app/globals.css`, o keyframe atual (linhas 262-265) está hardcoded para uma única percentagem:

```css
@keyframes ring-fill {
  from { stroke-dashoffset: 314; }
  to { stroke-dashoffset: 94; }
}
```

Substitui por (só define `from`; o `to` implícito herda o `stroke-dashoffset` que o elemento já tem via prop React — técnica padrão de CSS animation para animar até um valor calculado dinamicamente):

```css
@keyframes ring-fill {
  from { stroke-dashoffset: 100; }
}
```

- [ ] **Step 2: Reescrever `quizzes-card.tsx`**

```tsx
import Link from "next/link"

type QuizzesCardProps = {
  dueCount?: number
  totalCount?: number
}

export function QuizzesCard({ dueCount = 0, totalCount = 0 }: QuizzesCardProps) {
  const pct = totalCount > 0 ? Math.round(((totalCount - dueCount) / totalCount) * 100) : 0

  return (
    <Link href="/dashboard/quizzes" className="group block h-full">
      <div className="surface-card">
        <div className="corner-tick corner-tick--tl" />
        <div className="corner-tick corner-tick--br" />
        <span className="card-tag">QZ-04</span>

        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-foreground">
            Quizzes
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {dueCount > 0
              ? `${dueCount} pendente${dueCount !== 1 ? "s" : ""} hoje`
              : "Tudo em dia"}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-end">
          <svg width="110" height="64" viewBox="0 0 110 64">
            <path
              d="M8 60 A47 47 0 0 1 102 60"
              fill="none"
              stroke="var(--muted)"
              strokeWidth="6"
            />
            <path
              d="M8 60 A47 47 0 0 1 102 60"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="6"
              pathLength={100}
              strokeDasharray={100}
              strokeDashoffset={100 - pct}
              className="animate-[ring-fill_1s_ease-out_forwards]"
            />
            <text
              x="55" y="50"
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize="16"
              fontWeight="700"
              fill="var(--foreground)"
            >
              {pct}%
            </text>
          </svg>
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 3: Verificar**

Run: `cd frontend && npx tsc --noEmit && npm run lint`
Expected: sem erros. O `pathLength={100}` normaliza o comprimento do path para 100 unidades, tornando `strokeDasharray`/`strokeDashoffset` diretamente percentagens — funciona com qualquer `pct` sem recalcular geometria.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/globals.css frontend/src/components/dashboard/quizzes-card.tsx
git commit -m "$(cat <<'EOF'
style(dashboard): quizzes-card com dial em arco em vez de donut

Substitui o anel circular completo (o widget de KPI mais comum de
qualquer dashboard SaaS) por um dial em semicirculo com stroke reto
(sem cap arredondado). Usa pathLength=100 para tornar a animacao de
preenchimento independente da percentagem real, corrigindo o bug do
ring anterior (animava sempre para o mesmo offset fixo). Redefine o
keyframe ring-fill para funcionar com qualquer percentagem via a
tecnica de keyframe so-com-from.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: `streak-card.tsx` — pills de dia → linha de tempo pontilhada, sem link

**Files:**
- Modify: `frontend/src/components/dashboard/streak-card.tsx` (reescrita completa)

- [ ] **Step 1: Reescrever o ficheiro**

```tsx
type StreakCardProps = {
  streak?: number
}

const TIMELINE_X = [8, 24, 40, 56, 72, 88] as const
const TODAY_X = 96

export function StreakCard({ streak = 0 }: StreakCardProps) {
  const activeDots = Math.min(streak, TIMELINE_X.length)

  return (
    <div className="surface-static relative flex h-full flex-col justify-between p-6 lg:p-8">
      <div className="corner-tick corner-tick--tl" />
      <div className="corner-tick corner-tick--br" />
      <span className="card-tag">SEQ-06</span>

      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-foreground">
          Sequência
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Dias consecutivos de estudo
        </p>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <svg width="100%" height="30" viewBox="0 0 104 30" preserveAspectRatio="none" className="flex-1">
          <line x1="2" y1="15" x2="100" y2="15" stroke="var(--border)" strokeWidth="1" strokeDasharray="2 3" />
          {TIMELINE_X.map((x, i) => (
            <circle key={x} cx={x} cy={15} r={3} fill={i < activeDots ? "var(--primary)" : "var(--muted)"} />
          ))}
          <circle cx={TODAY_X} cy={15} r={4} fill="var(--card)" stroke="var(--coral)" strokeWidth={2} />
        </svg>

        <div className="shrink-0 text-right">
          <p className="text-2xl font-extrabold tabular-nums text-foreground">{streak}</p>
          <p className="text-xs text-muted-foreground">dias</p>
        </div>
      </div>
    </div>
  )
}
```

Nota: `dayLabels`/`getDayLabel`/`now` do ficheiro original deixam de ser usados — a linha de tempo já é implicitamente cronológica, não precisa de rótulos de dia da semana. Import de `Link` não existia neste ficheiro (nunca foi clicável) — mantém-se assim.

- [ ] **Step 2: Verificar**

Run: `cd frontend && npx tsc --noEmit && npm run lint`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/dashboard/streak-card.tsx
git commit -m "$(cat <<'EOF'
style(dashboard): streak-card com linha de tempo em vez de pills

Remove os pills circulares por dia (clone do streak do Duolingo/GitHub)
e o icone de chama animado. Novo conteudo: linha de tempo pontilhada
com marcador vazado a coral para "hoje". Troca surface-card por
surface-static (sem hover de borda) para nao sugerir clicabilidade
que o card nao tem — confirmado com o utilizador que fica sem link.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: `manuals-card.tsx` — ícone-em-caixa → texto simples

**Files:**
- Modify: `frontend/src/components/dashboard/manuals-card.tsx` (reescrita completa)

- [ ] **Step 1: Reescrever o ficheiro**

```tsx
import Link from "next/link"

export function ManualsCard() {
  return (
    <Link href="/manuals" className="group block h-full">
      <div className="surface-card">
        <div className="corner-tick corner-tick--tl" />
        <div className="corner-tick corner-tick--br" />
        <span className="card-tag">REF-05</span>

        <div>
          <h2 className="text-lg font-bold text-foreground">
            Manuais LPI
          </h2>
          <p className="text-xs text-muted-foreground">
            114 tópicos pesquisáveis
          </p>
        </div>

        <p className="mt-4 text-sm text-muted-foreground transition-colors group-hover:text-foreground">
          Explorar manuais →
        </p>
      </div>
    </Link>
  )
}
```

Nota: import de `BookOpen` (lucide-react) removido — deixa de haver ícone-em-caixa.

- [ ] **Step 2: Verificar**

Run: `cd frontend && npx tsc --noEmit && npm run lint`
Expected: sem erros, sem import não usado.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/dashboard/manuals-card.tsx
git commit -m "$(cat <<'EOF'
style(dashboard): manuals-card sem icone-em-caixa

Remove o icone Lucide dentro de badge arredondado (padrao "feature
card" de landing page). Fica so texto: titulo, contagem, "explorar",
corner-tick e tag REF-05.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: `study-card.tsx` — barras `rounded-full` → barras retas

**Files:**
- Modify: `frontend/src/components/dashboard/study-card.tsx` (reescrita completa)

- [ ] **Step 1: Reescrever o ficheiro**

```tsx
import Link from "next/link";
import type { GlobalProgress } from "@/lib/api";
import { accentClasses } from "@/lib/manuals";
import { getManual } from "@/lib/manuals";

type StudyCardProps = {
  progress: GlobalProgress;
};

export function StudyCard({ progress }: StudyCardProps) {
  return (
    <Link href="/dashboard/study" className="group block h-full">
      <div className="surface-card">
        <div className="corner-tick corner-tick--tl" />
        <div className="corner-tick corner-tick--br" />
        <span className="card-tag">FIG-02</span>

        <div>
          <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-foreground">
            Estudo
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {progress.total_topics_completed}/{progress.total_topics} tópicos
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-3">
          {progress.manuals.map((m) => {
            const manual = getManual(m.code);
            const accent = manual?.accent ?? "sage";
            const classes = accentClasses[accent];
            const pct = m.total_topics > 0
              ? Math.round((m.completed_topics / m.total_topics) * 100)
              : 0;

            return (
              <div key={m.code} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-semibold ${classes.strong}`}>
                    {m.title}
                  </span>
                  <span className="text-muted-foreground">
                    {m.modules_completed}/{m.modules_total} mód.
                  </span>
                </div>
                <div className="h-[3px] bg-muted overflow-hidden">
                  <div
                    className={`h-full ${classes.dot} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Link>
  );
}
```

Mudanças vs. original: `h-2 rounded-full` → `h-[3px]` (sem arredondamento) na track e no fill; adiciona corner-tick + tag FIG-02. `accentClasses` (cor por manual) mantém-se — não fica flattened para uma cor única.

- [ ] **Step 2: Verificar**

Run: `cd frontend && npx tsc --noEmit && npm run lint`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/dashboard/study-card.tsx
git commit -m "$(cat <<'EOF'
style(dashboard): study-card com barras retas em vez de rounded-full

Troca a barra de progresso arredondada por uma barra fina reta,
mantendo o sistema de cor por manual (accentClasses) ja usado no
resto do site. Adiciona corner-tick e tag FIG-02.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: `topics-card.tsx` — donut de fallback → estatística simples

**Files:**
- Modify: `frontend/src/components/dashboard/topics-card.tsx` (reescrita completa)

- [ ] **Step 1: Reescrever o ficheiro**

```tsx
export function TopicsCard() {
  return (
    <div className="surface-card">
      <div className="corner-tick corner-tick--tl" />
      <div className="corner-tick corner-tick--br" />
      <span className="card-tag">FIG-02</span>

      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-foreground">
          Tópicos
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Dos manuais oficiais LPI
        </p>
      </div>

      <div className="mt-6">
        <p className="text-3xl lg:text-4xl font-extrabold tabular-nums text-foreground">
          114
        </p>
        <p className="text-sm text-muted-foreground">tópicos</p>
      </div>
    </div>
  )
}
```

Este componente é o fallback usado quando `getUserGlobalProgress` falha (ver `dashboard/page.tsx`, `studyProgress` fica `null`) — sem dados por manual disponíveis, por isso não há dial nem barras, só a estatística total já hardcoded no original.

- [ ] **Step 2: Verificar**

Run: `cd frontend && npx tsc --noEmit && npm run lint`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/dashboard/topics-card.tsx
git commit -m "$(cat <<'EOF'
style(dashboard): topics-card sem donut de fallback

Remove o anel circular (fill-arc) do card de fallback usado quando o
progresso do utilizador falha ao carregar. Fica so o numero total de
topicos, corner-tick e tag FIG-02.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Limpeza de keyframes órfãos em `globals.css`

**Files:**
- Modify: `frontend/src/app/globals.css`

- [ ] **Step 1: Confirmar que `flicker` e `fill-arc` ficaram órfãos**

Run: `cd frontend && grep -rn "flicker\|fill-arc" src --include="*.tsx"`
Expected: nenhum resultado (as Tasks 5 e 8 removeram os únicos usos).

- [ ] **Step 2: Remover os dois keyframes**

Em `frontend/src/app/globals.css`, remove o bloco:

```css
@keyframes fill-arc {
  from { stroke-dashoffset: 220; }
  to { stroke-dashoffset: 44; }
}
```

E remove o bloco:

```css
@keyframes flicker {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.9; }
}
```

- [ ] **Step 3: Verificar**

Run: `cd frontend && npx tsc --noEmit`
Expected: sem erros (CSS puro, não afeta TS).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/globals.css
git commit -m "$(cat <<'EOF'
chore(css): remove keyframes fill-arc e flicker orfaos

Confirmado via grep que nenhum componente referencia estes keyframes
depois do refactor do topics-card e streak-card.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: `dashboard/page.tsx` — grid em faixas (Terminal → 4 widgets → Chat)

**Files:**
- Modify: `frontend/src/app/(dashboard)/dashboard/page.tsx:57-93` (secção "Bento Grid")

- [ ] **Step 1: Substituir a secção do grid**

O bloco atual (linhas 57-93) é:

```tsx
      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-5">
        {/* Terminal Lab — 8col × 2row */}
        <div className="md:col-span-6 lg:col-span-8 lg:row-span-2 min-h-[200px]">
          <TerminalCard />
        </div>

        {/* Estudo — 4col × 2row */}
        <div className="md:col-span-3 lg:col-span-4 lg:row-span-2 min-h-[200px]">
          {studyProgress ? (
            <StudyCard progress={studyProgress} />
          ) : (
            <TopicsCard />
          )}
        </div>

        {/* Chat IA — 6col × 2row */}
        <div className="md:col-span-3 lg:col-span-6 lg:row-span-2 min-h-[200px]">
          <ChatCard />
        </div>

        {/* Quizzes — 6col × 2row */}
        <div className="md:col-span-3 lg:col-span-6 lg:row-span-2 min-h-[200px]">
          <QuizzesCard
            dueCount={studyProgress?.due_quiz_count ?? 0}
            totalCount={studyProgress?.total_quizzes_taken ?? 0}
          />
        </div>

        {/* Manuais + Streak row — 6 + 6 preenche os 12 (sem buraco) */}
        <div className="md:col-span-6 lg:col-span-6 min-h-[140px]">
          <ManualsCard />
        </div>
        <div className="md:col-span-6 lg:col-span-6 min-h-[140px]">
          <StreakCard streak={studyProgress?.streak_consecutive_days ?? 0} />
        </div>
      </div>
```

Substitui por:

```tsx
      {/* Bento Grid — Terminal como faixa de abertura, 4 widgets em linha, Chat como faixa de fecho */}
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-5">
        {/* Terminal Lab — faixa larga */}
        <div className="md:col-span-6 lg:col-span-12 min-h-[180px]">
          <TerminalCard />
        </div>

        {/* Sequência */}
        <div className="md:col-span-3 lg:col-span-3 min-h-[160px]">
          <StreakCard streak={studyProgress?.streak_consecutive_days ?? 0} />
        </div>

        {/* Quizzes */}
        <div className="md:col-span-3 lg:col-span-3 min-h-[160px]">
          <QuizzesCard
            dueCount={studyProgress?.due_quiz_count ?? 0}
            totalCount={studyProgress?.total_quizzes_taken ?? 0}
          />
        </div>

        {/* Estudo */}
        <div className="md:col-span-3 lg:col-span-3 min-h-[160px]">
          {studyProgress ? (
            <StudyCard progress={studyProgress} />
          ) : (
            <TopicsCard />
          )}
        </div>

        {/* Manuais */}
        <div className="md:col-span-3 lg:col-span-3 min-h-[160px]">
          <ManualsCard />
        </div>

        {/* Chat IA — faixa larga */}
        <div className="md:col-span-6 lg:col-span-12 min-h-[200px]">
          <ChatCard />
        </div>
      </div>
```

- [ ] **Step 2: Verificar**

Run: `cd frontend && npx tsc --noEmit && npm run lint`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add "frontend/src/app/(dashboard)/dashboard/page.tsx"
git commit -m "$(cat <<'EOF'
style(dashboard): grid em faixas em vez de bento assimetrico

Terminal e Chat passam a ocupar faixas largas (12 colunas), com os
4 widgets pequenos (Sequencia, Quizzes, Estudo, Manuais) numa linha
entre eles — 2 por linha em md, 4 em lg. Ja nao espelha a disposicao
8+4/6+6/6+6 anterior.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Verificação final completa

**Files:** nenhum (só verificação)

- [ ] **Step 1: Build de produção**

Run: `cd frontend && npm run build`
Expected: build conclui sem erros.

- [ ] **Step 2: Grep de confirmação (sem os 5 padrões genéricos)**

Run:
```bash
cd frontend && grep -rn "rounded-full.*bg-\(primary\|muted\)\|animation:\s*[\"']\?float\|animation:\s*[\"']\?flicker\|rounded-2xl.*rounded-b[lr]-sm" src/components/dashboard
```
Expected: nenhum resultado.

- [ ] **Step 3: Iniciar o dev server e verificar visualmente**

Usar o Browser pane (`preview_start` com o dev server do projeto, ou `npm run dev` + navegar para `/dashboard` autenticado).

Confirmar:
- Terminal Lab: prompt real (`aluno@linuxdecamoes:~$`), sem pills flutuantes nem blobs.
- Chat IA: 2 colunas Q/A com sublinhado pontilhado, sem bolhas.
- Quizzes: dial em arco (semicírculo), não donut completo.
- Sequência: linha de tempo pontilhada, marcador coral em "hoje"; card não reage a hover como se fosse clicável.
- Manuais: sem ícone em caixa, só texto.
- Estudo: barras finas retas (sem `rounded-full`), cor por manual mantida.
- Todos os corner-ticks e tags (`LAB-01`, `SEQ-06`, `QZ-04`, `FIG-02`, `REF-05`, `CHAT-03`) visíveis mas discretos (opacidade baixa, não competem com o conteúdo).
- Clicar em Terminal, Estudo, Chat, Quizzes, Manuais navega para a rota correta (`/lab`, `/dashboard/study`, `/dashboard/chat`, `/dashboard/quizzes`, `/manuals`).
- Layout em mobile (`< md`): tudo em stack vertical de 1 coluna.
- Layout em `md` (tablet): 4 widgets pequenos em 2 colunas × 2 linhas.

- [ ] **Step 4: Screenshot para o utilizador**

Tirar screenshot do dashboard completo (desktop) e enviar via `SendUserFile`.
