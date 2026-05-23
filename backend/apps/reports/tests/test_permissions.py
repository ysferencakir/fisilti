from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from apps.users.models import User


class IsAdminPermissionTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_user(
            email='admin@example.com',
            username='admin',
            password='SecurePass@123',
            role='admin'
        )
        self.regular_user = User.objects.create_user(
            email='user@example.com',
            username='user',
            password='SecurePass@123'
        )

    def test_admin_can_access_admin_endpoints(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/admin/users/')
        self.assertNotEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_regular_user_cannot_access_admin_endpoints(self):
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get('/api/admin/users/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_cannot_access_admin(self):
        response = self.client.get('/api/admin/users/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_can_access_reports(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/admin/reports/')
        self.assertNotEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_access_stats(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/admin/stats/')
        self.assertNotEqual(response.status_code, status.HTTP_403_FORBIDDEN)
