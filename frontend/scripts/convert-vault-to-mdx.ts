#!/usr/bin/env npx tsx
/**
 * Script de conversão Vault → MDX premium.
 *
 * Lê ficheiros .md do Vault Obsidian e gera .mdx no design system premium.
 *
 * Executar:
 *   cd frontend && npx tsx ../scripts/convert-vault-to-mdx.ts
 *
 * Opções:
 *   --dry-run         Mostra o que faria sem escrever
 *   --code=010        Processa apenas um manual
 *   --force           Sobrescreve ficheiros MDX existentes
 */

import fs from "node:fs"
import path from "node:path"

// gray-matter já existe no projeto (usado pelo topic-loader)
import matter from "gray-matter"
import GithubSlugger from "github-slugger"

// --- Configuração ---

const FRONTEND_DIR = path.resolve(__dirname, "..")
const VAULT_ROOT = path.resolve(__dirname, "../../../Vault")
const OUTPUT_DIR = path.join(FRONTEND_DIR, "src/content/manuals")

const VAULT_DIR_MAP: Record<
  string,
  { code: string; accent: string; label: string }
> = {
  "010 - Linux Essentials": {
    code: "010",
    accent: "sage",
    label: "Linux Essentials",
  },
  "020-100 - Security Essentials": {
    code: "020",
    accent: "coral",
    label: "Security Essentials",
  },
  "030-100 - Web Development Essentials": {
    code: "030",
    accent: "amber",
    label: "Web Development Essentials",
  },
  "050-100 - Open Source Essentials": {
    code: "050",
    accent: "terracotta",
    label: "Open Source Essentials",
  },
  "101-500 - LPIC-1 (parte 1)": {
    code: "101",
    accent: "terracotta",
    label: "LPIC-1 Parte 1",
  },
  "102-500 - LPIC-1 (parte 2)": {
    code: "102",
    accent: "iris",
    label: "LPIC-1 Parte 2",
  },
}

// Regex para extrair topic number do filename
const TOPIC_NUM_REGEX = /^(t?\d+(?:[.\-]\d+)*)\s*[-—–]\s*/i

// --- CLI args ---
const args = process.argv.slice(2)
const DRY_RUN = args.includes("--dry-run")
const FORCE = args.includes("--force")
const ONLY_CODE = args
  .find((a) => a.startsWith("--code="))
  ?.split("=")[1]

// --- Utilitários ---

function sanitizeSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function extractHeadings(content: string) {
  const slugger = new GithubSlugger()
  const headings: Array<{ level: number; text: string; id: string }> = []
  for (const line of content.split("\n")) {
    const m = line.match(/^(#{1,3})\s+(.+)/)
    if (!m) continue
    const text = m[2].replace(/[*_`~\[\]]/g, "").trim()
    const id = slugger.slug(text)
    headings.push({ level: m[1].length, text, id })
  }
  return headings
}

/** Remove wikilinks do Vault antes de processar tabelas.
 *  [[path/to/file|label]] → label, [[path/to/file]] → last segment. */
function stripWikilinks(content: string): string {
  // Wikilink com label: [[path|label]] → label
  content = content.replace(/\[\[[^\]]*?\|([^\]]+?)\]\]/g, "$1")
  // Wikilink sem label: [[path/to/file]] → "file"
  content = content.replace(/\[\[([^\]]+?)\]\]/g, (_m, p1: string) => {
    const parts = p1.split("/")
    return parts[parts.length - 1]
  })
  return content
}

/** Normaliza callouts custom do Vault para marcadores GFM-alert.
 *  Vault usa:  > **Nota:** ...   > **Dica:** ...   > **Aviso:** ...
 *             > **Atenção:** ... > **Importante:** ... > **Perigo:** ...
 *  O remark-callout transforma [!type] em <Callout>. O Conteúdo depois do
 *  marcador fica no primeiro paragrafo (children do Callout). */
function normalizeAdmonitions(content: string): string {
  const typeMap: Record<string, string> = {
    nota: "note",
    dica: "tip",
    aviso: "warning",
    atencao: "warning",
    "atenção": "warning",
    importante: "warning",
    perigo: "danger",
  }
  // Linha de blockquote: "> **Tipo:** resto..."  (Tipo com/s sem acento, case-insensitive)
  return content.replace(
    /^>\s*\*\*([a-zA-ZÀ-ÿ]+)\s*:\s*\*\*\s*/gim,
    (_match, wordRaw: string) => {
      const word = wordRaw.trim().toLowerCase()
      const mapped = typeMap[word]
      return mapped ? `> [!${mapped}] ` : `> **${wordRaw}:** `
    },
  )
}

/** Converte <details>/<summary> HTML blocks do Vault para <SolutionBlock> MDX.
 *  MDX não suporta <details> inline — precisa de ser um componente JSX.
 *  Garante blank lines antes/depois para evitar parsing errors em MDX. */
function convertDetailsBlocks(content: string): string {
  const detailsRegex = /<details>\s*<summary>[^<]*<\/summary>\s*\n?([\s\S]*?)<\/details>/g

  return content.replace(detailsRegex, (_match, innerContent: string) => {
    const trimmed = innerContent.trim()
    return `\n\n<SolutionBlock>\n${trimmed}\n</SolutionBlock>\n\n`
  })
}

/** Escapa `<` para `&lt;` no texto markdown, PRESERVANDO:
 *  - fenced code blocks (` ``` `) e inline code (`` `...` ``): o remark escapa
 *    o conteúdo automaticamente; escapar aqui causaria duplo-escape
 *    (ex.: `` `&lt;` `` seria renderizado literalmente).
 *  - os marcadores JSX emitidos pelo converter (`<SolutionBlock>`,
 *    `</SolutionBlock>`); o `<TopicHero .../>` é adicionado depois, fora do body.
 *  Necessário porque o MDX interpreta `<` seguido de dígito/letra como início
 *  de tag JSX (ex.: "UID <1000" ou "<100" parte o parse a meio de uma tabela).
 *  `>` e `&` não partem o parse (são literais), pelo que ficam intactos —
 *  evitar mexer em `>` preserva os marcadores de blockquote (`> `). */
function escapeMdxAngles(content: string): string {
  const escapeText = (s: string) => s.replace(/</g, "&lt;")

  const escapeLine = (line: string): string => {
    const tokenRe = /(`[^`]*`|<\/?SolutionBlock>)/g
    let result = ""
    let last = 0
    let m: RegExpExecArray | null
    while ((m = tokenRe.exec(line)) !== null) {
      result += escapeText(line.slice(last, m.index))
      result += m[0]
      last = m.index + m[0].length
    }
    result += escapeText(line.slice(last))
    return result
  }

  const lines = content.split("\n")
  const out: string[] = []
  let inFence = false
  for (const line of lines) {
    if (line.trimStart().startsWith("```")) {
      inFence = !inFence
      out.push(line)
      continue
    }
    out.push(inFence ? line : escapeLine(line))
  }
  return out.join("\n")
}

// --- Conversão principal ---

interface ConvertResult {
  mdxContent: string
  toc: Array<{ id: string; level: number; text: string }>
  components: string[]
  meta: { title: string; objective: string; topic: string; weight: number; tags: string[] }
}

function convertVaultFile(
  vaultPath: string,
  code: string,
  accent: string,
  topicNumber: string,
): ConvertResult {
  const raw = fs.readFileSync(vaultPath, "utf-8")
  const { data: frontmatter, content } = matter(raw)

  const title = frontmatter.title ?? frontmatter.topic ?? topicNumber
  const meta = {
    title: String(title),
    objective: String(frontmatter.objective ?? ""),
    topic: String(frontmatter.topic ?? code),
    weight: typeof frontmatter.weight === "number" ? frontmatter.weight : 2,
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags.map(String) : [],
  }
  // Campos derivados para o TopicHero
  const objective = meta.objective
  const weight = meta.weight
  const pages = meta.tags[0] ?? ""

  // Extrair headings para TOC (h2 e h3)
  const allHeadings = extractHeadings(content)
  const toc = allHeadings
    .filter((h) => h.level >= 2)
    .map((h) => ({ id: h.id, level: h.level, text: h.text }))

  // Detetar componentes necessários
  const usedComponents = new Set<string>(["TopicHero"])

  // Detetar <details> blocks que serão convertidos para SolutionBlock
  if (content.includes("<details>")) {
    usedComponents.add("SolutionBlock")
  }

  // Limpar frontmatter e headings冗antes
  let body = content
  // Remover frontmatter
  body = body.replace(/^---[\s\S]*?---\n*/m, "")
  // Remover nav links no topo
  body = body.replace(
    /^>\s*\*\*Voltar para:\*\*.*$/m,
    "",
  )
  // Remover heading # redundante (o TopicHero já o trata)
  body = body.replace(/^#\s+.+\n*/m, "")
  // Remover bloco de metadata manual no topo (📖 ...)
  body = body.replace(/^>\s*📖.*\n(>\s*.*\n)*/m, "")
  body = body.trim()

  // Se começa com ## 📌 Resumo Conciso, limpar o emoji
  body = body.replace(/^##\s+📌\s+Resumo\s+Conciso/m, "## Resumo Conciso")

  // Se não começa com ## Resumo, adicionar
  if (!body.match(/^##\s+Resumo\s+Conciso/m)) {
    body = `## Resumo Conciso\n\n${body}`
  }

  // Limpar wikilinks antes de processar tabelas (evita que | em wikilinks quebre parsing)
  body = stripWikilinks(body)

  // Normalizar callouts custom do Vault -> marcadores [!type]
  body = normalizeAdmonitions(body)

  // Converter <details>/<summary> para <SolutionBlock>
  body = convertDetailsBlocks(body)

  // Escapar `<` literal (ex.: "UID <1000") que o MDX leria como tag JSX.
  // Preserva inline code, fenced code e os <SolutionBlock> acima.
  body = escapeMdxAngles(body)

  // Gerar TopicHero
  const heroLines = [
    `<TopicHero`,
    `  title="${title}"`,
    `  code="${code}"`,
    `  topicNumber="${topicNumber}"`,
    `  objective="${objective}"`,
    `  weight={${weight}}`,
    `  pages="${pages}"`,
    `  accent="${accent}"`,
    `/>`,
  ]

  // Gerar imports
  const mdxImportNames = ["TopicHero"]
  const iconImports = new Set<string>()

  if (usedComponents.has("SolutionBlock")) {
    mdxImportNames.push("SolutionBlock")
  }

  const importLines: string[] = []
  if (mdxImportNames.length > 0) {
    importLines.push(
      `import {\n  ${mdxImportNames.join(",\n  ")},\n} from "@/components/mdx"`,
    )
  }
  if (iconImports.size > 0) {
    importLines.push(
      `import {\n  ${Array.from(iconImports).join(",\n  ")},\n} from "lucide-react"`,
    )
  }

  const mdxContent = [importLines.join("\n\n"), heroLines.join("\n"), "", body]
    .join("\n\n") // \n\n entre imports e hero para MDX parser
    .trim()
    + "\n"

  return {
    mdxContent,
    toc,
    components: Array.from(usedComponents),
    meta,
  }
}

// --- Processamento por directório ---

function processVaultDir(dirName: string): {
  count: number
  skipped: number
  metas: Record<string, ConvertResult["meta"]>
} {
  const config = VAULT_DIR_MAP[dirName]
  if (!config) {
    console.warn(`⚠️  Directório Vault desconhecido: ${dirName}`)
    return { count: 0, skipped: 0, metas: {} }
  }

  const vaultDir = path.join(VAULT_ROOT, dirName)
  if (!fs.existsSync(vaultDir)) {
    console.warn(`⚠️  Directório não existe: ${vaultDir}`)
    return { count: 0, skipped: 0, metas: {} }
  }

  const outputDir = path.join(OUTPUT_DIR, config.code)
  fs.mkdirSync(outputDir, { recursive: true })

  const entries = fs.readdirSync(vaultDir, { withFileTypes: true })
  let count = 0
  let skipped = 0
  const metas: Record<string, ConvertResult["meta"]> = {}

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue
    if (
      entry.name === "README.md" ||
      entry.name === "index.md" ||
      entry.name.startsWith("010 - Vis")
    )
      continue

    const baseName = entry.name.replace(/\.md$/, "")
    const numMatch = baseName.match(TOPIC_NUM_REGEX)
    const topicNumber = numMatch
      ? numMatch[1].replace(/\s/g, "")
      : baseName.slice(0, 4)
    const restTitle = numMatch ? baseName.slice(numMatch[0].length) : baseName
    const slug = sanitizeSlug(restTitle)

    if (!slug) {
      console.warn(`⚠️  Slug vazio para: ${entry.name}`)
      continue
    }

    const outputPath = path.join(outputDir, `${slug}.mdx`)
    if (fs.existsSync(outputPath) && !FORCE) {
      skipped++
      continue
    }

    const vaultPath = path.join(vaultDir, entry.name)

    try {
      const { mdxContent, meta } = convertVaultFile(
        vaultPath,
        config.code,
        config.accent,
        topicNumber,
      )
      metas[`${config.code}/${slug}`] = meta

      if (DRY_RUN) {
        console.log(`📝 [dry-run] ${config.code}/${slug} ← ${entry.name}`)
      } else {
        fs.writeFileSync(outputPath, mdxContent, "utf-8")
        console.log(`✅ ${config.code}/${slug} ← ${entry.name}`)
      }
      count++
    } catch (err) {
      console.error(`❌ Erro ao converter ${entry.name}:`, err)
    }
  }

  const msg = skipped > 0 ? ` (${skipped} já existiam)` : ""
  console.log(`📊 ${config.label}: ${count} tópicos convertidos${msg}`)
  return { count, skipped, metas }
}

// --- Main ---

console.log(`🔄 Conversão Vault → MDX${DRY_RUN ? " (dry-run)" : ""}\n`)

const allMetas: Record<string, ConvertResult["meta"]> = {}
for (const dirName of Object.keys(VAULT_DIR_MAP)) {
  if (ONLY_CODE && !VAULT_DIR_MAP[dirName].code.startsWith(ONLY_CODE)) continue
  const result = processVaultDir(dirName)
  Object.assign(allMetas, result.metas)
}

// Gerar barrel file — index.ts com imports explícitos de todos os MDX
if (!DRY_RUN) {
  const mdxDir = path.join(OUTPUT_DIR)
  const manualCodes = ONLY_CODE
    ? [ONLY_CODE]
    : Object.values(VAULT_DIR_MAP).map((c) => c.code)

  const imports: string[] = []
  const entries: string[] = []
  const tocEntries: string[] = []
  const metaEntries: string[] = []

  const tocSlugger = new GithubSlugger()
  function slugifyHeading(text: string): string {
    return tocSlugger.slug(text)
  }

  function extractToc(mdxContent: string): Array<{ id: string; text: string; level: number }> {
    // Reset por ficheiro: o rehype-slug processa cada página de forma
    // independente, pelo que o espaço de slugs tem de ser por-doc (senão o
    // "Resumo Conciso" presente em todos os 119 .mdx acumularia sufixos
    // -1, -2 ... e os anchors do TOC já não bateriam com os da página).
    tocSlugger.reset()
    const headings: Array<{ id: string; text: string; level: number }> = []
    const lines = mdxContent.split("\n")
    let inCodeBlock = false
    for (const line of lines) {
      if (line.trimStart().startsWith("```")) {
        inCodeBlock = !inCodeBlock
        continue
      }
      if (inCodeBlock) continue
      const m = line.match(/^(#{2,3})\s+(.+)/)
      if (m) {
        const level = m[1].length as 2 | 3
        const text = m[2].replace(/\*\*/g, "").replace(/`/g, "").trim()
        headings.push({ id: slugifyHeading(text), text, level })
      }
    }
    return headings
  }

  for (const code of manualCodes) {
    const codeDir = path.join(mdxDir, code)
    if (!fs.existsSync(codeDir)) continue
    const files = fs.readdirSync(codeDir).filter((f) => f.endsWith(".mdx")).sort()
    for (const file of files) {
      const slug = file.replace(/\.mdx$/, "")
      const varName = `Mdx_${code}_${slug.replace(/[^a-zA-Z0-9]/g, "_")}`
      imports.push(
        `import ${varName} from "./${code}/${slug}.mdx"`,
      )
      entries.push(`  "${code}/${slug}": ${varName}`)

      // Extrair TOC do ficheiro MDX
      const mdxPath = path.join(codeDir, file)
      const mdxContent = fs.readFileSync(mdxPath, "utf-8")
      const toc = extractToc(mdxContent)
      tocEntries.push(`  "${code}/${slug}": ${JSON.stringify(toc)}`)

      // Meta (frontmatter thread-through) para o mdxMetaRegistry
      const key = `${code}/${slug}`
      if (allMetas[key]) {
        metaEntries.push(`  ${JSON.stringify(key)}: ${JSON.stringify(allMetas[key])}`)
      }
    }
  }

  const barrelContent = [
    "// AUTO-GERADO por scripts/convert-vault-to-mdx.ts — NÃO EDITAR À MÃO",
    "// Este ficheiro indexa todos os .mdx em content/manuals/ para o page.tsx.",
    "",
    ...imports,
    "",
    "export const mdxRegistry: Record<string, React.ComponentType> = {",
    entries.join(",\n"),
    "}",
    "",
    "export const mdxTocRegistry: Record<string, Array<{id: string; text: string; level: number}>> = {",
    tocEntries.join(",\n"),
    "}",
    "",
    "import type { TopicFrontmatter } from \"@/lib/topic-loader\"",
    "",
    "export const mdxMetaRegistry: Record<string, TopicFrontmatter> = {",
    metaEntries.join(",\n"),
    "}",
    "",
  ].join("\n")

  const barrelPath = path.join(mdxDir, "index.ts")
  fs.writeFileSync(barrelPath, barrelContent, "utf-8")
  console.log(`\n📦 Barrel file gerado: ${barrelPath} (${entries.length} entries, ${tocEntries.length} TOCs)`)
}

console.log(
  DRY_RUN
    ? "\n🏁 Dry-run concluído — nenhum ficheiro foi escrito"
    : "\n✅ Conversão concluída!",
)
