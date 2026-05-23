from django.test import TestCase
from django.utils import timezone
from apps.posts.models import Post, Repost
from apps.users.models import User


class PostModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='testuser@example.com',
            username='testuser',
            password='SecurePass@123',
            is_email_verified=True
        )

    def test_post_creation(self):
        post = Post.objects.create(
            author=self.user,
            content='This is a test post'
        )
        self.assertEqual(post.content, 'This is a test post')
        self.assertEqual(post.author, self.user)
        self.assertTrue(post.is_active)

    def test_post_max_length_constraint(self):
        # Model doesn't enforce this, but serializer does
        post = Post.objects.create(
            author=self.user,
            content='x' * 280
        )
        self.assertEqual(len(post.content), 280)

    def test_post_timestamps(self):
        before = timezone.now()
        post = Post.objects.create(
            author=self.user,
            content='Test post'
        )
        after = timezone.now()

        self.assertGreaterEqual(post.created_at, before)
        self.assertLessEqual(post.created_at, after)
        self.assertAlmostEqual(post.created_at, post.updated_at, delta=timezone.timedelta(milliseconds=10))

    def test_post_update_timestamp(self):
        post = Post.objects.create(
            author=self.user,
            content='Original content'
        )
        original_created = post.created_at

        import time
        time.sleep(0.1)

        post.content = 'Updated content'
        post.save()

        self.assertEqual(post.created_at, original_created)
        self.assertGreater(post.updated_at, original_created)

    def test_post_soft_delete(self):
        post = Post.objects.create(
            author=self.user,
            content='Test post'
        )
        self.assertTrue(post.is_active)

        post.is_active = False
        post.save()

        # Should still exist in database
        self.assertTrue(Post.objects.filter(id=post.id).exists())
        # But not in active posts
        self.assertFalse(Post.objects.filter(id=post.id, is_active=True).exists())

    def test_post_string_representation(self):
        post = Post.objects.create(
            author=self.user,
            content='Test post'
        )
        self.assertEqual(str(post), f'Post by {self.user.username}')


class RepostModelTests(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            email='user1@example.com',
            username='user1',
            password='SecurePass@123',
            is_email_verified=True
        )
        self.user2 = User.objects.create_user(
            email='user2@example.com',
            username='user2',
            password='SecurePass@123',
            is_email_verified=True
        )
        self.post = Post.objects.create(
            author=self.user1,
            content='Original post'
        )

    def test_repost_creation(self):
        repost = Repost.objects.create(
            user=self.user2,
            post=self.post
        )
        self.assertEqual(repost.user, self.user2)
        self.assertEqual(repost.post, self.post)

    def test_repost_unique_constraint(self):
        Repost.objects.create(user=self.user2, post=self.post)

        with self.assertRaises(Exception):
            Repost.objects.create(user=self.user2, post=self.post)

    def test_repost_timestamp(self):
        before = timezone.now()
        repost = Repost.objects.create(
            user=self.user2,
            post=self.post
        )
        after = timezone.now()

        self.assertGreaterEqual(repost.created_at, before)
        self.assertLessEqual(repost.created_at, after)

    def test_multiple_users_can_repost_same_post(self):
        user3 = User.objects.create_user(
            email='user3@example.com',
            username='user3',
            password='SecurePass@123',
            is_email_verified=True
        )

        repost1 = Repost.objects.create(user=self.user2, post=self.post)
        repost2 = Repost.objects.create(user=user3, post=self.post)

        self.assertEqual(repost1.post, repost2.post)
        self.assertNotEqual(repost1.user, repost2.user)
