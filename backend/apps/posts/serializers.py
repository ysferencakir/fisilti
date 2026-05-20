from rest_framework import serializers

from .models import Post, Repost


class PostSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source="author.username", read_only=True)
    repost_count = serializers.SerializerMethodField()
    is_reposted = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "author_username",
            "content",
            "is_active",
            "created_at",
            "updated_at",
            "repost_count",
            "is_reposted",
        ]
        read_only_fields = [
            "id",
            "author_username",
            "is_active",
            "created_at",
            "updated_at",
            "repost_count",
            "is_reposted",
        ]

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError("Gönderi içeriği boş olamaz.")
        if len(value) > 280:
            raise serializers.ValidationError("Gönderi en fazla 280 karakter olabilir.")
        return value

    def get_repost_count(self, obj):
        return obj.reposts.count()

    def get_is_reposted(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False

        return Repost.objects.filter(user=request.user, post=obj).exists()


class FeedItemSerializer(serializers.Serializer):
    type = serializers.CharField()
    timestamp = serializers.DateTimeField()
    reposted_by = serializers.CharField(allow_null=True, required=False)
    reposted_at = serializers.DateTimeField(allow_null=True, required=False)
    post = PostSerializer()