from django.db.models import Avg, Count
from rest_framework import serializers
from .models import Genre, Book, Review, Comment, Like, Bookmark, Favorite


class GenreSerializer(serializers.ModelSerializer):
    name = serializers.CharField(max_length=100)

    class Meta:
        model = Genre
        fields = ['id', 'name']


class BookSerializer(serializers.ModelSerializer):
    genre = serializers.SlugRelatedField(slug_field='name', read_only=True)
    genre_id = serializers.PrimaryKeyRelatedField(
        queryset=Genre.objects.all(), source='genre', write_only=True,
        required=False, allow_null=True
    )
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = [
            'id', 'title', 'author', 'genre', 'genre_id', 'slug',
            'average_rating', 'review_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

    def get_average_rating(self, obj):
        if hasattr(obj, 'average_rating'):
            return obj.average_rating
        return obj.reviews.aggregate(avg=Avg('rating'))['avg']

    def get_review_count(self, obj):
        if hasattr(obj, 'review_count'):
            return obj.review_count
        return obj.reviews.count()


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
    genre = serializers.SlugRelatedField(slug_field='name', read_only=True)

    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'slug', 'genre']


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
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
        if hasattr(obj, 'like_count'):
            return obj.like_count
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


class FavoriteSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    book = BookSerializer(read_only=True)
    book_id = serializers.PrimaryKeyRelatedField(
        queryset=Book.objects.all(), source='book', write_only=True
    )

    class Meta:
        model = Favorite
        fields = ['id', 'book', 'book_id', 'user', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']