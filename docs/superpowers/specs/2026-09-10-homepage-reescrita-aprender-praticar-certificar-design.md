# Spec: Reescrita da Homepage — Jornada "Aprender → Praticar → Certificar"

**Data:** 2026-09-10
**Estado:** Aprovado
**Autor:** Claude (Sonnet 5)

---

## 1. Resumo

A homepage atual (`src/app/page.tsx`) apresenta o projeto como um produto de engenharia — bento grid misturando funcionalidades de aprendizagem com uma secção inteira de stack tecnológica (Next.js, FastAPI, Kubernetes, etc.) e uma secção de comunidade focada em como contribuir código (PRs, issues). Isto desalinha a mensagem do público real: **qualquer pessoa que queira aprender Linux**, de qualquer idade, com ou sem ligação à universidade — não avaliadores técnicos da stack.

A stack tecnológica e o processo de contribuição de código já vivem no GitHub/README, que é o sítio certo para esse público (contribuidores). A homepage deve vender aprendizagem, não arquitetura.

Esta spec reescreve a homepage à volta de uma narrativa em 3 etapas — **Aprender → Praticar → Certificar** — mantendo a identidade visual de "terminal" (títulos tipo `$ comando`) que já existe no site, mas com copy acessível a iniciantes completos.

## 2. Decisões de Design

### 2.1 Abordagem: Reescrita completa da narrativa (não só reordenação)

Em vez de apenas trocar/remover secções pontuais, a homepage passa a ter uma estrutura nova de 4 secções principais (+ hero + footer), cada uma correspondendo a uma etapa da jornada do utilizador. Conteúdo espalhado hoje por "Bento Grid" + "Prova Social" + "Stack Tecnológica" + "Comunidade" é consolidado e redistribuído por essas etapas.

### 2.2 Público-alvo e implicações de copy

- Público: "qualquer pessoa que queira aprender Linux" — sem assumir conhecimento técnico prévio, idade ou vínculo universitário.
- Certificação LPI deixa de ser apresentada como o único objetivo — é uma possibilidade, não um requisito, no copy do hero.
- "Apoio Universitário" deixa de ser card de destaque (não é o público principal) — vira nota discreta de uma frase.

### 2.3 Identidade "terminal" mantida

Os títulos de secção continuam a usar o padrão `$ comando` (ex.: `$ cat manuais/*`) como elemento de marca — decisão explícita de manter, não suavizar nem remover. Cada título de comando é acompanhado de um H2 em português normal por baixo, para acessibilidade e para o Google (o comando fica como legenda estilística, o H2 carrega a semântica e as keywords).

### 2.4 SEO: mais links internos crawláveis a partir da homepage

A prévia real de manuais (secção "Aprender") liga diretamente para páginas de tópico reais (`/manuals/[code]/[slug]`), em vez de texto genérico sobre a funcionalidade. Isto dá ao Googlebot mais caminhos de descoberta a partir da homepage, que é a página com mais autoridade do site.

## 3. Estrutura da Página

### 3.1 Hero

- **H1:** reformulado de "Domine Sistemas Linux com IA Interativa" para algo como "Aprende Linux, ao teu ritmo, em português" — remove a moldura de "domínio via IA" (soa a produto SaaS técnico) e introduz keywords relevantes ("aprender Linux", "português") ausentes no H1 atual.
- **Subtítulo:** comunica que não é preciso saber nada de antemão; estuda-se pelos manuais oficiais, pratica-se com quizzes, e a certificação é uma opção para quem quiser, não o único destino.
- **CTAs:** primário **"Ver Manuais"** → `/manuals` (sem exigir registo, deixa explorar primeiro); secundário **"Criar Conta"** → `/sign-up` (para guardar progresso, usar quizzes SM-2 e o motor RAG).

### 3.2 `$ cat manuais/*` — Aprender

Duas partes:

- **Prévia real de manuais:** 3–4 tópicos verdadeiros retirados de `manuals` (ex.: "010 — A Evolução do Linux e Sistemas Operativos Populares", "101 — Gestão de Utilizadores", tópico de permissões de ficheiros), cada um como link real para a respetiva página de tópico. Substitui a atual secção de Stack Tecnológica.
- **Motor RAG:** mantém o card já existente ("pergunta em português, recebe resposta fundamentada, sem alucinações") — copy já adequada, não muda.

### 3.3 `$ ./quiz --run` — Praticar

Dois cards, reaproveitando texto já existente quase sem alteração:

- **Quizzes SM-2** — repetição espaçada que se adapta ao ritmo do utilizador.
- **Labs Kubernetes** (badge "Em breve") — terminal real para praticar comandos num ambiente isolado.

Estes dois cards saem do bento grid atual (onde estavam misturados com Manuais/RAG) e passam a formar a secção "Praticar" isolada.

### 3.4 `$ cat roadmap.yml` — Certificar

Consolida três coisas que hoje estão espalhadas (bento grid parcial + secção "Prova Social" + card "Apoio Universitário") num só bloco:

- **Roadmap** Essentials → LPIC-1 → LPIC-2, reaproveitando o conteúdo/estilo já existente na home.
- **Stats como prova social integrada** (não secção isolada): total de manuais, total de tópicos, estrelas no GitHub — como uma linha de números dentro desta secção.
- **Nota discreta para educadores:** uma frase curta ("Professores: integra isto na tua disciplina") com link para `/sobre`, sem card dedicado.

### 3.5 `$ git clone community` — Comunidade

Versão significativamente mais curta do que a atual. Mantém-se porque pode gerar tráfego/estrelas no GitHub (decisão explícita do utilizador de não remover), mas deixa de funcionar como onboarding técnico para contribuidores:

- Frase curta: "Open-source, feito pela comunidade. Usa, aprende, e se quiseres, contribui."
- Badge "Licença MIT" (mantém-se — sinal de confiança/transparência).
- Um único botão "Repositório no GitHub".
- **Remove-se:** tabela/lista "Pull Requests Bem-Vindos" / "Issues Respondidas Ativamente" e qualquer explicação de processo de contribuição — isso fica só no README do GitHub.

### 3.6 Footer

Sem alterações.

## 4. Fora de Âmbito

- Não altera `/sobre` (essa página pode continuar a detalhar stack técnica e processo de contribuição — é o sítio certo para esse conteúdo).
- Não altera `/manuals` nem páginas de manual/tópico individuais.
- Não introduz testemunhos, FAQ ou conteúdo novo tipo blog (ficou fora depois de escolhida a opção "prévia real de manuais" em vez de FAQ/prova social separada).
- Não mexe em `robots.ts`/`sitemap.ts` (já corrigidos em trabalho anterior).

## 5. Testes

- Verificação visual manual no browser (dev server) em desktop e mobile, temas claro/escuro.
- Confirmar que os links da prévia de manuais na secção "Aprender" apontam para rotas reais existentes (`/manuals/[code]/[slug]`) e não dão 404.
- Lint (`npm run lint`) sem erros novos.
