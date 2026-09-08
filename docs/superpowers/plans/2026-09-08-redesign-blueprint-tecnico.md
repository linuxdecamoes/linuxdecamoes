# Redesign "Blueprint Técnico" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o aspecto genérico "feito por IA" (mesh gradient azul/laranja, bento grid `rounded-2xl`, glassmorphism, tudo em Inter) por uma identidade própria "Blueprint Técnico" (verde-petróleo, bordas retas, Merriweather+JetBrains Mono+Inter) na landing page, dashboard e páginas de manuais.

**Architecture:** A maior parte da mudança acontece a nível de **tokens** em `frontend/src/app/globals.css` (Tailwind v4, `@theme inline` — sem `tailwind.config`): mudar `--primary`, `--radius` e neutralizar os tokens de sombra/glassmorphism faz cascata automática para todos os componentes que já usam essas variáveis (incluindo `rounded-2xl`/`rounded-3xl`/`.glass-card`), sem editar ficheiro a ficheiro. Por cima disso, um pequeno número de edições estruturais específicas: reescrever `hero-section.tsx` para um layout assimétrico, remover o `ProgressCard` (dados inventados) do dashboard, e duas correções pontuais em `manuals/`.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4 (tokens CSS, sem config JS), TypeScript.

---

## Antes de começar

Confirmar a versão do Node/npm do projeto e que o dev server arranca:

```bash
cd frontend
npm install
npm run dev
```

Deixa correr em `http://localhost:3000` numa aba do browser para verificação visual ao longo do plano (não é preciso reiniciar entre tarefas — Fast Refresh aplica as mudanças).

---

### Task 1: Tokens de design — paleta, raio, sombras/glass, tipografia, classe partilhada de card

**Files:**
- Modify: `frontend/src/app/globals.css:9-11` (fontes)
- Modify: `frontend/src/app/globals.css:57-58` (sombras bento)
- Modify: `frontend/src/app/globals.css:107-138` (cor primária, raio)
- Modify: `frontend/src/app/globals.css:158-161` (glass tokens)
- Modify: `frontend/src/app/globals.css` `@layer components` (nova classe `.surface-card`, novo `.hero-grid-bg`)

- [ ] **Step 1: Cor de assinatura — substituir azul-violeta por verde-petróleo**

Em `:root` (`frontend/src/app/globals.css`), substituir estas 4 linhas:

```css
  --primary: oklch(0.55 0.20 260);
  --primary-foreground: oklch(0.99 0 0);
```
```css
  --ring: oklch(0.55 0.20 260);
  --chart-1: oklch(0.55 0.20 260);
```
```css
  --sidebar-primary: oklch(0.55 0.20 260);
  --sidebar-primary-foreground: oklch(0.99 0 0);
```
```css
  --sidebar-ring: oklch(0.55 0.20 260);
```

por (mantendo a posição de cada uma, só o valor oklch muda de `0.55 0.20 260` para `0.42 0.09 165`):

```css
  --primary: oklch(0.42 0.09 165);
  --primary-foreground: oklch(0.99 0 0);
```
```css
  --ring: oklch(0.42 0.09 165);
  --chart-1: oklch(0.42 0.09 165);
```
```css
  --sidebar-primary: oklch(0.42 0.09 165);
  --sidebar-primary-foreground: oklch(0.99 0 0);
```
```css
  --sidebar-ring: oklch(0.42 0.09 165);
```

- [ ] **Step 2: Achatar a escala de raio**

Substituir em `:root`:

```css
  --radius: 0.625rem;
```

por:

```css
  --radius: 0.25rem;
```

(Os tokens derivados `--radius-sm/md/lg/xl/2xl/3xl/4xl` em `@theme inline` usam `calc(var(--radius) * N)` — recalculam sozinhos. Isto muda `rounded-lg`…`rounded-4xl` em todo o site, incluindo `manual-card.tsx` (`rounded-3xl`) e o bento grid da landing (`rounded-2xl`) sem precisar de tocar nesses ficheiros.)

- [ ] **Step 3: Neutralizar as sombras "bento" (só usadas no dashboard)**

Substituir em `@theme inline`:

```css
  --shadow-bento: 0 2px 20px oklch(0 0 0 / 0.04);
  --shadow-bento-hover: 0 4px 30px oklch(0 0 0 / 0.08);
```

por:

