# Redesign visual "Blueprint Técnico" — Landing, Dashboard e Manuais

## Contexto

O site atual (landing, dashboard, manuais) tem o "aspecto genérico de site feito por IA" descrito no artigo [How to fix the AI-generated look in your frontend](https://dev.to/alanwest/how-to-fix-the-ai-generated-look-in-your-frontend-1ahh): hero centrado com blob de mesh-gradient, texto em gradiente azul→laranja, bento grid de cards `rounded-2xl`/`rounded-3xl` com blur (`glass-card`), ícones Lucide, tipografia só Inter. Isto é visível em `hero-section.tsx` (mesh gradient + gradiente de texto azul/laranja), `page.tsx` (bento grid de cards simétricos), e `manual-card.tsx` (glassmorphism + `rounded-3xl`).

Objetivo: substituir esta identidade genérica por uma direção própria — "Blueprint Técnico" — coerente com o tema do produto (Linux, documentação técnica, LPI), validada com o utilizador através de mockups visuais (companion de brainstorming). Aproveita-se também para corrigir um problema real encontrado durante a exploração: o `ProgressCard` do dashboard mostra dados 100% inventados ("Fundamentos 72%", "Redes 28%") que duplicam informação que o `StudyCard` ao lado já mostra com dados reais da API.

**Fora de âmbito** (confirmado com o utilizador): nenhuma funcionalidade nova de backend. O placeholder `/lab` (labs Kubernetes "em breve") não é implementado nem removido — só recebe os novos tokens visuais para não destoar.

## Direção visual — "Blueprint Técnico"

Validada via 3 rondas de mockups no companion visual (paleta+tipo, estrutura de layout, tipografia):

- **Paleta**: verde-petróleo como cor de assinatura, substituindo o azul-índigo genérico. Fundo tipo papel/grid milimétrico muito subtil. Acentos quentes existentes (`--coral`, `--amber`) mantidos, mas só para destaques pontuais — nunca em gradientes de texto.
- **Tipografia**: Merriweather (serif, já carregada) só em títulos grandes (h1/h2/hero); JetBrains Mono (já carregada) em nav, badges, labels, botões, tags e código; Inter (já carregada) reservado para parágrafos de leitura longa. Sem novas dependências de fonte.
- **Bordas/sombras**: bordas sólidas de 1px substituem sombras flutuantes e glassmorphism (`shadow-bento`, `shadow-glass`, `glass-card`, `rounded-2xl`/`rounded-3xl`). Escala de raio achatada.
- **Layout**: quebra do padrão "hero centrado → grid simétrico → stack vertical" com um hero assimétrico (texto alinhado à esquerda numa coluna, elemento gráfico a sangrar para a direita) e grids com colunas desiguais em vez de cards uniformes.

## 1. Tokens (`frontend/src/app/globals.css`)

Ficheiro usa Tailwind v4 com `@theme inline` + variáveis `:root` (não há `tailwind.config`). Mudanças:

- `--primary` (e `--ring`, `--chart-1`, `--sidebar-primary`, `--sidebar-ring`): de `oklch(0.55 0.20 260)` (azul-violeta) para verde-petróleo, ex. `oklch(0.42 0.09 165)`. Recalcular `--primary-foreground` para contraste (mantém-se branco/quase-branco).
- `--accent`: mantém-se laranja/coral (`oklch(0.65 0.19 40)`) como acento quente pontual — não muda de propósito, só passa a ser usado com mais moderação nos componentes.
- `--radius`: de `0.625rem` para `0.25rem`. As variantes derivadas (`--radius-sm/md/lg/xl/2xl/3xl/4xl` em `@theme inline`) recalculam automaticamente a partir deste valor — não precisam de edição manual, mas o resultado deve ser verificado visualmente (os multiplicadores atuais, ex. `× 2.6` para `4xl`, podem já não fazer sentido numa escala achatada; ajustar os multiplicadores se o resultado ficar estranho).
- Novo token `--bg-grid`: SVG/gradiente leve de grid milimétrico para a hero (equivalente ao `--bg-grain` existente, mas em vez de ruído, linhas finas).
- `--font-heading`: passa de `var(--font-inter)` para `var(--font-merriweather)` (a variável `--font-merriweather` já é definida em `layout.tsx` mas não estava a ser consumida em `globals.css` — adicionar a linha em `@theme inline`).
- Tokens de glassmorphism (`--glass-bg`, `--glass-border`, `--shadow-glass`, `--shadow-bento`, `--shadow-card-elevated`) e a classe `.glass-card` **deixam de ser usados** pelos componentes redesenhados desta spec, mas o token/classe em si não precisa de ser apagado do CSS (pode continuar a ser usado por MDX/callouts fora de âmbito) — só parar de ser referenciado nos ficheiros listados abaixo.
- Gradiente de texto azul→laranja (`hero-slider` em `hero-section.tsx`, classe Tailwind inline `bg-gradient-to-r from-blue-500 to-orange-500`) é removido — texto passa a cor sólida (`--primary` ou `--foreground`).

## 2. Landing page

**`frontend/src/components/hero-section.tsx`**:
- Substituir o layout atual (`max-w-4xl` centrado + `MeshGradient` de fundo full-bleed) por um grid de 2 colunas desiguais: texto à esquerda (título, subtítulo, CTAs), elemento gráfico à direita a estender-se além da coluna de conteúdo.
- Remover `MeshGradient` (`@paper-design/shaders-react`) e o gradiente de texto azul/laranja do `hero-slider`. Elemento gráfico de substituição: usar o padrão CSS-only já existente no ficheiro (`hero-shader`/`hero-mesh-*` em `globals.css`) redesenhado para tons verde-petróleo, ou um mockup estático tipo terminal (reaproveitando o padrão visual já usado no dashboard `TerminalCard`). Decisão de implementação exata (shader CSS vs. terminal estático) fica para o plano de implementação — ambas as opções cumprem "elemento gráfico a sangrar para a direita, sem blob azul/laranja".
- Dependência `@paper-design/shaders-react` deixa de ser usada por este componente; avaliar no plano se fica sem outros usos no projeto (nesse caso pode ser removida do `package.json`) ou se é mantida por causa de outro consumidor.

**`frontend/src/app/page.tsx`**:
- Secção "Navegue nos Mares do Conhecimento" (bento grid): mantém a estrutura de grid de 12 colunas mas revê os `col-span` para assimetria intencional (já parcialmente assimétrica — `col-span-8`/`col-span-4` — mas visualmente "esconde-se" atrás de `rounded-2xl` uniforme); remove `rounded-2xl` de todos os cards do bento, passa a borda 1px sólida.
- Secção "Prova Social" e secção "Comunidade" (`rounded-2xl`, `rounded-3xl`, `shadow-xl`): mesma troca — borda sólida, sem sombra flutuante.

## 3. Dashboard

**`frontend/src/app/(dashboard)/dashboard/page.tsx`**:
- Remover o bloco `<ProgressCard />` do grid (dados inventados, duplica `StudyCard`). Reajustar `col-span`/`row-span` dos cards restantes para preencher os 12 colunas sem buracos (atualmente `ProgressCard` ocupa `lg:col-span-4 lg:row-span-2`; redistribuir esse espaço pelos cards vizinhos, ex. aumentar `ChatCard` ou `QuizzesCard`, a decidir no plano).
- Apagar `frontend/src/components/dashboard/progress-card.tsx` (fica órfão depois da remoção do uso).

**Todos os outros cards do dashboard** (`terminal-card.tsx`, `study-card.tsx`, `quizzes-card.tsx`, `manuals-card.tsx`, `streak-card.tsx`, `chat-card.tsx`, e o hero de saudação em `page.tsx`): reskin visual — remover `rounded-2xl`/`shadow-bento`/`shadow-bento-hover`, aplicar borda 1px sólida e os novos tokens de cor. Sem alterações de dados/lógica.

**`frontend/src/app/(dashboard)/lab/page.tsx`**: só recebe os tokens de cor/borda atualizados (ex. `rounded-lg` nos botões de navegação da sidebar) para não destoar visualmente do resto — mantém-se como placeholder funcional "em breve", sem qualquer mudança de comportamento.

## 4. Manuais

**`frontend/src/components/manuals/manual-card.tsx`**:
- Remove `glass-card` (blur) e `rounded-3xl`; passa a borda 1px sólida com o mesmo sistema de cor por manual (`accentClasses` em `@/lib/manuals` mantém-se — só a superfície do card muda, não o sistema de cor por manual).

**`frontend/src/components/manuals/manuals-explorer.tsx`** e restantes componentes de `manuals/` que usam os mesmos padrões (`manual-level-group.tsx`, `topic-row.tsx`) — aplicar o mesmo tratamento de borda/raio onde usarem `rounded-2xl`/`rounded-3xl`/`glass-card`; o plano de implementação deve listar cada ocorrência via grep, não é necessário enumerar aqui.

## 5. Copy

Revisão pontual de CTAs para reforçar a voz "terminal" (ex. `Começar a Aprender` → algo como `$ começar`), a decidir caso a caso durante a implementação. O copy em PT existente já é maioritariamente concreto (não usa os clichês genéricos do artigo — "Empower", "Unlock", "Transform" — em nenhum lado encontrado durante a exploração), pelo que esta secção é de polimento leve, não reescrita.

## Fora de âmbito (confirmado)

- Nenhuma funcionalidade nova de backend ou dados novos no dashboard.
- `/lab` não é implementado nem tem o seu conteúdo interno alterado (só cor/borda).
- Dark mode: o site não tem suporte a dark mode hoje (só `:root`); esta spec não o introduz.

## Verificação

- `npm run build` (frontend) sem erros.
- `npx tsc --noEmit` limpo.
- Correr o site localmente (`npm run dev`) e visitar `/`, `/dashboard`, `/manuals` — confirmar visualmente: sem `rounded-2xl`/`rounded-3xl`, sem gradiente azul→laranja no hero, sem `glass-card`/blur, cor de assinatura verde-petróleo em CTAs/links/ring de foco, Merriweather nos títulos grandes, mono em badges/labels/botões.
- Grep de confirmação pós-implementação: `rounded-2xl|rounded-3xl|glass-card|shadow-bento|shadow-glass|from-blue-500 to-orange-500` em `frontend/src/` deve devolver zero resultados fora dos ficheiros explicitamente marcados como fora de âmbito (MDX/callouts).
- Confirmar visualmente que o grid do dashboard não tem buracos depois de remover o `ProgressCard`.
