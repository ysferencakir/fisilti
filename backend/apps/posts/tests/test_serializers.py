from django.test import TestCase
from apps.posts.serializers import PostSerializer
from apps.posts.models import Post
from apps.users.models import User


class PostSerializerTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='testuser@example.com',
            username='testuser',
            password='SecurePass@123',
            is_email_verified=True
        )

    def test_post_serializer_valid_data(self):
        data = {
            'author_id': self.user.id,
            'content': 'Valid test post'
        }
        serializer = PostSerializer(data=data)
        self.assertTrue(serializer.is_valid())

    def test_post_serializer_empty_content(self):
        data = {
            'author_id': self.user.id,
            'content': ''
        }
        serializer = PostSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('content', serializer.errors)

    def test_post_serializer_exceeds_max_length(self):
        data = {
            'author_id': self.user.id,
            'content': 'x' * 281
        }
        serializer = PostSerializer(data=data)
        self.assertFalse(serializer.is_valid())

    def test_post_serializer_whitespace_only(self):
        data = {
            'author_id': self.user.id,
            'content': '   '
        }
        serializer = PostSerializer(data=data)
        self.assertFalse(serializer.is_valid())

    def test_post_serializer_exact_max_length(self):
        data = {
            'author_id': self.user.id,
            'content': 'x' * 280
        }
        serializer = PostSerializer(data=data)
        self.assertTrue(serializer.is_valid())

    def test_post_serializer_includes_metadata(self):
        post = Post.objects.create(author=self.user, content='Test post')
        serializer = PostSerializer(post)

        self.assertIn('id', serializer.data)
        self.assertIn('content', serializer.data)
        self.assertIn('author_username', serializer.data)
        self.assertIn('author_animal_avatar', serializer.data)
        self.assertIn('created_at', serializer.data)
        self.assertIn('is_active', serializer.data)
