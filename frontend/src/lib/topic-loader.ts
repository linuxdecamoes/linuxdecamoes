import fs from "node:fs/promises"
import path from "node:path"
import matter from "gray-matter"
import GithubSlugger from "github-slugger"

// O Vault de manuais LPI é EXTERNO ao repositório `linuxdecamoes/`. Há dois
// ambientes de execução:
//   • Dev local: `process.cwd()` = `linuxdecamoes/frontend/`, pelo que o Vault
//     vive em `../../Vault` (i.e. `manuais Linux/Vault/`).
//   • Docker: o Vault é montado em `/app/Vault` (compose mount `:ro`), e o
//     `process.cwd()` do contentor é `/app` — sem a env var `VAULT_PATH`,
//     `../../Vault` resolveria para `/Vault` (inexistente) e todos os tópicos
//     404'ariam. A env var é injetada tanto no build (Dockerfile `ARG`) como
//     no runtime (compose `environment`).
const VAULT_ROOT = process.env.VAULT_PATH
  ? path.resolve(process.env.VAULT_PATH)
  : path.resolve(process.cwd(), "..", "..", "Vault")

// Instância reutilizada de GithubSlugger para garantir que os IDs gerados pelo
// loader (TOC + wikilinks) batem com os IDs gerados pelo `rehype-slug` no
// renderer (ambos usam github-slugger, que PRESERVA diacritics: "Básicos" →
// "básicos", ao contrário do normalize("NFD") que os descarta).
const slugger = new GithubSlugger()

function slugify(input: string): string {
  slugger.reset()
  return slugger.slug(input)
}

export type TopicFrontmatter = {
  title: string
  objective?: string
  topic?: string
  weight?: number | string
  tags?: string[]
  prev?: string
  next?: string
}

export type LoadedTopic = {
  frontmatter: TopicFrontmatter
  content: string
  headings: TocItem[]
}

export type TocItem = {
  id: string
  level: 2 | 3
  text: string
}

const WIKILINK_REGEX = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g

function resolveWikilinks(markdown: string): string {
  return markdown.replace(WIKILINK_REGEX, (_match, target: string, label?: string) => {
    const text = label ?? target
    const slug = slugify(target)
    // v1: wikilinks viram âncoras in-page. Cross-topic (apontar para outro
    // /manuals/[code]/[slug]) fica para v2 — exigiria lookup reverso no
    // manifesto. Ver spec §10 (Riscos) e §9 (Out of scope implícito).
    return `[${text}](#${slug})`
  })
}

function extractHeadings(markdown: string): TocItem[] {
  const lines = markdown.split("\n")
  const headings: TocItem[] = []
  let inFence = false
  for (const line of lines) {
    if (line.trimStart().startsWith("```")) {
      inFence = !inFence
      continue
    }
    if (inFence) continue
    const h2 = /^##\s+(.+)$/.exec(line)
    if (h2) {
      const text = h2[1].trim()
      headings.push({ id: slugify(text), level: 2, text })
      continue
    }
    const h3 = /^###\s+(.+)$/.exec(line)
    if (h3) {
      const text = h3[1].trim()
      headings.push({ id: slugify(text), level: 3, text })
    }
  }
  return headings
}

// Nomes reais confirmados via `Get-ChildItem ..\Vault -Directory` (2026-07-21).
// Diferem do plano original em 3 entradas: Security/Web/Open Source Essentials
// têm sufixo "-100" no filesystem (ex.: "020-100 - Security Essentials").
const VAULT_DIRS = [
  "101-500 - LPIC-1 (parte 1)",
  "102-500 - LPIC-1 (parte 2)",
  "010 - Linux Essentials",
  "020-100 - Security Essentials",
  "030-100 - Web Development Essentials",
  "050-100 - Open Source Essentials",
]

// Normaliza uma string para a forma canónica de slug (ASCII lowercase com
// hífens). Aplicar tanto ao slug do manifesto como ao slug derivado do nome do
// ficheiro do Vault para que ambos possam ser comparados. Os slugs do manifesto
// (`lib/manuals.ts`) já são ASCII lowercase com hífens, mas os nomes dos
// ficheiros no Vault contêm diacríticos, espaços e prefixos como "T01 - ".
function normalizeSlug(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // descarta diacríticos (ex.: "á" → "a")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // não-alfanumérico → hífen
    .replace(/^-+|-+$/g, "") // trim hífens das pontas
}

// Converte o nome de um ficheiro do Vault num slug comparável com o slug do
// manifesto. Descarta a extensão `.md` e o prefixo de código (ex.: "T01 - ",
// "T02.5 - ", "101.1 - ", "010 - ") que antecede o título real. O separador
// entre o prefixo e o título pode ser hífen ASCII ("-"), em-dash (—, U+2014)
// ou en-dash (–, U+2013) — o manual 050-100 usa em-dash, daí a necessidade
// de os tratar todos como equivalentes.
function filenameToSlug(filename: string): string {
  const withoutExt = filename.replace(/\.md$/i, "")
  // Strip de prefixos como "T01 - ", "T02.5 - ", "101.1 - ", "010 - " do início.
  // O separador aceita hífen ASCII, em-dash (—) e en-dash (–).
  const withoutPrefix = withoutExt.replace(
    /^t?\d+(?:[.\-]\d+)*\s*[-—–]\s*/i,
    ""
  )
  return normalizeSlug(withoutPrefix)
}

async function findTopicFile(slug: string): Promise<string | null> {
  const targetSlug = normalizeSlug(slug)
  for (const dir of VAULT_DIRS) {
    const fullDir = path.join(VAULT_ROOT, dir)
    let entries: string[]
    try {
      entries = await fs.readdir(fullDir)
    } catch {
      continue
    }
    for (const entry of entries) {
      if (!entry.toLowerCase().endsWith(".md")) continue
      if (filenameToSlug(entry) === targetSlug) {
        return path.join(fullDir, entry)
      }
    }
  }
  return null
}

export async function loadTopicBySlug(slug: string): Promise<LoadedTopic | null> {
  const filePath = await findTopicFile(slug)
  if (!filePath) {
    console.warn(`[topic-loader] Tópico não encontrado no Vault: ${slug}`)
    return null
  }

  const raw = await fs.readFile(filePath, "utf8")
  let parsed: matter.GrayMatterFile<string>
  try {
    parsed = matter(raw)
  } catch (err) {
    // YAML malformado no frontmatter não deve derrubar o build/dev com 500.
    // A página de tópico trata `null` como 404 (ver I6 — notFound()).
    console.error("[topic-loader] YAML malformado em:", filePath, err)
    return null
  }
  const frontmatter = parsed.data as TopicFrontmatter
  const contentWithLinks = resolveWikilinks(parsed.content)
  const headings = extractHeadings(parsed.content)

  return {
    frontmatter,
    content: contentWithLinks,
    headings,
  }
}
