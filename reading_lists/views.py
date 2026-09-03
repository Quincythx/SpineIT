from django.db import IntegrityError
from rest_framework import viewsets, permissions, serializers
from .models import ReadingList, ReadingListItem
from .serializers import ReadingListSerializer, ReadingListItemSerializer
from .permissions import IsOwnerOrReadOnly, CannotDeleteDefaultList


class ReadingListViewSet(viewsets.ModelViewSet):
    serializer_class = ReadingListSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly, CannotDeleteDefaultList]

    def get_queryset(self):
        return ReadingList.objects.filter(user=self.request.user).order_by('created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReadingListItemViewSet(viewsets.ModelViewSet):
    serializer_class = ReadingListItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ReadingListItem.objects.filter(
            reading_list__user=self.request.user
        ).select_related('reading_list', 'book').order_by('-added_at')

    def perform_create(self, serializer):
        try:
            serializer.save()
        except IntegrityError:
            raise serializers.ValidationError("This book is already in that reading list.")
