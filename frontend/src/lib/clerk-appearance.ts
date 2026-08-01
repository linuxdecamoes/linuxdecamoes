/**
 * Configuracao de aparencia do Clerk partilhada entre sign-in e sign-up.
 * Tokens OKLCH do design system + acessibilidade reforcada.
 */

export const clerkAppearance = {
  variables: {
    colorPrimary: "oklch(0.55 0.20 260)",
    colorText: "oklch(0.13 0.03 260)",
    colorTextSecondary: "oklch(0.45 0.02 260)",
    colorBackground: "oklch(0.99 0.002 250)",
    colorInputBackground: "oklch(0.99 0.002 250)",
    colorInputText: "oklch(0.13 0.03 260)",
    colorInputBorder: "oklch(0.88 0.01 250)",
    colorDanger: "oklch(0.60 0.20 25)",
    colorSuccess: "oklch(0.72 0.10 150)",
    colorWarning: "oklch(0.75 0.15 85)",
    borderRadius: "0.625rem",
    fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
    fontFamilyButtons: "var(--font-inter), Inter, system-ui, sans-serif",
  },
  elements: {
    rootBox: "mx-auto w-full max-w-md",
    card: "shadow-lg border border-border rounded-2xl bg-card",
    headerTitle: "text-foreground text-xl font-bold",
    headerSubtitle: "text-muted-foreground text-sm",
    socialButtonsBlockButton: "border border-border rounded-lg text-foreground hover:bg-muted transition-colors",
    socialButtonsBlockButtonText: "text-foreground font-medium text-sm",
    dividerLine: "bg-border",
    dividerText: "text-muted-foreground text-xs",
    formFieldLabel: "text-foreground text-sm font-medium",
    formFieldInput:
      "border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary transition-colors",
    formFieldInputShowPasswordIcon: "text-muted-foreground",
    formFieldAction: "text-primary text-sm font-medium hover:underline",
    formButtonPrimary:
      "bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shadow-none",
    formFieldErrorText: "text-destructive text-xs",
    formFieldSuccessText: "text-sage text-xs",
    alertText: "text-destructive text-sm",
    alert: "border border-border rounded-lg bg-muted/50",
    footer: "bg-transparent",
    footerActionText: "text-muted-foreground text-sm",
    footerActionLink: "text-primary font-semibold text-sm hover:underline",
    identityPreviewText: "text-foreground",
    identityPreviewEditButton: "text-primary hover:underline",
    otpCodeFieldInput:
      "border border-input rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-ring",
    userButtonBox: "",
    userButtonTrigger: "focus-visible:ring-2 focus-visible:ring-ring rounded-full",
  },
  layout: {
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "iconButton" as const,
    termsPageUrl: "/sobre",
    privacyPageUrl: "/sobre",
    helpPageUrl: "https://github.com/linuxdecamoes",
  },
}
