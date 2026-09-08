export type ChangelogEntry = {
  version: string
  title: string
  dateLabel: string
  isoDate: string
  highlights: string[]
}

// Uma entrada por semana de trabalho (nunca mais que uma), curada a partir
// do histórico de commits desde o lançamento alpha. Datas em PT-PT.
export const changelog: ChangelogEntry[] = [
  {
    version: "0.3.0",
    title: "Fiabilidade, SEO e Acessibilidade",
    dateLabel: "Semana de 7–13 de setembro de 2026",
    isoDate: "2026-09-08",
    highlights: [
      "robots.txt e sitemap.xml deixam de ser bloqueados por autenticação — o Google volta a conseguir indexar o site",
      "Sitemap corrigido para apontar para as rotas reais dos manuais (estava a gerar URLs inexistentes)",
      "Domínio canónico corrigido em todas as páginas (apontava para um domínio que não resolve)",
      "Homepage redesenhada: hierarquia visual, ícones consistentes, nova secção de estatísticas reais (manuais, tópicos, estrelas no GitHub)",
      "Corrigido erro de hidratação no ecrã de abertura (splash screen)",
      "A lista de tópicos de cada manual deixa de esconder conteúdo por omissão (só a primeira secção aparecia sem clicar)",
      "142 páginas de tópicos com links de navegação \"Anterior/Próximo\" partidos corrigidos",
      "O rodapé passa a indicar quando uma funcionalidade exige conta antes de clicar",
      "Portas da base de dados, backend e frontend restringidas a acesso local por segurança",
    ],
  },
  {
    version: "0.2.0",
    title: "Lançamento em Produção",
    dateLabel: "Semana de 27 de julho – 2 de agosto de 2026",
    isoDate: "2026-08-01",
    highlights: [
      "Deploy automático para produção via CI/CD",
      "Motor de chat com IA corrigido e estabilizado",
      "Metadados de SEO completos em todas as páginas públicas (Open Graph, Twitter Card, dados estruturados)",
      "Nova identidade visual: logótipo, favicon e ecrã de abertura animado",
      "Nova página de Política de Privacidade (RGPD)",
      "Painel de autenticação redesenhado, mais acessível",
    ],
  },
  {
    version: "0.1.0",
    title: "Lançamento Alpha",
    dateLabel: "28 de julho de 2026",
    isoDate: "2026-07-28",
    highlights: [
      "Primeira versão pública do Linux de Camões",
      "Manuais oficiais de certificação LPI, com tópicos e quizzes inteligentes",
      "Chat com IA para tirar dúvidas sobre os conteúdos",
      "Dashboard de progresso de estudo",
    ],
  },
]
