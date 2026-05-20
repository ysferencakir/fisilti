from django.urls import path

from .views import (
    FeedView,
    PostCreateView,
    PostUpdateView,
    PostDeleteView,
    UserPostsView,
    RepostView,
)

urlpatterns = [
    path("feed/", FeedView.as_view(), name="post-feed"),
    path("", PostCreateView.as_view(), name="post-create"),
    path("<int:pk>/", PostUpdateView.as_view(), name="post-update"),
    path("<int:pk>/", PostDeleteView.as_view(), name="post-delete"),
    path("<int:pk>/repost/", RepostView.as_view(), name="post-repost"),
    path("user/<str:username>/", UserPostsView.as_view(), name="user-posts"),
]