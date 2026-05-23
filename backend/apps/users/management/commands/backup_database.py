"""
Django management command — Veritabanı yedeklemesi

Kullanım:
    python manage.py backup_database
    python manage.py backup_database --output /custom/path/backup.sql
"""
import os
import subprocess
from datetime import datetime
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings


class Command(BaseCommand):
    help = 'PostgreSQL veritabanını SQL dosyasına yedekle'

    def add_arguments(self, parser):
        parser.add_argument(
            '--output',
            type=str,
            default=None,
            help='Yedek dosyasının tam yolu (varsayılan: backups/)',
        )

    def handle(self, *args, **options):
        db_config = settings.DATABASES['default']

        if db_config['ENGINE'] not in ['django.db.backends.postgresql', 'django.db.backends.postgresql_psycopg2']:
            raise CommandError('Yedekleme sadece PostgreSQL için desteklenir')

        # Çıktı dizini
        if options['output']:
            output_file = options['output']
        else:
            backup_dir = 'backups'
            os.makedirs(backup_dir, exist_ok=True)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            output_file = os.path.join(backup_dir, f'fisilti_backup_{timestamp}.sql')

        # pg_dump komutu
        try:
            cmd = [
                'pg_dump',
                '--host', db_config.get('HOST', 'localhost'),
                '--port', str(db_config.get('PORT', 5432)),
                '--username', db_config['USER'],
                '--file', output_file,
                db_config['NAME'],
            ]

            # Şifre ortam değişkeni olarak geçilir
            env = os.environ.copy()
            if db_config.get('PASSWORD'):
                env['PGPASSWORD'] = db_config['PASSWORD']

            result = subprocess.run(cmd, env=env, check=True, capture_output=True, text=True)

            file_size = os.path.getsize(output_file) / (1024 * 1024)
            self.stdout.write(
                self.style.SUCCESS(
                    f'✓ Yedekleme tamamlandı: {output_file} ({file_size:.1f} MB)'
                )
            )

        except subprocess.CalledProcessError as e:
            raise CommandError(f'Yedekleme başarısız: {e.stderr}')
        except Exception as e:
            raise CommandError(f'Hata: {str(e)}')
