from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse

from apps.users.models import User
from apps.follows.models import Follow
from .models import Post


def make_user(username, email, password='Test1234!', verified=True):
    user = User.objects.create_user(username=username, email=email, password=password)
    user.is_email_verified = verified
    user.save()
    return user


def auth_client(user, password='Test1234!'):
    client = APIClient()
    resp = client.post('/api/auth/login/', {'email': user.email, 'password': password}, format='json')
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {resp.data['access']}")
    return client


class PostCRUDTests(TestCase):
    def setUp(self):
        self.user = make_user('alice', 'alice@example.com')
        self.other = make_user('bob', 'bob@example.com')
        self.client = auth_client(self.user)

    def test_create_post(self):
        resp = self.client.post('/api/posts/', {'content': 'Merhaba dünya'}, format='json')
        self.assertEqual(resp.status_code, 201)

    def test_empty_post_rejected(self):
        resp = self.client.post('/api/posts/', {'content': '   '}, format='json')
        self.assertEqual(resp.status_code, 400)

    def test_over_limit_post_rejected(self):
        resp = self.client.post('/api/posts/', {'content': 'x' * 281}, format='json')
        self.assertEqual(resp.status_code, 400)

    def test_edit_own_post(self):
        post = Post.objects.create(author=self.user, content='İlk içerik')
        resp = self.client.patch(f'/api/posts/{post.id}/', {'content': 'Düzenlenmiş'}, format='json')
        self.assertEqual(resp.status_code, 200)
        post.refresh_from_db()
        self.assertEqual(post.content, 'Düzenlenmiş')

    def test_edit_others_post_forbidden(self):
        post = Post.objects.create(author=self.other, content='Başkasının gönderisi')
        other_client = auth_client(self.other)
        resp = auth_client(self.user).patch(f'/api/posts/{post.id}/', {'content': 'Hack'}, format='json')
        self.assertEqual(resp.status_code, 403)

    def test_delete_own_post(self):
        post = Post.objects.create(author=self.user, content='Silinecek')
        resp = self.client.delete(f'/api/posts/{post.id}/')
        self.assertEqual(resp.status_code, 200)
        post.refresh_from_db()
        self.assertFalse(post.is_active)

    def test_delete_others_post_forbidden(self):
        post = Post.objects.create(author=self.other, content='Silinmemeli')
        resp = self.client.delete(f'/api/posts/{post.id}/')
        self.assertEqual(resp.status_code, 403)

    def test_is_active_not_user_settable(self):
        # Admin pasife aldı, kullanıcı geri aktif yapamaz
        post = Post.objects.create(author=self.user, content='Pasif gönderi', is_active=False)
        # Pasif gönderi 404 döner (queryset filter(is_active=True))
        resp = self.client.patch(f'/api/posts/{post.id}/', {'content': 'Geri aktif', 'is_active': True}, format='json')
        self.assertEqual(resp.status_code, 404)


class FeedTests(TestCase):
    def setUp(self):
        self.alice = make_user('alice', 'alice@example.com')
        self.bob = make_user('bob', 'bob@example.com')
        self.eve = make_user('eve', 'eve@example.com')
        self.bob_post = Post.objects.create(author=self.bob, content='Bob gönderisi')
        self.eve_post = Post.objects.create(author=self.eve, content='Eve gönderisi')

    def test_feed_shows_only_followed(self):
        Follow.objects.create(follower=self.alice, following=self.bob)
        client = auth_client(self.alice)
        resp = client.get('/api/posts/feed/')
        self.assertEqual(resp.status_code, 200)
        contents = [item['post']['content'] for item in resp.data['results']]
        self.assertIn('Bob gönderisi', contents)
        self.assertNotIn('Eve gönderisi', contents)

    def test_empty_feed_when_no_follows(self):
        client = auth_client(self.alice)
        resp = client.get('/api/posts/feed/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['count'], 0)

    def test_passive_post_not_in_feed(self):
        Follow.objects.create(follower=self.alice, following=self.bob)
        self.bob_post.is_active = False
        self.bob_post.save()
        client = auth_client(self.alice)
        resp = client.get('/api/posts/feed/')
        self.assertEqual(resp.data['count'], 0)
