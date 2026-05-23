from django.conf import settings
from django.db import models


class Report(models.Model):
    REASON_CHOICES = [
        ('spam', 'Spam'),
        ('inappropriate', 'Uygunsuz İçerik'),
        ('harassment', 'Taciz'),
        ('misinformation', 'Yanlış Bilgi'),
        ('other', 'Diğer'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Beklemede'),
        ('resolved', 'Çözüldü'),
        ('dismissed', 'Reddedildi'),
    ]

    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reports_made',
    )
    post = models.ForeignKey(
        'posts.Post',
        on_delete=models.CASCADE,
        related_name='reports',
    )
    reason = models.CharField(max_length=50, choices=REASON_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('reporter', 'post')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
        ]

    def __str__(self):
        return f'{self.reporter} reported post {self.post_id} ({self.status})'


class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('ban', 'Ban'),
        ('unban', 'Unban'),
        ('deactivate', 'Deactivate'),
        ('activate', 'Activate'),
    ]

    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_logs_as_admin',
    )
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    target_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs_as_target',
    )
    target_post = models.ForeignKey(
        'posts.Post',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs',
    )
    detail = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.admin} → {self.action}'
