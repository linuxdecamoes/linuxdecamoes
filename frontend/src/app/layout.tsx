import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, JetBrains_Mono, Merriweather, Fira_Code } from "next/font/google";
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

// Metadados da aplicação (SEO / social) — PT-PT
export const metadata: Metadata = {
  title: "Linux de Camões — Plataforma de Aprendizagem de Linux",
  description: "Plataforma de aprendizagem interativa de Linux com IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="pt"
        className={`${inter.variable} ${jetbrainsMono.variable} ${merriweather.variable} ${firaCode.variable} h-full`}
      >
        <body className="min-h-full flex flex-col antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
