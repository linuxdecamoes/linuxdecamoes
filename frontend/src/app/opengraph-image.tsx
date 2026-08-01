import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "Linux de Camões — Plataforma de Aprendizagem de Linux"
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1a1a2e",
          backgroundImage:
            "radial-gradient(ellipse at 30% 20%, rgba(74,127,181,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(106,173,140,0.12) 0%, transparent 60%)",
          fontFamily: "Inter",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "#f8f7f4",
              letterSpacing: "-0.02em",
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            Linux de Camões
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 500,
              color: "#a0a0b0",
              textAlign: "center",
              letterSpacing: "-0.01em",
            }}
          >
            Plataforma de Aprendizagem de Linux
          </div>
          <div
            style={{
              marginTop: 32,
              display: "flex",
              gap: 24,
            }}
          >
            <div
              style={{
                fontSize: 18,
                color: "#8ab4d8",
                padding: "8px 24px",
                borderRadius: 9999,
                border: "1px solid rgba(138,180,216,0.3)",
              }}
            >
              Manuais LPI
            </div>
            <div
              style={{
                fontSize: 18,
                color: "#6aad8c",
                padding: "8px 24px",
                borderRadius: 9999,
                border: "1px solid rgba(106,173,140,0.3)",
              }}
            >
              IA Interativa
            </div>
            <div
              style={{
                fontSize: 18,
                color: "#d4956a",
                padding: "8px 24px",
                borderRadius: 9999,
                border: "1px solid rgba(212,149,106,0.3)",
              }}
            >
              Open Source
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  )
}
