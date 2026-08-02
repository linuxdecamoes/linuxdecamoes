---
tipo: spec
titulo: "Página de Política de Privacidade + Correção do Favicon"
projeto: Linux de Camões
data: 2026-08-02
estado: aprovado
idioma: PT-PT
relacionado:
  - Norma 01 - Sistema de Tokens e Cores
  - ADR-001 - Abordagem A - CSS puro e SVG inline
---

# Página de Política de Privacidade + Correção do Favicon

## Contexto

A app **Linux de Camões** não tem nenhuma página legal. O RGPD (art. 13.º) exige
transparência sobre o tratamento de dados pessoais. Verificou-se que a app **não
recolhe dados para tracking** (zero analytics, zero trackers de terceiros) — o único
terceiro é o Clerk (autenticação), cujos cookies de sessão são estritamente
necessários. Logo, **não é necessário banner de cookies**, mas é recomendado ter uma
**Política de Privacidade** no site para cumprir o dever de informação.

Adicionalmente, o favicon atual é o **default do create-next-app** (triângulo
preto, `src/app/favicon.ico`) — visualmente percebido como uma "seta para cima".
Deve ser substituído pelo logo da marca.

## Objetivos

1. Criar a página pública `/privacidade` com a Política de Privacidade em PT-PT.
2. Adicionar link "Política de Privacidade" nos dois rodapés (público + dashboard).
3. Substituir o favicon default pelo logo da marca.

## Fora de âmbito

- Banner de consentimento de cookies (não necessário — ver Contexto).
- Página de Termos de Utilização (pode ser futuro).
- Alterações de conteúdo ao texto legal além do descrito.

## Decisões

1. **Abordagem A** — página única Server Component em `frontend/src/app/privacidade/page.tsx`,
   seguindo o padrão do `/sobre` (metadata completa + `LandingHeader` + `LandingFooter`).
   Zero novas dependências.
2. **Identificação genérica** do responsável pelo tratamento ("Linux de Camões —
   projeto open-source de comunidade") com email placeholder
   `privacidade@linuxdecamoes.pt` (a atualizar futuramente).
3. **Link nos dois rodapés**:
   - `LandingFooter`: nova secção **"Legal"** com link "Política de Privacidade".
   - `DashboardFooter`: link "Privacidade" na `nav` existente.
4. **Favicon**: apagar `src/app/favicon.ico`; criar `src/app/icon.svg` (cópia de
   `public/icon.svg` — logo da marca) e `src/app/apple-icon.png` (cópia de
   `public/apple-icon.png`). Segue a convenção App Router (metadata file
   conventions), sem necessitar de metadata explícita no layout.

## Implementação

### 1. Página `/privacidade`

Novo ficheiro: `frontend/src/app/privacidade/page.tsx`

- `export const metadata`: title "Política de Privacidade", description, keywords,
  `canonical: "/privacidade"`, openGraph + twitter (padrão do `/sobre`),
  `robots: { index: true, follow: true }`.
- Estrutura JSX: `LandingHeader` + `<main>` + `LandingFooter`.
- Conteúdo com secções numeradas, título, e nota "Última atualização: 2 de agosto
  de 2026".
- Estilo: tipografia tipográfica limpa, `max-w-3xl`, sem cores inline (Norma 01).

### Secções do conteúdo (PT-PT)

1. **Introdução** — âmbito e compromisso de privacidade.
2. **Responsável pelo tratamento** — "Linux de Camões — projeto open-source de
   comunidade. Contacto: privacidade@linuxdecamoes.pt".
3. **Dados recolhidos** — conta (via Clerk: nome e email), progresso de estudo,
   resultados de quizzes, histórico de chat.
4. **Finalidades e base legal** — prestação do serviço (execução de contrato);
   sem publicidade nem perfilação.
5. **Cookies** — apenas estritamente necessários (sessão Clerk / autenticação /
   CSRF); sem analytics, sem tracking, sem fingerprinting.
6. **Partilha de dados** — subcontratantes: Clerk (autenticação/hosting) e Groq
   (inferência LLM no chat); nunca venda de dados.
7. **Retenção** — dados mantidos enquanto a conta estiver ativa; apagáveis a pedido.
8. **Direitos do titular** — acesso, retificação, apagamento, portabilidade,
   oposição → via email de contacto.
9. **Segurança** — HTTPS, autenticação JWT, boas práticas OWASP.
10. **Alterações à política** — atualizações publicadas nesta página.
11. **Contacto** — email placeholder.

### 2. Rodapés

- `frontend/src/components/landing-footer.tsx`: adicionar secção **"Legal"** com
  `{ href: "/privacidade", label: "Política de Privacidade" }`.
- `frontend/src/components/dashboard-footer.tsx`: adicionar
  `<Link href="/privacidade">Privacidade</Link>` na `nav`.

### 3. Favicon

- Apagar `frontend/src/app/favicon.ico`.
- Copiar `frontend/public/icon.svg` → `frontend/src/app/icon.svg`.
- Copiar `frontend/public/apple-icon.png` → `frontend/src/app/apple-icon.png`.

## Verificação

1. `cmd /c "npm run lint"` — sem erros.
2. `cmd /c "npm run build"` — 132+ páginas SSG (gate de integração).
3. A rota `/privacidade` acessível e indexável; favicon da marca no browser.

## Commit

- Commit atómico por tarefa, mensagem convencional (PT-PT).
- Push para `master` (aciona CI/CD automático GitHub→VPS).

## Notas

- Zero dependências runtime novas (ADR-001 respeitado).
- Zero cores inline em `.tsx` (Norma 01 respeitada).
