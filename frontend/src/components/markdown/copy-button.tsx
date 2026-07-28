"use client"

import { useState, useCallback } from "react"
import { Copy, Check } from "lucide-react"

type CopyButtonProps = {
  value: string
  label?: string
  copiedLabel?: string
  className?: string
}

export function CopyButton({
  value,
  label = "Copiar",
  copiedLabel = "Copiado!",
  className = "",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard indisponível (HTTPS exigido); silencioso
    }
  }, [value])

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-live="polite"
      aria-label={copied ? copiedLabel : label}
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors ${className}`}
    >
      {copied ? (
        <Check
          className="h-3.5 w-3.5"
          style={{ animation: "copy-feedback 0.3s ease" }}
          aria-hidden
        />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden />
      )}
      <span>{copied ? copiedLabel : label}</span>
    </button>
  )
}
