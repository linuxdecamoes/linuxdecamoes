# Cyber Terminal Landing Page — Design Spec

> **Data:** 2026-07-27
> **Autor:** opencode (big-pickle)
> **Estado:** Aprovado pelo utilizador

## 1. Design Read

**Reading this as:** Educational platform landing page for Portuguese-speaking Linux learners, with a cyber terminal / hacker aesthetic, leaning toward dark-tech + monospace + scroll storytelling manifesto.

**Dials:** DESIGN_VARIANCE=7, MOTION_INTENSITY=5, VISUAL_DENSITY=3

## 2. Visão Geral

A homepage do Linux de Camões é reescrita como um **"boot sequence"** — cada secção é um "comando" que o utilizador executa ao fazer scroll. A estética é dark-tech/cyberpunk com tipografia monospace, acentos ciano, e conteúdo em estilo manifesto/terminal.

**Objetivo:** Transformar uma landing page genérica (vibe-coded SaaS) numa página única, memorável e tematicamente coesa com o tema Linux.

**Scope:** Apenas a landing page (`/`). Dashboard, manuals, sobre, lab não são alterados.

## 3. Sistema de Identidade

### 3.1 Paleta de Cores (OKLCH)

A paleta atual (coral, amber, sage, etc.) é **substituída** para a landing page. O dashboard mantém a paleta existente.

| Token | Valor OKLCH | Uso |
|-------|------------|-----|
| `--bg-void` | `oklch(0.10 0.02 260)` | Fundo principal |
| `--bg-surface` | `oklch(0.14 0.02 260)` | Cards, secções alternadas |
| `--bg-elevated` | `oklch(0.18 0.02 260)` | Elementos elevados, hover |
| `--text-primary` | `oklch(0.95 0 0)` | Texto principal branco |
| `--text-secondary` | `oklch(0.60 0.02 260)` | Texto secundário |
| `--text-dim` | `oklch(0.40 0.02 260)` | Texto muted, comentários |
| `--accent-cyan` | `oklch(0.75 0.15 195)` | Accent principal |
| `--accent-green` | `oklch(0.80 0.18 145)` | Terminal prompt, sucesso |
| `--accent-magenta` | `oklch(0.65 0.20 330)` | Accent secundário |
| `--accent-yellow` | `oklch(0.90 0.15 95)` | Warnings, highlights |
| `--border-subtle` | `oklch(0.20 0.02 260)` | Bordas suaves |
| `--border-glow` | `oklch(0.75 0.15 195 / 0.3)` | Bordas com glow ciano |

### 3.2 Tipografia

- **Títulos:** Inter bold/black — sans-serif limpo, contraste com monospace
- **Código/Terminal:** JetBrains Mono — para elementos de terminal
- **Corpo:** Inter regular — legibilidade

### 3.3 Brand Motif: "Grade Terminal"

Padrão sutil de grid/crosshairs em fundos de secções, como overlay de terminal. Implementado via SVG inline ou CSS `background-image` com `opacity: 0.03`.

### 3.4 Animações (CSS-only, ADR-001)

- **Typing effect:** `@keyframes typing` com `overflow: hidden` + `border-right` cursor
- **Blink cursor:** `@keyframes blink` (já existe)
- **Glow pulse:** `@keyframes glow-pulse` no accent ciano
- **Fade-in up:** `@keyframes fade-in-up` para secções ao scroll

## 4. Estrutura da Página — "Boot Sequence"

### 4.1 Header (adaptado)

- Sticky glassmorphism mantido, mas com cores escuras
- Logo + "Linux de Camões" em branco
- Nav links: Funcionalidades, Manuais, Sobre
- CTA: "Aceder ao Dashboard" com accent ciano
- GitHub icon mantido

### 4.2 Hero — `$ boot`

- Fundo: `--bg-void` com grid sutil (`opacity: 0.03`)
- Layout: centro, vertical
- **Linha 1:** `> _` (prompt com cursor blink) — animação typing
- **Linha 2 (após delay):** `carregando linux-de-camoes...` em monospace verde
- **Linha 3 (após delay):** `pronto.` em ciano
- **Título grande:** "Domina Linux" em Inter bold branco + "com IA Interativa" em ciano
- **Subtítulo:** "Plataforma open-source de aprendizagem Linux..." em `--text-secondary`
- **Botões:** "Começar Agora" (solid cyan bg) + "Ver Manuais" (outline cyan)
- **Badge:** `<Terminal /> Certificação LPI` em pill com borda ciano

### 4.3 Secção 1 — `$ cat /etc/manifesto`

- Fundo: `--bg-surface` (alternado)
- Título: `$ cat /etc/manifesto` em monospace ciano
- Conteúdo: manifesto do projeto em estilo "output de terminal"
  - Linhas numeradas à esquerda (`001:`, `002:`, etc.)
  - Texto em `--text-primary`, keywords em ciano
  - Exemplo:
    ```
    001: Aprender Linux não deve ser um privilégio.
    002: Os manuais LPI são a base — nós tornamos-os interativos.
    003: Terminal real. IA treinada. Quizzes inteligentes.
    004: Open-source. Gratuito. Para sempre.
    ```
  - Layout: max-w-3xl, mono fonte, line-height generoso

### 4.4 Secção 2 — `$ ls /funcionalidades`

