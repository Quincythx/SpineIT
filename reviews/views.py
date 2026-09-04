from django.db.models import Avg, Count
from django.shortcuts import render
from rest_framework import mixins, serializers, status, viewsets, permissions, filters
from rest_framework.response import Response
from .models import Book, Review, Genre, Comment, Like, Bookmark
from .serializers import (
    BookSerializer, BookDetailSerializer, ReviewSerializer, GenreSerializer,
    CommentSerializer, LikeSerializer, BookmarkSerializer,
)
from .permissions import IsOwnerOrReadOnly
from django.db import IntegrityError
from rest_framework.decorators import action

# Create your views here.
class BookViewSet(mixins.ListModelMixin,
                   mixins.RetrieveModelMixin,
                   mixins.CreateModelMixin,
                   viewsets.GenericViewSet):
    lookup_field = 'slug'
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'author', 'genre__name']

    def get_queryset(self):
        return Book.objects.select_related('genre').annotate(
            average_rating=Avg('reviews__rating'),
            review_count=Count('reviews', distinct=True),
        )

    def get_serializer_class(self):
        return BookDetailSerializer if self.action == 'retrieve' else BookSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        title = serializer.validated_data['title'].strip()
        author = serializer.validated_data['author'].strip()
        existing = Book.objects.filter(title__iexact=title, author__iexact=author).first()
        if existing:
            return Response(self.get_serializer(existing).data, status=status.HTTP_200_OK)
        book = serializer.save(title=title, author=author)
        return Response(self.get_serializer(book).data, status=status.HTTP_201_CREATED)


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['book__title', 'book__author', 'book__genre__name']

    def get_queryset(self):
        queryset = Review.objects.select_related('book__genre', 'user').annotate(
            like_count=Count('likes')
        ).order_by('-created_at')

        book_id = self.request.query_params.get('book')
        if book_id:
            try:
                queryset = queryset.filter(book_id=int(book_id))
            except (TypeError, ValueError):
                return queryset.none()

        if self.request.query_params.get('mine') == 'true':
            if not self.request.user.is_authenticated:
                return queryset.none()
            queryset = queryset.filter(user=self.request.user)

        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class GenreViewSet(viewsets.ModelViewSet):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        name = serializer.validated_data['name'].strip()
        existing = Genre.objects.filter(name__iexact=name).first()
        if existing:
            return Response(self.get_serializer(existing).data, status=status.HTTP_200_OK)
        genre = serializer.save(name=name)
        return Response(self.get_serializer(genre).data, status=status.HTTP_201_CREATED)




class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        queryset = Comment.objects.select_related('user', 'review').order_by('-created_at')
        review_id = self.request.query_params.get('review')
        if review_id:
            try:
                queryset = queryset.filter(review_id=int(review_id))
            except (TypeError, ValueError):
                return queryset.none()
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)



class LikeViewSet(viewsets.ModelViewSet):
    serializer_class = LikeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Like.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        try:
            serializer.save(user=self.request.user)
        except IntegrityError:
            raise serializers.ValidationError("You already liked this review.")


class BookmarkViewSet(viewsets.ModelViewSet):
    serializer_class = BookmarkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Bookmark.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        try:
            serializer.save(user=self.request.user)
        except IntegrityError:
            raise serializers.ValidationError("You already bookmarked this review.")