from django.test import TestCase
from rest_framework.test import APIClient
from apps.users.models import User
from .models import Follow


def make_user(username, email, password='Test1234!'):
    user = User.objects.create_user(username=username, email=email, password=password)
    user.is_email_verified = True
    user.save()
    return user


def auth_client(user, password='Test1234!'):
    client = APIClient()
    resp = client.post('/api/auth/login/', {'email': user.email, 'password': password}, format='json')
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {resp.data['access']}")
    return client


class FollowTests(TestCase):
    def setUp(self):
        self.alice = make_user('alice', 'alice@example.com')
        self.bob = make_user('bob', 'bob@example.com')
        self.client = auth_client(self.alice)

    def test_follow_user(self):
        resp = self.client.post('/api/bob/follow/')
        self.assertEqual(resp.status_code, 201)
        self.assertTrue(Follow.objects.filter(follower=self.alice, following=self.bob).exists())

    def test_unfollow_user(self):
        Follow.objects.create(follower=self.alice, following=self.bob)
        resp = self.client.delete('/api/bob/follow/')
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(Follow.objects.filter(follower=self.alice, following=self.bob).exists())

    def test_self_follow_rejected(self):
        resp = self.client.post('/api/alice/follow/')
        self.assertEqual(resp.status_code, 400)

    def test_duplicate_follow_rejected(self):
        Follow.objects.create(follower=self.alice, following=self.bob)
        resp = self.client.post('/api/bob/follow/')
        self.assertIn(resp.status_code, [400, 409])

    def test_followers_list(self):
        Follow.objects.create(follower=self.alice, following=self.bob)
        resp = self.client.get('/api/bob/followers/')
        self.assertEqual(resp.status_code, 200)
        usernames = [u['username'] for u in resp.data]
        self.assertIn('alice', usernames)

    def test_following_list(self):
        Follow.objects.create(follower=self.alice, following=self.bob)
        resp = self.client.get('/api/alice/following/')
        self.assertEqual(resp.status_code, 200)
        usernames = [u['username'] for u in resp.data]
        self.assertIn('bob', usernames)
