---
tipo: norma
titulo: "Norma 01 — Sistema de Tokens e Cores"
projeto: Linux de Camões
data_criacao: 2026-07-17
estado: aprovado
aplica_se_a: frontend (src/**/*.tsx, src/**/*.ts, src/**/*.css)
fonte_de_verdade: src/app/globals.css
relaciona: [ADR-001, Design System - OKLCH Grid e Responsividade]
---

# 🎯 Norma 01 — Sistema de Tokens e Cores

Esta norma estabelece as regras **obrigatórias e verificáveis** sobre como cor,
sombra e decoração visual são representadas no frontend. É a base do
[_Design System OKLCH_](./Design%20System%20-%20OKLCH%2C%20Grid%20e%20Responsividade.md)
e deriva do [_ADR-001_](./ADR-001%20-%20Abordagem%20A%20-%20CSS%20puro%20e%20SVG%20inline.md).

> **Princípio:** a UI nunca declara um valor de cor/sombra. Declara sempre um
> **token**. Isto garante consistência visual, mantém uma única fonte de verdade e
> permite retocar o tema sem tocar nos componentes.

---

## 1. Regras (obrigatórias)

### R1 — OKLCH é o único modelo de cor
Todos os tokens são definidos em **OKLCH** (`oklch(L C H)` ou `oklch(L C H / A)`).
Hexadecimal (`#RRGGBB`), `rgb()`, `hsl()` e `named colors` são **proibidos** em
`.tsx`, `.ts` e em regras CSS de componentes. A única exceção admitida é a paleta
de 256 cores interna do **xterm.js**, que vive dentro do `<canvas>` do terminal
(não afeta a camada React/CSS).

### R2 — Zero cores inline em JSX
Em `.tsx`/`.ts` é **proibido** escrever cores como valor literal arbitrário:

| ❌ Proibido | ✅ Permitido |
|------------|-------------|
| `bg-[oklch(0.65_0.14_25)]` | `bg-coral` |
| `text-[oklch(0.45_0.03_260)]` | `text-muted-foreground` |
| `shadow-[0_2px_20px_oklch(0_0_0/0.04)]` | `shadow-bento` |
| `style={{ background: '#0E1525' }}` | `style={{ background: 'var(--card-dark)' }}` ou `bg-card-dark` |
| `fill="oklch(...)"` (SVG) | `fill-foreground` / `fill="var(--coral)"` |

Toda cor/sombra usada em `className` deve ser uma **utility gerada por
`@theme inline`** (ex.: `bg-coral`, `shadow-bento`). Em atributos SVG que não
aceitam classes (ex.: `stroke` numa `<circle>` inline), usar `var(--token)`.

### R3 — Duas camadas de token (definição + exposição)
Um token de cor Bento exige **ambas** as linhas em `globals.css`:

1. **Definição** em `:root` — nome nu, valor OKLCH:
   ```css
   :root { --coral: oklch(0.65 0.14 25); }
   ```
2. **Exposição** em `@theme inline` — prefixo `--color-` (gera utilities Tailwind):
   ```css
   @theme inline { --color-coral: var(--coral); }
   ```

Sem o passo 2, a utility `bg-coral` **não existe** e o componente é forçado a
fall back para inline (origem do débito técnico agora extinto).

### R4 — Nomenclatura canónica
- **Cores semânticas shadcn** (tema base): `--background`, `--foreground`,
  `--card`, `--primary`, `--muted`, `--accent`, `--destructive`, `--border`,
  `--ring`, … — já expostas em `@theme inline` pelo template `base-nova`.
- **Paleta Bento quente** (cartões): cada acento tem um par **forte + `-soft`**
  (fundo suave), de forma a separar "cor de realce" de "cor de superfície":
  `coral`/`coral-soft`, `amber`/`amber-soft`, `sage`/`sage-soft`.
- **Superfícies escuras**: `--card-dark` (neutro frio) e `--card-dark-alt`
  (quente) para cartões Terminal e Manuais.
- **Neutros suaves**: `--terracotta` (texto escuro sobre quente), `--peach`,
  `--cream` (fundo suave).
- **Sombras Bento**: `--shadow-bento` (repouso) e `--shadow-bento-hover` (hover).

> ⚠️ O nome correto é `terracotta` (dois `t`). O typo histórico `terracota` foi
> corrigido em 2026-07-17; não reintroduzir.