```css
  --shadow-bento: none;
  --shadow-bento-hover: none;
```

- [ ] **Step 4: Achatar o glassmorphism (`.glass-card`, usado só em `manuals/`)**

Substituir em `:root`:

```css
  --glass-bg: oklch(0.99 0.002 250 / 0.65);
  --glass-bg-strong: oklch(0.99 0.002 250 / 0.85);
  --glass-border: oklch(0.88 0.01 250 / 0.5);
  --glass-blur: 12px;
```

por:

```css
  --glass-bg: oklch(0.99 0.002 250 / 1);
  --glass-bg-strong: oklch(0.99 0.002 250 / 1);
  --glass-border: oklch(0.88 0.01 250 / 1);
  --glass-blur: 0px;
```

- [ ] **Step 5: Título grande passa a usar Merriweather**

Substituir em `@theme inline`:

```css
  --font-heading: var(--font-inter);
```

por:

```css
  --font-heading: var(--font-merriweather);
```

(`--font-merriweather` já é definida globalmente por `layout.tsx:17-22` via `next/font/google` — não precisa de nenhuma mudança lá.)

- [ ] **Step 6: Adicionar classe partilhada `.surface-card` e `.hero-grid-bg`**

No final do bloco `@layer components { ... }` existente em `globals.css` (depois da regra `.bento-card:hover`), acrescentar:

```css
  /* Superfície de card partilhada do dashboard — substitui o padrão
     repetido rounded-2xl + shadow-bento em 7 ficheiros por uma única
     classe. Borda sólida, sem sombra flutuante. */
  .surface-card {
    display: flex;
    height: 100%;
    flex-direction: column;
    justify-content: space-between;
    border: 1px solid var(--border);
    background: var(--card);
    padding: 1.5rem;
    transition: border-color 0.2s ease;
  }
  .surface-card:hover {
    border-color: var(--primary);
  }
  @media (min-width: 1024px) {
    .surface-card {
      padding: 2rem;
    }
  }

  /* Fundo tipo papel milimétrico para o painel da hero. */
  .hero-grid-bg {
    background-image:
      linear-gradient(var(--border) 1px, transparent 1px),
      linear-gradient(90deg, var(--border) 1px, transparent 1px);
    background-size: 24px 24px;
  }
```

- [ ] **Step 7: Verificar que o CSS é válido**

```bash
cd frontend
npx tsc --noEmit
```

Esperado: sem erros (esta etapa só mexeu em CSS, o `tsc` serve para confirmar que nada mais no repo quebrou por acaso).

