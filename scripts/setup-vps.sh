#!/usr/bin/env bash
# =============================================================================
# Linux de Camoes — Provisionamento inicial da VPS
# =============================================================================
# Corre num VPS Ubuntu/Debian novo. Instala Docker, clona o repo, configura
# .env e sobe os servicos.

set -euo pipefail

# ── Configuracao ──────────────────────────────────────────────────────────
APP_DIR="${APP_DIR:-/opt/linuxdecamoes}"
REPO_URL="${REPO_URL:-https://github.com/linuxdecamoes/linuxdecamoes.git}"
BRANCH="${BRANCH:-master}"

# ── 1. Instalar Docker + Docker Compose ───────────────────────────────────
echo "▶ A instalar Docker e Docker Compose..."
if ! command -v docker &>/dev/null; then
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker "$USER"
    sudo systemctl enable docker
    sudo systemctl start docker
fi

if ! docker compose version &>/dev/null; then
    echo "Docker Compose plugin nao encontrado. A instalar..."
    sudo apt-get update -qq
    sudo apt-get install -y -qq docker-compose-plugin
fi

echo "✅ Docker instalado."

# ── 2. Clonar repositorio ─────────────────────────────────────────────────
echo "▶ A clonar repositorio..."
if [ -d "$APP_DIR" ]; then
    echo "  Ja existe: $APP_DIR — a fazer pull..."
    cd "$APP_DIR"
    git fetch origin
    git checkout "$BRANCH"
    git pull origin "$BRANCH"
else
    sudo mkdir -p "$(dirname "$APP_DIR")"
    sudo chown "$USER:$USER" "$(dirname "$APP_DIR")"
    git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

# ── 3. Criar .env se nao existir ──────────────────────────────────────────
if [ ! -f .env ]; then
    echo "▶ A criar .env a partir de .env.example..."
    cp .env.example .env
    echo "   ⚠️  Edita o ficheiro: $APP_DIR/.env"
    echo "   ⚠️  Adiciona as chaves GROQ_API_KEY, CLERK_SECRET_KEY, etc."
fi

# ── 4. Copiar .env do backend ─────────────────────────────────────────────
if [ -f backend/.env.example ] && [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "   ⚠️  Edita o ficheiro: $APP_DIR/backend/.env"
fi

# ── 5. Copiar .env do frontend ────────────────────────────────────────────
if [ -f frontend/.env.example ] && [ ! -f frontend/.env.local ]; then
    cp frontend/.env.example frontend/.env.local
    echo "   ⚠️  Edita o ficheiro: $APP_DIR/frontend/.env.local"
fi

# ── 6. Garantir que user tem acesso a /var/run/docker.sock ─────────────────
sudo usermod -aG docker "$USER" 2>/dev/null || true

echo ""
echo "=============================================================================="
echo "  Provisionamento concluido."
echo ""
echo "  Agora edita os ficheiros .env com as tuas chaves:"
echo "    $APP_DIR/.env"
echo "    $APP_DIR/backend/.env"
echo "    $APP_DIR/frontend/.env.local"
echo ""
echo "  Depois sobe os servicos:"
echo "    cd $APP_DIR"
echo "    docker compose up --build -d"
echo ""
echo "  E configura os GitHub Secrets (ver README.md)."
echo "=============================================================================="
