import { Header } from "@/components/header"
import { DashboardFooter } from "@/components/dashboard-footer"

export default function ManualsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <DashboardFooter />
    </div>
  )
}
