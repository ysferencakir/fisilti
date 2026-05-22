from django.conf import settings
from django.db import models


class Report(models.Model):
    REASON_CHOICES = [
        ("spam", "Spam"),
        ("abuse", "Abuse / Harassment"),
        ("inappropriate", "Inappropriate Content"),
        ("other", "Other"),
    ]

    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reports_made"
    )

    post = models.ForeignKey(
        "posts.Post",
        on_delete=models.CASCADE,
        related_name="reports"
    )

    reason = models.CharField(max_length=50, choices=REASON_CHOICES)
    description = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("reporter", "post")

    def __str__(self):
        return f"{self.reporter} reported post {self.post_id}"