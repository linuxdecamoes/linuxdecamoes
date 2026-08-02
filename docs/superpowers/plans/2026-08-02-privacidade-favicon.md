# Política de Privacidade + Favicon — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar a página pública `/privacidade` (Política de Privacidade em PT-PT), ligá-la nos dois rodapés e substituir o favicon default do Next.js pelo logo da marca.

**Architecture:** Página única Server Component em `frontend/src/app/privacidade/page.tsx`, seguindo o padrão do `/sobre` (metadata + `LandingHeader` + `LandingFooter`). Conteúdo modelado como array de secções (`{ title, paragraphs, list }`) e renderizado genericamente — DRY e fácil de editar. Rodapés alterados por edição direta. Favicon substituído via convenção App Router (`app/icon.svg` + `app/apple-icon.png`).

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind v4, lucide-react, tokens OKLCH (CSS vars).

**Convenções obrigatórias:** PT-PT em todo o conteúdo; zero cores `oklch()`/hex inline em `.tsx` (Norma 01 — usar `var(--token)` ou classes Tailwind); zero deps runtime novas (ADR-001). No Windows correr `npm` via `cmd /c`.

---

### Task 1: Página `/privacidade`

**Files:**
- Create: `frontend/src/app/privacidade/page.tsx`

- [ ] **Step 1: Criar o ficheiro da página**

Conteúdo completo do ficheiro:

```tsx
import type { Metadata } from "next"
import { Shield } from "lucide-react"
import { LandingHeader } from "@/components/landing-header"
import { LandingFooter } from "@/components/landing-footer"

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Política de Privacidade do Linux de Camões: dados recolhidos, finalidades, base legal, cookies, partilha de dados e direitos dos utilizadores.",
  keywords: [
    "Linux de Camões", "política de privacidade", "RGPD", "dados pessoais",
    "cookies", "privacidade", "PT-PT",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: "/privacidade" },
  openGraph: {
    title: "Política de Privacidade — Linux de Camões",
    description:
      "Transparência no tratamento de dados: que dados recolhemos, finalidades, cookies e direitos dos utilizadores.",
    type: "website",
    locale: "pt_PT",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Linux de Camões",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Política de Privacidade — Linux de Camões",
    description: "Transparência no tratamento de dados da plataforma.",
    images: ["/opengraph-image"],
  },
}

const sections = [
  {
    title: "1. Introdução",
    paragraphs: [
      "A plataforma Linux de Camões está comprometida com a proteção da privacidade de quem a utiliza. Esta Política de Privacidade explica, de forma clara e transparente, que dados pessoais são tratados, com que finalidade, em que base legal, durante quanto tempo e quais os direitos de quem os utiliza.",
    ],
  },
  {
    title: "2. Responsável pelo tratamento",
    paragraphs: [
      "O Linux de Camões é um projeto open-source de comunidade. O responsável pelo tratamento de dados pessoais é a equipa de gestão do projeto, contactável através do email privacidade@linuxdecamoes.pt.",
    ],
  },
  {
    title: "3. Dados pessoais recolhidos",
    paragraphs: [
      "Recolhemos apenas os dados estritamente necessários à prestação do serviço:",
    ],
    list: [
      "Dados de conta: nome e email, fornecidos através do fornecedor de autenticação Clerk;",
      "Dados de utilização da plataforma: progresso de estudo, resultados de quizzes e histórico de conversas no chat com IA.",
    ],
  },
  {
    title: "4. Finalidades e base legal",
    paragraphs: [
      "Os dados são tratados exclusivamente para prestar o serviço de aprendizagem: gerir a conta, guardar o progresso, gerar quizzes e responder a perguntas no chat. A base legal é a execução do contrato de utilização do serviço (artigo 6.º, n.º 1, alínea b) do RGPD).",
      "Não utilizamos os dados para publicidade, perfilação ou venda a terceiros.",
    ],
  },
  {
    title: "5. Cookies",
    paragraphs: [
      "Utilizamos apenas cookies e armazenamento estritamente necessários ao funcionamento técnico do serviço: sessão de autenticação (Clerk) e proteção contra falsificação de pedidos (CSRF).",
      "Não usamos cookies de publicidade, de analytics de terceiros, de redes sociais ou qualquer técnica de fingerprinting.",
    ],
  },
  {
    title: "6. Partilha de dados",
    paragraphs: [
      "Os dados podem ser tratados por subcontratantes que prestam serviços essenciais à plataforma:",
    ],
    list: [
      "Clerk: autenticação e gestão de contas (hosting nos EUA);",
      "Groq: inferência de modelo de linguagem, recebendo apenas o texto da mensagem enviada no chat.",
    ],
    paragraphsAfter: [
      "Nunca vendemos dados pessoais a terceiros.",
    ],
  },
  {
    title: "7. Retenção dos dados",
    paragraphs: [
      "Os dados são mantidos enquanto a conta estiver ativa e forem necessários às finalidades descritas. Quando a conta é eliminada ou o consentimento retirado, os dados são apagados ou anonimizados, salvo obrigação legal de conservação.",
    ],
  },
  {
    title: "8. Direitos dos titulares",
    paragraphs: [
      "Nos termos do RGPD, tens o direito de:",
    ],
    list: [
      "Aceder aos teus dados pessoais;",
      "Retificar dados incorretos;",
      "Solicitar o apagamento dos dados;",
      "Solicitar a portabilidade dos dados;",
      "Opor-te a determinado tratamento.",
    ],
    paragraphsAfter: [
      "Para exercer estes direitos, contacta-nos através do email privacidade@linuxdecamoes.pt. Tens ainda o direito de apresentar uma reclamação junto da autoridade de controlo competente (em Portugal, a CNPD).",
    ],
  },
  {
    title: "9. Segurança",
    paragraphs: [
      "Adotamos medidas técnicas e organizativas adequadas para proteger os dados pessoais: transporte encriptado (HTTPS), autenticação por token (JWT) e boas práticas de segurança de aplicações web (OWASP).",
    ],
  },
  {
    title: "10. Alterações a esta política",
    paragraphs: [
      "Esta Política de Privacidade pode ser atualizada para refletir alterações ao serviço ou requisitos legais. As alterações serão publicadas nesta página, com indicação da data da última atualização.",
    ],
  },
  {
    title: "11. Contacto",
    paragraphs: [
      "Para qualquer questão relativa a esta Política de Privacidade ou ao tratamento dos teus dados, contacta-nos através do email privacidade@linuxdecamoes.pt.",
    ],
  },
]

export default function PrivacidadePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-primary" />
              Privacidade · RGPD · PT-PT
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Política de Privacidade
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">
              Última atualização: 2 de agosto de 2026
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-16">
          {sections.map((section) => (
            <div key={section.title} className="mb-12">
              <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
                {section.title}
              </h2>
              {section.paragraphs.map((p, i) => (
                <p
                  key={i}
                  className="mt-4 text-base leading-relaxed text-muted-foreground"
                >
                  {p}
                </p>
              ))}
              {section.list ? (
                <ul className="mt-4 list-inside list-disc space-y-2 text-base leading-relaxed text-muted-foreground">
                  {section.list.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {section.paragraphsAfter
                ? section.paragraphsAfter.map((p, i) => (
                    <p
                      key={i}
                      className="mt-4 text-base leading-relaxed text-muted-foreground"
                    >
                      {p}
                    </p>
                  ))
                : null}
            </div>
          ))}
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
```

