import { Suspense } from "react"
import { SignIn } from "@clerk/nextjs"
import { clerkAppearance } from "@/lib/clerk-appearance"
import { AuthCardSkeleton } from "@/components/auth/auth-card-skeleton"

export default function SignInPage() {
  return (
    <section aria-label="Formulário de início de sessão">
      <Suspense fallback={<AuthCardSkeleton title="Entrar" />}>
        <SignIn
          appearance={clerkAppearance}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          forceRedirectUrl="/dashboard"
        />
      </Suspense>
    </section>
  )
}
