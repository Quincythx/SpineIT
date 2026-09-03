from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Follow, Notification

User = get_user_model()


class FollowSerializer(serializers.ModelSerializer):
    follower = serializers.StringRelatedField(read_only=True)
    following = serializers.SlugRelatedField(
        slug_field='username',
        queryset=User.objects.filter(is_active=True),
    )

    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following', 'created_at']
        read_only_fields = ['id', 'follower', 'created_at']

    def validate_following(self, value):
        request = self.context['request']
        if value == request.user:
            raise serializers.ValidationError("You can't follow yourself.")
        return value


class NotificationSerializer(serializers.ModelSerializer):
    actor = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'actor', 'type', 'review', 'read', 'created_at']
        read_only_fields = fields
