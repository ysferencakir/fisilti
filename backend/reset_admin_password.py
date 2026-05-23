import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fisilti.settings')
django.setup()

from apps.users.models import User
import secrets
import string

alphabet = string.ascii_letters + string.digits + '!@#$%^&*'
new_password = ''.join(secrets.choice(alphabet) for i in range(16))

try:
    user = User.objects.get(username='admin')
    user.set_password(new_password)
    user.save()
    print(f'Admin sifresi sifirland: {new_password}')
except User.DoesNotExist:
    print('Admin kullanicisi bulunamadi')
    admins = User.objects.filter(role='admin')
    if admins.exists():
        for u in admins:
            print(f'Admin bulundu: {u.username} ({u.email})')
    else:
        print('Veritabaninda admin yok')
