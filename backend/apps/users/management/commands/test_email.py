from django.core.management.base import BaseCommand
from apps.users.emails import send_verification_email, send_password_reset_email


class Command(BaseCommand):
    help = 'Test email gönderme işlevini kontrol et'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Test edilecek email adresi')
        parser.add_argument('--type', choices=['verification', 'password_reset'], default='verification',
                          help='Email tipi')

    def handle(self, *args, **options):
        email = options['email']
        email_type = options['type']

        self.stdout.write(f"Email gönderiliyor: {email}")

        if email_type == 'verification':
            result = send_verification_email(email, '123456')
        else:
            result = send_password_reset_email(email, 'http://localhost:5173/password-reset?token=test123')

        if result:
            self.stdout.write(self.style.SUCCESS(f"✅ Email başarıyla gönderildi!"))
        else:
            self.stdout.write(self.style.ERROR(f"❌ Email gönderilemedi. Logs'u kontrol et."))
