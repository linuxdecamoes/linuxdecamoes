# Spec: Landing Page Redesign — "Linux de Camões"

**Data:** 2026-07-27
**Estado:** Aprovado
**Fase:** 1 de 4 (landing page only; dashboard, manuais, auth = fases futuras)

---

## 1. Objetivo

Redesenhar completamente a landing page (homepage, header, footer) para alinhar com a identidade visual "Linux de Camões": paleta slate/azul/laranja, tipografia serif em accentos, Bento Grid de 12 colunas, secções de stack tecnológica e comunidade. O dashboard e manuais permanecem intocados.

## 2. Abordagem

**Landing-scoped tokens** — um wrapper `.landing-theme` no `page.tsx` redefine CSS variables apenas dentro da landing page. A paleta global (bege/laranja OKLCH) do `:root` fica inalterada. Zero impacto em rotas autenticadas.

## 3. Paleta de Cores

Novas variáveis CSS dentro de `.landing-theme`, em OKLCH (Norma 01):

```css
.landing-theme {
  --lp-bg: oklch(0.97 0.003 250);          /* #f8fafc — brand-50 */
  --lp-bg-card: oklch(0.99 0.002 250);      /* #ffffff */
  --lp-text: oklch(0.13 0.03 260);           /* #0f172a — brand-900 */
  --lp-text-secondary: oklch(0.45 0.02 260); /* #64748b — slate-500 */
  --lp-border: oklch(0.88 0.01 250);         /* #e2e8f0 — brand-200 */
  --lp-primary: oklch(0.55 0.20 260);        /* #2563eb — blue-600 */
  --lp-primary-hover: oklch(0.50 0.20 260);  /* #1d4ed8 — blue-700 */
  --lp-accent: oklch(0.65 0.19 40);          /* #ea580c — orange-600 */
  --lp-surface: oklch(0.96 0.005 250);       /* #f1f5f9 — brand-100 */
  --lp-dark: oklch(0.13 0.03 260);           /* #0f172a — brand-900 */
  --lp-dark-card: oklch(0.18 0.02 260);      /* #1e293b — brand-800 */
}
```

## 4. Tipografia

- **Inter** — font principal (já existe)
- **Merriweather** — serif, para accentos (logo, headline hero "Na nossa língua.", títulos)
- **Fira Code** — mono (substitui JetBrains Mono na landing; dashboard mantém JetBrains)
- Adicionar Merriweather via `next/font/google` no `layout.tsx` com variável `--font-merriweather`
- Adicionar Fira Code via `next/font/google` com variável `--font-fira-code`
- Usar `font-serif` para Merriweather, `font-mono` para Fira Code no escopo `.landing-theme`

## 5. Ícones

Manter **Lucide React**. Mapeamento para equivalentes do HTML original:

| Font Awesome | Lucide | Uso |
|-------------|--------|-----|
| `fa-linux` | SVG custom (Linux penguin) | Logo nav + footer |
| `fa-graduation-cap` | `GraduationCap` | CTA hero |
| `fa-github` | SVG GitHub (já existe) | Header + footer + comunidade |
| `fa-brain` | `Brain` | Card RAG |
| `fa-stopwatch` | `Timer` | Card SM-2 |
| `fa-users` | `Users` | Card comunidade |
| `fa-terminal` | `Terminal` | Card labs |
| `fa-certificate` | `Award` | Card LPI |
| `fa-book-journal-whills` | `BookOpen` | Decorative LPI |
| `fa-heart` | `Heart` | Footer "Desenvolvido com ❤️" |
| `fa-discord` | SVG Discord | Comunidade CTA |
| `fa-circle-info` | `Info` | ADR card |
| `fa-code-pull-request` | `GitPullRequest` | Contribuição badge |
| `fa-circle-check` | `CheckCircle2` | Issues badge |

## 6. Secções da Homepage

### 6.1 Header (`landing-header.tsx` — reescrever)

- Sticky, `bg-white/80 backdrop-blur-md`, `border-b border-slate-200`
- Logo: ícone Linux (SVG) + "Linux de **Camões**" (serif bold, accent orange)
- Nav desktop: O Projeto, Certificação LPI, Stack Tecnológica, Comunidade + divider + "Entrar" (com ícone)
- Mobile: hamburger → dropdown menu abaixo da nav (não Sheet lateral)
- Shadow on scroll (JS toggle)

### 6.2 Hero Section (`page.tsx`)

