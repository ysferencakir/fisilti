from django.urls import path

from .views import (
    FollowView,
    FollowersView,
    FollowingView,
)

urlpatterns = [
    path(
        "<str:username>/follow/",
        FollowView.as_view()
    ),

    path(
        "<str:username>/followers/",
        FollowersView.as_view()
    ),

    path(
        "<str:username>/following/",
        FollowingView.as_view()
    ),
]