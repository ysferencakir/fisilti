from django.test import TestCase
from django.utils import timezone
from apps.reports.models import Report, AuditLog
from apps.posts.models import Post
from apps.users.models import User


class ReportModelTests(TestCase):
    def setUp(self):
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

    def test_report_creation(self):
        report = Report.objects.create(
            reporter=self.reporter,
            post=self.post,
            reason='spam'
        )
        self.assertEqual(report.reporter, self.reporter)
        self.assertEqual(report.post, self.post)
        self.assertEqual(report.reason, 'spam')
        self.assertEqual(report.status, 'pending')

    def test_report_status_choices(self):
        report = Report.objects.create(
            reporter=self.reporter,
            post=self.post,
            reason='spam'
        )

        report.status = 'resolved'
        report.save()
        self.assertEqual(report.status, 'resolved')

        report.status = 'dismissed'
        report.save()
        self.assertEqual(report.status, 'dismissed')

    def test_report_timestamp(self):
        before = timezone.now()
        report = Report.objects.create(
            reporter=self.reporter,
            post=self.post,
            reason='spam'
        )
        after = timezone.now()

        self.assertGreaterEqual(report.created_at, before)
        self.assertLessEqual(report.created_at, after)

    def test_report_resolved_at_timestamp(self):
        report = Report.objects.create(
            reporter=self.reporter,
            post=self.post,
            reason='spam'
        )
        self.assertIsNone(report.resolved_at)

        report.status = 'resolved'
        report.resolved_at = timezone.now()
        report.save()

        self.assertIsNotNone(report.resolved_at)

    def test_report_unique_constraint(self):
        Report.objects.create(
            reporter=self.reporter,
            post=self.post,
            reason='spam'
        )

        with self.assertRaises(Exception):
            Report.objects.create(
                reporter=self.reporter,
                post=self.post,
                reason='inappropriate'
            )

    def test_report_reason_choices(self):
        reasons = ['spam', 'inappropriate', 'harassment', 'misinformation', 'other']

        for reason in reasons:
            report = Report.objects.create(
                reporter=self.reporter,
                post=self.post,
                reason=reason
            )
            self.assertEqual(report.reason, reason)


class AuditLogModelTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            email='admin@example.com',
            username='admin',
            password='SecurePass@123',
            role='admin'
        )
        self.user = User.objects.create_user(
            email='user@example.com',
            username='user',
            password='SecurePass@123'
        )
        self.post = Post.objects.create(
            author=self.user,
            content='Test post'
        )

    def test_audit_log_ban_action(self):
        log = AuditLog.objects.create(
            admin=self.admin,
            action='ban',
            target_user=self.user,
            detail='7 day ban'
        )
        self.assertEqual(log.action, 'ban')
        self.assertEqual(log.target_user, self.user)

    def test_audit_log_unban_action(self):
        log = AuditLog.objects.create(
            admin=self.admin,
            action='unban',
            target_user=self.user
        )
        self.assertEqual(log.action, 'unban')

    def test_audit_log_deactivate_action(self):
        log = AuditLog.objects.create(
            admin=self.admin,
            action='deactivate',
            target_post=self.post,
            detail='Inappropriate content'
        )
        self.assertEqual(log.action, 'deactivate')
        self.assertEqual(log.target_post, self.post)

    def test_audit_log_activate_action(self):
        log = AuditLog.objects.create(
            admin=self.admin,
            action='activate',
            target_post=self.post
        )
        self.assertEqual(log.action, 'activate')

    def test_audit_log_timestamp(self):
        before = timezone.now()
        log = AuditLog.objects.create(
            admin=self.admin,
            action='ban',
            target_user=self.user
        )
        after = timezone.now()

        self.assertGreaterEqual(log.created_at, before)
        self.assertLessEqual(log.created_at, after)

    def test_audit_log_ordering(self):
        log1 = AuditLog.objects.create(
            admin=self.admin,
            action='ban',
            target_user=self.user
        )
        log2 = AuditLog.objects.create(
            admin=self.admin,
            action='unban',
            target_user=self.user
        )

        logs = AuditLog.objects.all()
        self.assertEqual(logs[0].id, log2.id)  # Most recent first
        self.assertEqual(logs[1].id, log1.id)
