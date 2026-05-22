from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid
from django.utils import timezone
import random


ANIMAL_CHOICES = [
    ('fox',    'Fennec'),
    ('owl',    'Baykuş'),
    ('rabbit', 'Tavşan'),
    ('cat',    'Kedi'),
]

class User(AbstractUser):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=50, unique=True)
    role = models.CharField(max_length=20, default='user')
    is_email_verified = models.BooleanField(default=False)
    is_banned = models.BooleanField(default=False)
    banned_until = models.DateTimeField(null=True, blank=True)
    country = models.CharField(max_length=100, blank=True)
    ad_soyad = models.CharField(max_length=100, blank=True)
    animal_avatar = models.CharField(max_length=10, choices=ANIMAL_CHOICES, default='fox')
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'kullanicilar'


class EmailVerification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    @classmethod
    def create_for_user(cls, user):
        cls.objects.filter(user=user, is_used=False).update(is_used=True)
        code = str(random.randint(100000, 999999))
        expires_at = timezone.now() + timezone.timedelta(minutes=10)
        return cls.objects.create(user=user, code=code, expires_at=expires_at)

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at

    class Meta:
        db_table = 'eposta_dogrulamalari'
        indexes = [
            models.Index(fields=['user', 'is_used']),
        ]


class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sifre_sifirlama_tokenlari'


class LoginAttempt(models.Model):
    email = models.EmailField()
    attempted_at = models.DateTimeField(auto_now_add=True)
    is_successful = models.BooleanField(default=False)

    class Meta:
        db_table = 'giris_denemeleri'
        indexes = [
            models.Index(fields=['email', 'attempted_at']),
        ]