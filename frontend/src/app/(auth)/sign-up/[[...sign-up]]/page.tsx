import { Suspense } from "react"
import { SignUp } from "@clerk/nextjs"
import { clerkAppearance } from "@/lib/clerk-appearance"
import { AuthCardSkeleton } from "@/components/auth/auth-card-skeleton"

export default function SignUpPage() {
  return (
    <section aria-label="Formulário de criação de conta">
      <Suspense fallback={<AuthCardSkeleton title="Criar Conta" />}>
        <SignUp
          appearance={clerkAppearance}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          forceRedirectUrl="/dashboard"
        />
      </Suspense>
    </section>
  )
}
