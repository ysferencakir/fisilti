from django.test import TestCase, Client
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from apps.users.models import User, EmailVerification
import json


class RegisterViewTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register')

    def test_register_success(self):
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'SecurePass@123',
            'data_processing_consent': True
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='newuser@example.com').exists())

    def test_register_missing_username(self):
        data = {
            'email': 'newuser@example.com',
            'password': 'SecurePass@123',
            'data_processing_consent': True
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_missing_email(self):
        data = {
            'username': 'newuser',
            'password': 'SecurePass@123',
            'data_processing_consent': True
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_weak_password(self):
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'weak',
            'data_processing_consent': True
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_invalid_username(self):
        data = {
            'username': 'ab',  # Too short
            'email': 'newuser@example.com',
            'password': 'SecurePass@123',
            'data_processing_consent': True
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_missing_consent(self):
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'SecurePass@123',
            'data_processing_consent': False
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_email(self):
        User.objects.create_user(
            email='existing@example.com',
            username='existing',
            password='SecurePass@123'
        )
        data = {
            'username': 'newuser',
            'email': 'existing@example.com',
            'password': 'SecurePass@123',
            'data_processing_consent': True
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LoginViewTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.login_url = reverse('login')
        self.user = User.objects.create_user(
            email='testuser@example.com',
            username='testuser',
            password='SecurePass@123',
            is_email_verified=True
        )

    def test_login_success(self):
        data = {
            'email': 'testuser@example.com',
            'password': 'SecurePass@123'
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_wrong_password(self):
        data = {
            'email': 'testuser@example.com',
            'password': 'WrongPassword'
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_non_existent_email(self):
        data = {
            'email': 'nonexistent@example.com',
            'password': 'SecurePass@123'
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_unverified_email(self):
        unverified_user = User.objects.create_user(
            email='unverified@example.com',
            username='unverified',
            password='SecurePass@123',
            is_email_verified=False
        )
        data = {
            'email': 'unverified@example.com',
            'password': 'SecurePass@123'
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_login_banned_user(self):
        banned_user = User.objects.create_user(
            email='banned@example.com',
            username='banned',
            password='SecurePass@123',
            is_email_verified=True,
            is_banned=True
        )
        data = {
            'email': 'banned@example.com',
            'password': 'SecurePass@123'
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class VerifyEmailViewTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.verify_url = reverse('verify-email')
        self.user = User.objects.create_user(
            email='testuser@example.com',
            username='testuser',
            password='SecurePass@123'
        )
        self.verification = EmailVerification.create_for_user(self.user)

    def test_email_verification_success(self):
        data = {
            'email': 'testuser@example.com',
            'code': self.verification.code
        }
        response = self.client.post(self.verify_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertTrue(self.user.is_email_verified)

    def test_email_verification_wrong_code(self):
        data = {
            'email': 'testuser@example.com',
            'code': '000000'
        }
        response = self.client.post(self.verify_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_email_verification_expired_code(self):
        from django.utils import timezone
        from datetime import timedelta

        self.verification.expires_at = timezone.now() - timedelta(minutes=1)
        self.verification.save()

        data = {
            'email': 'testuser@example.com',
            'code': self.verification.code
        }
        response = self.client.post(self.verify_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class MeViewTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.me_url = reverse('me')
        self.user = User.objects.create_user(
            email='testuser@example.com',
            username='testuser',
            password='SecurePass@123',
            is_email_verified=True
        )

    def test_get_me_authenticated(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['email'], 'testuser@example.com')

    def test_get_me_not_authenticated(self):
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_profile_avatar(self):
        self.client.force_authenticate(user=self.user)
        data = {'animal_avatar': 'owl'}
        response = self.client.patch(self.me_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertEqual(self.user.animal_avatar, 'owl')

    def test_update_profile_invalid_avatar(self):
        self.client.force_authenticate(user=self.user)
        data = {'animal_avatar': 'invalid_animal'}
        response = self.client.patch(self.me_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertEqual(self.user.animal_avatar, 'fox')  # Should remain default

    def test_deactivate_account(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertFalse(self.user.is_active)

    def test_cannot_login_deactivated_account(self):
        self.user.is_active = False
        self.user.save()

        login_data = {
            'email': 'testuser@example.com',
            'password': 'SecurePass@123'
        }
        response = self.client.post(reverse('login'), login_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
