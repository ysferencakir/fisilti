from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from apps.posts.models import Post, Repost
from apps.users.models import User
from apps.follows.models import Follow


class PostCreateViewTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='testuser@example.com',
            username='testuser',
            password='SecurePass@123',
            is_email_verified=True
        )
        self.client.force_authenticate(user=self.user)

    def test_create_post_success(self):
        data = {'content': 'This is a test post'}
        response = self.client.post('/api/posts/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Post.objects.filter(content='This is a test post').exists())

    def test_create_post_empty_content(self):
        data = {'content': ''}
        response = self.client.post('/api/posts/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_post_exceeds_max_length(self):
        data = {'content': 'x' * 281}
        response = self.client.post('/api/posts/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_post_exact_max_length(self):
        data = {'content': 'x' * 280}
        response = self.client.post('/api/posts/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_post_unverified_user(self):
        unverified_user = User.objects.create_user(
            email='unverified@example.com',
            username='unverified',
            password='SecurePass@123',
            is_email_verified=False
        )
        self.client.force_authenticate(user=unverified_user)

        data = {'content': 'Test post'}
        response = self.client.post('/api/posts/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_post_not_authenticated(self):
        self.client.force_authenticate(user=None)
        data = {'content': 'Test post'}
        response = self.client.post('/api/posts/', data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class PostUpdateViewTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='testuser@example.com',
            username='testuser',
            password='SecurePass@123',
            is_email_verified=True
        )
        self.other_user = User.objects.create_user(
            email='other@example.com',
            username='other',
            password='SecurePass@123',
            is_email_verified=True
        )
        self.post = Post.objects.create(
            author=self.user,
            content='Original content'
        )
        self.client.force_authenticate(user=self.user)

    def test_update_own_post(self):
        data = {'content': 'Updated content'}
        response = self.client.patch(f'/api/posts/{self.post.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.post.refresh_from_db()
        self.assertEqual(self.post.content, 'Updated content')

    def test_cannot_update_other_user_post(self):
        self.client.force_authenticate(user=self.other_user)
        data = {'content': 'Hacked content'}
        response = self.client.patch(f'/api/posts/{self.post.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.post.refresh_from_db()
        self.assertEqual(self.post.content, 'Original content')

    def test_update_post_exceeds_max_length(self):
        data = {'content': 'x' * 281}
        response = self.client.patch(f'/api/posts/{self.post.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_post_empty_content(self):
        data = {'content': ''}
        response = self.client.patch(f'/api/posts/{self.post.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class PostDeleteViewTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='testuser@example.com',
            username='testuser',
            password='SecurePass@123',
            is_email_verified=True
        )
        self.other_user = User.objects.create_user(
            email='other@example.com',
            username='other',
            password='SecurePass@123',
            is_email_verified=True
        )
        self.post = Post.objects.create(
            author=self.user,
            content='Test post'
        )
        self.client.force_authenticate(user=self.user)

    def test_delete_own_post(self):
        response = self.client.delete(f'/api/posts/{self.post.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        self.post.refresh_from_db()
        self.assertFalse(self.post.is_active)

    def test_cannot_delete_other_user_post(self):
        self.client.force_authenticate(user=self.other_user)
        response = self.client.delete(f'/api/posts/{self.post.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.post.refresh_from_db()
        self.assertTrue(self.post.is_active)

    def test_delete_non_existent_post(self):
        response = self.client.delete(f'/api/posts/99999/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class FeedViewTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
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
        self.user3 = User.objects.create_user(
            email='user3@example.com',
            username='user3',
            password='SecurePass@123',
            is_email_verified=True
        )

        # Create posts from user2 and user3
        self.post2 = Post.objects.create(author=self.user2, content='Post from user2')
        self.post3 = Post.objects.create(author=self.user3, content='Post from user3')

        # user1 follows user2
        Follow.objects.create(follower=self.user1, following=self.user2)

        self.client.force_authenticate(user=self.user1)

    def test_feed_shows_followed_user_posts(self):
        response = self.client.get('/api/feed/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        post_ids = [post['id'] for post in response.data]
        self.assertIn(self.post2.id, post_ids)

    def test_feed_excludes_unfollowed_user_posts(self):
        response = self.client.get('/api/feed/')
        post_ids = [post['id'] for post in response.data]
        self.assertNotIn(self.post3.id, post_ids)

    def test_feed_includes_own_posts(self):
        own_post = Post.objects.create(author=self.user1, content='My post')
        response = self.client.get('/api/feed/')

        post_ids = [post['id'] for post in response.data]
        self.assertIn(own_post.id, post_ids)

    def test_feed_excludes_inactive_posts(self):
        self.post2.is_active = False
        self.post2.save()

        response = self.client.get('/api/feed/')
        post_ids = [post['id'] for post in response.data]
        self.assertNotIn(self.post2.id, post_ids)


class RepostViewTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
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
        self.post = Post.objects.create(author=self.user1, content='Original post')
        self.client.force_authenticate(user=self.user2)

    def test_repost_creation(self):
        response = self.client.post(f'/api/posts/{self.post.id}/repost/')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertTrue(Repost.objects.filter(user=self.user2, post=self.post).exists())

    def test_repost_deletion(self):
        Repost.objects.create(user=self.user2, post=self.post)

        response = self.client.delete(f'/api/posts/{self.post.id}/repost/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        self.assertFalse(Repost.objects.filter(user=self.user2, post=self.post).exists())

    def test_prevent_duplicate_repost(self):
        Repost.objects.create(user=self.user2, post=self.post)

        response = self.client.post(f'/api/posts/{self.post.id}/repost/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_repost_non_existent_post(self):
        response = self.client.post('/api/posts/99999/repost/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