- Background: `--lp-bg` com dot-pattern overlay (`radial-gradient` 1px dots) + opacity 50%
- Blur circles decorativos: 2 divs `rounded-full blur-3xl` com `animate-pulse-slow` (primary e accent)
- Badge: "100% Open-Source e em PT-PT" com green dot + `animate-slide-up`
- Headline: "Domine Sistemas Linux." + `<br>` + "<span class='font-serif italic gradient'>Na nossa língua.</span>"
- Descrição: texto sobre LPI e ponte universidade/marketplace
- CTAs: "Começar a Aprender" (primary dark) + "Contribuir no GitHub" (outline with GitHub icon)
- Animações stagger: `animation-delay` incrementais (0.1s, 0.2s, 0.3s, 0.4s)

### 6.3 Bento Grid — "Navegue nos Mares do Conhecimento"

12-column grid (`grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]`):

| Card | Colspan | Conteúdo |
|------|---------|----------|
| LPI Manuais | `col-span-12 md:col-span-8` | Título, descrição LPI, decorative icon |
| Motor RAG | `col-span-12 md:col-span-4` | Dark card (brand-900), brain icon, FAISS/Groq |
| SM-2 Quizzes | `col-span-12 md:col-span-4` | Timer icon, algoritmo SM-2 |
| Apoio Universitário | `col-span-12 md:col-span-4` | Users icon, professores/alunos |
| Labs K8s | `col-span-12 md:col-span-4` | Dashed border, "Em breve" badge, terminal icon |

Hover: `translateY(-4px)` + shadow (`bento-card` class).

### 6.4 Stack Tecnológica

- Background: `--lp-dark` (brand-900), texto branco
- Título: "Uma Arquitetura de Excelência"
- 4 colunas: Frontend (blue icon), Backend (green icon), IA/ML (purple icon), DevOps (blue icon)
- Cada coluna: título com ícone + border-bottom + lista mono com technologias
- Card ADR no fundo: "Decisão Arquitetural (ADR-001)" + tags TypeScript/Python

### 6.5 Comunidade

- Background: `--lp-bg` com border-top
- Card branco grande (`rounded-3xl shadow-xl`) com decorative GitHub icon (250px, faded)
- Badge: "Licença MIT" (primary bg)
- Título: "Desenvolvido pela Comunidade. Para a Comunidade."
- Descrição sobre open-source e experiência real
- CTAs: "Repositório no GitHub" (dark) + "Juntar ao Discord" (indigo outline)
- Badges footer: "Guias de Contribuição Ativos" + "Issues Geridas Ativamente"

### 6.6 Footer (`landing-footer.tsx` — reescrever)

- Background: white, border-top
- 4 colunas: Brand (logo + descrição), Plataforma (links), Código Aberto (links)
- Copyright: "© 2026 Comunidade Linux de Camões. Código sob licença MIT."
- "Desenvolvido com ❤️ pela comunidade."

### 6.7 CTA Section (removida)

A secção CTA actual é substituída pelo hero + comunidade. Não existe mais como secção separada.

## 7. Animações (ADR-001: CSS puro)

- `@keyframes fadeIn` — opacity 0→1
- `@keyframes slideUp` — opacity 0 + translateY(20px) → opacity 1 + translateY(0)
- `@keyframes pulse` — `animate-pulse-slow` (4s) nos blur circles
- `.bento-card` — `transition: transform 0.3s, box-shadow 0.3s` no hover
- Navbar — JS scroll listener para shadow toggle
- Mobile menu — JS toggle (hidden class)
- `prefers-reduced-motion: reduce` — desliga todas as animações

## 8. Ficheiros a Criar/Modificar

| Ficheiro | Accão | Dependências |
|----------|-------|-------------|
| `src/app/globals.css` | Adicionar `.landing-theme` vars + `.dot-pattern` + `.bento-card` + keyframes novas | Nenhuma |
| `src/app/layout.tsx` | Adicionar Merriweather + Fira Code fonts | `next/font/google` |
| `src/app/page.tsx` | Reescrever: hero + bento + stack + comunidade | Novos componentes |
| `src/components/landing-header.tsx` | Reescrever: nav, logo, mobile menu | Nenhuma |
| `src/components/landing-footer.tsx` | Reescrever: 4 colunas, copyright | Nenhuma |

**Ficheiros NÃO alterados:** todos os componentes de dashboard, manuais, auth, ui/.

## 9. Restrições

- **ADR-001**: zero dependências de runtime para animação (sem Framer Motion/Lottie/GSAP)
- **Norma 01**: todas as cores em tokens CSS, zero inline
- **Norma 03**: PT-PT em todo o conteúdo
- **Compatibilidade**: landing page funciona sem JavaScript (menu mobile é progressive enhancement)
- **Acessibilidade**: `prefers-reduced-motion` respeitado, `aria-label` nos botões, contraste WCAG AA

## 10. Plano de Fases Futuras

| Fase | Âmbito | Complexidade |
|------|--------|-------------|
| **1 (atual)** | Landing page | Baixa |
| 2 | Dashboard | Média |
| 3 | Manuais | Média |
| 4 | Auth pages | Baixa |
