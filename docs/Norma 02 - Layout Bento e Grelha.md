---
tipo: norma
titulo: "Norma 02 — Layout Bento e Grelha de 12 Colunas"
projeto: Linux de Camões
data_criacao: 2026-07-17
estado: aprovado
aplica_se_a: frontend (src/app/(dashboard)/**, src/components/dashboard/**)
fonte_de_verdade: src/app/(dashboard)/dashboard/page.tsx
relaciona: [Design System - OKLCH Grid e Responsividade, Norma 01 - Sistema de Tokens e Cores]
---

# 🧱 Norma 02 — Layout Bento e Grelha de 12 Colunas

Esta norma estabelece as regras **obrigatórias e verificáveis** do layout do
dashboard e de qualquer página que use a Bento Grid. Deriva do
[_Design System — OKLCH, Grid e Responsividade_](./Design%20System%20-%20OKLCH%2C%20Grid%20e%20Responsividade.md).

> **Princípio:** a grelha é uma fonte de verdade geométrica. Um cartão não decide
> o seu tamanho — herda-o do **span** que lhe é atribuído na página. Isto garante
> um dashboard denso, sem buracos e sem reflow inesperado em qualquer ecrã.

---

## 1. Regras (obrigatórias)

### R1 — Grelha de 12 colunas, mobile-first
O container do dashboard é **sempre** uma grelha que parte de 1 coluna e cresce:

```jsx
<div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-5">
```

| Breakpoint | Colunas | Comportamento |
|------------|---------|---------------|
| `base` (< 768 px) | **1** | cartões em stack vertical (`col-span-1` implícito) |
| `md` (≥ 768 px) | **6** | primeira arrumação; cada cartão usa `md:col-span-{2..6}` |
| `lg` (≥ 1024 px) | **12** | Bento completo (regra de soma R2) |

### R2 — Regra de soma: cada linha soma 12 (no `lg`)
No breakpoint `lg`, a soma dos `lg:col-span-*` de cada **linha visual** tem de ser
**exatamente 12**.

- ❌ Soma < 12 → deixa um **buraco** (cols vazias à direita).
- ❌ Soma > 12 → força **wrap** involuntário para a linha seguinte, deslocando tudo.
- ✅ Soma = 12 → linha fechada, sem espaços nem transbordo.

> É por esta regra que o histórico "buraco de 4 colunas" era classificado como
> bug crítico: Manuais(4) + Streak(4) = 8 ≠ 12. Corrigido para **6 + 6 = 12**.

Cartões altos (`lg:row-span-2`) ocupam duas linhas; a soma deve fechar 12 em
**cada** das linhas que atravessam. Quando um cartão alto partilha a linha com um
cartão curto, o curto fecha a linha sozinho (ou em conjunto com outros curtos).

### R3 — `row-span` só quando há conteúdo para duas linhas
- **Cartões de conteúdo** (Terminal, Tópicos, Chat, Quizzes, Progresso) usam
  `lg:row-span-2` — precisam de altura para listas / terminais / gráficos.
- **Cartões curtos** (Manuais, Streak) ficam em **1 linha** (`min-h-[140px]`).
- Regra prática: um cartão só recebe `row-span-2` se o seu conteúdo **precisar**
  dessa altura. Não usar `row-span-2` só por estética.

### R4 — Altura mínima explícita (anti-layout-shift)
Cada item da grelha declara uma **altura mínima** para evitar que o reflow de
conteúdo (ex.: streaming de chat, arranque do pod) empurre os cartões vizinhos:

```jsx
<div className="... min-h-[200px]">  {/* cartões altos (row-span-2) */}
<div className="... min-h-[140px]">  {/* cartões curtos (1 linha) */}
```

> O alojamento futuro do **xterm.js** deverá usar altura fixa (`h-[Xpx]` ou
> `aspect-[...]`) e não `auto` — o canvas do terminal não pode ser content-driven.

### R5 — Container canónico
Todo o conteúdo de dashboard vive dentro de:

```
mx-auto w-full max-w-[1560px] 2xl:max-w-[1920px] px-4 md:px-8 xl:px-12 py-8
```

- **Cap dura de 1920 px** (no `2xl`). Em monitores 2K/4K o conteúdo fica
  **centrado** com margens laterais crescentes — nunca se estica para a largura
  total (evita linhas de leitura infinitas e tipografia gigante).
- O padding cresce com o breakpoint: `px-4` (mobile) → `px-8` (md) → `px-12` (xl).

### R6 — Geometria base do cartão
Todo o cartão Bento aplica:

```
rounded-3xl p-6 lg:p-8 shadow-bento transition-shadow hover:shadow-bento-hover
```

(As cores vêm da [_Norma 01 — Tokens e Cores_](./Norma%2001%20-%20Sistema%20de%20Tokens%20e%20Cores.md);
aqui só se define a geometria.) Os cartões usam `flex h-full flex-col` para que o
conteúdo se distribua pela altura herdada do span.

### R7 — Adicionar um cartão novo (checklist)
1. Escolher um `lg:col-span-*` que faça a linha somar 12 (R2).
2. Decidir `lg:row-span-2` só se houver conteúdo para tal (R3).
3. Declarar `min-h-[200px]` (alto) ou `min-h-[140px]` (curto) (R4).
4. Aplicar a geometria base (R6) e consumir tokens (Norma 01).
5. Confirmar que os `md:col-span-*` somam 6 (na grelha intermédia).
6. Atualizar o diagrama de spans no
   [_Design System §2.1_](./Design%20System%20-%20OKLCH%2C%20Grid%20e%20Responsividade.md).

---

## 2. Spans canónicos atuais (snapshot `dashboard/page.tsx`)

```
linha 1–2 │ Terminal (8)            │ Tópicos (4)            │   soma 12 ✓
linha 3–4 │ Chat IA (5) │ Quizzes(3)│ Progresso (4)          │   soma 12 ✓
linha 5   │ Manuais (6)          │ Streak (6)                │   soma 12 ✓
```

| Cartão | `md` | `lg` | `row` | min-h |
|--------|------|------|-------|-------|
| Terminal | `col-span-6` | `col-span-8` | `row-span-2` | `200px` |
| Tópicos | `col-span-3` | `col-span-4` | `row-span-2` | `200px` |
| Chat IA | `col-span-3` | `col-span-5` | `row-span-2` | `200px` |
| Quizzes | `col-span-3` | `col-span-3` | `row-span-2` | `200px` |
| Progresso | `col-span-6` | `col-span-4` | `row-span-2` | `200px` |
| Manuais | `col-span-6` | `col-span-6` | — | `140px` |
| Streak | `col-span-6` | `col-span-6` | — | `140px` |

> Soma `lg` por linha: **12 · 12 · 12**. Soma `md` por "linha" (6 cols):
> Terminal(6)→linha; Tópicos(3)+Chat(3)→linha; Quizzes(3)+Progresso(6)→transborda
> para nova linha (aceitável em `md`, onde o Bento é intermédio).

---

## 3. Verificação

Antes de considerar uma alteração de layout concluída:

1. **Soma por linha = 12** no `lg` (manualmente ou contando `lg:col-span-*`).
2. **`npm run build`** verde (o TypeScript / Tailwind não valida a regra de soma —
   é uma verificação humana obrigatória).
3. **Inspeção visual** a 3 larguras: mobile (≤ 768), md (768–1024), lg (≥ 1024).
4. Nenhum cartão sem `min-h-*` (R4).

---

## 4. Exceções

| Contexto | Desvio | Razão | Estado |
|----------|--------|-------|--------|
| `lab/page.tsx` | Layout não-Bento (host futuro do xterm.js) | Página dedicada ao terminal, precisa de geometria própria (altura fixa) | 🟠 Pendente de Norma 03 (terminal/xterm) |

---

## 5. Histórico

| Data | Evento |
|------|--------|
| 2026-07-17 | Norma criada. Buraco crítico #2 corrigido: Manuais+Streak 4+4 → 6+6 (soma 12). Build + lint verdes. |
