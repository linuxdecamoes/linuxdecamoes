/**
 * Schemas de validacao client-side para fluxos de autenticacao.
 * Defesa em profundidade: mesmo com Clerk a validar no servidor,
 * interceptamos erros comuns no cliente para feedback imediato.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_MIN = 8
const NAME_MIN = 2
const NAME_MAX = 100

export type ValidationResult = { valid: true } | { valid: false; error: string }

function sanitize(input: string): string {
  return input.trim().replace(/<[^>]*>/g, "")
}

export function validateEmail(email: string): ValidationResult {
  const cleaned = sanitize(email)
  if (!cleaned) {
    return { valid: false, error: "O email é obrigatório." }
  }
  if (cleaned.length > 254) {
    return { valid: false, error: "O email é demasiado longo." }
  }
  if (!EMAIL_RE.test(cleaned)) {
    return { valid: false, error: "Formato de email inválido." }
  }
  return { valid: true }
}

export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { valid: false, error: "A palavra-passe é obrigatória." }
  }
  if (password.length < PASSWORD_MIN) {
    return { valid: false, error: `A palavra-passe deve ter pelo menos ${PASSWORD_MIN} caracteres.` }
  }
  if (password.length > 128) {
    return { valid: false, error: "A palavra-passe é demasiado longa." }
  }
  return { valid: true }
}

export function validateName(name: string): ValidationResult {
  const cleaned = sanitize(name)
  if (!cleaned) {
    return { valid: false, error: "O nome é obrigatório." }
  }
  if (cleaned.length < NAME_MIN) {
    return { valid: false, error: `O nome deve ter pelo menos ${NAME_MIN} caracteres.` }
  }
  if (cleaned.length > NAME_MAX) {
    return { valid: false, error: "O nome é demasiado longo." }
  }
  return { valid: true }
}

export function sanitizeInput(input: string): string {
  return sanitize(input)
}
