from django.conf import settings
from django.db import models


class Post(models.Model):
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="posts"
    )

    content = models.TextField(max_length=280)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

        indexes = [
            models.Index(fields=["author", "is_active"])
        ]

    def __str__(self):
        return f"{self.author.username}: {self.content[:30]}"


class Repost(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reposts"
    )

    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="reposts"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "post")

        indexes = [
            models.Index(fields=["user"]),
            models.Index(fields=["post"])
        ]

    def __str__(self):
        return f"{self.user.username} reposted {self.post.id}"