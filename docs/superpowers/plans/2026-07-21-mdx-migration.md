# Migração MDX — Todos os Tópicos

> **Para trabalhadores agênicos:** REQUER SUB-SKILL: usar `superpowers:subagent-driven-development` (recomendado) ou `superpowers:executing-plans` para implementar este plano tarefa a tarefa. Passos usam sintaxe de checkbox (`- [ ]`) para tracking.

**Objetivo:** Documentar o design system MDX e migrar os 91 tópicos restantes (de 92 total) para o formato MDX premium, eliminando o fallback MarkdownRenderer.

**Arquitetura:** Script de conversão automatizado que lê ficheiros `.md` do Vault (com YAML frontmatter), gera `.mdx` com componentes MDX estruturados (TopicHero, Callout, DistributionCard, ExerciseCard, SolutionBlock), e regista automaticamente no `mdxTopics` via auto-descoberta no build.

**Stack:** Next.js 16 App Router, MDX via `@next/mdx`, componentes React em `components/mdx/`, Tailwind v4, tokens OKLCH.

---

## Ficheiros a Criar/Modificar

| Ficheiro | Responsabilidade |
|---|---|
| `docs/superpowers/specs/2026-07-21-mdx-design-system.md` | Documentação completa do design system MDX (tokens, componentes, padrões) |
| `frontend/src/lib/mdx-auto-register.ts` | Auto-descoberta de ficheiros `.mdx` em `content/manuals/` — gera o mapa `mdxTopics` no build |
| `frontend/src/app/manuals/[code]/[slug]/page.tsx` | Substituir `mdxTopics` hardcoded por importação do auto-register |
| `scripts/convert-vault-to-mdx.ts` | Script de conversão: lê Vault `.md` → gera `.mdx` com template padrão |
| `frontend/src/content/manuals/{code}/{slug}.mdx` | 91 novos ficheiros MDX (um por tópico) |

---

## Task 1: Documentação do Design System MDX

**Ficheiros:**
- Criar: `docs/superpowers/specs/2026-07-21-mdx-design-system.md`

- [ ] **Passo 1: Criar o documento de especificação do design system**

```markdown
# Design System MDX — Especificação

## Visão Gonal
Todas as páginas de tópicos usam MDX com componentes React premium.
O fallback MarkdownRenderer é eliminado após a migração completa.

## Paleta de Acentos por Manual

| Manual | Código | Acento | Uso |
|--------|--------|--------|-----|
| Linux Essentials | 010 | sage | Verde suave — distribuições, comandos |
| Security Essentials | 020 | coral | Coral — segurança, alertas |
| Web Development Essentials | 030 | amber | Âmbar — web, CSS, JS |
| Open Source Essentials | 050 | terracotta | Terracotta — licenças, modelos |
| LPIC-1 Parte 1 | 101 | terracotta | Terracotta — hardware, partições |
| LPIC-1 Parte 2 | 102 | iris | Íris — shell, redes, segurança |

## Componentes MDX Disponíveis

### TopicHero
```jsx
<TopicHero
  title="Título do Tópico"
  code="010"           // código do manual
  topicNumber="T01"    // número do tópico (para watermark)
  objective="1.1"      // objetivo de aprendizagem
  weight={2}           // peso relativo (1-4)
  pages="11-22"        // páginas do manual
  accent="sage"        // acento do manual
  areas={["Área 1", "Área 2"]}  // áreas temáticas (opcional)
