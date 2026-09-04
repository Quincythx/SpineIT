from django.db import IntegrityError
from django.db.models import Count
from rest_framework import viewsets, permissions, serializers
from .models import ReadingList, ReadingListItem
from .serializers import ReadingListSerializer, ReadingListItemSerializer
from .permissions import IsOwnerOrReadOnly, CannotDeleteDefaultList


class ReadingListViewSet(viewsets.ModelViewSet):
    serializer_class = ReadingListSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly, CannotDeleteDefaultList]

    def get_queryset(self):
        return ReadingList.objects.filter(user=self.request.user) \
            .annotate(item_count=Count('items')).order_by('created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReadingListItemViewSet(viewsets.ModelViewSet):
    serializer_class = ReadingListItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = ReadingListItem.objects.filter(
            reading_list__user=self.request.user
        ).select_related('reading_list', 'book__genre').order_by('-added_at')

        reading_list_id = self.request.query_params.get('reading_list')
        if reading_list_id:
            try:
                queryset = queryset.filter(reading_list_id=int(reading_list_id))
            except (TypeError, ValueError):
                return queryset.none()

        return queryset

    def perform_create(self, serializer):
        try:
            serializer.save()
        except IntegrityError:
            raise serializers.ValidationError("This book is already in that reading list.")
