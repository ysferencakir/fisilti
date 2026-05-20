from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()


class Follow(models.Model):
    follower = models.ForeignKey(
        User,
        related_name="following_set",
        on_delete=models.CASCADE
    )

    following = models.ForeignKey(
        User,
        related_name="follower_set",
        on_delete=models.CASCADE
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("follower", "following")
        indexes = [
            models.Index(fields=["follower"]),
            models.Index(fields=["following"]),
        ]

    def clean(self):
        if self.follower == self.following:
            raise ValidationError("Kullanıcı kendini takip edemez.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.follower} -> {self.following}"