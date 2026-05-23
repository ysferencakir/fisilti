"""
Django management command — Veritabanı geri yükleme

Kullanım:
    python manage.py restore_database /path/to/backup.sql
"""
import subprocess
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings


class Command(BaseCommand):
    help = 'SQL yedek dosyasından PostgreSQL veritabanını geri yükle'

    def add_arguments(self, parser):
        parser.add_argument('backup_file', type=str, help='Yedek dosyasının yolu')

    def handle(self, *args, **options):
        backup_file = options['backup_file']

        db_config = settings.DATABASES['default']

        if db_config['ENGINE'] not in ['django.db.backends.postgresql', 'django.db.backends.postgresql_psycopg2']:
            raise CommandError('Geri yükleme sadece PostgreSQL için desteklenir')

        # Onay iste
        response = input(
            f'⚠️  UYARI: Mevcut veritabanı "{db_config["NAME"]}" silinecek ve yerine konacaktır.\n'
            'Devam etmek istediğinize emin misiniz? (yes/no): '
        )
        if response.lower() != 'yes':
            self.stdout.write(self.style.WARNING('İşlem iptal edildi.'))
            return

        try:
            # Veritabanını sıfırla (bağlantıları kapat, veritabanını sil, yeni oluştur)
            drop_cmd = [
                'psql',
                '--host', db_config.get('HOST', 'localhost'),
                '--port', str(db_config.get('PORT', 5432)),
                '--username', db_config['USER'],
                '--command', f"DROP DATABASE IF EXISTS {db_config['NAME']};",
            ]

            create_cmd = [
                'psql',
                '--host', db_config.get('HOST', 'localhost'),
                '--port', str(db_config.get('PORT', 5432)),
                '--username', db_config['USER'],
                '--command', f"CREATE DATABASE {db_config['NAME']};",
            ]

            # Geri yükle
            restore_cmd = [
                'psql',
                '--host', db_config.get('HOST', 'localhost'),
                '--port', str(db_config.get('PORT', 5432)),
                '--username', db_config['USER'],
                db_config['NAME'],
                '--file', backup_file,
            ]

            import os
            env = os.environ.copy()
            if db_config.get('PASSWORD'):
                env['PGPASSWORD'] = db_config['PASSWORD']

            self.stdout.write('Veritabanı sıfırlanıyor...')
            subprocess.run(drop_cmd, env=env, check=True, capture_output=True)
            subprocess.run(create_cmd, env=env, check=True, capture_output=True)

            self.stdout.write('Yedek geri yükleniyor...')
            subprocess.run(restore_cmd, env=env, check=True, capture_output=True)

            self.stdout.write(
                self.style.SUCCESS(f'✓ Geri yükleme tamamlandı: {backup_file}')
            )

        except subprocess.CalledProcessError as e:
            raise CommandError(f'Geri yükleme başarısız: {e.stderr}')
        except Exception as e:
            raise CommandError(f'Hata: {str(e)}')
