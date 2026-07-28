"""Update DB topic titles to match the real Vault titles from manuals.ts."""
import asyncio, sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from db.base import async_session
from models.models import Topic, Manual
from sqlalchemy import select

# Mapping: manual_code -> list of (topic_number, real_title)
TITLES = {
    "010": [
        (1, "001.1 A evolucao do Linux e sistemas operacionais populares"),
        (2, "001.2 Principais Aplicacoes Open Source"),
        (3, "001.3 Entendendo o Software Open Source e suas Licensas"),
        (4, "001.4 Habilidades ICT e trabalhando no Linux"),
        (5, "002.1 O basico sobre a linha de comando"),
        (6, "002.2 Usando a linha de comando para conseguir ajuda"),
        (7, "002.3 Usando diretorios e listando arquivos"),
        (8, "002.4 Criando, Movendo e Deletando Arquivos"),
        (9, "003.1 Empacotando arquivos na linha de comando"),
        (10, "003.2 Pesquisando e extraindo dados de arquivos"),
        (11, "003.3 Transformando comandos em Scripts"),
        (12, "004.1 Escolhendo um Sistema Operacional"),
        (13, "004.2 Entendendo o Hardware do Computador"),
        (14, "004.3 Onde os dados sao armazenados"),
        (15, "004.4 Seu Computador na Rede"),
        (16, "005.1 Seguranca Basica e Identificacao de Tipos de Usuarios"),
        (17, "005.2 Criando Usuarios e Grupos"),
        (18, "005.3 Gerenciando permissoes e donos de arquivos"),
        (19, "005.4 Diretorios e arquivos especiais"),
    ],
    "020": [
        (1, "021.1 Objetivos, Funcoes e Atores"),
        (2, "021.2 Avaliacao e Gestao de Riscos"),
        (3, "021.3 Comportamento Etico"),
        (4, "022.1 Criptografia e PKI"),
        (5, "022.2 Criptografia na Web"),
        (6, "022.3 Criptografia de Email"),
        (7, "022.4 Criptografia de Armazenamento"),
        (8, "023.1 Seguranca de Hardware"),
        (9, "023.2 Seguranca de Aplicativos"),
        (10, "023.3 Malware"),
        (11, "023.4 Disponibilidade de Dados"),
        (12, "024.1 Redes, Servicos de Rede e Internet"),
        (13, "024.2 Seguranca de Rede e Internet"),
        (14, "024.3 Criptografia e Anonimato na Rede"),
        (15, "025.1 Identidade e Autenticacao"),
        (16, "025.2 Confidencialidade da Informacao"),
        (17, "025.3 Protecao da Privacidade"),
    ],
    "030": [
        (1, "031.1 Nocoes basicas de desenvolvimento de software"),
        (2, "031.2 Arquitetura de aplicativos web"),
        (3, "031.3 Nocoes basicas de HTTP"),
        (4, "A anatomia do documento HTML"),
        (5, "A semantica do HTML e a hierarquia de documentos"),
        (6, "Referencias e recursos incorporados do HTML"),
        (7, "Formularios HTML"),
        (8, "Nocoes basicas de CSS"),
        (9, "Seletores de CSS e aplicacao de estilo"),
        (10, "Estilizacao com CSS"),
        (11, "Layout e modelo de caixa CSS"),
        (12, "034.1 Execucao e sintaxe de JavaScript"),
        (13, "034.2 Estruturas de dados em JavaScript"),
        (14, "034.3 Estruturas de controle e funcoes do JavaScript"),
        (15, "034.4 Manipulacao de conteudo e estilo de websites com JavaScript"),
        (16, "035.1 Nocoes basicas de Node.js"),
        (17, "035.2 Nocoes basicas de NodeJS Express"),
        (18, "035.3 Nocoes basicas de SQL"),
    ],
    "050": [
        (1, "051.1 Componentes de software"),
        (2, "051.2 Arquitetura de software"),
        (3, "051.3 Computacao local e em nuvem"),
        (4, "052.1 Conceitos de licencas de software de codigo aberto"),
        (5, "052.2 Licensas de software Copyleft"),
        (6, "052.3 Licensas de software permissivas"),
        (7, "053.1 Conceitos de licencas de conteudo aberto"),
        (8, "053.2 Licensas Creative Commons"),
        (9, "053.3 Outras licencas de conteudo aberto"),
        (10, "054.1 Modelos de negocios para desenvolvimento de software"),
        (11, "054.2 Modelos de negocios para prestadores de servicos"),
        (12, "054.3 Conformidade e reducao de riscos"),
        (13, "055.1 Modelos de desenvolvimento de software"),
        (14, "055.2 Gestao de produtos - Gestao de lancamentos"),
        (15, "055.3 Gestao da comunidade"),
        (16, "056.1 Ferramentas de desenvolvimento"),
        (17, "056.2 Gestao do codigo-fonte"),
        (18, "056.3 Ferramentas de comunicacao e colaboracao"),
    ],
    "101": [
        (1, "101.1 Determinar e definir configuracoes de hardware"),
        (2, "101.2 Inicializacao do sistema"),
        (3, "101.3 Alterar niveis de execucao - destinos de energia"),
        (4, "102.1 Definir o esquema de particoes do disco"),
        (5, "102.2 Instalar um gerenciador de inicializacao"),
        (6, "102.3 Gerenciar bibliotecas compartilhadas"),
        (7, "102.4 Gerenciamento de pacotes do Debian"),
        (8, "102.5 Uso e gerenciamento de pacotes com RPM"),
        (9, "102.6 Linux virtualizado"),
        (10, "103.1 Trabalho na linha de comando"),
        (11, "103.2 Processar fluxos de texto usando filtros"),
        (12, "103.3 Gerenciamento basico de arquivos"),
        (13, "103.4 Usando fluxos, pipes e redirecionamentos"),
        (14, "103.5 Criar, monitorar e eliminar processos"),
        (15, "103.6 Modificar prioridades de execucao"),
        (16, "103.7 Pesquisar usando expressoes regulares"),
        (17, "103.8 Edicao basica de arquivos com o vi"),
        (18, "104.1 Criar particoes e sistemas de arquivos"),
        (19, "104.2 Manutencao da integridade de sistemas de arquivos"),
        (20, "104.3 Controle da montagem e desmontagem"),
        (21, "104.5 Controlar permissoes e propriedades de arquivos"),
        (22, "104.6 Criar e alterar links simbolicos e hardlinks"),
        (23, "104.7 Localizacao de arquivos de sistema"),
    ],
    "102": [
        (1, "105.1 Personalizar e trabalhar no ambiente shell"),
        (2, "105.2 Editar e escrever scripts simples"),
        (3, "106.1 Instalar e configurar o X11"),
        (4, "106.2 Desktops graficos"),
        (5, "106.3 Acessibilidade"),
        (6, "107.1 Administrar contas de utilizadores, grupos e ficheiros de sistema"),
        (7, "107.2 Automatizar e agendar tarefas administrativas"),
        (8, "107.3 Localizacao e internacionalizacao"),
        (9, "108.1 Manutencao da data e hora do sistema"),
        (10, "108.2 Log do sistema"),
        (11, "108.3 Fundamentos de MTA (Mail Transfer Agent)"),
        (12, "108.4 Configurar impressoras e impressao"),
        (13, "109.1 Fundamentos de protocolos de internet"),
        (14, "109.2 Configuracao persistente de rede"),
        (15, "109.3 Solucoes para problemas simples de rede"),
        (16, "109.4 Configurar DNS cliente"),
        (17, "110.1 Tarefas administrativas de seguranca"),
        (18, "110.2 Configurar e verificar o SSH"),
        (19, "110.3 Mantendo o sistema seguro"),
    ],
}

async def main():
    async with async_session() as db:
        updated = 0
        for code, topics in TITLES.items():
            manual = (await db.execute(
                select(Manual).where(Manual.code == code)
            )).scalar_one_or_none()
            if not manual:
                print(f"[SKIP] Manual {code} not found")
                continue

            for num, real_title in topics:
                topic = (await db.execute(
                    select(Topic).where(
                        Topic.manual_id == manual.id,
                        Topic.topic_number == num
                    )
                )).scalar_one_or_none()

                if not topic:
                    print(f"[SKIP] {code} T{num} not found")
                    continue

                if topic.title != real_title:
                    old = topic.title
                    topic.title = real_title
                    print(f"[UPD] {code} T{num}: {old} -> {real_title}")
                    updated += 1

        await db.commit()
        print(f"\nDone! Updated {updated} titles.")


if __name__ == "__main__":
    asyncio.run(main())
