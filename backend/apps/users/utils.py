import re
import random
import logging
from datetime import timedelta
from django.utils import timezone
from .models import EmailVerification, LoginAttempt

logger = logging.getLogger(__name__)

def validate_username(username):
    if not re.match(r'^[a-zA-Z0-9_]{3,50}$', username):
        return False, 'Kullanıcı adı sadece harf, rakam ve _ içerebilir (3-50 karakter)'
    return True, None

def validate_password_strength(password):
    if len(password) < 8:
        return False, 'Şifre en az 8 karakter olmalıdır'
    if not re.search(r'[A-Z]', password):
        return False, 'Şifre en az bir büyük harf içermelidir'
    if not re.search(r'[a-z]', password):
        return False, 'Şifre en az bir küçük harf içermelidir'
    if not re.search(r'[0-9]', password):
        return False, 'Şifre en az bir rakam içermelidir'
    return True, None

def check_login_throttle(email, minutes=15, max_attempts=5):
    cutoff = timezone.now() - timedelta(minutes=minutes)
    fail_count = LoginAttempt.objects.filter(
        email=email,
        attempted_at__gte=cutoff,
        is_successful=False
    ).count()
    return fail_count < max_attempts, fail_count

def check_email_verification_throttle(email, minutes=10, max_attempts=5):
    cutoff = timezone.now() - timedelta(minutes=minutes)
    fail_count = EmailVerification.objects.filter(
        user__email=email,
        created_at__gte=cutoff,
        is_used=False
    ).exclude(code__isnull=True).count()
    return fail_count < max_attempts, fail_count

def log_security_event(event_type, user=None, email=None, ip_address=None, details=None):
    msg = f"[{event_type}]"
    if user:
        msg += f" user_id={user.id}"
    if email:
        msg += f" email={email}"
    if ip_address:
        msg += f" ip={ip_address}"
    if details:
        msg += f" {details}"
    logger.warning(msg)
