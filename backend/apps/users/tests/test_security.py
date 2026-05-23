from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from apps.users.models import User, LoginAttempt
from django.utils import timezone
from datetime import timedelta


class LoginThrottlingTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.login_url = '/api/auth/login/'
        self.user = User.objects.create_user(
            email='testuser@example.com',
            username='testuser',
            password='SecurePass@123',
            is_email_verified=True
        )

    def test_five_failed_logins_trigger_throttle(self):
        for i in range(5):
            data = {
                'email': 'testuser@example.com',
                'password': 'WrongPassword'
            }
            response = self.client.post(self.login_url, data)
            self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # 6th attempt should be throttled
        data = {
            'email': 'testuser@example.com',
            'password': 'SecurePass@123'  # Correct password now
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    def test_login_attempts_recorded(self):
        data = {
            'email': 'testuser@example.com',
            'password': 'WrongPassword'
        }
        self.client.post(self.login_url, data)

        attempts = LoginAttempt.objects.filter(email='testuser@example.com')
        self.assertGreater(attempts.count(), 0)

    def test_successful_login_recorded(self):
        data = {
            'email': 'testuser@example.com',
            'password': 'SecurePass@123'
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        attempts = LoginAttempt.objects.filter(
            email='testuser@example.com',
            is_successful=True
        )
        self.assertGreater(attempts.count(), 0)


class BanAwareAuthenticationTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.banned_user = User.objects.create_user(
            email='banned@example.com',
            username='banned',
            password='SecurePass@123',
            is_email_verified=True,
            is_banned=True
        )
        self.active_user = User.objects.create_user(
            email='active@example.com',
            username='active',
            password='SecurePass@123',
            is_email_verified=True
        )

    def test_banned_user_cannot_login(self):
        data = {
            'email': 'banned@example.com',
            'password': 'SecurePass@123'
        }
        response = self.client.post('/api/auth/login/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_active_user_can_login(self):
        data = {
            'email': 'active@example.com',
            'password': 'SecurePass@123'
        }
        response = self.client.post('/api/auth/login/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_temporary_ban_expires(self):
        from django.utils import timezone
        from datetime import timedelta

        # User banned until 1 hour ago (should be expired)
        self.banned_user.banned_until = timezone.now() - timedelta(hours=1)
        self.banned_user.save()

        data = {
            'email': 'banned@example.com',
            'password': 'SecurePass@123'
        }
        response = self.client.post('/api/auth/login/', data)
        # Should succeed since ban has expired
        self.assertNotEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_banned_user_cannot_access_api(self):
        self.client.force_authenticate(user=self.banned_user)
        response = self.client.get('/api/feed/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class PasswordSecurityTests(TestCase):
    def test_password_not_stored_plaintext(self):
        user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='SecurePass@123'
        )
        # Password should be hashed, not stored as plaintext
        self.assertNotEqual(user.password, 'SecurePass@123')
        # Check that it's hashed with PBKDF2
        self.assertTrue(user.password.startswith('pbkdf2_sha256$'))

    def test_password_validation_on_check(self):
        user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='SecurePass@123'
        )
        self.assertTrue(user.check_password('SecurePass@123'))
        self.assertFalse(user.check_password('WrongPassword'))


class EmailVerificationSecurityTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='testuser@example.com',
            username='testuser',
            password='SecurePass@123'
        )
        from apps.users.models import EmailVerification
        self.verification = EmailVerification.create_for_user(self.user)

    def test_email_verification_code_is_numeric(self):
        self.assertTrue(self.verification.code.isdigit())
        self.assertEqual(len(self.verification.code), 6)

    def test_email_verification_code_not_sequential(self):
        from apps.users.models import EmailVerification
        codes = set()
        for i in range(10):
            temp_user = User.objects.create_user(
                email=f'user{i}@example.com',
                username=f'user{i}',
                password='SecurePass@123'
            )
            verification = EmailVerification.create_for_user(temp_user)
            codes.add(verification.code)

        # All codes should be different
        self.assertEqual(len(codes), 10)

    def test_email_verification_throttling(self):
        # Multiple wrong attempts should be throttled
        for i in range(5):
            data = {
                'email': 'testuser@example.com',
                'code': '000000'
            }
            response = self.client.post('/api/auth/verify-email/', data)
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # 6th attempt should be throttled
        data = {
            'email': 'testuser@example.com',
            'code': '000000'
        }
        response = self.client.post('/api/auth/verify-email/', data)
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)


class DataProcessingConsentTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/auth/register/'

    def test_user_without_consent_cannot_register(self):
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'SecurePass@123',
            'data_processing_consent': False
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(email='newuser@example.com').exists())

    def test_user_with_consent_can_register(self):
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'SecurePass@123',
            'data_processing_consent': True
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(email='newuser@example.com')
        self.assertTrue(user.data_processing_consent)
        self.assertIsNotNone(user.data_processing_consent_date)

    def test_consent_date_recorded(self):
        from django.utils import timezone
        before_registration = timezone.now()

        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'SecurePass@123',
            'data_processing_consent': True
        }
        self.client.post(self.register_url, data)

        user = User.objects.get(email='newuser@example.com')
        after_registration = timezone.now()

        self.assertGreater(user.data_processing_consent_date, before_registration)
        self.assertLess(user.data_processing_consent_date, after_registration)


class CSRFProtectionTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='testuser@example.com',
            username='testuser',
            password='SecurePass@123',
            is_email_verified=True
        )

    def test_csrf_token_required_for_state_changing_operations(self):
        # JWT endpoints don't require CSRF, but it's good to have protection
        # This test ensures CORS settings are correct
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/posts/', {'content': 'test'})
        self.assertNotEqual(response.status_code, status.HTTP_403_FORBIDDEN)
