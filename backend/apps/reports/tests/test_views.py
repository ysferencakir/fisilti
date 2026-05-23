from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from apps.reports.models import Report, AuditLog
from apps.posts.models import Post
from apps.users.models import User


class ReportCreateViewTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.reporter = User.objects.create_user(
            email='reporter@example.com',
            username='reporter',
            password='SecurePass@123',
            is_email_verified=True
        )
        self.author = User.objects.create_user(
            email='author@example.com',
            username='author',
            password='SecurePass@123'
        )
        self.post = Post.objects.create(
            author=self.author,
            content='Test post'
        )
        self.client.force_authenticate(user=self.reporter)

    def test_report_creation_success(self):
        data = {
            'post_id': self.post.id,
            'reason': 'spam'
        }
        response = self.client.post('/api/reports/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        report = Report.objects.get(post=self.post, reporter=self.reporter)
        self.assertEqual(report.reason, 'spam')

    def test_report_all_reason_types(self):
        reasons = ['spam', 'inappropriate', 'harassment', 'misinformation', 'other']

        for i, reason in enumerate(reasons):
            post = Post.objects.create(author=self.author, content=f'Post {i}')
            data = {
                'post_id': post.id,
                'reason': reason
            }
            response = self.client.post('/api/reports/', data)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_report_unverified_user_cannot_report(self):
        unverified_user = User.objects.create_user(
            email='unverified@example.com',
            username='unverified',
            password='SecurePass@123',
            is_email_verified=False
        )
        self.client.force_authenticate(user=unverified_user)

        data = {
            'post_id': self.post.id,
            'reason': 'spam'
        }
        response = self.client.post('/api/reports/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_report_duplicate_prevented(self):
        Report.objects.create(
            reporter=self.reporter,
            post=self.post,
            reason='spam'
        )

        data = {
            'post_id': self.post.id,
            'reason': 'inappropriate'
        }
        response = self.client.post('/api/reports/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_report_non_existent_post(self):
        data = {
            'post_id': 99999,
            'reason': 'spam'
        }
        response = self.client.post('/api/reports/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class AdminReportedPostsViewTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            email='admin@example.com',
            username='admin',
            password='SecurePass@123',
            is_email_verified=True,
            role='admin'
        )
        self.reporter = User.objects.create_user(
            email='reporter@example.com',
            username='reporter',
            password='SecurePass@123',
            is_email_verified=True
        )
        self.author = User.objects.create_user(
            email='author@example.com',
            username='author',
            password='SecurePass@123'
        )
        self.post = Post.objects.create(author=self.author, content='Test post')

        Report.objects.create(
            reporter=self.reporter,
            post=self.post,
            reason='spam',
            status='pending'
        )
        self.client.force_authenticate(user=self.admin)

    def test_admin_can_view_reported_posts(self):
        response = self.client.get('/api/admin/reports/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)

    def test_non_admin_cannot_view_reported_posts(self):
        self.client.force_authenticate(user=self.reporter)
        response = self.client.get('/api/admin/reports/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_filter_by_status_pending(self):
        response = self.client.get('/api/admin/reports/?status=pending')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_filter_by_status_resolved(self):
        response = self.client.get('/api/admin/reports/?status=resolved')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class AdminReportResolveViewTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            email='admin@example.com',
            username='admin',
            password='SecurePass@123',
            role='admin'
        )
        self.reporter = User.objects.create_user(
            email='reporter@example.com',
            username='reporter',
            password='SecurePass@123',
            is_email_verified=True
        )
        self.author = User.objects.create_user(
            email='author@example.com',
            username='author',
            password='SecurePass@123'
        )
        self.post = Post.objects.create(author=self.author, content='Test post')
        self.report = Report.objects.create(
            reporter=self.reporter,
            post=self.post,
            reason='spam',
            status='pending'
        )
        self.client.force_authenticate(user=self.admin)

    def test_admin_resolve_report(self):
        response = self.client.post(f'/api/admin/reports/{self.report.id}/resolve/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.report.refresh_from_db()
        self.assertEqual(self.report.status, 'resolved')
        self.assertIsNotNone(self.report.resolved_at)

    def test_non_admin_cannot_resolve_report(self):
        self.client.force_authenticate(user=self.reporter)
        response = self.client.post(f'/api/admin/reports/{self.report.id}/resolve/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class AdminReportDismissViewTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            email='admin@example.com',
            username='admin',
            password='SecurePass@123',
            role='admin'
        )
        self.reporter = User.objects.create_user(
            email='reporter@example.com',
            username='reporter',
            password='SecurePass@123',
            is_email_verified=True
        )
        self.author = User.objects.create_user(
            email='author@example.com',
            username='author',
            password='SecurePass@123'
        )
        self.post = Post.objects.create(author=self.author, content='Test post')
        self.report = Report.objects.create(
            reporter=self.reporter,
            post=self.post,
            reason='spam',
            status='pending'
        )
        self.client.force_authenticate(user=self.admin)

    def test_admin_dismiss_report(self):
        response = self.client.post(f'/api/admin/reports/{self.report.id}/dismiss/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.report.refresh_from_db()
        self.assertEqual(self.report.status, 'dismissed')
        self.assertIsNotNone(self.report.resolved_at)

    def test_non_admin_cannot_dismiss_report(self):
        self.client.force_authenticate(user=self.reporter)
        response = self.client.post(f'/api/admin/reports/{self.report.id}/dismiss/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class AdminPostDeactivateViewTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            email='admin@example.com',
            username='admin',
            password='SecurePass@123',
            role='admin'
        )
        self.reporter = User.objects.create_user(
            email='reporter@example.com',
            username='reporter',
            password='SecurePass@123',
            is_email_verified=True
        )
        self.author = User.objects.create_user(
            email='author@example.com',
            username='author',
            password='SecurePass@123'
        )
        self.post = Post.objects.create(author=self.author, content='Test post')
        self.report = Report.objects.create(
            reporter=self.reporter,
            post=self.post,
            reason='spam',
            status='pending'
        )
        self.client.force_authenticate(user=self.admin)

    def test_admin_deactivate_post(self):
        response = self.client.post(f'/api/admin/posts/{self.post.id}/deactivate/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.post.refresh_from_db()
        self.assertFalse(self.post.is_active)

    def test_deactivate_marks_reports_resolved(self):
        response = self.client.post(f'/api/admin/posts/{self.post.id}/deactivate/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.report.refresh_from_db()
        self.assertEqual(self.report.status, 'resolved')

    def test_audit_log_created_on_deactivate(self):
        self.client.post(f'/api/admin/posts/{self.post.id}/deactivate/')

        log = AuditLog.objects.get(target_post=self.post)
        self.assertEqual(log.admin, self.admin)
        self.assertEqual(log.action, 'deactivate')