### R5 — Toda exceção é documentada aqui
Qualquer desvio a R1/R2 tem de constar da [_Lista de Exceções_](#3-lista-de-exceções)
abaixo, com justificação e prazo de resolução. Exceções não documentadas são
consideradas bugs.

### R6 — Verificação contínua
Antes de considerar uma tarefa de UI concluída, confirmar:

```powershell
# 0 ocorrências de oklch() em .tsx (tokens apenas em globals.css)
cmd /c "node -e ""const g=require('child_process').execSync('rg -l \"\"oklch\(\"\" src --glob \"\"*.tsx\"\"').toString(); console.log(g||'OK: zero oklch em tsx')"""

# hex em .tsx só pode aparecer na lista de exceções
cmd /c "rg ""#[0-9a-fA-F]{3,8}\b"" src --glob *.tsx"
```

O objetivo é: **zero `oklch(` e zero hex em `.tsx`**, salvo a [_Lista de Exceções_](#3-lista-de-exceções).

---

## 2. Paleta canónica (snapshot `globals.css`)

| Token (`:root`) | OKLCH | Utility | Uso típico |
|-----------------|-------|---------|------------|
| `--coral` | `0.65 0.14 25` | `bg-coral` | acento Chat IA, progresso |
| `--coral-soft` | `0.94 0.04 25` | `bg-coral-soft` | fundo suave coral |
| `--amber` | `0.75 0.12 70` | `bg-amber` | streak ativo |
| `--amber-soft` | `0.94 0.05 70` | `bg-amber-soft` | fundo Quizzes / Streak |
| `--sage` | `0.72 0.10 150` | `bg-sage` | sucesso / "Conectado" |
| `--sage-soft` | `0.95 0.03 150` | `bg-sage-soft` | fundo Chat IA |
| `--terracotta` | `0.35 0.10 40` | `bg-terracotta` | texto escuro sobre quente |
| `--peach` | `0.90 0.03 60` | `bg-peach` | streak inativo |
| `--cream` | `0.96 0.02 75` | `bg-cream` | fundo Tópicos / Progresso |
| `--card-dark` | `0.20 0.03 260` | `bg-card-dark` | Terminal (escuro neutro) |
| `--card-dark-alt` | `0.28 0.08 30` | `bg-card-dark-alt` | Manuais (escuro quente) |
| `--shadow-bento` | `0 2px 20px oklch(0 0 0/0.04)` | `shadow-bento` | repouso |
| `--shadow-bento-hover` | `0 4px 30px oklch(0 0 0/0.08)` | `hover:shadow-bento-hover` | hover |

As cores semânticas shadcn (`--background`, `--foreground`, `--primary`,
`--muted`, …) continuam definidas em `:root` e expostas pelo template; usam-se
em `text-foreground`, `bg-muted`, `border-border`, etc.

---

## 3. Lista de Exceções

| Ficheiro | Linha | Valor | Razão | Estado |
|----------|-------|-------|-------|--------|
| `src/app/(dashboard)/lab/page.tsx` | ~71 | `bg-[#0E1525]`, `text-green-400` | Página _lab_ ainda não migrada para o Design System (host futuro do xterm.js) | 🟠 Pendente — [Norma 02 (layout)] quando criada |

> Não existem outras exceções. O grep de `oklch(`/hex em `.tsx` deve devolver
> **apenas** a linha acima.

---

## 4. Mapeamento aplicado (auditoria 2026-07-17)

Resumo de como os 7 cartões Bento passaram a consumir tokens (referência para
futuros cartões seguirem o mesmo padrão):

| Cartão | Fundo | Acento | Sombra |
|--------|-------|--------|--------|
| Terminal | `bg-card-dark` | `var(--sage)` prompt | `shadow-bento` |
| Tópicos | `bg-cream` | `text-foreground` | `shadow-bento` |
| Chat IA | `bg-sage-soft` | `bg-coral` (bubble) | `shadow-bento` |
| Quizzes | `bg-amber-soft` | `var(--amber)` SVG | `shadow-bento` |
| Progresso | `bg-cream` | `bg-coral` (fill), `bg-muted` (track) | `shadow-bento` |
| Manuais | `bg-card-dark-alt` | `fill-foreground` | `shadow-bento` |
| Streak | `bg-amber-soft` | `bg-amber` (ativo), `bg-peach` (inativo) | `shadow-bento` |

---

## 5. Histórico

| Data | Evento |
|------|--------|
| 2026-07-17 | Norma criada. Refactor crítico #1 concluído: paleta registada em `@theme inline`, inline `oklch()` eliminado dos 7 cartões, typo `terracota`→`terracotta`. Build + lint verdes. |
