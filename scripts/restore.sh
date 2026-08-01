#!/usr/bin/env bash
# =============================================================================
# Linux de Camoes — Restauro de backup PostgreSQL
# =============================================================================
# Restaura um backup .dump (pg_dump formato customizado).
#
# Uso:  ./scripts/restore.sh backups/pg_2026-07-31_120000.dump
# =============================================================================

set -euo pipefail

if [ $# -lt 1 ]; then
    echo "Uso: $0 <ficheiro.dump>"
    echo "Exemplo: $0 backups/pg_2026-07-31_120000.dump"
    exit 1
fi

DUMP_FILE="$1"
APP_DIR="${APP_DIR:-/opt/linuxdecamoes}"
CONTAINER_NAME="${DB_CONTAINER:-linuxdecamoes-db-1}"

if [ ! -f "$DUMP_FILE" ]; then
    echo "❌ Ficheiro nao encontrado: $DUMP_FILE"
    exit 1
fi

if [ -f "$APP_DIR/.env" ]; then
    set -a
    source "$APP_DIR/.env"
    set +a
fi

DB_USER="${POSTGRES_USER:-kubeai}"
DB_NAME="${POSTGRES_DB:-kubeai}"

echo "⚠️  Isto vai SOBRESCREVER a base de dados '$DB_NAME'."
read -r -p "Tens a certeza? [s/N] " answer
if [ "$answer" != "s" ] && [ "$answer" != "S" ]; then
    echo "Cancelado."
    exit 0
fi

echo "▶ A restaurar $DUMP_FILE → $DB_NAME..."
docker exec -i "$CONTAINER_NAME" pg_restore -U "$DB_USER" -d "$DB_NAME" --clean --if-exists < "$DUMP_FILE"

echo "✅ Restauro concluido."