/>
```

### Callout
```jsx
<Callout variant="info" title="Título" icon={Info}>
Conteúdo do callout. Suporta **bold**, `code`, listas.
</Callout>
```
Variantes: `info` | `warning` | `success` | `tip` | `note`

### DistributionCard
```jsx
<DistributionCard name="Debian" manager="dpkg / .deb" accent="sage" icon={Boxes}>
- **Debian GNU/Linux** — máxima estabilidade.
</DistributionCard>
```

### ExerciseCard
```jsx
<ExerciseCard number={1} title="Título" difficulty="guided" accent="sage">
<SolutionBlock>
Solução passo a passo.
</SolutionBlock>
</ExerciseCard>
```
Difficulty: `guided` | `exploratory`

### SolutionBlock
```jsx
<SolutionBlock>
Conteúdo da solução. Tabelas devem ser HTML raw:
<table>...</table>
</SolutionBlock>
```

### StatPill
```jsx
<StatPill icon={Target} label="Objetivo" value="1.1" />
```

## Padrões de Conteúdo

### Estrutura padrão de um tópico MDX
1. **Imports** — componentes MDX + ícones Lucide
2. **TopicHero** — hero com dados do tópico
3. **## Resumo Conciso** — conteúdo principal (h3 subseções)
4. **## Exercícios Guiados** — ExerciseCard + SolutionBlock (se existirem no Vault)
5. **## Exercícios Exploratórios** — ExerciseCard difficulty="exploratory" (se existirem)
6. **## Resumo** — resumo final (opcional)

### Tabelas em MDX
MDX NÃO processa markdown `| col |` dentro de JSX components.
Tabelas dentro de SolutionBlock devem ser HTML raw:
```jsx
<table className="w-full border-collapse my-3 overflow-hidden rounded-lg border border-border">
  <thead className="bg-[oklch(0.96_0.02_75)]">
    <tr>
      <th className="border-b border-border px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-foreground">Coluna</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-border/50">
      <td className="px-3 py-2 text-sm text-muted-foreground">Valor</td>
    </tr>
  </tbody>
</table>
```

### Code blocks
Fenced code blocks (` ```bash `) recebem automaticamente chrome de terminal
(via `TerminalPre` em `mdx-components.tsx`). Não precisam de JSX explícito.

### Inline code
`code` inline recebe styling simples (`rounded-md border bg-muted`).
NÃO aplica coloring de terminal (exclusivo de `TerminalPre`).

## Paleta de Cores — Tokens OKLCH

### Componentes com fundo diferenciado
- **Callout:** `bg-[oklch(0.94_..._/_0.15)]` + `shadow-sm backdrop-blur-sm` + `border-l-4`
- **DistributionCard:** `bg-[oklch(0.94_..._/_0.15)]` + `shadow-sm backdrop-blur-sm` + `border-l-4` accent
- **ExerciseCard:** `border border-border/40 bg-background/80 shadow-sm backdrop-blur-sm` + ribbon top 4px
- **SolutionBlock:** `border border-border/40 bg-background/80 shadow-sm backdrop-blur-sm`
- **StatPill:** `bg-background/80 shadow-sm backdrop-blur-sm`

### Gradientes por variante de Callout
- info: `linear-gradient(135deg, oklch(0.96 0.03 265 / 0.25) 0%, transparent 60%)`
- warning: `linear-gradient(135deg, oklch(0.96 0.04 70 / 0.28) 0%, transparent 60%)`
- success: `linear-gradient(135deg, oklch(0.96 0.03 150 / 0.28) 0%, transparent 60%)`
- tip: `linear-gradient(135deg, oklch(0.96 0.04 25 / 0.22) 0%, transparent 60%)`
- note: `linear-gradient(135deg, oklch(0.96 0.01 80 / 0.25) 0%, transparent 60%)`

### Gradientes por acento de DistributionCard
- sage: `radial-gradient(ellipse at 0% 50%, oklch(0.95 0.03 150 / 0.35) 0%, transparent 65%)`
- coral: `radial-gradient(ellipse at 0% 50%, oklch(0.95 0.04 25 / 0.30) 0%, transparent 65%)`
- amber: `radial-gradient(ellipse at 0% 50%, oklch(0.95 0.04 70 / 0.30) 0%, transparent 65%)`
- terracotta: `radial-gradient(ellipse at 0% 50%, oklch(0.95 0.03 45 / 0.30) 0%, transparent 65%)`
- iris: `radial-gradient(ellipse at 0% 50%, oklch(0.95 0.04 265 / 0.25) 0%, transparent 65%)`

