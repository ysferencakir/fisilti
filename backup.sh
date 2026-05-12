#!/bin/bash
# Fısıltı PostgreSQL yedekleme scripti
# Günlük cron için: 0 2 * * * cd /path/to/fisilti && bash backup.sh >> /var/log/fisilti_backup.log 2>&1

set -e

mkdir -p backups

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backups/backup_${DATE}.sql"

docker compose exec -T db pg_dump -U fisilti_user fisilti > "$BACKUP_FILE"

echo "[$(date)] Yedek alındı: $BACKUP_FILE"

# 30 günden eski yedekleri sil
find backups/ -name "backup_*.sql" -mtime +30 -delete
