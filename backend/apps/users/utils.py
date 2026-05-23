import re
import random
import logging
from datetime import timedelta
from django.utils import timezone
from django.core.cache import cache
from .models import LoginAttempt

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

def check_email_verification_throttle(email, max_attempts=5):
    cache_key = f'email_verify_fail:{email}'
    fail_count = cache.get(cache_key, 0)
    return fail_count < max_attempts, fail_count

def record_verify_fail(email, minutes=10):
    cache_key = f'email_verify_fail:{email}'
    try:
        cache.incr(cache_key)
    except ValueError:
        cache.set(cache_key, 1, timeout=minutes * 60)

def mask_email(email):
    """Email adresini güvenlik loglama için maskelenmiş hale getir"""
    if not email or '@' not in email:
        return 'invalid'
    local, domain = email.split('@', 1)
    masked = f"{local[:2]}***@{domain}"
    return masked

def log_security_event(event_type, user=None, email=None, ip_address=None, details=None):
    """Güvenlik olaylarını logla — hassas bilgileri maskelenmiş halde kaydet"""
    msg = f"[{event_type}]"
    if user:
        msg += f" user_id={user.id}"
    if email:
        msg += f" email={mask_email(email)}"
    if ip_address:
        msg += f" ip={ip_address}"
    if details:
        msg += f" {details}"
    logger.warning(msg)
