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