## Background da Página
- `.premium-atmosphere`: 4 radiais sobrepostos + SVG grain (fixed, full viewport)
- Hero: `.premium-hero` (white bg, glass-border, ribbon accent top 4px, shadow elevado)
- Typography: IBM Plex Sans (UI/headings) + IBM Plex Mono (code/terminal)
- h2: `font-bold tracking-tight border-b border-border` + barra accent esquerda
- h3: `pl-4 border-l-3 border-primary font-bold`
- hr: `bg-gradient-to-r from-transparent via-border to-transparent`

## Normas
- Zero inline oklch em `.tsx` — usar tokens Tailwind
- PT-PT em todo o conteúdo
- ADR-001: zero runtime animation deps
- Base UI ≠ Radix: `multiple?: boolean`, `data-panel-open`
- Tabelas em SolutionBlock: HTML raw JSX (não markdown)
```

- [ ] **Passo 2: Commit**

```bash
git add docs/superpowers/specs/2026-07-21-mdx-design-system.md
git commit -m "docs: especificação do design system MDX para migração"
```

---

## Task 2: Auto-descoberta de MDX no Build

**Ficheiros:**
- Criar: `frontend/src/lib/mdx-auto-register.ts`
- Modificar: `frontend/src/app/manuals/[code]/[slug]/page.tsx`

- [ ] **Passo 1: Criar o módulo de auto-descoberta**

O módulo usa `require.context` (Webpack/Turbopack) para descobrir todos os ficheiros `.mdx` em `content/manuals/` e gerar o mapa `mdxTopics` automaticamente.

```ts
// frontend/src/lib/mdx-auto-register.ts
import type { ComponentType } from "react"
import type { TocItem } from "./topic-loader"

type MdxEntry = {
  Component: ComponentType
  toc: TocItem[]
}

/**
 * Auto-descobre ficheiros .mdx em content/manuals/ e gera o mapa mdxTopics.
 * Cada ficheiro MDX deve exportar um array `toc` como default export ou
 * usar a convenção de heading extraction automática.
 *
 * NOTA: Turbopack (Next.js 16) suporta require.context.
 * Fallback: mapa hardcoded se require.context não estiver disponível.
 */

// Convenção: cada .mdx exporta { default: Component, toc: TocItem[] }
// Ou, para simplificar, o TOC é extraído dos headings do ficheiro.

// Webpack/Turbopack require.context — descobre todos os .mdx recursivamente
const mdxContext = (typeof require !== "undefined")
  ? require.context("@/content/manuals", true, /\.mdx$/)
  : null

