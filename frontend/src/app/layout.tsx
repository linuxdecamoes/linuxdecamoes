import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, JetBrains_Mono, Merriweather, Fira_Code } from "next/font/google";
import { SplashScreen } from "@/components/splash-screen";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://linuxdecamoes.pt";
const SITE_NAME = "Linux de Camões";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f7f4" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a2e" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Plataforma de Aprendizagem de Linux`,
    template: `%s — ${SITE_NAME}`,
  },
  description:
    "Plataforma open-source de aprendizagem de Linux baseada nos manuais oficiais de certificação LPI. Estuda, pratica com IA interativa e prepara-te para os exames com quizzes inteligentes.",
  keywords: [
    "Linux", "LPI", "certificação Linux", "LPIC-1", "Linux Essentials",
    "aprendizagem Linux", "comandos Linux", "administração sistemas",
    "open source", "sysadmin", "DevOps", "RAG", "IA", "quizzes Linux",
    "formação Linux", "Linux Professional Institute",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Plataforma de Aprendizagem de Linux`,
    description:
      "Plataforma open-source de aprendizagem de Linux baseada nos manuais oficiais de certificação LPI. Estuda, pratica com IA interativa e prepara-te para os exames com quizzes inteligentes.",
    url: SITE_URL,
    locale: "pt_PT",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Plataforma de Aprendizagem de Linux`,
    description:
      "Plataforma open-source de aprendizagem de Linux baseada nos manuais oficiais de certificação LPI.",
    images: ["/opengraph-image"],
    creator: "@linuxdecamoes",
    site: "@linuxdecamoes",
  },
  category: "education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Plataforma open-source de aprendizagem de Linux baseada nos manuais oficiais de certificação LPI.",
    inLanguage: "pt-PT",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/manuals?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <ClerkProvider>
      <html
        lang="pt"
        className={`${inter.variable} ${jetbrainsMono.variable} ${merriweather.variable} ${firaCode.variable} h-full`}
      >
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `try{if(sessionStorage.getItem('ldc:splash-shown'))document.documentElement.setAttribute('data-splash','skip')}catch(e){}`,
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </head>
        <body className="min-h-full flex flex-col antialiased">
          <SplashScreen />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
