from django.db.models import Count
from rest_framework import serializers
from .models import Genre, Book, Review, Comment, Like, Bookmark


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'name']


class BookSerializer(serializers.ModelSerializer):
    genre = GenreSerializer(read_only=True)
    genre_id = serializers.PrimaryKeyRelatedField(
        queryset=Genre.objects.all(), source='genre', write_only=True,
        required=False, allow_null=True
    )
    average_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Book
        fields = [
            'id', 'title', 'author', 'genre', 'genre_id', 'slug',
            'average_rating', 'review_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']


class BookDetailSerializer(BookSerializer):
    rating_distribution = serializers.SerializerMethodField()

    class Meta(BookSerializer.Meta):
        fields = BookSerializer.Meta.fields + ['rating_distribution']

    def get_rating_distribution(self, obj):
        counts = {i: 0 for i in range(1, 6)}
        for row in obj.reviews.values('rating').annotate(count=Count('id')):
            counts[row['rating']] = row['count']
        return counts


class BookMinimalSerializer(serializers.ModelSerializer):
    genre = GenreSerializer(read_only=True)

    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'slug', 'genre']


class ReviewSerializer(serializers.ModelSerializer):
    book = BookMinimalSerializer(read_only=True)
    book_id = serializers.PrimaryKeyRelatedField(
        queryset=Book.objects.all(), source='book', write_only=True
    )
    like_count = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            'id', 'user', 'book', 'book_id',
            'review_text', 'rating', 'image', 'like_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def get_like_count(self, obj):
        return obj.likes.count()
    


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'review', 'user', 'text', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ['id', 'review', 'user', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class BookmarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bookmark
        fields = ['id', 'review', 'user', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']