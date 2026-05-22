from rest_framework.pagination import PageNumberPagination
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Post, Repost
from .serializers import PostSerializer, FeedItemSerializer

class FeedPagination(PageNumberPagination):
    page_size = 5
class FeedView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        posts = Post.objects.filter(
            is_active=True
        ).select_related("author")
        reposts = Repost.objects.filter(
    post__is_active=True
).select_related("user", "post", "post__author")

        items = []

        for post in posts:
            items.append({
                "type": "post",
                "timestamp": post.created_at,
                "reposted_by": None,
                "reposted_at": None,
                "post": post
            })

        for repost in reposts:
            items.append({
                "type": "repost",
                "timestamp": repost.created_at,
                "reposted_by": repost.user.username,
                "reposted_at": repost.created_at,
                "post": repost.post
            })

        items.sort(key=lambda x: x["timestamp"], reverse=True)

        pagination = FeedPagination()
        paginated_items = pagination.paginate_queryset(items, request)

        serializer = FeedItemSerializer(
            paginated_items,
            many=True,
            context={"request": request}
        )

        return pagination.get_paginated_response(serializer.data)


class PostCreateView(generics.CreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class PostUpdateView(generics.UpdateAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    queryset = Post.objects.filter(is_active=True)

    def patch(self, request, *args, **kwargs):
        post = self.get_object()

        if post.author != request.user:
            return Response(
                {"detail": "Bu gönderiyi düzenleyemezsiniz."},
                status=status.HTTP_403_FORBIDDEN
            )

        return self.partial_update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        post = self.get_object()

        if post.author != request.user:
            return Response(
                {"detail": "Bu gönderiyi silemezsiniz."},
                status=status.HTTP_403_FORBIDDEN
            )

        post.is_active = False
        post.save()

        return Response(
            {"detail": "Gönderi silindi."},
            status=status.HTTP_200_OK
        )


class UserPostsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, username):
        posts = Post.objects.filter(
            author__username=username,
            is_active=True
        ).select_related("author")

        serializer = PostSerializer(
            posts,
            many=True,
            context={"request": request}
        )

        return Response(serializer.data)


class UserRepostsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, username):
        reposts = Repost.objects.filter(
            user__username=username,
            post__is_active=True
        ).select_related("user", "post", "post__author")

        items = []

        for repost in reposts:
            items.append({
                "type": "repost",
                "timestamp": repost.created_at,
                "reposted_by": repost.user.username,
                "reposted_at": repost.created_at,
                "post": repost.post
            })

        items.sort(key=lambda x: x["timestamp"], reverse=True)

        serializer = FeedItemSerializer(
            items,
            many=True,
            context={"request": request}
        )

        return Response(serializer.data)


class RepostView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            post = Post.objects.get(pk=pk, is_active=True)
        except Post.DoesNotExist:
            return Response(
                {"detail": "Gönderi bulunamadı."},
                status=status.HTTP_404_NOT_FOUND
            )

        if post.author == request.user:
            return Response(
                {"detail": "Kendi gönderinizi repost edemezsiniz."},
                status=status.HTTP_400_BAD_REQUEST
            )

        already_reposted = Repost.objects.filter(
            user=request.user,
            post=post
        ).exists()

        if already_reposted:
            return Response(
                {"detail": "Bu gönderi zaten repost edildi."},
                status=status.HTTP_400_BAD_REQUEST
            )

        Repost.objects.create(
            user=request.user,
            post=post
        )

        return Response(
            {"detail": "Gönderi repost edildi."},
            status=status.HTTP_201_CREATED
        )

    def delete(self, request, pk):
        repost = Repost.objects.filter(
            user=request.user,
            post_id=pk
        ).first()

        if not repost:
            return Response(
                {"detail": "Repost bulunamadı."},
                status=status.HTTP_404_NOT_FOUND
            )

        repost.delete()

        return Response(
            {"detail": "Repost kaldırıldı."},
            status=status.HTTP_200_OK
        )