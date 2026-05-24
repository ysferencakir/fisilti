from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenBlacklistView
from django.contrib.auth import authenticate
from .emails import send_verification_email, send_password_reset_email
from datetime import timedelta
import logging

from .models import User, EmailVerification, PasswordResetToken, LoginAttempt
from .serializers import (
    RegisterSerializer, VerifyEmailSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    UserSerializer, MeSerializer
)
from .utils import check_login_throttle, check_email_verification_throttle, record_verify_fail, log_security_event
from django.conf import settings

logger = logging.getLogger(__name__)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()

                # E-posta doğrulaması gerekli mi?
                if not settings.REQUIRE_EMAIL_VERIFICATION:
                    user.is_email_verified = True
                    user.save()
                    return Response({'message': 'Kayıt başarılı.'}, status=201)

                verification = EmailVerification.create_for_user(user)
                ok = send_verification_email(user.email, verification.code)
                if ok:
                    return Response({'message': 'Kayıt başarılı. Doğrulama kodu e-postanıza gönderildi.'}, status=201)
                else:
                    # E-posta gönderilemedi — DEBUG modunda kodu response'a ekle
                    response_data = {'message': 'Kayıt başarılı.'}
                    if settings.DEBUG:
                        response_data['debug_code'] = verification.code
                    return Response(response_data, status=201)
            except Exception as e:
                logger.error(f"[REGISTER_ERROR] {request.data.get('email', 'unknown')}: {str(e)}", exc_info=True)
                return Response({'detail': 'Kayıt işleminde hata oluştu. Lütfen daha sonra tekrar deneyin.'}, status=500)
        return Response(serializer.errors, status=400)


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        email = serializer.validated_data['email']
        code = serializer.validated_data['code']

        throttle_ok, fail_count = check_email_verification_throttle(email)
        if not throttle_ok:
            log_security_event('EMAIL_VERIFY_THROTTLE', email=email)
            return Response({'detail': 'Çok fazla deneme.'}, status=429)

        try:
            user = User.objects.get(email=email)
            verification = EmailVerification.objects.filter(
                user=user, is_used=False
            ).latest('created_at')

            if verification.is_expired:
                record_verify_fail(email)
                return Response({'detail': 'Kod süresi dolmuş.'}, status=400)

            if verification.code != code:
                record_verify_fail(email)
                _, updated_fail_count = check_email_verification_throttle(email)
                remaining = max(0, 5 - updated_fail_count)
                return Response({'detail': f'Kod hatalı. {remaining} deneme kaldı.'}, status=400)

            verification.is_used = True
            verification.save()
            user.is_email_verified = True
            user.save()
            log_security_event('EMAIL_VERIFIED', user=user)
            return Response({'message': 'E-posta doğrulandı.'})

        except User.DoesNotExist:
            return Response({'detail': 'Geçersiz istek.'}, status=400)
        except EmailVerification.DoesNotExist:
            return Response({'detail': 'Doğrulama kodu bulunamadı.'}, status=400)


class ResendVerificationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'detail': 'E-posta gereklidir.'}, status=400)

        try:
            user = User.objects.get(email=email)
            if user.is_email_verified:
                return Response({'detail': 'E-posta zaten doğrulanmış.'}, status=400)
            verification = EmailVerification.create_for_user(user)
            ok = send_verification_email(user.email, verification.code)
            if ok:
                return Response({'message': 'Yeni kod gönderildi.'})
            else:
                response_data = {'message': 'E-posta gönderilemedi.'}
                if settings.DEBUG:
                    response_data['debug_code'] = verification.code
                return Response(response_data, status=200)
        except User.DoesNotExist:
            return Response({'detail': 'Kullanıcı bulunamadı.'}, status=404)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'detail': 'E-posta ve şifre gereklidir.'}, status=400)

        throttle_ok, _ = check_login_throttle(email)
        if not throttle_ok:
            log_security_event('LOGIN_THROTTLE', email=email)
            return Response({'detail': 'Çok fazla hatalı deneme.'}, status=429)

        user = authenticate(request, username=email, password=password)
        if not user:
            LoginAttempt.objects.create(email=email, is_successful=False)
            log_security_event('LOGIN_FAILED', email=email)
            return Response({'detail': 'E-posta veya şifre hatalı.'}, status=401)

        LoginAttempt.objects.create(email=email, is_successful=True)

        if not user.is_active:
            log_security_event('LOGIN_INACTIVE_ACCOUNT', user=user)
            return Response({'detail': 'Hesabınız pasife alınmıştır.'}, status=403)

        if user.is_banned:
            if user.banned_until and user.banned_until <= timezone.now():
                user.is_banned = False
                user.banned_until = None
                user.save()
            else:
                log_security_event('LOGIN_BANNED_ACCOUNT', user=user)
                return Response({'detail': 'Hesabınız askıya alınmıştır.'}, status=403)

        if not user.is_email_verified:
            return Response({'detail': 'E-postanızı doğrulayın.'}, status=403)

        refresh = RefreshToken.for_user(user)
        log_security_event('LOGIN_SUCCESS', user=user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })


