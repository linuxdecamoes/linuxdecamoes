#!/usr/bin/env bash
# =============================================================================
# Linux de Camoes — Backup da base de dados e volumes
# =============================================================================
# Faz dump do PostgreSQL e guarda os ficheiros de backup com timestamp.
# Corre na VPS. Pode ser chamado via cron para backups diarios.
#
# Uso:  ./scripts/backup.sh
# Cron: 0 3 * * * /opt/linuxdecamoes/scripts/backup.sh >> /var/log/linuxdecamoes-backup.log 2>&1
# =============================================================================

set -euo pipefail

APP_DIR="${APP_DIR:-/opt/linuxdecamoes}"
BACKUP_DIR="${BACKUP_DIR:-$APP_DIR/backups}"
TIMESTAMP=$(date +%Y-%m-%d_%H%M%S)
RETENTION_DAYS="${RETENTION_DAYS:-7}"

# ── Carregar variaveis do .env ─────────────────────────────────────────────
if [ -f "$APP_DIR/.env" ]; then
    set -a
    source "$APP_DIR/.env"
    set +a
fi

DB_USER="${POSTGRES_USER:-kubeai}"
DB_NAME="${POSTGRES_DB:-kubeai}"
CONTAINER_NAME="${DB_CONTAINER:-linuxdecamoes-db-1}"

mkdir -p "$BACKUP_DIR"

# ── Dump da base de dados PostgreSQL ──────────────────────────────────────
echo "[${TIMESTAMP}] ▶ Backup PostgreSQL: $DB_NAME"
docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" -Fc "$DB_NAME" \
    > "$BACKUP_DIR/pg_${TIMESTAMP}.dump"

echo "[${TIMESTAMP}]    Ficheiro: pg_${TIMESTAMP}.dump"
echo "[${TIMESTAMP}]    Tamanho: $(du -h "$BACKUP_DIR/pg_${TIMESTAMP}.dump" | cut -f1)"

# ── Backup do volume pgdata (binario) ─────────────────────────────────────
echo "[${TIMESTAMP}] ▶ Backup volume pgdata..."
docker run --rm \
    -v linuxdecamoes_pgdata:/pgdata:ro \
    -v "$BACKUP_DIR":/backup \
    alpine tar czf "/backup/pgdata_${TIMESTAMP}.tar.gz" -C /pgdata .

echo "[${TIMESTAMP}]    Ficheiro: pgdata_${TIMESTAMP}.tar.gz"
echo "[${TIMESTAMP}]    Tamanho: $(du -h "$BACKUP_DIR/pgdata_${TIMESTAMP}.tar.gz" | cut -f1)"

# ── Limpeza de backups antigos ────────────────────────────────────────────
echo "[${TIMESTAMP}] ▶ A limpar backups com mais de ${RETENTION_DAYS} dias..."
find "$BACKUP_DIR" -name "pg_*.dump" -mtime "+${RETENTION_DAYS}" -delete 2>/dev/null || true
find "$BACKUP_DIR" -name "pgdata_*.tar.gz" -mtime "+${RETENTION_DAYS}" -delete 2>/dev/null || true

echo "[${TIMESTAMP}] ✅ Backup concluido."
echo "[${TIMESTAMP}]    Backups em: $BACKUP_DIR"
ls -lh "$BACKUP_DIR"
