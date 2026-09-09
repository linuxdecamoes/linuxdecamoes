/**
 * Configuracao de aparencia do Clerk partilhada entre sign-in e sign-up.
 * Tokens OKLCH do design system + acessibilidade reforcada.
 */

export const clerkAppearance = {
  variables: {
    colorPrimary: "oklch(0.42 0.09 165)",
    colorText: "oklch(0.13 0.03 260)",
    colorTextSecondary: "oklch(0.45 0.02 260)",
    colorBackground: "oklch(0.99 0.002 250)",
    colorInputBackground: "oklch(0.99 0.002 250)",
    colorInputText: "oklch(0.13 0.03 260)",
    colorInputBorder: "oklch(0.88 0.01 250)",
    colorDanger: "oklch(0.60 0.20 25)",
    colorSuccess: "oklch(0.42 0.09 165)",
    colorWarning: "oklch(0.75 0.15 85)",
    borderRadius: "0.25rem",
    // Corpo do formulário em Inter (leitura); botões em mono, como o resto
    // dos CTA do site. A classe font-mono em elements.formButtonPrimary não
    // chega — os estilos internos do Clerk ganham à classe Tailwind.
    fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
    fontFamilyButtons: "var(--font-jetbrains-mono), ui-monospace, monospace",
  },
  elements: {
    rootBox: "mx-auto w-full max-w-md",
    // shadow-none! / rounded-none! com ! porque o Clerk aplica a sua própria
    // sombra e raio com precedência sobre a classe simples.
    card: "shadow-none! rounded-none! border border-border bg-card",
    headerTitle: "font-heading text-foreground text-xl font-bold",
    headerSubtitle: "text-muted-foreground text-sm",
    socialButtonsBlockButton: "border border-border text-foreground hover:border-primary transition-colors",
    socialButtonsBlockButtonText: "text-foreground font-medium text-sm",
    dividerLine: "bg-border",
    dividerText: "text-muted-foreground text-xs",
    formFieldLabel: "text-foreground text-sm font-medium",
    formFieldInput:
      "border border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary transition-colors",
    formFieldInputShowPasswordIcon: "text-muted-foreground",
    formFieldAction: "text-primary text-sm font-medium hover:underline",
    formButtonPrimary:
      "bg-primary text-primary-foreground font-mono font-semibold text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shadow-none",
    formFieldErrorText: "text-destructive-fg text-xs",
    formFieldSuccessText: "text-primary text-xs",
    alertText: "text-destructive-fg text-sm",
    alert: "border border-border bg-muted/50",
    footer: "bg-transparent",
    footerActionText: "text-muted-foreground text-sm",
    footerActionLink: "text-primary font-semibold text-sm hover:underline",
    identityPreviewText: "text-foreground",
    identityPreviewEditButton: "text-primary hover:underline",
    otpCodeFieldInput:
      "border border-input bg-background text-foreground focus-visible:ring-2 focus-visible:ring-ring",
    userButtonBox: "",
    userButtonTrigger: "focus-visible:ring-2 focus-visible:ring-ring",
    userButtonPopoverCard: "border border-border shadow-none",
  },
  layout: {
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "iconButton" as const,
    termsPageUrl: "/sobre",
    privacyPageUrl: "/privacidade",
    helpPageUrl: "https://github.com/linuxdecamoes",
  },
}