function slugFromPath(path: string): string {
  // "./010/a-evolucao-do-linux-e-sistemas-operacionais-populares.mdx"
  // → "010/a-evolucao-do-linux-e-sistemas-operacionais-populares"
  return path
    .replace(/^\.\//, "")
    .replace(/\.mdx$/, "")
}

export function getMdxTopics(): Record<string, MdxEntry> {
  const topics: Record<string, MdxEntry> = {}

  if (!mdxContext) return topics

  for (const path of mdxContext.keys()) {
    const mod = mdxContext(path)
    const slug = slugFromPath(path)

    topics[slug] = {
      Component: mod.default,
      // Se o .mdx exportar `toc`, usa-o; senão, gera vazio (será preenchido)
      toc: mod.toc ?? [],
    }
  }

  return topics
}
```

- [ ] **Passo 2: Atualizar page.tsx para usar auto-descoberta**

Substituir o `mdxTopics` hardcoded por:

```tsx
// Na topo de page.tsx, substituir o import Pilot010T01 e o mapa hardcoded por:
import { getMdxTopics } from "@/lib/mdx-auto-register"

// Gerar o mapa (chamado uma vez, em module scope)
const mdxTopics = getMdxTopics()
```

Remover as linhas 12-30 (import Pilot010T01 + mapa hardcoded).

- [ ] **Passo 3: Build + lint para verificar**

```bash
cmd /c "npm run build"
cmd /c "npm run lint"
```

- [ ] **Passo 4: Commit**

```bash
git add frontend/src/lib/mdx-auto-register.ts frontend/src/app/manuals/\[code\]/\[slug\]/page.tsx
git commit -m "feat(mdx): auto-descoberta de ficheiros MDX no build"
```

---

## Task 3: Script de Conversão Vault → MDX

**Ficheiros:**
- Criar: `scripts/convert-vault-to-mdx.ts`

- [ ] **Passo 1: Criar o script de conversão**

O script:
1. Lê cada ficheiro `.md` do Vault (6 directórios VAULT_DIRS)
2. Parseia YAML frontmatter (título, objetivo, weight, tags)
3. Extrai headings h2/h3 para TOC
4. Detecta secções de exercícios (guided/exploratory)
5. Gera ficheiro `.mdx` com template padrão + conteúdo adaptado
6. Gera entradas para o mapa mdxTopics com TOC

```ts
// scripts/convert-vault-to-mdx.ts
// Executar com: npx tsx scripts/convert-vault-to-mdx.ts
//
// Este script lê os ficheiros .md do Vault Obsidian e gera ficheiros .mdx
// no formato premium do design system MDX.

import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"

const VAULT_ROOT = path.resolve(__dirname, "../../Vault")
const OUTPUT_DIR = path.resolve(__dirname, "../src/content/manuals")

// Mapeamento de directórios Vault → código de manual
const VAULT_DIR_MAP: Record<string, { code: string; accent: string; label: string }> = {
  "010 - Linux Essentials":               { code: "010", accent: "sage",      label: "Linux Essentials" },
  "020-100 - Security Essentials":        { code: "020", accent: "coral",     label: "Security Essentials" },
  "030-100 - Web Development Essentials": { code: "030", accent: "amber",     label: "Web Development Essentials" },
  "050-100 - Open Source Essentials":     { code: "050", accent: "terracotta", label: "Open Source Essentials" },
  "101-500 - LPIC-1 (parte 1)":          { code: "101", accent: "terracotta", label: "LPIC-1 Parte 1" },
  "102-500 - LPIC-1 (parte 2)":          { code: "102", accent: "iris",      label: "LPIC-1 Parte 2" },
}

// Nomes de directórios que são "chapapters" (ignorar)
const SKIP_DIRS = ["img", "images", "assets", ".obsidian"]

// Regex para extrair topic number do filename
// Exemplos: "T01 - ..." → "T01", "101.1 - ..." → "101.1"
const TOPIC_NUM_REGEX = /^(t?\d+(?:[.\-]\d+)*)\s*[-—–]\s*/i

function sanitizeFilename(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function extractHeadings(content: string): Array<{ level: number; text: string; id: string }> {
  const headings: Array<{ level: number; text: string; id: string }> = []
  const lines = content.split("\n")

  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)/)
    if (match) {
      const level = match[1].length
      const text = match[2].trim()
      const id = text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
      headings.push({ level, text, id })
    }
  }

  return headings
}

