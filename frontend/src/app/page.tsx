import type { Metadata } from "next"
import { LandingHeader } from "@/components/landing-header"
import { LandingFooter } from "@/components/landing-footer"
import { HeroSection } from "@/components/hero-section"
import { LearnSection } from "@/components/learn-section"
import { PracticeSection } from "@/components/practice-section"
import { CertifySection } from "@/components/certify-section"
import { CommunitySection } from "@/components/community-section"
import { getManuals } from "@/lib/api"

export const metadata: Metadata = {
  title: "Aprende Linux, ao teu ritmo, em português",
  description:
    "A plataforma de aprendizagem de Linux baseada nos manuais oficiais. Estuda, pratica e prepara-te para os exames de certificação LPI com IA interativa e quizzes inteligentes.",
  openGraph: {
    title: "Linux de Camões — Aprende Linux em português",
    description:
      "A plataforma de aprendizagem de Linux baseada nos manuais oficiais, feita para qualquer pessoa que queira aprender Linux, do zero ou até à certificação.",
    type: "website",
  },
}

async function getStats() {
  const [manualsResult, githubResult] = await Promise.allSettled([
    getManuals(),
    fetch("https://api.github.com/repos/linuxdecamoes/linuxdecamoes", {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    }).then((res) => (res.ok ? res.json() : null)),
  ])

  const manuals = manualsResult.status === "fulfilled" ? manualsResult.value : []
  const totalManuais = manuals.length
  const totalTopicos = manuals.reduce((sum, m) => sum + (m.total_topics ?? 0), 0)
  const stars =
    githubResult.status === "fulfilled" && githubResult.value
      ? (githubResult.value.stargazers_count as number)
      : null

  return { totalManuais, totalTopicos, stars }
}

export default async function Home() {
  const stats = await getStats()

  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />

      <main className="flex-1">
        <HeroSection />
        <LearnSection />
        <PracticeSection />
        <CertifySection
          totalManuais={stats.totalManuais}
          totalTopicos={stats.totalTopicos}
          stars={stats.stars}
        />
        <CommunitySection />
      </main>

      <LandingFooter />
    </div>
  )
}
