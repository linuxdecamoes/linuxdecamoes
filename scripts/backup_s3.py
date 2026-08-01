#!/usr/bin/env python3
# =============================================================================
# Linux de Camoes — Backup S3 (AWS) da base de dados
# =============================================================================
# Faz dump do PostgreSQL e envia para um bucket S3 (AWS / MinIO / Cloudflare R2).
# Este script foi pensado para aprenderes a integrar Python com AWS.
#
# Requisitos: pip install boto3
# Variaveis env: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET
# =============================================================================

import os
import sys
import subprocess
import logging
from datetime import datetime, timedelta, timezone
from pathlib import Path

import boto3
from botocore.exceptions import ClientError

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


class BackupManager:
    def __init__(self) -> None:
        self.app_dir = Path(os.environ.get("APP_DIR", "/opt/linuxdecamoes"))
        self.backup_dir = self.app_dir / "backups"
        self.backup_dir.mkdir(parents=True, exist_ok=True)

        self.db_user = os.environ.get("POSTGRES_USER", "kubeai")
        self.db_name = os.environ.get("POSTGRES_DB", "kubeai")
        self.db_container = os.environ.get("DB_CONTAINER", "linuxdecamoes-db-1")

        self.s3_bucket = os.environ.get("S3_BUCKET", "")
        self.s3_endpoint = os.environ.get("S3_ENDPOINT", None)
        self.retention_days = int(os.environ.get("RETENTION_DAYS", "7"))

        self._s3_client = None

    @property
    def s3_client(self):
        if self._s3_client is None and self.s3_bucket:
            self._s3_client = boto3.client(
                "s3",
                endpoint_url=self.s3_endpoint,
            )
        return self._s3_client

    def dump_database(self) -> Path:
        """Faz pg_dump em formato customizado (-Fc)."""
        timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d_%H%M%S")
        dump_path = self.backup_dir / f"pg_{timestamp}.dump"

        logger.info(f"Dump PostgreSQL: {self.db_name} → {dump_path}")
        subprocess.run(
            [
                "docker", "exec", self.db_container,
                "pg_dump", "-U", self.db_user, "-Fc", self.db_name,
            ],
            stdout=open(dump_path, "wb"),
            check=True,
        )
        size_mb = dump_path.stat().st_size / (1024 * 1024)
        logger.info(f"Dump criado: {dump_path.name} ({size_mb:.1f} MB)")
        return dump_path

    def upload_to_s3(self, filepath: Path) -> bool:
        """Envia o ficheiro de backup para S3."""
        if not self.s3_bucket:
            logger.warning("S3_BUCKET nao definido. A saltar upload S3.")
            return False

        s3_key = f"linuxdecamoes/backups/{filepath.name}"
        logger.info(f"Upload S3: {filepath.name} → s3://{self.s3_bucket}/{s3_key}")

        try:
            self.s3_client.upload_file(
                Filename=str(filepath),
                Bucket=self.s3_bucket,
                Key=s3_key,
            )
            logger.info(f"Upload concluido: s3://{self.s3_bucket}/{s3_key}")
            return True
        except ClientError as exc:
            logger.error(f"Erro no upload S3: {exc}")
            return False

    def clean_old_backups(self) -> int:
        """Remove backups locais mais antigos que retention_days."""
        cutoff = datetime.now(timezone.utc) - timedelta(days=self.retention_days)
        deleted = 0
        for pattern in ["pg_*.dump", "pgdata_*.tar.gz"]:
            for f in self.backup_dir.glob(pattern):
                mtime = datetime.fromtimestamp(f.stat().st_mtime, tz=timezone.utc)
                if mtime < cutoff:
                    logger.info(f"A remover backup antigo: {f.name}")
                    f.unlink()
                    deleted += 1
        return deleted

    def run(self) -> None:
        logger.info("Inicio do backup")
        logger.info(f"Directoria: {self.backup_dir}")
        logger.info(f"S3 bucket: {self.s3_bucket or '(nao configurado)'}")

        dump_path = self.dump_database()

        if self.s3_bucket:
            self.upload_to_s3(dump_path)

        deleted = self.clean_old_backups()
        if deleted:
            logger.info(f"{deleted} backups antigos removidos (retencao: {self.retention_days} dias)")

        logger.info("Backup concluido com sucesso.")
        logger.info(f"Ficheiros em {self.backup_dir}:")
        for f in sorted(self.backup_dir.iterdir()):
            size_mb = f.stat().st_size / (1024 * 1024)
            logger.info(f"  {f.name} ({size_mb:.1f} MB)")


if __name__ == "__main__":
    BackupManager().run()
