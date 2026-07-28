---
tipo: adr
titulo: "ADR-001: Abordagem A — CSS Puro + SVG Inline + Zero libs de animação"
projeto: Linux de Camões
data_criacao: 2026-07-17
estado: aceita
supersedes: ""
---

# ADR-001 — Abordagem A: CSS Puro + SVG Inline

**Estado:** ✅ Aceita · **Data:** 2026-07-17 · **Decisores:** Tech Lead + Equipa

## Contexto

O dashboard do Linux de Camões é uma **Bento Grid** com 7 cartões, dos quais dois
serão componentes pesados em runtime:

- **Terminal Lab** → `xterm.js` montado sobre WebSocket, com canvas e reconexão.
- **Chat IA** → streaming de respostas RAG (FAISS + Groq Llama 3 8B), token-a-token.

Ambos são consumidores intensivos de **CPU, GPU e main thread**. A sandbox real é
orquestrada em **Kubernetes (pods efémeros)**, pelo que a latência de rede e a
instância do pod também pesam no orçamento percebido pelo utilizador.

Havia três abordagens em análise para a camada de animação/interação visual da UI:

| Abordagem | Stack | Custo de runtime |
|-----------|-------|------------------|
| **A** ✅ | CSS puro + Tailwind + SVG inline + keyframes | Mínimo |
| B | Framer Motion (React) | Médio-alto (bundle + WAAPI + reconciliação) |
| C | Lottie / Rive (ficheiros JSON binários) | Médio (player dedicado) |

## Decisão

Adotar a **Abordagem A**:

- **Animações exclusivamente via `@keyframes` CSS** e utilitários `tw-animate-css`.
- **Ícones e ilustrações como SVG inline** (sem libs de icon-runtime para além de
  `lucide-react`, já presente via shadcn).
- **Zero dependências novas** de animação — **Framer Motion, Lottie, Rive e GSAP
  ficam explicitamente fora de scope** para a UI decorativa do dashboard.

### Justificação

1. **Reservar orçamento para o que importa.** `xterm.js` desenha num `<canvas>` a
   cada keystroke; o streaming RAG actualiza o DOM continuamente. Qualquer overhead
   de animação (reconciliação React de Framer, instâncias de players) rouba
   frame-budget desses dois fluxos.
2. **Bundle mínimo.** O projecto tem restrição de **custo zero** e deploy em
   free-tier (Vercel/Railway). Menos JS = TTI menor = melhor experiência em redes
   móveis e em hardware modesto (público-alvo: estudantes).
3. **`prefers-reduced-motion` nativo.** Keyframes CSS desligam-se com uma única
   regra global (já implementada em `globals.css`), sem lógica JS por componente.
4. **Composição com Tailwind v4.** As animações são declarativas via classes e
   `style={{ animation: ... }}`, mantendo-se dentro do paradigma do projecto.

### Implementação actual (referência)

Keyframes definidos em `src/app/globals.css`:

| Keyframe | Uso | Propriedades animadas (compositor-friendly) |
|----------|-----|---------------------------------------------|
| `float` | cartão Terminal (comandos) | `transform`, `opacity` |
| `blink` | cursor do terminal | `opacity` |
| `fill-arc` | TopicsCard (anel SVG) | `stroke-dashoffset` |
| `ring-fill` | QuizzesCard (anel SVG) | `stroke-dashoffset` |
| `bar-fill` | ProgressCard (barras) | `width` |
| `pop-in` | ChatCard (bubbles) | `transform`, `opacity` |
| `page-flip` | ManualsCard (livro) | `transform` |
| `flicker` | StreakCard (chama) | `transform`, `opacity` |

Redução de movimento (global):

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Consequências

- ✅ **Positivas:** bundle reduzido; animações consistentes; acessibilidade grátis;
  zero risco de conflito entre runtimes de animação e o canvas do xterm.
- ⚠️ **Negativas:** interações complexas (drag-and-drop, layout animations tipo
  `layoutId` do Framer) ficam mais trabalhosas. Se surgirem requisitos desse tipo,
  avaliar caso a caso — **não** reabrir esta ADR para a UI decorativa.
- 📌 **Exceção pré-aprovada:** se o futuro editor de quizzes precisar de
  drag-and-drop acessível, poderá ser introduzida uma lib dedicada **apenas nesse
  chunk carregado por code-splitting** (dynamic import), sem afectar o dashboard.

## Conformidade

- ✅ `package.json` não contém `framer-motion`, `lottie`, `rive`, `gsap`.
- ✅ Único pacote de animação: `tw-animate-css` (utilitários CSS, sem JS runtime).
