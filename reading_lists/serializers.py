from rest_framework import serializers
from reviews.models import Book
from reviews.serializers import BookSerializer
from .models import ReadingList, ReadingListItem


class ReadingListSerializer(serializers.ModelSerializer):
    item_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = ReadingList
        fields = ['id', 'user', 'name', 'default_key', 'item_count', 'created_at']
        read_only_fields = ['id', 'user', 'default_key', 'item_count', 'created_at']


class ReadingListItemSerializer(serializers.ModelSerializer):
    reading_list_id = serializers.PrimaryKeyRelatedField(
        queryset=ReadingList.objects.all(), source='reading_list'
    )
    book = BookSerializer(read_only=True)
    book_id = serializers.PrimaryKeyRelatedField(
        queryset=Book.objects.all(), source='book', write_only=True
    )

    class Meta:
        model = ReadingListItem
        fields = ['id', 'reading_list_id', 'book', 'book_id', 'added_at']
        read_only_fields = ['id', 'added_at']
        validators = []

    def validate_reading_list_id(self, value):
        request = self.context['request']
        if value.user != request.user:
            raise serializers.ValidationError("You can only add items to your own reading lists.")
        return value
