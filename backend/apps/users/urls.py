from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, VerifyEmailView, ResendVerificationView,
    LoginView, LogoutView,
    PasswordResetRequestView, PasswordResetConfirmView,
    UserListView, MeView, UserDetailView, AccountReactivateView
)

urlpatterns = [
    # Auth
    path('auth/register/', RegisterView.as_view()),
    path('auth/verify-email/', VerifyEmailView.as_view()),
    path('auth/resend-verification/', ResendVerificationView.as_view()),
    path('auth/login/', LoginView.as_view()),
    path('auth/logout/', LogoutView.as_view()),
    path('auth/token/refresh/', TokenRefreshView.as_view()),
    path('auth/password-reset/', PasswordResetRequestView.as_view()),
    path('auth/password-reset/confirm/', PasswordResetConfirmView.as_view()),

    # Users
    path('users/', UserListView.as_view()),
    path('users/me/', MeView.as_view()),
    path('users/reactivate/', AccountReactivateView.as_view()),
    path('users/<str:username>/', UserDetailView.as_view()),
]