- [ ] **Step 2: Verificar que a rota compila (typecheck do ficheiro)**

Run: `cmd /c "npx tsc --noEmit -p frontend"` (na raiz do repo) — se o tsconfig não existir na raiz, correr dentro de `frontend/`.
Expected: sem erros de tipo (ou erro apenas se houver problemas reais de tipo).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/privacidade/page.tsx
git commit -m "feat(privacidade): pagina de politica de privacidade (RGPD, PT-PT)"
```

---

### Task 2: Link no rodapé público (`LandingFooter`)

**Files:**
- Modify: `frontend/src/components/landing-footer.tsx`

- [ ] **Step 1: Adicionar secção "Legal" ao array `footerSections`**

No ficheiro, alterar o array `footerSections` para incluir uma nova secção depois de "Recursos":

```tsx
  {
    title: "Recursos",
    links: [
      { href: "/manuals", label: "Manuais LPI" },
      { href: "/lab", label: "Sandbox Kubernetes" },
      { href: "/dashboard/chat", label: "Motor RAG" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacidade", label: "Política de Privacidade" },
    ],
  },
```

Nota: o grid usa `lg:grid-cols-4`; com 4 secções (marca + Projeto + Comunidade + Recursos + Legal = 5 blocos) as secções passam a ocupar 1 coluna cada na grelha `sm:grid-cols-2`. **Não alterar o grid** — o layout com 5 blocos continua equilibrado (2+2+1 em `sm`, 4+1 em `lg`). Manter o bloco da marca com `sm:col-span-2 lg:col-span-1`.

- [ ] **Step 2: Verificar o componente**

Run: `cmd /c "npm run lint"` no diretório `frontend/`
Expected: sem erros de lint.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/landing-footer.tsx
git commit -m "feat(privacidade): link no rodape publico (seccao Legal)"
```

---

### Task 3: Link no rodapé do dashboard (`DashboardFooter`)

**Files:**
- Modify: `frontend/src/components/dashboard-footer.tsx`

- [ ] **Step 1: Adicionar link "Privacidade" na `nav`**

No `nav` do componente, adicionar após o link "Lab":

```tsx
            <Link href="/lab" className="hover:text-foreground transition-colors">
              Lab
            </Link>
            <Link href="/privacidade" className="hover:text-foreground transition-colors">
              Privacidade
            </Link>
```

- [ ] **Step 2: Verificar o componente**

Run: `cmd /c "npm run lint"` no diretório `frontend/`
Expected: sem erros de lint.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/dashboard-footer.tsx
git commit -m "feat(privacidade): link no rodape do dashboard"
```

---

### Task 4: Favicon — substituir default pelo logo da marca

**Files:**
- Delete: `frontend/src/app/favicon.ico`
- Create: `frontend/src/app/icon.svg`
- Create: `frontend/src/app/apple-icon.png`

- [ ] **Step 1: Apagar o favicon default do Next.js**

Run (PowerShell):
```powershell
Remove-Item -LiteralPath "C:\Users\ROG\Documents\GitHub\linuxdecamoes\frontend\src\app\favicon.ico"
```
Expected: ficheiro removido.

- [ ] **Step 2: Copiar o logo da marca para a convenção App Router**

Run (PowerShell):
```powershell
Copy-Item "C:\Users\ROG\Documents\GitHub\linuxdecamoes\frontend\public\icon.svg" "C:\Users\ROG\Documents\GitHub\linuxdecamoes\frontend\src\app\icon.svg"
Copy-Item "C:\Users\ROG\Documents\GitHub\linuxdecamoes\frontend\public\apple-icon.png" "C:\Users\ROG\Documents\GitHub\linuxdecamoes\frontend\src\app\apple-icon.png"
```
Expected: `frontend/src/app/icon.svg` e `frontend/src/app/apple-icon.png` criados. O Next.js 16 deteta automaticamente estes ficheiros e emite `<link rel="icon" type="image/svg+xml">` e `<link rel="apple-touch-icon">`.

- [ ] **Step 3: Confirmar que nada referencia `/icon.svg` diretamente (deixar `public/icon.svg` intocado)**

Run: `rg "icon\.svg" frontend/src`
Expected: sem resultados em código (`public/icon.svg` permanece como asset estático inofensivo).

- [ ] **Step 4: Verificação de build**

Run: `cmd /c "npm run build"` no diretório `frontend/`
Expected: build com sucesso, 132+ páginas SSG; output deve incluir `icon.svg` e `apple-icon.png` como metadata (sem avisos de favicon em falta).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/icon.svg frontend/src/app/apple-icon.png frontend/src/app/favicon.ico
git commit -m "feat(favicon): logo da marca como favicon e apple-touch-icon (remove default do Next)"
```

> Nota: `git add` de um ficheiro apagado (favicon.ico) é o que grava a eliminação.

---

### Task 5: Verificação final (integration gate)

**Files:** nenhum.

- [ ] **Step 1: Lint completo**

Run: `cmd /c "npm run lint"` no diretório `frontend/`
Expected: sem erros.

- [ ] **Step 2: Build completo**

Run: `cmd /c "npm run build"` no diretório `frontend/`
Expected: build com sucesso (132+ páginas SSG). Confirmar que `/privacidade` aparece na lista de rotas geradas.

- [ ] **Step 3: Teste manual rápido (opcional)**

Se o servidor de desenvolvimento estiver a correr em `http://localhost:3001`, abrir `/privacidade` e confirmar: hero com badge "Privacidade · RGPD · PT-PT", 11 secções, footer com link "Política de Privacidade". Verificar o separador para confirmar favicon do logo (círculo preto) em vez do triângulo.

---

### Task 6: Push para GitHub (aciona CI/CD)

**Files:** nenhum.

- [ ] **Step 1: Confirmar estado do repositório**

Run: `git status --short`
Expected: apenas os ficheiros das Tasks 1–4 modificados/novos; nenhum ficheiro estranho (ex.: não incluir `linuxdecamoes_bk.svg` não rastreado na raiz do repo, se existir).

- [ ] **Step 2: Push para `master`**

```bash
git push origin master
```
Expected: push com sucesso; o workflow `deploy.yml` (verify: lint+build → check-secret → deploy SSH→VPS) é acionado automaticamente. Confirmar o run em `https://github.com/linuxdecamoes/linuxdecamoes/actions` se desejado.

---

## Self-Review

**Cobertura do spec:**
- Página `/privacidade` com 11 secções em PT-PT → Task 1 ✅
- Metadata completa (title, description, canonical, OG, twitter) → Task 1 ✅
- Link no `LandingFooter` → Task 2 ✅
- Link no `DashboardFooter` → Task 3 ✅
- Favicon substituído (delete `favicon.ico`, criar `icon.svg` + `apple-icon.png`) → Task 4 ✅
- Verificação lint+build → Task 5 ✅
- Push para GitHub → Task 6 ✅

**Placeholders:** nenhum "TBD"/"TODO"; todo o código está completo.

**Consistência:** componentes `LandingHeader`/`LandingFooter` importados de `@/components/...` como em `/sobre`; tokens via classes Tailwind (`border-border`, `bg-card`, `text-foreground`, `text-muted-foreground`, `text-primary`) — sem cores `oklch()`/hex inline (Norma 01).