- Fundo: `--bg-void` (voltar ao escuro)
- Título: `$ ls /funcionalidades` em monospace ciano
- Subtítulo: "Ferramentas pensadas para aprendizagem prática"
- **4 features como "directorias":**
  ```
  drwxr-xr-x  consola-real/
  drwxr-xr-x  chat-ia-rag/
  drwxr-xr-x  manuais-lpi/
  drwxr-xr-x  quizzes/
  ```
  - Cada uma é um card (`terminal-card`) com borda `--border-subtle`
  - Ícone à esquerda (lucide: Terminal, Brain, BookOpen, Trophy)
  - Nome em monospace verde (`--accent-green`)
  - Descrição em `--text-secondary`
  - Hover: borda `--border-glow`, fundo `--bg-elevated`, glow sutil

### 4.5 Secção 3 — `$ neofetch`

- Fundo: `--bg-surface`
- Título: `$ neofetch` em monospace ciano
- Layout: 2 colunas (ASCII art à esquerda, stats à direita)
- **ASCII art:** Logo do Linux de Camões em ASCII (SVG inline ou `<pre>` monospace)
- **Stats:**
  ```
  OS:         Linux de Camões v1.0
  Kernel:     Next.js 16 + React 19
  Shell:      FastAPI + PostgreSQL
  CPU:        RAG (FAISS + Groq)
  Memory:     114 tópicos LPI
  Disk:       1831 chunks processados
  ```
  - Labels em `--text-dim`, valores em `--text-primary`
  - Accent ciano nos valores

### 4.6 Secção 4 — `$ sudo make install`

- Fundo: `--bg-void`
- Título: `$ sudo make install` em monospace ciano
- Subtítulo: "Junta-te à comunidade"
- **2 cards de estatísticas:**
  - "5 Manuais LPI" + "114 Tópicos" em tipografia grande (stat-number)
  - Números em ciano, labels em `--text-secondary`
- **CTA final:**
  - "Criar Conta Grátis" — botão sólido ciano
  - "Ver no GitHub" — botão outline
  - Texto: "Open-source. Gratuito. Para sempre."

### 4.7 Footer (adaptado)

- Fundo: `--bg-surface`
- Mesma estrutura atual mas com cores escuras
- Links em `--text-secondary`, hover `--text-primary`
- Copyright: "© 2026 Linux de Camões · Licenciado sob MIT"

## 5. Componentes CSS

### 5.1 Terminal Prompt Line

```css
.terminal-prompt {
  font-family: var(--font-mono);
  color: var(--accent-green);
}
.terminal-prompt::before {
  content: "> ";
  color: var(--accent-cyan);
}
```

### 5.2 Typing Animation

```css
.typing-line {
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid var(--accent-green);
  animation: typing 2s steps(40) forwards, blink 0.7s step-end infinite;
}

@keyframes typing {
  from { width: 0; }
  to { width: 100%; }
}
```

### 5.3 Terminal Card

```css
.terminal-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-2xl);
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
}
.terminal-card:hover {
  border-color: var(--border-glow);
  background: var(--bg-elevated);
  box-shadow: 0 0 20px oklch(0.75 0.15 195 / 0.08);
}
```

### 5.4 Glow Text

```css
.text-glow-cyan {
  color: var(--accent-cyan);
  text-shadow: 0 0 20px oklch(0.75 0.15 195 / 0.3);
}
```

### 5.5 Line Numbers

```css
.line-number {
  color: var(--text-dim);
  font-family: var(--font-mono);
  user-select: none;
}
```

### 5.6 Stats Number

```css
.stat-number {
  font-size: 3rem;
  font-weight: 800;
  color: var(--accent-cyan);
  line-height: 1;
  text-shadow: 0 0 30px oklch(0.75 0.15 195 / 0.2);
}
```

### 5.7 Manifesto Line

```css
.manifesto-line {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 2;
  color: var(--text-primary);
}
```

## 6. @theme inline Exports

```css
--color-bg-void: var(--bg-void);
--color-bg-surface: var(--bg-surface);
--color-bg-elevated: var(--bg-elevated);
--color-accent-cyan: var(--accent-cyan);
--color-accent-green: var(--accent-green);
--color-accent-magenta: var(--accent-magenta);
--color-accent-yellow: var(--accent-yellow);
--color-text-dim: var(--text-dim);
--color-border-glow: var(--border-glow);
```

## 7. Âmbito

### In Scope

| Ficheiro | Alterações |
|----------|-----------|
| `globals.css` | Novos tokens `:root` + `@theme inline` + classes `@layer components` + keyframes |
| `page.tsx` | Reescrita completa — hero typing, manifesto, ls features, neofetch stats, CTA |
| `landing-header.tsx` | Adaptar cores para dark theme |
| `landing-footer.tsx` | Adaptar cores para dark theme |

### Fora de Scope

- Dashboard (mantém paleta quente)
- Manuals, Sobre, Lab
- Novas dependências runtime
- Fontes novas
- Dark mode toggle

## 8. Constraintes Técnicas

1. **ADR-001:** CSS-only animations. Zero Framer Motion, GSAP, Lottie.
2. **Norma 01:** Todas as cores em tokens `:root` + `@theme inline`. Zero `oklch()` inline.
3. **Norma 03:** PT-PT em todo o conteúdo.
4. **Next.js 16:** Server Component por defeito.
5. **Build gate:** lint + build antes de commit.
6. **Docker:** `docker compose up --build -d frontend` para verificar.

## 9. Plano de Verificação

1. `cmd /c "npm run lint"` — 0 erros
2. `cmd /c "npm run build"` — 132/132 páginas
3. `docker compose up --build -d frontend` — container OK
4. Browser: landing page escura, typing animation funcional, todas as secções visíveis
5. Responsivo: mobile (320px), tablet (768px), desktop (1280px+)
