# syntax=docker/dockerfile:1
# (BuildKit frontend: necessário para `RUN --mount=type=bind`. É o default em
# Docker moderno, mas a diretiva explícita garante o parser certo.)
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
# VAULT_PATH tem de estar disponível no build para o `generateStaticParams`
# (SSG) encontrar o Vault. O contexto nomeado "vault" vem do `additional_contexts`
# no docker-compose e é montado em /app/Vault apenas durante o `npm run build`.
# Default = /app/Vault (mesmo caminho do mount de runtime).
ARG VAULT_PATH=/app/Vault
ENV VAULT_PATH=$VAULT_PATH
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# syntax directive no topo do ficheiro ativa o parser BuildKit. O mount é
# read-only e só existe durante este RUN: o Vault não entra na imagem final,
# mantendo-a pequena e sem dependência do hospedeiro em runtime.
RUN --mount=type=bind,from=vault,source=.,target=/app/Vault,readonly \
    npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Default de segurança: compose fornece VAULT_PATH em runtime, mas se o
# contentor arrancar sem essa env var, caímos no default correto.
ENV VAULT_PATH=/app/Vault

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]