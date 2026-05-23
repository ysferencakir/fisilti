from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from apps.users.models import User
from apps.users.permissions import IsEmailVerified


class IsEmailVerifiedPermissionTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.verified_user = User.objects.create_user(
            email='verified@example.com',
            username='verified',
            password='SecurePass@123',
            is_email_verified=True
        )
        self.unverified_user = User.objects.create_user(
            email='unverified@example.com',
            username='unverified',
            password='SecurePass@123',
            is_email_verified=False
        )

    def test_verified_user_can_access_protected_endpoint(self):
        # Test with follow endpoint which requires IsEmailVerified
        self.client.force_authenticate(user=self.verified_user)
        response = self.client.post(f'/api/users/{self.unverified_user.username}/follow/')
        # Should not get 403 Forbidden due to email verification
        self.assertNotEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unverified_user_cannot_access_protected_endpoint(self):
        # Test with follow endpoint which requires IsEmailVerified
        self.client.force_authenticate(user=self.unverified_user)
        response = self.client.post(f'/api/users/{self.verified_user.username}/follow/')
        # Should get 403 Forbidden due to email not being verified
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_permission_checks_on_post_creation(self):
        # Posts also require email verification
        self.client.force_authenticate(user=self.unverified_user)
        data = {'content': 'Test post'}
        response = self.client.post('/api/posts/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_verified_user_can_create_posts(self):
        self.client.force_authenticate(user=self.verified_user)
        data = {'content': 'Test post by verified user'}
        response = self.client.post('/api/posts/', data)
        self.assertNotEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unverified_user_cannot_report(self):
        # Reports also require email verification
        self.client.force_authenticate(user=self.unverified_user)

        # First create a post with verified user
        post = self._create_post_with_user(self.verified_user)

        # Try to report with unverified user
        data = {'post_id': post.id, 'reason': 'spam'}
        response = self.client.post('/api/reports/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def _create_post_with_user(self, user):
        from apps.posts.models import Post
        return Post.objects.create(
            author=user,
            content='Test post'
        )
