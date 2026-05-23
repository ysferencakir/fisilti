from django.utils import timezone
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.authentication import JWTAuthentication


class BanAwareJWTAuthentication(JWTAuthentication):
    """
    Ban ve hesap durumunu her request'te kontrol eder.
    Standart JWTAuthentication'ın üzerine biner; token geçerli olsa bile
    banlı veya pasif kullanıcıya 403 döner.
    """

    def get_user(self, validated_token):
        user = super().get_user(validated_token)

        if not user.is_active:
            raise PermissionDenied('Hesabınız pasife alınmıştır.')

        if user.is_banned:
            if user.banned_until and user.banned_until <= timezone.now():
                # Geçici ban süresi dolmuş — otomatik kaldır
                user.is_banned = False
                user.banned_until = None
                user.save(update_fields=['is_banned', 'banned_until'])
            else:
                raise PermissionDenied('Hesabınız askıya alınmıştır.')

        return user
