from rest_framework import serializers

from apps.posts.models import Post
from .models import AuditLog, Report


class ReportSerializer(serializers.ModelSerializer):
    post_id = serializers.IntegerField(write_only=True)
    reporter_username = serializers.CharField(source='reporter.username', read_only=True)
    post_content = serializers.CharField(source='post.content', read_only=True)
    post_author = serializers.CharField(source='post.author.username', read_only=True)

    class Meta:
        model = Report
        fields = ['id', 'post_id', 'reporter_username', 'post_content', 'post_author', 'reason', 'created_at']
        read_only_fields = ['id', 'reporter_username', 'post_content', 'post_author', 'created_at']

    def validate_post_id(self, value):
        try:
            post = Post.objects.get(pk=value, is_active=True)
        except Post.DoesNotExist:
            raise serializers.ValidationError('Gönderi bulunamadı veya aktif değil.')
        return value

    def validate(self, attrs):
        request = self.context['request']
        post_id = attrs.get('post_id')
        if Report.objects.filter(reporter=request.user, post_id=post_id).exists():
            raise serializers.ValidationError('Bu gönderiyi zaten raporladınız.')
        return attrs

    def create(self, validated_data):
        post_id = validated_data.pop('post_id')
        return Report.objects.create(
            reporter=self.context['request'].user,
            post_id=post_id,
            **validated_data,
        )


class ReportedPostSerializer(serializers.Serializer):
    post_id = serializers.IntegerField(source='id')
    post_content = serializers.CharField(source='content')
    post_author = serializers.CharField(source='author.username')
    post_is_active = serializers.BooleanField(source='is_active')
    report_count = serializers.IntegerField()
    reasons = serializers.SerializerMethodField()
    reports = serializers.SerializerMethodField()

    def get_reasons(self, obj):
        return list(obj.reports.values_list('reason', flat=True))

    def get_reports(self, obj):
        return [
            {
                'reporter_username': r.reporter.username,
                'reason': r.reason,
                'created_at': r.created_at,
            }
            for r in obj.reports.all()
        ]


class AdminUserSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    email = serializers.EmailField()
    country = serializers.CharField()
    role = serializers.CharField()
    is_email_verified = serializers.BooleanField()
    is_banned = serializers.BooleanField()
    banned_until = serializers.DateTimeField(allow_null=True)
    created_at = serializers.DateTimeField()


class AuditLogSerializer(serializers.ModelSerializer):
    admin_username = serializers.CharField(source='admin.username', read_only=True)
    target_user_username = serializers.CharField(source='target_user.username', read_only=True, default=None)
    target_post_id = serializers.IntegerField(source='target_post.id', read_only=True, default=None)

    class Meta:
        model = AuditLog
        fields = ['id', 'admin_username', 'action', 'target_user_username', 'target_post_id', 'detail', 'created_at']