Depois, com o dev server a correr, visitar `http://localhost:3000` e confirmar visualmente: os cantos das cards do bento grid já não são tão arredondados, e o botão "Começar a Aprender" já não tem sombra flutuante ao passar o rato — mesmo sem termos editado ainda nenhum componente.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/app/globals.css
git commit -m "style(tokens): paleta verde-petróleo, raio achatado, remove glass/sombras bento"
```

---

### Task 2: Hero da landing page — layout assimétrico

**Files:**
- Modify: `frontend/src/components/hero-section.tsx` (reescrita completa)
- Modify: `frontend/package.json` (remover dependência não usada)

- [ ] **Step 1: Reescrever `hero-section.tsx`**

Substituir todo o conteúdo de `frontend/src/components/hero-section.tsx` por:

```tsx
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
```

Notas sobre o que mudou: já não é `"use client"` (não há mais estado/efeitos — o `MeshGradient` e a lógica de `dimensions`/`useSyncExternalStore` desapareceram, o componente passa a renderizar no servidor); o texto do slider já não tem `bg-gradient-to-r from-blue-500 to-orange-500`, usa `text-primary` sólido; o hero passa de `max-w-4xl` centrado para um grid de 2 colunas desiguais (`lg:grid-cols-[minmax(0,26rem)_1fr]`) com o painel de terminal à direita a "sangrar" para além da coluna via `lg:w-[calc(100%+4rem)]`.

- [ ] **Step 2: Remover a dependência do mesh gradient, agora sem uso**

```bash
cd frontend
grep -r "shaders-react" src/
```

Esperado: nenhum resultado (só o `globals.css` tinha uma referência em comentário — se aparecer, é só texto, não import).

```bash
npm uninstall @paper-design/shaders-react
```

- [ ] **Step 3: Verificar**

```bash
npx tsc --noEmit
npm run build
```

Esperado: ambos sem erros. Depois, visitar `http://localhost:3000` e confirmar visualmente: hero com texto à esquerda, painel escuro tipo terminal à direita a estender-se até à margem, sem gradiente azul/laranja.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/hero-section.tsx frontend/package.json frontend/package-lock.json
git commit -m "feat(landing): hero assimétrico, remove mesh gradient e gradiente de texto"
```

---

### Task 3: Landing page — bento grid, prova social, comunidade

**Files:**
- Modify: `frontend/src/app/page.tsx`

- [ ] **Step 1: Remover `rounded-2xl`/`rounded-3xl` explícitos e trocar cores genéricas do stack**

No bento grid (secção `id="lpi"`), remover a classe `rounded-2xl` de todos os 5 blocos (linhas com `className="bento-card relative rounded-2xl ..."`, `"bento-card rounded-2xl ..."` ×4) — ficam só com `border border-border` (a borda já existe, só a classe `rounded-2xl` sai). Mesmo tratamento na secção "Prova Social" (3 ocorrências de `rounded-2xl`) e na secção "Comunidade" (`rounded-3xl` no container principal).

Concretamente, `grep -n "rounded-2xl\|rounded-3xl" frontend/src/app/page.tsx` deve deixar de devolver resultados depois desta edição — usar o resultado desse grep (linhas 105, 121, 134, 149, 164, 189, 196, 206, 248 no ficheiro original) como lista de edição: em cada uma, remover apenas o token `rounded-2xl` ou `rounded-3xl` da string de classes, sem tocar no resto.

- [ ] **Step 2: Substituir as cores hardcoded roxo/verde do `STACK_COLUMNS` pelos tokens da marca**

Em `page.tsx`, substituir:

```tsx
const STACK_COLUMNS = [
  {
    title: "Frontend",
    icon: Palette,
    color: "var(--primary)",
    items: ["Next.js 16", "React 19", "Tailwind v4", "shadcn/ui"],
  },
  {
    title: "Backend",
    icon: Server,
    color: "#22c55e",
    items: ["FastAPI", "SQLAlchemy", "PostgreSQL", "Alembic"],
  },
  {
    title: "IA / ML",
    icon: Sparkles,
    color: "#a855f7",
    items: ["FAISS", "Groq", "sentence-transformers", "RAG"],
  },
  {
    title: "DevOps",
    icon: Rocket,
    color: "var(--primary)",
    items: ["Kubernetes", "Docker", "CI/CD", "WebSockets"],
  },
]
```

por (troca o verde/roxo genéricos pelos acentos quentes já existentes na paleta — `--coral` e `--amber` — evitando introduzir cor nova):

```tsx
const STACK_COLUMNS = [
  {
    title: "Frontend",
    icon: Palette,
    color: "var(--primary)",
    items: ["Next.js 16", "React 19", "Tailwind v4", "shadcn/ui"],
  },
  {
    title: "Backend",
    icon: Server,
    color: "var(--coral)",
    items: ["FastAPI", "SQLAlchemy", "PostgreSQL", "Alembic"],
  },
  {
    title: "IA / ML",
    icon: Sparkles,
    color: "var(--amber)",
    items: ["FAISS", "Groq", "sentence-transformers", "RAG"],
  },
  {
    title: "DevOps",
    icon: Rocket,
    color: "var(--primary)",
    items: ["Kubernetes", "Docker", "CI/CD", "WebSockets"],
  },
]
```

- [ ] **Step 3: Verificar**

```bash
cd frontend
npx tsc --noEmit
```

Esperado: sem erros. Visitar `http://localhost:3000`, secções "Navegue nos Mares do Conhecimento", "Prova Social", "Uma Arquitetura de Excelência" e "Comunidade" — confirmar bordas retas (sem cantos muito arredondados) e sem ícone roxo (`#a855f7`) na coluna "IA / ML".

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/page.tsx
git commit -m "style(landing): bordas retas no bento grid, remove roxo genérico do stack"
```

---

### Task 4: Dashboard — remove card de dados inventados, aplica `.surface-card`

**Files:**
- Modify: `frontend/src/app/(dashboard)/dashboard/page.tsx`
- Delete: `frontend/src/components/dashboard/progress-card.tsx`
- Modify: `frontend/src/components/dashboard/topics-card.tsx`
- Modify: `frontend/src/components/dashboard/terminal-card.tsx`
- Modify: `frontend/src/components/dashboard/study-card.tsx`
- Modify: `frontend/src/components/dashboard/streak-card.tsx`
- Modify: `frontend/src/components/dashboard/quizzes-card.tsx`
- Modify: `frontend/src/components/dashboard/manuals-card.tsx`
- Modify: `frontend/src/components/dashboard/chat-card.tsx`

- [ ] **Step 1: Remover o `ProgressCard` (dados inventados) e reequilibrar o grid**

Em `frontend/src/app/(dashboard)/dashboard/page.tsx`, remover o import:

```tsx
import { ProgressCard } from "@/components/dashboard/progress-card";
```

Remover o bloco JSX:

```tsx
        {/* Progresso — 4col × 2row */}
        <div className="md:col-span-6 lg:col-span-4 lg:row-span-2 min-h-[200px]">
          <ProgressCard />
        </div>
