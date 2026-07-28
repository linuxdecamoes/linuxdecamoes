export type Accent = "sage" | "coral" | "amber" | "terracotta" | "iris"

export interface ManualTopic {
  slug: string
  title: string
  objective?: string
}

export type ManualLevel = "essentials" | "lpic1"

export interface Manual {
  code: string
  title: string
  description: string
  accent: Accent
  level: ManualLevel
  topics: ManualTopic[]
  objectiveTitles?: Record<string, string>
}

export const accentClasses: Record<
  Accent,
  { badge: string; soft: string; strong: string; dot: string }
> = {
  sage: {
    badge: "bg-sage-soft text-sage",
    soft: "bg-sage-soft",
    strong: "text-sage",
    dot: "bg-sage",
  },
  coral: {
    badge: "bg-coral-soft text-coral",
    soft: "bg-coral-soft",
    strong: "text-coral",
    dot: "bg-coral",
  },
  amber: {
    badge: "bg-amber-soft text-amber",
    soft: "bg-amber-soft",
    strong: "text-amber",
    dot: "bg-amber",
  },
  terracotta: {
    badge: "bg-peach text-terracotta",
    soft: "bg-peach",
    strong: "text-terracotta",
    dot: "bg-terracotta",
  },
  iris: {
    badge: "bg-iris-soft text-iris",
    soft: "bg-iris-soft",
    strong: "text-iris",
    dot: "bg-iris",
  },
}

