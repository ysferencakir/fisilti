from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient
from rest_framework import status

from .models import User, EmailVerification


def make_user(username='testuser', email='test@example.com', password='Test1234!', verified=True, role='user'):
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        role=role,
    )
    user.is_email_verified = verified
    user.save()
    return user


def get_tokens(client, email, password):
    resp = client.post('/api/auth/login/', {'email': email, 'password': password}, format='json')
    return resp.data.get('access'), resp.data.get('refresh')


class RegisterTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_success(self):
        resp = self.client.post('/api/auth/register/', {
            'email': 'new@example.com',
            'username': 'newuser',
            'password': 'Test1234!',
        }, format='json')
        self.assertEqual(resp.status_code, 201)
        self.assertTrue(User.objects.filter(email='new@example.com').exists())

    def test_duplicate_email_rejected(self):
        make_user()
        resp = self.client.post('/api/auth/register/', {
            'email': 'test@example.com',
            'username': 'other',
            'password': 'Test1234!',
        }, format='json')
        self.assertEqual(resp.status_code, 400)

    def test_duplicate_username_rejected(self):
        make_user()
        resp = self.client.post('/api/auth/register/', {
            'email': 'other@example.com',
            'username': 'testuser',
            'password': 'Test1234!',
        }, format='json')
        self.assertEqual(resp.status_code, 400)

    def test_weak_password_rejected(self):
        resp = self.client.post('/api/auth/register/', {
            'email': 'weak@example.com',
            'username': 'weakuser',
            'password': '123',
        }, format='json')
        self.assertEqual(resp.status_code, 400)


class LoginTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user()

    def test_login_success(self):
        resp = self.client.post('/api/auth/login/', {
            'email': 'test@example.com',
            'password': 'Test1234!',
        }, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('access', resp.data)

    def test_wrong_password_rejected(self):
        resp = self.client.post('/api/auth/login/', {
            'email': 'test@example.com',
            'password': 'WrongPass!',
        }, format='json')
        self.assertEqual(resp.status_code, 401)

    def test_unverified_user_blocked(self):
        user = make_user('unverified', 'unverified@example.com', verified=False)
        resp = self.client.post('/api/auth/login/', {
            'email': 'unverified@example.com',
            'password': 'Test1234!',
        }, format='json')
        self.assertEqual(resp.status_code, 403)

    def test_banned_user_blocked(self):
        self.user.is_banned = True
        self.user.save()
        resp = self.client.post('/api/auth/login/', {
            'email': 'test@example.com',
            'password': 'Test1234!',
        }, format='json')
        self.assertEqual(resp.status_code, 403)

    def test_temp_ban_expired_allows_login(self):
        self.user.is_banned = True
        self.user.banned_until = timezone.now() - timedelta(minutes=1)
        self.user.save()
        resp = self.client.post('/api/auth/login/', {
            'email': 'test@example.com',
            'password': 'Test1234!',
        }, format='json')
        self.assertEqual(resp.status_code, 200)
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_banned)


class EmailVerificationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        from django.test.utils import override_settings
        self.user = make_user(verified=False)
        self.verification = EmailVerification.create_for_user(self.user)

    def test_correct_code_verifies(self):
        resp = self.client.post('/api/auth/verify-email/', {
            'email': self.user.email,
            'code': self.verification.code,
        }, format='json')
        self.assertEqual(resp.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_email_verified)

    def test_wrong_code_rejected(self):
        resp = self.client.post('/api/auth/verify-email/', {
            'email': self.user.email,
            'code': '000000',
        }, format='json')
        self.assertEqual(resp.status_code, 400)

    def test_expired_code_rejected(self):
        self.verification.expires_at = timezone.now() - timedelta(minutes=1)
        self.verification.save()
        resp = self.client.post('/api/auth/verify-email/', {
            'email': self.user.email,
            'code': self.verification.code,
        }, format='json')
        self.assertEqual(resp.status_code, 400)

    def test_used_code_rejected(self):
        self.verification.is_used = True
        self.verification.save()
        resp = self.client.post('/api/auth/verify-email/', {
            'email': self.user.email,
            'code': self.verification.code,
        }, format='json')
        self.assertEqual(resp.status_code, 400)
