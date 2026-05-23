from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from apps.users.models import User, EmailVerification, PasswordResetToken, LoginAttempt


class UserModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='testuser@example.com',
            username='testuser',
            password='SecurePass@123',
            data_processing_consent=True
        )

    def test_user_creation(self):
        self.assertEqual(self.user.email, 'testuser@example.com')
        self.assertEqual(self.user.username, 'testuser')
        self.assertFalse(self.user.is_email_verified)
        self.assertFalse(self.user.is_banned)
        self.assertTrue(self.user.data_processing_consent)

    def test_email_lowercase(self):
        user = User.objects.create_user(
            email='TestUser@EXAMPLE.COM',
            username='testuser2',
            password='SecurePass@123'
        )
        self.assertEqual(user.email, 'testuser@example.com')

    def test_username_lowercase(self):
        user = User.objects.create_user(
            email='test2@example.com',
            username='TestUser',
            password='SecurePass@123'
        )
        self.assertEqual(user.username, 'testuser')

    def test_duplicate_email_raises_error(self):
        with self.assertRaises(Exception):
            User.objects.create_user(
                email='testuser@example.com',
                username='different',
                password='SecurePass@123'
            )

    def test_duplicate_username_raises_error(self):
        with self.assertRaises(Exception):
            User.objects.create_user(
                email='different@example.com',
                username='testuser',
                password='SecurePass@123'
            )

    def test_password_hashing(self):
        self.assertNotEqual(self.user.password, 'SecurePass@123')
        self.assertTrue(self.user.check_password('SecurePass@123'))

    def test_invalid_password_fails(self):
        self.assertFalse(self.user.check_password('WrongPassword'))

    def test_user_role_default(self):
        self.assertEqual(self.user.role, 'user')

    def test_user_ban_functionality(self):
        self.user.is_banned = True
        self.user.banned_until = timezone.now() + timedelta(days=7)
        self.user.save()

        self.assertTrue(self.user.is_banned)
        self.assertIsNotNone(self.user.banned_until)

    def test_user_email_verification(self):
        self.assertFalse(self.user.is_email_verified)
        self.user.is_email_verified = True
        self.user.save()
        self.assertTrue(self.user.is_email_verified)


class EmailVerificationTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='testuser@example.com',
            username='testuser',
            password='SecurePass@123'
        )

    def test_verification_creation(self):
        verification = EmailVerification.create_for_user(self.user)
        self.assertEqual(verification.user, self.user)
        self.assertEqual(len(verification.code), 6)
        self.assertFalse(verification.is_used)

    def test_verification_code_format(self):
        verification = EmailVerification.create_for_user(self.user)
        self.assertTrue(verification.code.isdigit())

    def test_verification_expires_in_10_minutes(self):
        verification = EmailVerification.create_for_user(self.user)
        now = timezone.now()
        difference = (verification.expires_at - now).total_seconds()
        # Should be around 600 seconds (10 minutes), allow 5 second variance
        self.assertGreater(difference, 595)
        self.assertLess(difference, 605)

    def test_verification_is_expired_property(self):
        verification = EmailVerification.create_for_user(self.user)
        self.assertFalse(verification.is_expired)

        # Manually set expiration to past
        verification.expires_at = timezone.now() - timedelta(minutes=1)
        verification.save()
        self.assertTrue(verification.is_expired)

    def test_multiple_verifications_previous_marked_used(self):
        verification1 = EmailVerification.create_for_user(self.user)
        code1 = verification1.code

        verification2 = EmailVerification.create_for_user(self.user)

        verification1.refresh_from_db()
        self.assertTrue(verification1.is_used)
        self.assertFalse(verification2.is_used)
        self.assertNotEqual(code1, verification2.code)


class PasswordResetTokenTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='testuser@example.com',
            username='testuser',
            password='SecurePass@123'
        )

    def test_token_creation(self):
        token = PasswordResetToken.objects.create(
            user=self.user,
            expires_at=timezone.now() + timedelta(hours=1)
        )
        self.assertEqual(token.user, self.user)
        self.assertFalse(token.is_used)

    def test_token_is_uuid(self):
        token = PasswordResetToken.objects.create(
            user=self.user,
            expires_at=timezone.now() + timedelta(hours=1)
        )
        # UUID format check
        self.assertEqual(len(str(token.token)), 36)

    def test_token_expires_in_one_hour(self):
        token = PasswordResetToken.objects.create(
            user=self.user,
            expires_at=timezone.now() + timedelta(hours=1)
        )
        now = timezone.now()
        difference = (token.expires_at - now).total_seconds()
        # Should be around 3600 seconds (1 hour), allow 5 second variance
        self.assertGreater(difference, 3595)
        self.assertLess(difference, 3605)


class LoginAttemptTests(TestCase):
    def test_login_attempt_creation(self):
        attempt = LoginAttempt.objects.create(
            email='testuser@example.com',
            is_successful=True
        )
        self.assertEqual(attempt.email, 'testuser@example.com')
        self.assertTrue(attempt.is_successful)

    def test_failed_login_attempt(self):
        attempt = LoginAttempt.objects.create(
            email='testuser@example.com',
            is_successful=False
        )
        self.assertFalse(attempt.is_successful)

    def test_multiple_login_attempts(self):
        for i in range(5):
            LoginAttempt.objects.create(
                email='testuser@example.com',
                is_successful=False
            )

        attempts = LoginAttempt.objects.filter(email='testuser@example.com')
        self.assertEqual(attempts.count(), 5)
