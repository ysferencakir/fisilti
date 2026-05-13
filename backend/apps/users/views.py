from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenBlacklistView, TokenRefreshView
from django.contrib.auth import authenticate
from datetime import timedelta

from .models import User, EmailVerification, PasswordResetToken, LoginAttempt
from .serializers import (
    RegisterSerializer, VerifyEmailSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    UserSerializer, MeSerializer
)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            verification = EmailVerification.create_for_user(user)
            print(f"[DEV] Email: {user.email} Code: {verification.code}")
            return Response({'message': 'Kayit basarili.'}, status=201)
        return Response(serializer.errors, status=400)


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        email = serializer.validated_data['email']
        code = serializer.validated_data['code']

        ten_min_ago = timezone.now() - timedelta(minutes=10)
        fail_count = LoginAttempt.objects.filter(
            email=email,
            attempted_at__gte=ten_min_ago,
            is_successful=False
        ).count()
        if fail_count >= 5:
            return Response({'detail': 'Cok fazla deneme.'}, status=429)

        try:
            user = User.objects.get(email=email)
            verification = EmailVerification.objects.filter(
                user=user, is_used=False
            ).latest('created_at')

            if verification.is_expired:
                LoginAttempt.objects.create(email=email, is_successful=False)
                return Response({'detail': 'Kod suresi dolmus.'}, status=400)

            if verification.code != code:
                LoginAttempt.objects.create(email=email, is_successful=False)
                return Response({'detail': 'Kod hatali.'}, status=400)

            verification.is_used = True
            verification.save()
            user.is_email_verified = True
            user.save()
            LoginAttempt.objects.create(email=email, is_successful=True)
            return Response({'message': 'E-posta dogrulandi.'})

        except (User.DoesNotExist, EmailVerification.DoesNotExist):
            return Response({'detail': 'Gecersiz istek.'}, status=400)


class ResendVerificationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            verification = EmailVerification.create_for_user(user)
            print(f"[DEV] Email: {user.email} New Code: {verification.code}")
            return Response({'message': 'Yeni kod gonderildi.'})
        except User.DoesNotExist:
            return Response({'detail': 'Kullanici bulunamadi.'}, status=404)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        # 1. Throttle check
        fifteen_min_ago = timezone.now() - timedelta(minutes=15)
        fail_count = LoginAttempt.objects.filter(
            email=email,
            attempted_at__gte=fifteen_min_ago,
            is_successful=False
        ).count()
        if fail_count >= 5:
            return Response({'detail': 'Cok fazla hatali deneme.'}, status=429)

        # 2. Authentication
        user = authenticate(request, username=email, password=password)
        if not user:
            LoginAttempt.objects.create(email=email, is_successful=False)
            return Response({'detail': 'E-posta veya sifre hatali.'}, status=401)

        LoginAttempt.objects.create(email=email, is_successful=True)

        # 3. is_active check
        if not user.is_active:
            return Response({'detail': 'Hesabiniz pasife alinmistir.'}, status=403)

        # 4 & 5. Ban check
        if user.is_banned:
            if user.banned_until is None or user.banned_until > timezone.now():
                return Response({'detail': 'Hesabiniz askiya alinmistir.'}, status=403)
            else:
                user.is_banned = False
                user.save()

        # 6. Email verification check
        if not user.is_email_verified:
            return Response({'detail': 'E-postanizi dogrulayin.'}, status=403)

        # 7. Generate JWT token
        refresh = RefreshToken.for_user(user)
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
            user = User.objects.get(email=email)
            token = PasswordResetToken.objects.create(
                user=user,
                expires_at=timezone.now() + timedelta(hours=1)
            )
            reset_link = f"http://localhost:5173/password-reset?token={token.token}"
            print(f"[DEV] Reset link: {reset_link}")
        except User.DoesNotExist:
            pass

        return Response({'message': 'Sifre sifirlama linki gonderildi.'})


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
                return Response({'detail': 'Token daha once kullanildi.'}, status=400)
            if reset_token.expires_at < timezone.now():
                return Response({'detail': 'Token suresi dolmus.'}, status=400)

            user = reset_token.user
            user.set_password(new_password)
            user.save()
            reset_token.is_used = True
            reset_token.save()
            return Response({'message': 'Sifre basariyla guncellendi.'})

        except PasswordResetToken.DoesNotExist:
            return Response({'detail': 'Gecersiz token.'}, status=400)


class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        search = request.query_params.get('search', '')
        users = User.objects.filter(username__icontains=search, is_active=True)
        serializer = UserSerializer(users, many=True, context={'request': request})
        return Response(serializer.data)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = MeSerializer(request.user)
        return Response(serializer.data)


class UserDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
            serializer = UserSerializer(user, context={'request': request})
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({'detail': 'Kullanici bulunamadi.'}, status=404)


class AccountDeactivateView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        user.is_active = False
        user.save()
        return Response({'message': 'Hesabiniz pasife alindi.'})