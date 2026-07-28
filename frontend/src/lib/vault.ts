import fs from "fs"
import path from "path"

function findVaultDir(): string {
  const candidates = [
    path.resolve(process.cwd(), "../../Vault"),
    path.resolve(process.cwd(), "../Vault"),
    "/app/Vault",
  ]
  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir
  }
  return candidates[0]
}

const VAULT_DIR = findVaultDir()

export interface VaultTopic {
  slug: string
  filename: string
  title: string
  objective: string
  topic: string
  summary: string
  content: string
}

export interface VaultManual {
  code: string
  dirName: string
  title: string
  description: string
  accent: "sage" | "coral" | "amber" | "terracotta" | "iris"
  topics: VaultTopic[]
}

const MANUAL_CONFIG: Record<string, { title: string; description: string; accent: VaultManual["accent"] }> = {
  "010": { title: "Linux Essentials", description: "Fundamentos do Linux -- ficheiros, permissoes, processos e shell basica.", accent: "sage" },
  "020": { title: "Security Essentials", description: "Conceitos de seguranca -- autenticacao, permissoes, criptografia e boas praticas.", accent: "coral" },
  "030": { title: "Web Development Essentials", description: "Desenvolvimento web -- HTML, CSS, JavaScript, Node.js e SQL.", accent: "amber" },
  "050": { title: "Open Source Essentials", description: "Software de codigo aberto -- licencas, modelos de negocio e ferramentas.", accent: "terracotta" },
  "101": { title: "LPIC-1 Parte 1", description: "Arquitetura do Linux, gestao de pacotes, kernels, boot e filesystems.", accent: "terracotta" },
  "102": { title: "LPIC-1 Parte 2", description: "Shell avancado, administracao de sistemas, redes, seguranca e ferramentas GNU.", accent: "iris" },
}

const DIR_MAP: Record<string, string> = {
  "010": "010 - Linux Essentials",
  "020": "020-100 - Security Essentials",
  "030": "030-100 - Web Development Essentials",
  "050": "050-100 - Open Source Essentials",
  "101": "101-500 - LPIC-1 (parte 1)",
  "102": "102-500 - LPIC-1 (parte 2)",
}

function slugify(filename: string): string {
  return filename
    .replace(/^T\d+\s*[-—]\s*/, "")
    .replace(/\.md$/, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function parseFrontmatter(text: string): { meta: Record<string, string>; body: string } {
  const match = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/)
  if (!match) return { meta: {}, body: text }

  const meta: Record<string, string> = {}
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":")
    if (idx > 0) {
      const key = line.slice(0, idx).trim()
      const val = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "")
      if (val) meta[key] = val
    }
  }
  return { meta, body: match[2] }
}

function getFirstParagraph(body: string): string {
  const lines = body.split("\n")
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith("#") && !trimmed.startsWith("---")) {
      return trimmed.slice(0, 200)
    }
  }
  return ""
}

let _cache: VaultManual[] | null = null

export function getVaultManuals(): VaultManual[] {
  if (_cache) return _cache

  const manuals: VaultManual[] = []

  for (const [code, dirName] of Object.entries(DIR_MAP)) {
    const manualDir = path.join(VAULT_DIR, dirName)
    if (!fs.existsSync(manualDir)) continue

    const config = MANUAL_CONFIG[code]
    if (!config) continue

    const files = fs.readdirSync(manualDir)
      .filter((f) => f.startsWith("T") && f.endsWith(".md"))
      .sort()

    const topics: VaultTopic[] = files.map((filename) => {
      const filePath = path.join(manualDir, filename)
      const raw = fs.readFileSync(filePath, "utf-8")
      const { meta, body } = parseFrontmatter(raw)

      return {
        slug: slugify(filename),
        filename,
        title: meta.title || meta.titulo || filename.replace(/\.md$/, ""),
        objective: meta.objective || meta.objetivo || "",
        topic: meta.topic || meta.topico || "",
        summary: getFirstParagraph(body),
        content: body,
      }
    })

    manuals.push({
      code,
      dirName,
      title: config.title,
      description: config.description,
      accent: config.accent,
      topics,
    })
  }

  _cache = manuals
  return manuals
}

export function getVaultManual(code: string): VaultManual | undefined {
  return getVaultManuals().find((m) => m.code === code)
}

export function getVaultTopic(code: string, slug: string): { manual: VaultManual; topic: VaultTopic; index: number } | undefined {
  const manual = getVaultManual(code)
  if (!manual) return undefined
  const index = manual.topics.findIndex((t) => t.slug === slug)
  if (index === -1) return undefined
  return { manual, topic: manual.topics[index], index }
}