```

E mudar as spans do Chat e do Quizzes, de `lg:col-span-5` / `lg:col-span-3` para `lg:col-span-6` cada (preenche os 12 que o `ProgressCard` deixou de ocupar, mesmo padrão 6+6 já usado na linha Manuais/Streak):

```tsx
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
```

Também remover `rounded-2xl` e `shadow-bento` do hero de saudação no topo do mesmo ficheiro (linha com `className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-bento ..."`) — fica `className="mb-6 flex flex-col gap-4 border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between lg:p-8"`.

- [ ] **Step 2: Apagar o ficheiro do card removido**

```bash
rm frontend/src/components/dashboard/progress-card.tsx
```

- [ ] **Step 3: Trocar o wrapper repetido `rounded-2xl border ... shadow-bento ...` por `.surface-card` nos 6 cards simples**

Em cada um destes ficheiros, a `className` do `<div>` topo-de-nível muda de:

```tsx
className="flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-bento transition-all hover:shadow-bento-hover lg:p-8"
```

para:

```tsx
className="surface-card"
```

Ficheiros: `topics-card.tsx`, `study-card.tsx`, `streak-card.tsx`, `quizzes-card.tsx`, `manuals-card.tsx`.

- [ ] **Step 4: Aplicar `.surface-card` aos 2 cards com variante (fundo escuro / overflow)**

Em `frontend/src/components/dashboard/terminal-card.tsx`, mudar:

```tsx
className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card-dark p-6 shadow-bento transition-all hover:shadow-bento-hover lg:p-8"
```

para:

```tsx
className="surface-card relative overflow-hidden bg-card-dark"
```

Em `frontend/src/components/dashboard/chat-card.tsx`, mudar:

```tsx
className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-bento transition-all hover:shadow-bento-hover lg:p-8"
```

para:

```tsx
className="surface-card relative overflow-hidden"
```

(As 3 bolhas de chat dentro do mesmo ficheiro, com `rounded-2xl rounded-br-sm`/`rounded-bl-sm`, ficam como estão — já vão herdar o novo `--radius` mais achatado do Task 1, não precisam de edição.)

- [ ] **Step 5: Verificar**

```bash
cd frontend
npx tsc --noEmit
npm run build
```

Esperado: ambos sem erros — se `tsc`/`build` acusarem `ProgressCard`/`progress-card` em falta nalgum sítio, é sinal de que ficou uma referência por remover no `page.tsx` do Step 1.

Visitar `http://localhost:3000/dashboard` autenticado — confirmar: grid sem buracos, sem o card "Progresso" duplicado, todos os cards com borda reta (sem sombra flutuante ao passar o rato, só a borda a ficar verde-petróleo).

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/\(dashboard\)/dashboard/page.tsx frontend/src/components/dashboard/
git commit -m "refactor(dashboard): remove ProgressCard com dados inventados, aplica surface-card"
```

---

### Task 5: Manuais — remover blur/transparência residuais fora do alcance dos tokens

**Files:**
- Modify: `frontend/src/app/manuals/page.tsx`
- Modify: `frontend/src/components/manuals/prev-next-nav.tsx`

> Nota: `manual-card.tsx`, `manuals-explorer.tsx`, `topic-meta.tsx`, `topic-accordion.tsx` usam a classe `.glass-card` e/ou `rounded-2xl`/`rounded-3xl` — já ficam retos e opacos automaticamente com os tokens do Task 1, sem precisar de editar estes ficheiros.

- [ ] **Step 1: Remover blur/transparência ad-hoc em `app/manuals/page.tsx`**

Na linha com:

```tsx
                  className="flex min-w-[7rem] flex-col items-center rounded-2xl border border-border bg-card/80 px-5 py-3 text-center backdrop-blur-sm"
