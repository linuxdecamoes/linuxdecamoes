"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function NotFoundTerminal() {
  const pathname = usePathname()
  const [typed, setTyped] = useState("")
  const [showError, setShowError] = useState(false)

  const command = `cd ${pathname || "/"}`

  useEffect(() => {
    setTyped("")
    setShowError(false)

    let i = 0
    const typeTimer = setInterval(() => {
      i += 1
      setTyped(command.slice(0, i))
      if (i >= command.length) {
        clearInterval(typeTimer)
        setTimeout(() => setShowError(true), 300)
      }
    }, 35)

    return () => clearInterval(typeTimer)
  }, [command])

  return (
    <div
      className="hero-grid-bg relative mx-auto w-full max-w-lg overflow-hidden border border-border bg-card-dark"
      aria-hidden="true"
    >
      <div className="relative z-10 flex flex-col gap-2 px-6 py-6 font-mono text-sm text-white/80">
        <div>
          <span className="text-primary">$</span> {typed}
          {typed.length < command.length && (
            <span style={{ animation: "blink 1s step-end infinite" }}>_</span>
          )}
        </div>
        {showError && (
          <>
            <div className="text-red-400" style={{ animation: "slideUp 0.3s ease-out both" }}>
              bash: cd: {pathname || "/"}: No such file or directory
            </div>
            <div className="text-white/40" style={{ animation: "slideUp 0.3s ease-out 0.1s both" }}>
              <span style={{ animation: "blink 1s step-end infinite" }}>_</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
