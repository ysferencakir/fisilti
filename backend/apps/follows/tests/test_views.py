from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from apps.follows.models import Follow
from apps.users.models import User


class FollowViewTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.follower = User.objects.create_user(
            email='follower@example.com',
            username='follower',
            password='SecurePass@123',
            is_email_verified=True
        )
        self.following = User.objects.create_user(
            email='following@example.com',
            username='following',
            password='SecurePass@123',
            is_email_verified=True
        )
        self.client.force_authenticate(user=self.follower)

    def test_follow_user_success(self):
        response = self.client.post(f'/api/users/{self.following.username}/follow/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertTrue(Follow.objects.filter(
            follower=self.follower,
            following=self.following
        ).exists())

    def test_follow_user_unverified_email(self):
        unverified_user = User.objects.create_user(
            email='unverified@example.com',
            username='unverified',
            password='SecurePass@123',
            is_email_verified=False
        )
        self.client.force_authenticate(user=unverified_user)

        response = self.client.post(f'/api/users/{self.following.username}/follow/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_follow_self_prevented(self):
        response = self.client.post(f'/api/users/{self.follower.username}/follow/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(Follow.objects.filter(
            follower=self.follower,
            following=self.follower
        ).exists())

    def test_follow_non_existent_user(self):
        response = self.client.post('/api/users/nonexistent/follow/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_duplicate_follow_handled(self):
        Follow.objects.create(follower=self.follower, following=self.following)

        response = self.client.post(f'/api/users/{self.following.username}/follow/')
        # Should return 200 (get_or_create)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Should still have only one follow
        self.assertEqual(
            Follow.objects.filter(
                follower=self.follower,
                following=self.following
            ).count(),
            1
        )

    def test_unfollow_user(self):
        Follow.objects.create(follower=self.follower, following=self.following)

        response = self.client.delete(f'/api/users/{self.following.username}/follow/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertFalse(Follow.objects.filter(
            follower=self.follower,
            following=self.following
        ).exists())

    def test_unfollow_non_existent_follow(self):
        response = self.client.delete(f'/api/users/{self.following.username}/follow/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class FollowersViewTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='user@example.com',
            username='user',
            password='SecurePass@123'
        )
        self.follower1 = User.objects.create_user(
            email='follower1@example.com',
            username='follower1',
            password='SecurePass@123'
        )
        self.follower2 = User.objects.create_user(
            email='follower2@example.com',
            username='follower2',
            password='SecurePass@123'
        )

    def test_get_followers_list(self):
        Follow.objects.create(follower=self.follower1, following=self.user)
        Follow.objects.create(follower=self.follower2, following=self.user)

        response = self.client.get(f'/api/users/{self.user.username}/followers/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_get_followers_empty(self):
        response = self.client.get(f'/api/users/{self.user.username}/followers/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_followers_non_existent_user(self):
        response = self.client.get('/api/users/nonexistent/followers/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class FollowingViewTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='user@example.com',
            username='user',
            password='SecurePass@123'
        )
        self.following1 = User.objects.create_user(
            email='following1@example.com',
            username='following1',
            password='SecurePass@123'
        )
        self.following2 = User.objects.create_user(
            email='following2@example.com',
            username='following2',
            password='SecurePass@123'
        )

    def test_get_following_list(self):
        Follow.objects.create(follower=self.user, following=self.following1)
        Follow.objects.create(follower=self.user, following=self.following2)

        response = self.client.get(f'/api/users/{self.user.username}/following/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_get_following_empty(self):
        response = self.client.get(f'/api/users/{self.user.username}/following/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_following_non_existent_user(self):
        response = self.client.get('/api/users/nonexistent/following/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
