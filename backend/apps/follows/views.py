from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsEmailVerified

from .models import Follow
from .serializers import UserMiniSerializer

User = get_user_model()


class FollowView(APIView):
    permission_classes = [IsAuthenticated, IsEmailVerified]

    def post(self, request, username):
        target = get_object_or_404(User, username=username)

        if target == request.user:
            return Response(
                {"detail": "Kendini takip edemezsin."},
                status=status.HTTP_400_BAD_REQUEST
            )

        Follow.objects.get_or_create(
            follower=request.user,
            following=target
        )

        return Response(
            {"detail": "Takip edildi."},
            status=status.HTTP_200_OK
        )

    def delete(self, request, username):
        target = get_object_or_404(User, username=username)

        Follow.objects.filter(
            follower=request.user,
            following=target
        ).delete()

        return Response(
            {"detail": "Takip bırakıldı."},
            status=status.HTTP_200_OK
        )


class FollowersView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, username):
        target = get_object_or_404(User, username=username)

        followers = Follow.objects.filter(
            following=target
        ).select_related("follower")

        users = [follow.follower for follow in followers]

        serializer = UserMiniSerializer(users, many=True)

        return Response(serializer.data)


class FollowingView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, username):
        target = get_object_or_404(User, username=username)

        following = Follow.objects.filter(
            follower=target
        ).select_related("following")

        users = [follow.following for follow in following]

        serializer = UserMiniSerializer(users, many=True)

        return Response(serializer.data)