```

mudar para (remove `bg-card/80` transparente e `backdrop-blur-sm`, fica opaco):

```tsx
                  className="flex min-w-[7rem] flex-col items-center border border-border bg-card px-5 py-3 text-center"
```

- [ ] **Step 2: Remover sombra flutuante em `prev-next-nav.tsx`**

As duas ocorrências de:

```tsx
className="glass-card group flex flex-col gap-1 rounded-xl p-4 transition-all hover:shadow-float hover:translate-x-[-2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
```

e

```tsx
className="glass-card group flex flex-col gap-1 rounded-xl p-4 text-right transition-all hover:shadow-float hover:translate-x-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
```

mudam para (mantém `glass-card`, que já é opaco/reto pelo Task 1; troca `hover:shadow-float hover:translate-x-...` por uma borda que reage no hover, coerente com o resto do redesign):

```tsx
className="glass-card group flex flex-col gap-1 rounded-xl border border-transparent p-4 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
```

```tsx
className="glass-card group flex flex-col gap-1 rounded-xl border border-transparent p-4 text-right transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
```

- [ ] **Step 3: Verificar**

```bash
cd frontend
npx tsc --noEmit
```

Esperado: sem erros. Visitar `http://localhost:3000/manuals` e um tópico qualquer (`/manuals/<code>/<slug>`) — confirmar: cards de manual com borda reta e fundo opaco (sem "vidro" ou desfoque), badges de contagem de tópicos sem transparência, navegação anterior/próximo sem sombra flutuante.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/manuals/page.tsx frontend/src/components/manuals/prev-next-nav.tsx
git commit -m "style(manuais): remove blur e sombra flutuante residuais"
```

---

### Task 6: Verificação final

**Files:** nenhum (só comandos)

- [ ] **Step 1: Build completo**

```bash
cd frontend
npm run build
```

Esperado: build sem erros.

- [ ] **Step 2: Typecheck completo**

```bash
npx tsc --noEmit
```

Esperado: sem erros.

- [ ] **Step 3: Grep de confirmação — vocabulário antigo não deve sobrar nos ficheiros tocados**

```bash
grep -rn "rounded-2xl\|rounded-3xl\|shadow-bento\|from-blue-500 to-orange-500" \
  frontend/src/app/page.tsx \
  frontend/src/components/hero-section.tsx \
  "frontend/src/app/(dashboard)/dashboard/page.tsx" \
  frontend/src/components/dashboard/
```

Esperado: nenhum resultado (o `chat-card.tsx` pode ainda mostrar `rounded-2xl` nas bolhas de chat — isso é esperado e aceite, ver nota no Task 4 Step 4; se aparecer noutro sítio, falta limpar).

- [ ] **Step 4: Passagem visual manual no browser**

Com `npm run dev` a correr, visitar por esta ordem e confirmar contra a spec (`docs/superpowers/specs/2026-09-08-redesign-blueprint-tecnico-design.md`):
1. `/` — hero assimétrico com painel de terminal à direita, verde-petróleo em vez de azul/laranja, títulos em Merriweather, CTAs em mono.
2. `/dashboard` (autenticado) — grid sem buracos, sem card "Progresso" duplicado, bordas retas.
3. `/manuals` — cards de manual sem blur/transparência, bordas retas.
4. `/manuals/<code>/<slug>` — navegação anterior/próximo sem sombra flutuante.
5. `/lab` (autenticado) — não foi editado nenhum ficheiro deste plano, mas os botões da sidebar (`rounded-lg`) e a cor de destaque já devem refletir o novo `--radius`/`--primary` só por herdarem os tokens do Task 1; confirmar que não destoa visualmente do resto — se destoar, é sinal de que algo usa uma cor/raio hardcoded em vez do token, e vale abrir uma tarefa de seguimento (fora deste plano).

- [ ] **Step 5: Commit final (se sobrar algum ajuste solto)**

```bash
git status
```

Se houver alterações por commitar resultantes de ajustes feitos durante a verificação visual, commitar com uma mensagem descritiva do ajuste específico feito.
