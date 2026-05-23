from django.test import TestCase
from rest_framework.test import APIClient
from apps.users.models import User
from apps.posts.models import Post
from .models import Report, AuditLog


def make_user(username, email, password='Test1234!', role='user', verified=True):
    user = User.objects.create_user(username=username, email=email, password=password, role=role)
    user.is_email_verified = verified
    user.save()
    return user


def auth_client(user, password='Test1234!'):
    client = APIClient()
    resp = client.post('/api/auth/login/', {'email': user.email, 'password': password}, format='json')
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {resp.data['access']}")
    return client


class ReportTests(TestCase):
    def setUp(self):
        self.reporter = make_user('reporter', 'reporter@example.com')
        self.author = make_user('author', 'author@example.com')
        self.post = Post.objects.create(author=self.author, content='Raporlanacak içerik')
        self.client = auth_client(self.reporter)

    def test_report_post(self):
        resp = self.client.post('/api/reports/', {'post': self.post.id, 'reason': 'spam'}, format='json')
        self.assertEqual(resp.status_code, 201)
        self.assertTrue(Report.objects.filter(reporter=self.reporter, post=self.post).exists())

    def test_duplicate_report_rejected(self):
        Report.objects.create(reporter=self.reporter, post=self.post, reason='spam')
        resp = self.client.post('/api/reports/', {'post': self.post.id, 'reason': 'spam'}, format='json')
        self.assertEqual(resp.status_code, 400)

    def test_unauthenticated_cannot_report(self):
        client = APIClient()
        resp = client.post('/api/reports/', {'post': self.post.id, 'reason': 'spam'}, format='json')
        self.assertIn(resp.status_code, [401, 403])


class AdminTests(TestCase):
    def setUp(self):
        self.admin = make_user('admin', 'admin@example.com', role='admin')
        self.user = make_user('normaluser', 'user@example.com')
        self.post = Post.objects.create(author=self.user, content='Test gönderisi')
        Report.objects.create(reporter=self.admin, post=self.post, reason='spam')
        self.admin_client = auth_client(self.admin)
        self.user_client = auth_client(self.user)

    def test_normal_user_cannot_access_admin(self):
        resp = self.user_client.get('/api/admin/reports/')
        self.assertEqual(resp.status_code, 403)

    def test_admin_can_list_reports(self):
        resp = self.admin_client.get('/api/admin/reports/')
        self.assertEqual(resp.status_code, 200)

    def test_admin_can_deactivate_post(self):
        resp = self.admin_client.post(f'/api/admin/posts/{self.post.id}/deactivate/')
        self.assertEqual(resp.status_code, 200)
        self.post.refresh_from_db()
        self.assertFalse(self.post.is_active)
        self.assertTrue(AuditLog.objects.filter(target_post=self.post, action='deactivate').exists())

    def test_admin_can_activate_post(self):
        self.post.is_active = False
        self.post.save()
        resp = self.admin_client.post(f'/api/admin/posts/{self.post.id}/activate/')
        self.assertEqual(resp.status_code, 200)
        self.post.refresh_from_db()
        self.assertTrue(self.post.is_active)

    def test_admin_can_ban_user(self):
        resp = self.admin_client.post('/api/admin/users/normaluser/ban/', {'duration_days': 7}, format='json')
        self.assertEqual(resp.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_banned)

    def test_admin_cannot_ban_self(self):
        resp = self.admin_client.post('/api/admin/users/admin/ban/', {}, format='json')
        self.assertEqual(resp.status_code, 400)

    def test_last_admin_cannot_be_banned(self):
        resp = self.admin_client.post('/api/admin/users/admin/ban/', {}, format='json')
        self.assertEqual(resp.status_code, 400)

    def test_admin_can_unban_user(self):
        self.user.is_banned = True
        self.user.save()
        resp = self.admin_client.post('/api/admin/users/normaluser/unban/')
        self.assertEqual(resp.status_code, 200)
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_banned)
        self.assertTrue(AuditLog.objects.filter(target_user=self.user, action='unban').exists())

    def test_admin_stats(self):
        resp = self.admin_client.get('/api/admin/stats/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('total_users', resp.data)
        self.assertIn('users_by_country', resp.data)

    def test_post_stats_date_validation(self):
        resp = self.admin_client.get('/api/admin/stats/posts/?start=2025-12-31&end=2025-01-01')
        self.assertEqual(resp.status_code, 400)

    def test_banned_user_token_rejected(self):
        # Ban sonrası mevcut token çalışmamalı
        self.user.is_banned = True
        self.user.save()
        resp = self.user_client.get('/api/users/me/')
        self.assertEqual(resp.status_code, 403)
