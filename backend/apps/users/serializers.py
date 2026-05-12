from rest_framework import serializers
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    country = serializers.CharField(required=False, allow_blank=True)
    ad_soyad = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'country', 'ad_soyad']

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            country=validated_data.get('country', ''),
            ad_soyad=validated_data.get('ad_soyad', '')
        )
        return user


class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.UUIDField()
    new_password = serializers.CharField(min_length=8)


class UserSerializer(serializers.ModelSerializer):
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'role', 'is_email_verified',
            'is_banned', 'created_at', 'followers_count',
            'following_count', 'is_following'
        ]

    def get_followers_count(self, obj):
        try:
            return obj.follower_set.count()
        except:
            return 0

    def get_following_count(self, obj):
        try:
            return obj.following_set.count()
        except:
            return 0

    def get_is_following(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        try:
            from apps.follows.models import Follow
            return Follow.objects.filter(
                follower=request.user, following=obj
            ).exists()
        except:
            return False


class MeSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['email', 'ad_soyad']