class LogoutView(TokenBlacklistView):
    pass


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email, is_active=True)
            token = PasswordResetToken.objects.create(
                user=user,
                expires_at=timezone.now() + timedelta(hours=1)
            )
            reset_link = f"{settings.PASSWORD_RESET_FRONTEND_URL}?token={token.token}"
            send_password_reset_email(user.email, reset_link)
            log_security_event('PASSWORD_RESET_REQUESTED', user=user)
        except User.DoesNotExist:
            pass  # E-posta yoksa bile aynı yanıtı dön (enum attack'ı önlemek için)

        return Response({'message': 'Şifre sıfırlama linki gönderildi.'})


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']

        try:
            reset_token = PasswordResetToken.objects.get(token=token)
            if reset_token.is_used:
                log_security_event('PASSWORD_RESET_TOKEN_REUSED', email=reset_token.user.email)
                return Response({'detail': 'Token daha önce kullanıldı.'}, status=400)
            if reset_token.expires_at < timezone.now():
                return Response({'detail': 'Token süresi dolmuş.'}, status=400)

            user = reset_token.user
            user.set_password(new_password)
            user.save()
            reset_token.is_used = True
            reset_token.save()
            log_security_event('PASSWORD_RESET_SUCCESS', user=user)
            return Response({'message': 'Şifre başarıyla güncellendi.'})

        except PasswordResetToken.DoesNotExist:
            return Response({'detail': 'Geçersiz token.'}, status=400)


class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        search = request.query_params.get('search', '')[:100]
        users = User.objects.filter(username__icontains=search, is_active=True)[:50]
        serializer = UserSerializer(users, many=True, context={'request': request})
        return Response(serializer.data)


ALLOWED_ANIMALS = {'fox', 'owl', 'rabbit', 'cat'}

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_active:
            return Response({'detail': 'Hesap pasife alınmıştır.'}, status=403)
        serializer = MeSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        user = request.user
        animal = request.data.get('animal_avatar')
        if animal and animal in ALLOWED_ANIMALS:
            user.animal_avatar = animal
            user.save(update_fields=['animal_avatar'])
        serializer = MeSerializer(user)
        return Response(serializer.data)

    def delete(self, request):
        user = request.user
        user.is_active = False
        user.save()
        log_security_event('ACCOUNT_DEACTIVATED', user=user)
        return Response({'message': 'Hesabınız pasife alındı.'})


class UserDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, username):
        try:
            user = User.objects.get(username=username, is_active=True)
            serializer = UserSerializer(user, context={'request': request})
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({'detail': 'Kullanıcı bulunamadı.'}, status=404)



class AccountReactivateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'detail': 'E-posta ve şifre gereklidir.'}, status=400)

        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                if user.is_active:
                    return Response({'detail': 'Hesap zaten aktif.'}, status=400)
                user.is_active = True
                user.save()
                log_security_event('ACCOUNT_REACTIVATED', user=user)
                return Response({'message': 'Hesap yeniden aktif edildi.'})
            else:
                return Response({'detail': 'E-posta veya şifre hatalı.'}, status=401)
        except User.DoesNotExist:
            return Response({'detail': 'Kullanıcı bulunamadı.'}, status=404)


class DebugCorsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({
            'CORS_ALLOWED_ORIGINS': settings.CORS_ALLOWED_ORIGINS,
            'Origin_header': request.META.get('HTTP_ORIGIN'),
            'REQUIRE_EMAIL_VERIFICATION': settings.REQUIRE_EMAIL_VERIFICATION,
            'DEFAULT_FROM_EMAIL': settings.DEFAULT_FROM_EMAIL,
            'DEBUG': settings.DEBUG,
        })
