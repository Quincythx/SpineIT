from django.db import IntegrityError
from rest_framework import viewsets, permissions, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Follow, Notification
from .serializers import FollowSerializer, NotificationSerializer
from .permissions import IsFollowerOrReadOnly


class FollowViewSet(viewsets.ModelViewSet):
    http_method_names = ['get', 'post', 'delete']
    serializer_class = FollowSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsFollowerOrReadOnly]

    def get_queryset(self):
        queryset = Follow.objects.all().order_by('-created_at')
        follower = self.request.query_params.get('follower')
        following = self.request.query_params.get('following')
        if follower:
            queryset = queryset.filter(follower__username__iexact=follower)
        if following:
            queryset = queryset.filter(following__username__iexact=following)
        return queryset

    def perform_create(self, serializer):
        try:
            serializer.save(follower=self.request.user)
        except IntegrityError:
            raise serializers.ValidationError("You're already following this user.")


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=False, methods=['patch'], url_path='mark-read')
    def mark_read(self, request):
        self.get_queryset().filter(read=False).update(read=True)
        return Response({"detail": "All notifications marked as read."})
