"""
Test ortamı ayarları — production ayarlarından farklı konfigürasyonlar
"""
from .settings import *

# Test ortamında veritabanı: in-memory SQLite
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Test hızlandırması
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Email backend: in-memory (test e-postaları göndermez)
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

# Şifre doğrulayıcılarını devre dışı bırak (hız)
AUTH_PASSWORD_VALIDATORS = []

# Cache: dummy (her test izole edilir)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

# Logging: devre dışı (test çıktısını temiz tut)
LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'handlers': {},
    'loggers': {},
}

# Güvenlik ayarları: test'te devre dışı
SECURE_SSL_REDIRECT = False
SECURE_HSTS_SECONDS = 0
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# Debug açık
DEBUG = True

print("⚠️ TEST SETTINGS AKTIF - Production için kullanmayın!")
