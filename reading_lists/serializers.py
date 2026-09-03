from rest_framework import serializers
from .models import ReadingList, ReadingListItem


class ReadingListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReadingList
        fields = ['id', 'user', 'name', 'default_key', 'created_at']
        read_only_fields = ['id', 'user', 'default_key', 'created_at']


class ReadingListItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReadingListItem
        fields = ['id', 'reading_list', 'book', 'added_at']
        read_only_fields = ['id', 'added_at']
        validators = []

    def validate_reading_list(self, value):
        request = self.context['request']
        if value.user != request.user:
            raise serializers.ValidationError("You can only add items to your own reading lists.")
        return value
