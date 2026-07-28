import { Header } from "@/components/header"
import { DashboardFooter } from "@/components/dashboard-footer"

export default function ManualsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Atmosfera premium: gradientes radiais sobrepostos + grain SVG.
          Wrapper fixed full-viewport abaixo de todo o conteúdo (z -1). */}
      <div className="premium-atmosphere" aria-hidden />
      <Header />
      <main className="flex-1">{children}</main>
      <DashboardFooter />
    </div>
  )
}