function detectExercises(content: string): { guided: string; exploratory: string } | null {
  const guidedMatch = content.match(/##\s*(?:Exerc[ií]cios?\s*(?:Guiados|Resolvidos)[^\n]*)\n([\s\S]*?)(?=##\s|$)/i)
  const exploratoryMatch = content.match(/##\s*(?:Exerc[ií]cios?\s*Explorat[oó]rios[^\n]*)\n([\s\S]*?)(?=##\s|$)/i)

  if (!guidedMatch && !exploratoryMatch) return null

  return {
    guided: guidedMatch?.[1]?.trim() ?? "",
    exploratory: exploratoryMatch?.[1]?.trim() ?? "",
  }
}

function generateMdxImports(components: string[]): string {
  const mdxImports = ["Callout", "ExerciseCard", "SolutionBlock", "TopicHero"]
    .filter((c) => components.includes(c))

  const iconSet = new Set<string>()
  if (components.includes("DistributionCard")) {
    iconSet.add("Boxes")
    iconSet.add("Server")
    iconSet.add("Layers")
    iconSet.add("Cpu")
  }
  if (components.includes("Callout")) {
    iconSet.add("Info")
    iconSet.add("AlertTriangle")
    iconSet.add("CheckCircle")
    iconSet.add("Lightbulb")
  }

  const imports: string[] = []

  if (mdxImports.length > 0) {
    imports.push(`import {\n  ${mdxImports.join(",\n  ")},\n} from "@/components/mdx"`)
  }

  if (components.includes("DistributionCard")) {
    imports.push(`import {\n  ${Array.from(iconSet).join(",\n  ")},\n} from "lucide-react"`)
  }

  return imports.join("\n\n")
}

function convertVaultFile(
  vaultPath: string,
  code: string,
  accent: string,
  topicNumber: string
): { mdxContent: string; toc: Array<{ id: string; level: number; text: string }> } {
  const raw = fs.readFileSync(vaultPath, "utf-8")
  const { data: frontmatter, content } = matter(raw)

  const title = frontmatter.title ?? topicNumber
  const objective = frontmatter.topic ?? frontmatter.tags?.[0] ?? ""
  const weight = typeof frontmatter.weight === "number" ? frontmatter.weight : 2
  const pages = frontmatter.tags?.[1] ?? "1-10"

  // Detectar componentes necessários
  const components: string[] = ["TopicHero"]
  if (content.includes("<DistributionCard") || content.includes("distribui")) components.push("DistributionCard")
  if (content.includes("<Callout") || content.includes("**Nota")) components.push("Callout")
  if (content.includes("Exerc") || content.includes("exerc")) {
    components.push("ExerciseCard", "SolutionBlock")
  }

  // Extrair headings
  const headings = extractHeadings(content)
  const toc = headings
    .filter((h) => h.level >= 2)
    .map((h) => ({ id: h.id, level: h.level, text: h.text }))

  // Gerar imports
  const imports = generateMdxImports(components)

  // Gerar TopicHero
  const hero = `<TopicHero
  title="${title}"
  code="${code}"
  topicNumber="${topicNumber}"
  objective="${objective}"
  weight={${weight}}
  pages="${pages}"
  accent="${accent}"
/>`

  // Gerar conteúdo (limpar frontmatter, manter markdown)
  let bodyContent = content
    .replace(/^---[\s\S]*?---\n*/m, "") // remover frontmatter
    .trim()

  // Adicionar heading "Resumo Conciso" se não existir
  if (!bodyContent.match(/^##\s+Resumo\s+Conciso/m)) {
    bodyContent = `## Resumo Conciso\n\n${bodyContent}`
  }

  const mdxContent = [imports, hero, "", bodyContent].join("\n\n")

  return { mdxContent, toc }
}

function processVaultDir(dirName: string) {
  const config = VAULT_DIR_MAP[dirName]
  if (!config) {
    console.warn(`⚠️  Directório Vault desconhecido: ${dirName}`)
    return
  }

  const vaultDir = path.join(VAULT_ROOT, dirName)
  if (!fs.existsSync(vaultDir)) {
    console.warn(`⚠️  Directório não existe: ${vaultDir}`)
    return
  }

  const outputDir = path.join(OUTPUT_DIR, config.code)
  fs.mkdirSync(outputDir, { recursive: true })

  const entries = fs.readdirSync(vaultDir, { withFileTypes: true })

  let count = 0
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue
    if (entry.name === "README.md" || entry.name === "index.md") continue

    // Extrair topic number e slug
    const baseName = entry.name.replace(/\.md$/, "")
    const numMatch = baseName.match(TOPIC_NUM_REGEX)
    const topicNumber = numMatch ? numMatch[1].replace(/\s/g, "") : baseName.slice(0, 4)
    const restTitle = numMatch ? baseName.slice(numMatch[0].length) : baseName
    const slug = sanitizeFilename(restTitle)

    if (!slug) {
      console.warn(`⚠️  Slug vazio para: ${entry.name}`)
      continue
    }

    // Verificar se já existe MDX
    const outputPath = path.join(outputDir, `${slug}.mdx`)
    if (fs.existsSync(outputPath)) {
      console.log(`⏭️  Já existe: ${config.code}/${slug}`)
      continue
    }

    const vaultPath = path.join(vaultDir, entry.name)

    try {
      const { mdxContent } = convertVaultFile(vaultPath, config.code, config.accent, topicNumber)
      fs.writeFileSync(outputPath, mdxContent, "utf-8")
      count++
      console.log(`✅ ${config.code}/${slug} ← ${entry.name}`)
    } catch (err) {
      console.error(`❌ Erro ao converter ${entry.name}:`, err)
    }
  }

  console.log(`\n📊 ${config.label}: ${count} tópicos convertidos`)
}

// --- Main ---
console.log("🔄 Conversão Vault → MDX\n")

for (const dirName of Object.keys(VAULT_DIR_MAP)) {
  processVaultDir(dirName)
}

console.log("\n✅ Conversão concluída!")
console.log("📋 Próximo passo: gerar entradas mdxTopics para cada ficheiro")
```

- [ ] **Passo 2: Executar o script**

```bash
npx tsx scripts/convert-vault-to-mdx.ts
```

- [ ] **Passo 3: Commit**

```bash
git add scripts/convert-vault-to-mdx.ts
git commit -m "feat: script de conversão Vault → MDX"
```

---

## Task 4: Conversão em Massa — 010 Linux Essentials (18 tópicos)

**Ficheiros:**
- Modificar/criar: `frontend/src/content/manuals/010/*.mdx` (18 novos)

**Nota:** O primeiro tópico (`a-evolucao-do-linux-e-sistemas-operacionais-populares`) já existe como pilot.

- [ ] **Passo 1: Executar conversão para manual 010**

```bash
# O script já terá gerado os 18 .mdx. Verificar:
ls frontend/src/content/manuals/010/
# Esperado: 19 ficheiros (1 pilot + 18 convertidos)
```

- [ ] **Passo 2: Verificar TOC e imports de cada ficheiro**

Abrir pelo menos 3 ficheiros aleatórios e verificar:
- TopicHero com dados corretos (code="010", accent="sage")
- TOC coerente com os headings do conteúdo
- Imports de Lucide icons corretos

- [ ] **Passo 3: Build e smoke test**

```bash
cmd /c "npm run build"
# Verificar que todos os 19 tópicos de 010 são gerados como SSG
```

- [ ] **Passo 4: Commit**

```bash
git add frontend/src/content/manuals/010/
git commit -m "feat(mdx): migração completa manual 010 Linux Essentials (18 tópicos)"
```

---

## Task 5: Conversão em Massa — 020 Security Essentials (17 tópicos)

**Ficheiros:**
- Criar: `frontend/src/content/manuals/020/*.mdx`

- [ ] **Passo 1: Executar conversão para manual 020**

Verificar que todos os 17 .mdx foram gerados com accent="coral".

- [ ] **Passo 2: Build**

```bash
cmd /c "npm run build"
```

- [ ] **Passo 3: Commit**

```bash
git add frontend/src/content/manuals/020/
git commit -m "feat(mdx): migração completa manual 020 Security Essentials (17 tópicos)"
```

---

## Task 6: Conversão em Massa — 030 Web Development (18 tópicos)

**Ficheiros:**
- Criar: `frontend/src/content/manuals/030/*.mdx`

- [ ] **Passo 1: Executar conversão para manual 030**

Verificar que todos os 18 .mdx foram gerados com accent="amber".

- [ ] **Passo 2: Build**

```bash
cmd /c "npm run build"
```

- [ ] **Passo 3: Commit**

```bash
git add frontend/src/content/manuals/030/
git commit -m "feat(mdx): migração completa manual 030 Web Development Essentials (18 tópicos)"
```

---

## Task 7: Conversão em Massa — 050 Open Source (18 tópicos)

**Ficheiros:**
- Criar: `frontend/src/content/manuals/050/*.mdx`

- [ ] **Passo 1: Executar conversão para manual 050**

Verificar que todos os 18 .mdx foram gerados com accent="terracotta".

- [ ] **Passo 2: Build**

```bash
cmd /c "npm run build"
```

- [ ] **Passo 3: Commit**

```bash
git add frontend/src/content/manuals/050/
git commit -m "feat(mdx): migração completa manual 050 Open Source Essentials (18 tópicos)"
```

---

## Task 8: Conversão em Massa — 101 LPIC-1 Parte 1 (23 tópicos)

**Ficheiros:**
- Criar: `frontend/src/content/manuals/101/*.mdx`

**Nota:** O manual 101 tem 23 tópicos (não 20 como listado em manuals.ts — há tópicos extras 104-5, 104-6, 104-7).

- [ ] **Passo 1: Executar conversão para manual 101**

Verificar que todos os .mdx foram gerados com accent="terracotta".

- [ ] **Passo 2: Build**

```bash
cmd /c "npm run build"
```

- [ ] **Passo 3: Commit**

```bash
git add frontend/src/content/manuals/101/
git commit -m "feat(mdx): migração completa manual 101 LPIC-1 Parte 1 (23 tópicos)"
```

---

## Task 9: Conversão em Massa — 102 LPIC-1 Parte 2 (19 tópicos)

**Ficheiros:**
- Criar: `frontend/src/content/manuals/102/*.mdx`

- [ ] **Passo 1: Executar conversão para manual 102**

Verificar que todos os 19 .mdx foram gerados com accent="iris".

- [ ] **Passo 2: Build**

```bash
cmd /c "npm run build"
```

- [ ] **Passo 3: Commit**

```bash
git add frontend/src/content/manuals/102/
git commit -m "feat(mdx): migração completa manual 102 LPIC-1 Parte 2 (19 tópicos)"
```

---

## Task 10: Verificação Final e Limpeza

**Ficheiros:**
- Modificar: `frontend/src/app/manuals/[code]/[slug]/page.tsx`

- [ ] **Passo 1: Contar ficheiros MDX gerados**

```bash
ls frontend/src/content/manuals/**/*.mdx | wc -l
# Esperado: 92 (1 pilot + 91 convertidos)
```

- [ ] **Passo 2: Remover fallback MarkdownRenderer**

Após migração completa, o `else` branch em page.tsx (linhas 93-104) pode ser removido — todos os tópicos são MDX.

```tsx
// Remover o branch else:
// } else {
//   const loaded = await loadTopicBySlug(slug)
//   ...
// }
```

NOTA: Manter `topic-loader.ts` por agora — pode ser útil para debug. Marcar como deprecated.

- [ ] **Passo 3: Build final completo**

```bash
cmd /c "npm run build"
cmd /c "npm run lint"
```

- [ ] **Passo 4: Docker rebuild + smoke test completo**

```bash
docker compose build frontend
docker compose up -d frontend
Start-Sleep -Seconds 5
# Testar 6 URLs (uma por manual):
curl -sI "http://localhost:3001/manuals/010/a-evolucao-do-linux-e-sistemas-operacionais-populares"
curl -sI "http://localhost:3001/manuals/020/021-1-objetivos-funcoes-e-atores"
curl -sI "http://localhost:3001/manuals/030/a-anatomia-do-documento-html"
curl -sI "http://localhost:3001/manuals/050/051-1-componentes-de-software"
curl -sI "http://localhost:3001/manuals/101/101-1-determinar-e-definir-configuracoes-de-hardware"
curl -sI "http://localhost:3001/manuals/102/105-1-personalizar-e-trabalhar-no-ambiente-shell"
```

- [ ] **Passo 5: Commit final**

```bash
git add -A
git commit -m "feat(mdx): migração completa 92 tópicos para MDX premium — eliminação do fallback MarkdownRenderer"
```