export const manuals: Manual[] = [
  {
    code: "010",
    title: "Linux Essentials",
    description: "Fundamentos do Linux -- ficheiros, permissoes, processos e shell basica.",
    accent: "sage",
    level: "essentials",
    objectiveTitles: {
      "011": "Comunidade Linux e Carreira em Open Source",
      "012": "Navegando num Sistema Linux",
      "013": "O Poder da Linha de Comando",
      "014": "O Sistema Operativo Linux",
      "015": "Seguranca e Permissoes de Ficheiros",
    },
    topics: [
      { slug: "a-evolucao-do-linux-e-sistemas-operacionais-populares", title: "A evolucao do Linux e sistemas operacionais populares", objective: "011" },
      { slug: "principais-aplicacoes-open-source", title: "Principais Aplicacoes Open Source", objective: "011" },
      { slug: "entendendo-o-software-open-source-e-suas-licencas", title: "Entendendo o Software Open Source e suas Licensas", objective: "011" },
      { slug: "habilidades-ict-e-trabalhando-no-linux", title: "Habilidades ICT e trabalhando no Linux", objective: "011" },
      { slug: "o-basico-sobre-a-linha-de-comando", title: "O basico sobre a linha de comando", objective: "012" },
      { slug: "usando-a-linha-de-comando-para-conseguir-ajuda", title: "Usando a linha de comando para conseguir ajuda", objective: "012" },
      { slug: "usando-diretorios-e-listando-arquivos", title: "Usando diretorios e listando arquivos", objective: "012" },
      { slug: "criando-movendo-e-deletando-arquivos", title: "Criando, Movendo e Deletando Arquivos", objective: "012" },
      { slug: "empacotando-arquivos-na-linha-de-comando", title: "Empacotando arquivos na linha de comando", objective: "013" },
      { slug: "pesquisando-e-extraindo-dados-de-arquivos", title: "Pesquisando e extraindo dados de arquivos", objective: "013" },
      { slug: "transformando-comandos-em-scripts", title: "Transformando comandos em Scripts", objective: "013" },
      { slug: "escolhendo-um-sistema-operacional", title: "Escolhendo um Sistema Operacional", objective: "014" },
      { slug: "entendendo-o-hardware-do-computador", title: "Entendendo o Hardware do Computador", objective: "014" },
      { slug: "onde-os-dados-sao-armazenados", title: "Onde os dados sao armazenados", objective: "014" },
      { slug: "seu-computador-na-rede", title: "Seu Computador na Rede", objective: "014" },
      { slug: "seguranca-basica-e-identificacao-de-tipos-de-usuarios", title: "Seguranca Basica e Identificacao de Tipos de Usuarios", objective: "015" },
      { slug: "criando-usuarios-e-grupos", title: "Criando Usuarios e Grupos", objective: "015" },
      { slug: "gerenciando-permissoes-e-donos-de-arquivos", title: "Gerenciando permissoes e donos de arquivos", objective: "015" },
      { slug: "diretorios-e-arquivos-especiais", title: "Diretorios e arquivos especiais", objective: "015" },
    ],
  },
  {
    code: "020",
    title: "Security Essentials",
    description: "Conceitos de seguranca -- autenticacao, permissoes, criptografia e boas praticas.",
    accent: "coral",
    level: "essentials",
    topics: [
      { slug: "021-1-objetivos-funcoes-e-atores", title: "021.1 Objetivos, Funcoes e Atores" },
      { slug: "021-2-avaliacao-e-gestao-de-riscos", title: "021.2 Avaliacao e Gestao de Riscos" },
      { slug: "021-3-comportamento-etico", title: "021.3 Comportamento Etico" },
      { slug: "022-1-criptografia-e-pki", title: "022.1 Criptografia e PKI" },
      { slug: "022-2-criptografia-na-web", title: "022.2 Criptografia na Web" },
      { slug: "022-3-criptografia-de-email", title: "022.3 Criptografia de Email" },
      { slug: "022-4-criptografia-de-armazenamento", title: "022.4 Criptografia de Armazenamento" },
      { slug: "023-1-seguranca-de-hardware", title: "023.1 Seguranca de Hardware" },
      { slug: "023-2-seguranca-de-aplicativos", title: "023.2 Seguranca de Aplicativos" },
      { slug: "023-3-malware", title: "023.3 Malware" },
      { slug: "023-4-disponibilidade-de-dados", title: "023.4 Disponibilidade de Dados" },
      { slug: "024-1-redes-servicos-de-rede-e-internet", title: "024.1 Redes, Servicos de Rede e Internet" },
      { slug: "024-2-seguranca-de-rede-e-internet", title: "024.2 Seguranca de Rede e Internet" },
      { slug: "024-3-criptografia-e-anonimato-na-rede", title: "024.3 Criptografia e Anonimato na Rede" },
      { slug: "025-1-identidade-e-autenticacao", title: "025.1 Identidade e Autenticacao" },
      { slug: "025-2-confidencialidade-da-informacao", title: "025.2 Confidencialidade da Informacao" },
      { slug: "025-3-protecao-da-privacidade", title: "025.3 Protecao da Privacidade" },
    ],
  },
  {
    code: "030",
    title: "Web Development Essentials",
    description: "Desenvolvimento web -- HTML, CSS, JavaScript, Node.js e SQL.",
    accent: "amber",
    level: "essentials",
    objectiveTitles: {
      "032": "HTML",
      "033": "CSS",
    },
    topics: [
      { slug: "031-1-nocoes-basicas-de-desenvolvimento-de-software", title: "031.1 Nocoes basicas de desenvolvimento de software" },
      { slug: "031-2-arquitetura-de-aplicativos-web", title: "031.2 Arquitetura de aplicativos web" },
      { slug: "031-3-nocoes-basicas-de-http", title: "031.3 Nocoes basicas de HTTP" },
      { slug: "a-anatomia-do-documento-html", title: "A anatomia do documento HTML", objective: "032" },
      { slug: "a-semantica-do-html-e-a-hierarquia-de-documentos", title: "A semantica do HTML e a hierarquia de documentos", objective: "032" },
      { slug: "referencias-e-recursos-incorporados-do-html", title: "Referencias e recursos incorporados do HTML", objective: "032" },
      { slug: "formularios-html", title: "Formularios HTML", objective: "032" },
      { slug: "nocoes-basicas-de-css", title: "Nocoes basicas de CSS", objective: "033" },
      { slug: "seletores-de-css-e-aplicacao-de-estilo", title: "Seletores de CSS e aplicacao de estilo", objective: "033" },
      { slug: "estilizacao-com-css", title: "Estilizacao com CSS", objective: "033" },
      { slug: "layout-e-modelo-de-caixa-css", title: "Layout e modelo de caixa CSS", objective: "033" },
      { slug: "034-1-execucao-e-sintaxe-de-javascript", title: "034.1 Execucao e sintaxe de JavaScript" },
      { slug: "034-2-estruturas-de-dados-em-javascript", title: "034.2 Estruturas de dados em JavaScript" },
      { slug: "034-3-estruturas-de-controle-e-funcoes-do-javascript", title: "034.3 Estruturas de controle e funcoes do JavaScript" },
      { slug: "034-4-manipulacao-de-conteudo-e-estilo-de-websites-com-javascript", title: "034.4 Manipulacao de conteudo e estilo de websites com JavaScript" },
      { slug: "035-1-nocoes-basicas-de-node-js", title: "035.1 Nocoes basicas de Node.js" },
      { slug: "035-2-nocoes-basicas-de-nodejs-express", title: "035.2 Nocoes basicas de NodeJS Express" },
      { slug: "035-3-nocoes-basicas-de-sql", title: "035.3 Nocoes basicas de SQL" },
    ],
  },
  {
    code: "050",
    title: "Open Source Essentials",
    description: "Software de codigo aberto -- licencas, modelos de negocio e ferramentas.",
    accent: "terracotta",
    level: "essentials",
    topics: [
      { slug: "051-1-componentes-de-software", title: "051.1 Componentes de software" },
      { slug: "051-2-arquitetura-de-software", title: "051.2 Arquitetura de software" },
      { slug: "051-3-computacao-local-e-em-nuvem", title: "051.3 Computacao local e em nuvem" },
      { slug: "052-1-conceitos-de-licencas-de-software-de-codigo-aberto", title: "052.1 Conceitos de licencas de software de codigo aberto" },
      { slug: "052-2-licencas-de-software-copyleft", title: "052.2 Licensas de software Copyleft" },
      { slug: "052-3-licencas-de-software-permissivas", title: "052.3 Licensas de software permissivas" },
      { slug: "053-1-conceitos-de-licencas-de-conteudo-aberto", title: "053.1 Conceitos de licencas de conteudo aberto" },
      { slug: "053-2-licencas-creative-commons", title: "053.2 Licensas Creative Commons" },
      { slug: "053-3-outras-licencas-de-conteudo-aberto", title: "053.3 Outras licencas de conteudo aberto" },
      { slug: "054-1-modelos-de-negocios-para-desenvolvimento-de-software", title: "054.1 Modelos de negocios para desenvolvimento de software" },
      { slug: "054-2-modelos-de-negocios-para-prestadores-de-servicos", title: "054.2 Modelos de negocios para prestadores de servicos" },
      { slug: "054-3-conformidade-e-reducao-de-riscos", title: "054.3 Conformidade e reducao de riscos" },
      { slug: "055-1-modelos-de-desenvolvimento-de-software", title: "055.1 Modelos de desenvolvimento de software" },
      { slug: "055-2-gestao-de-produtos-gestao-de-lancamentos", title: "055.2 Gestao de produtos - Gestao de lancamentos" },
      { slug: "055-3-gestao-da-comunidade", title: "055.3 Gestao da comunidade" },
      { slug: "056-1-ferramentas-de-desenvolvimento", title: "056.1 Ferramentas de desenvolvimento" },
      { slug: "056-2-gestao-do-codigo-fonte", title: "056.2 Gestao do codigo-fonte" },
      { slug: "056-3-ferramentas-de-comunicacao-e-colaboracao", title: "056.3 Ferramentas de comunicacao e colaboracao" },
    ],
  },
  {
    code: "101",
    title: "LPIC-1 Parte 1",
    description: "Arquitetura do Linux, gestao de pacotes, kernels, boot e filesystems.",
    accent: "terracotta",
    level: "lpic1",
    topics: [
      { slug: "101-1-determinar-e-definir-configuracoes-de-hardware", title: "101.1 Determinar e definir configuracoes de hardware" },
      { slug: "101-2-inicializacao-do-sistema", title: "101.2 Inicializacao do sistema" },
      { slug: "101-3-alterar-niveis-de-execucao-destinos-de-energia", title: "101.3 Alterar niveis de execucao - destinos de energia" },
      { slug: "102-1-definir-o-esquema-de-particoes-do-disco", title: "102.1 Definir o esquema de particoes do disco" },
      { slug: "102-2-instalar-um-gerenciador-de-inicializacao", title: "102.2 Instalar um gerenciador de inicializacao" },
      { slug: "102-3-gerenciar-bibliotecas-compartilhadas", title: "102.3 Gerenciar bibliotecas compartilhadas" },
      { slug: "102-4-gerenciamento-de-pacotes-do-debian", title: "102.4 Gerenciamento de pacotes do Debian" },
      { slug: "102-5-uso-e-gerenciamento-de-pacotes-com-rpm", title: "102.5 Uso e gerenciamento de pacotes com RPM" },
      { slug: "102-6-linux-virtualizado", title: "102.6 Linux virtualizado" },
      { slug: "103-1-trabalho-na-linha-de-comando", title: "103.1 Trabalho na linha de comando" },
      { slug: "103-2-processar-fluxos-de-texto-usando-filtros", title: "103.2 Processar fluxos de texto usando filtros" },
      { slug: "103-3-gerenciamento-basico-de-arquivos", title: "103.3 Gerenciamento basico de arquivos" },
      { slug: "103-4-usando-fluxos-pipes-e-redirecionamentos", title: "103.4 Usando fluxos, pipes e redirecionamentos" },
      { slug: "103-5-criar-monitorar-e-eliminar-processos", title: "103.5 Criar, monitorar e eliminar processos" },
      { slug: "103-6-modificar-prioridades-de-execucao", title: "103.6 Modificar prioridades de execucao" },
      { slug: "103-7-pesquisar-usando-expressoes-regulares", title: "103.7 Pesquisar usando expressoes regulares" },
      { slug: "103-8-edicao-basica-de-arquivos-com-o-vi", title: "103.8 Edicao basica de arquivos com o vi" },
      { slug: "104-1-criar-particoes-e-sistemas-de-arquivos", title: "104.1 Criar particoes e sistemas de arquivos" },
      { slug: "104-2-manutencao-da-integridade-de-sistemas-de-arquivos", title: "104.2 Manutencao da integridade de sistemas de arquivos" },
      { slug: "104-3-controle-da-montagem-e-desmontagem", title: "104.3 Controle da montagem e desmontagem" },
      { slug: "104-5-controlar-permissoes-e-propriedades-de-arquivos", title: "104.5 Controlar permissoes e propriedades de arquivos" },
      { slug: "104-6-criar-e-alterar-links-simbolicos-e-hardlinks", title: "104.6 Criar e alterar links simbolicos e hardlinks" },
      { slug: "104-7-localizacao-de-arquivos-de-sistema", title: "104.7 Localizacao de arquivos de sistema" },
    ],
  },
  {
    code: "102",
    title: "LPIC-1 Parte 2",
    description: "Shell avancado, administracao de sistemas, redes, seguranca e ferramentas GNU.",
    accent: "iris",
    level: "lpic1",
    topics: [
      { slug: "105-1-personalizar-e-trabalhar-no-ambiente-shell", title: "105.1 Personalizar e trabalhar no ambiente shell" },
      { slug: "105-2-editar-e-escrever-scripts-simples", title: "105.2 Editar e escrever scripts simples" },
      { slug: "106-1-instalar-e-configurar-o-x11", title: "106.1 Instalar e configurar o X11" },
      { slug: "106-2-desktops-graficos", title: "106.2 Desktops graficos" },
      { slug: "106-3-acessibilidade", title: "106.3 Acessibilidade" },
      { slug: "107-1-administrar-contas-de-utilizador-grupos-e-ficheiros-de-sistema", title: "107.1 Administrar contas de utilizador, grupos e ficheiros de sistema" },
      { slug: "107-2-automatizar-e-agendar-tarefas-administrativas", title: "107.2 Automatizar e agendar tarefas administrativas" },
      { slug: "107-3-localizacao-e-internacionalizacao", title: "107.3 Localizacao e internacionalizacao" },
      { slug: "108-1-manutencao-da-data-e-hora-do-sistema", title: "108.1 Manutencao da data e hora do sistema" },
      { slug: "108-2-log-do-sistema", title: "108.2 Log do sistema" },
      { slug: "108-3-fundamentos-de-mta-mail-transfer-agent", title: "108.3 Fundamentos de MTA (Mail Transfer Agent)" },
      { slug: "108-4-configurar-impressoras-e-impressao", title: "108.4 Configurar impressoras e impressao" },
      { slug: "109-1-fundamentos-de-protocolos-de-internet", title: "109.1 Fundamentos de protocolos de internet" },
      { slug: "109-2-configuracao-persistente-de-rede", title: "109.2 Configuracao persistente de rede" },
      { slug: "109-3-solucoes-para-problemas-simples-de-rede", title: "109.3 Solucoes para problemas simples de rede" },
      { slug: "109-4-configurar-dns-cliente", title: "109.4 Configurar DNS cliente" },
      { slug: "110-1-tarefas-administrativas-de-seguranca", title: "110.1 Tarefas administrativas de seguranca" },
      { slug: "110-2-configurar-a-seguranca-do-host", title: "110.2 Configurar a seguranca do host" },
      { slug: "110-3-protecao-de-dados-com-criptografia", title: "110.3 Protecao de dados com criptografia" },
    ],
  },
]

export function getManual(code: string): Manual | undefined {
  return manuals.find((m) => m.code === code)
}

export type { TocItem, TopicFrontmatter } from "./topic-loader"
