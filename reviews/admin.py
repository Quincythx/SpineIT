from django.contrib import admin
from .models import Genre, Book, Review, Comment, Like, Bookmark, Favorite

# Register your models here.
admin.site.register(Genre)
admin.site.register(Book)
admin.site.register(Review)
admin.site.register(Comment)
admin.site.register(Like)
admin.site.register(Bookmark)
admin.site.register(Favorite)

