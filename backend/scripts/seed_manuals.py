"""Seed script: insert LPI manuals and their topics into the database.

Usage: python -m scripts.seed_manuals
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from db.base import async_session
from models.models import Manual, Topic

MANUALS = [
    {
        "code": "010",
        "title": "Linux Essentials",
        "topics": [
            "A evolução do Linux e sistemas operacionais populares",
            "Principais Aplicações Open Source",
            "Entendendo o Software Open Source e suas Licenças",
            "Habilidades ICT e trabalhando no Linux",
            "O básico sobre a linha de comando",
            "Usando a linha de comando para conseguir ajuda",
            "Usando diretórios e listando arquivos",
            "Criando, Movendo e Deletando Arquivos",
            "Empacotando arquivos na linha de comando",
            "Pesquisando e extraindo dados de arquivos",
            "Transformando comandos em Scripts",
            "Escolhendo um Sistema Operacional",
            "Entendendo o Hardware do Computador",
            "Onde os dados são armazenados",
            "Seu Computador na Rede",
            "Segurança Básica e Identificação de Tipos de Usuários",
            "Criando Usuários e Grupos",
            "Gerenciando permissões e donos de arquivos",
            "Diretórios e arquivos especiais",
        ],
    },
    {
        "code": "020",
        "title": "Security Essentials",
        "topics": [
            "021.1 — Objetivos, Funções e Atores",
            "021.2 — Avaliação e Gestão de Riscos",
            "021.3 — Comportamento Ético",
            "022.1 — Criptografia e PKI",
            "022.2 — Criptografia na Web",
            "022.3 — Criptografia de Email",
            "022.4 — Criptografia de Armazenamento",
            "023.1 — Segurança de Hardware",
            "023.2 — Segurança de Aplicativos",
            "023.3 — Malware",
            "023.4 — Disponibilidade de Dados",
            "024.1 — Redes, Serviços de Rede e Internet",
            "024.2 — Segurança de Rede e Internet",
            "024.3 — Criptografia e Anonimato na Rede",
            "025.1 — Identidade e Autenticação",
            "025.2 — Confidencialidade da Informação",
            "025.3 — Proteção da Privacidade",
        ],
    },
    {
        "code": "030",
        "title": "Web Development Essentials",
        "topics": [
            "031.1 — Noções básicas de desenvolvimento de software",
            "031.2 — Arquitetura de aplicativos web",
            "031.3 — Noções básicas de HTTP",
            "A anatomia do documento HTML",
            "A semântica do HTML e a hierarquia de documentos",
            "Referências e recursos incorporados do HTML",
            "Formulários HTML",
            "Noções básicas de CSS",
            "Seletores de CSS e aplicação de estilo",
            "Estilização com CSS",
            "Layout e modelo de caixa CSS",
            "034.1 — Execução e sintaxe de JavaScript",
            "034.2 — Estruturas de dados em JavaScript",
            "034.3 — Estruturas de controle e funções do JavaScript",
            "034.4 — Manipulação de conteúdo e estilo de websites com JavaScript",
            "035.1 — Noções básicas de Node.js",
            "035.2 — Noções básicas de NodeJS Express",
            "035.3 — Noções básicas de SQL",
        ],
    },
    {
        "code": "050",
        "title": "Open Source Essentials",
        "topics": [
            "051.1 — Componentes de software",
            "051.2 — Arquitetura de software",
            "051.3 — Computação local e em nuvem",
            "052.1 — Conceitos de licenças de software de código aberto",
            "052.2 — Licenças de software Copyleft",
            "052.3 — Licenças de software permissivas",
            "053.1 — Conceitos de licenças de conteúdo aberto",
            "053.2 — Licenças Creative Commons",
            "053.3 — Outras licenças de conteúdo aberto",
            "054.1 — Modelos de negócios para desenvolvimento de software",
            "054.2 — Modelos de negócios para prestadores de serviços",
            "054.3 — Conformidade e redução de riscos",
            "055.1 — Modelos de desenvolvimento de software",
            "055.2 — Gestão de produtos-Gestão de lançamentos",
            "055.3 — Gestão da comunidade",
            "056.1 — Ferramentas de desenvolvimento",
            "056.2 — Gestão do código-fonte",
            "056.3 — Ferramentas de comunicação e colaboração",
        ],
    },
    {
        "code": "101",
        "title": "LPIC-1 Parte 1",
        "topics": [
            "101.1 — Determinar e definir configurações de hardware",
            "101.2 — Inicialização do sistema",
            "101.3 — Alterar níveis de execução - destinos de energia",
            "102.1 — Definir o esquema de partições do disco",
            "102.2 — Instalar um gerenciador de inicialização",
            "102.3 — Gerenciar bibliotecas compartilhadas",
            "102.4 — Gerenciamento de pacotes do Debian",
            "102.5 — Uso e gerenciamento de pacotes com RPM",
            "102.6 — Linux virtualizado",
            "103.1 — Trabalho na linha de comando",
            "103.2 — Processar fluxos de texto usando filtros",
            "103.3 — Gerenciamento básico de arquivos",
            "103.4 — Usando fluxos, pipes e redirecionamentos",
            "103.5 — Criar, monitorar e eliminar processos",
            "103.6 — Modificar prioridades de execução",
            "103.7 — Pesquisar usando expressões regulares",
            "103.8 — Edição básica de arquivos com o vi",
            "104.1 — Criar partições e sistemas de arquivos",
            "104.2 — Manutenção da integridade de sistemas de arquivos",
            "104.3 — Controle da montagem e desmontagem",
            "104.5 — Controlar permissões e propriedades de arquivos",
            "104.6 — Criar e alterar links simbólicos e hardlinks",
            "104.7 — Localização de arquivos de sistema",
        ],
    },
    {
        "code": "102",
        "title": "LPIC-1 Parte 2",
        "topics": [
            "105.1 — Personalizar e trabalhar no ambiente shell",
            "105.2 — Editar e escrever scripts simples",
            "106.1 — Instalar e configurar o X11",
            "106.2 — Desktops gráficos",
            "106.3 — Acessibilidade",
            "107.1 — Administrar contas de utilizador, grupos e ficheiros de sistema",
            "107.2 — Automatizar e agendar tarefas administrativas",
            "107.3 — Localização e internacionalização",
            "108.1 — Manutenção da data e hora do sistema",
            "108.2 — Log do sistema",
            "108.3 — Fundamentos de MTA (Mail Transfer Agent)",
            "108.4 — Configurar impressoras e impressão",
            "109.1 — Fundamentos de protocolos de internet",
            "109.2 — Configuração persistente de rede",
            "109.3 — Soluções para problemas simples de rede",
            "109.4 — Configurar DNS cliente",
            "110.1 — Tarefas administrativas de segurança",
            "110.2 — Hosts e controle de acesso",  
            "110.3 — Executar backups",
        ],
    },
]


async def main():
    async with async_session() as db:
        existing = await db.execute(select(Manual))
        if existing.scalars().first():
            print("Manuals already seeded. Skipping.")
            return

        for m_data in MANUALS:
            manual = Manual(
                code=m_data["code"],
                title=m_data["title"],
                total_topics=len(m_data["topics"]),
            )
            db.add(manual)
            await db.flush()
            print(f"  [OK] Manual {manual.code}: {manual.title}")

            for i, title in enumerate(m_data["topics"], 1):
                topic = Topic(
                    manual_id=manual.id,
                    topic_number=i,
                    title=title,
                )
                db.add(topic)

            await db.flush()
            print(f"       -> {len(m_data['topics'])} topics created")

        await db.commit()
        print("\nDone! All manuals and topics seeded.")


if __name__ == "__main__":
    asyncio.run(main())
