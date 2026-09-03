from collections import Counter
from django.db import migrations
from django.utils.text import slugify


def migrate_book_data(apps, schema_editor):
    Review = apps.get_model('reviews', 'Review')
    Book = apps.get_model('reviews', 'Book')

    def unique_slug(title, author):
        base = slugify(f"{title}-{author}") or "book"
        slug = base
        n = 2
        while Book.objects.filter(slug=slug).exists():
            slug = f"{base}-{n}"
            n += 1
        return slug

    reviews = list(
        Review.objects.order_by('created_at').only(
            'id', 'book_title', 'author', 'genre_id', 'created_at'
        )
    )

    groups = {}
    for review in reviews:
        key = (review.book_title.strip().lower(), review.author.strip().lower())
        groups.setdefault(key, []).append(review)

    for key, group_reviews in groups.items():
        earliest = group_reviews[0]
        title = earliest.book_title.strip()
        author = earliest.author.strip()

        genre_counts = Counter(r.genre_id for r in group_reviews if r.genre_id is not None)
        genre_id = None
        if genre_counts:
            max_count = max(genre_counts.values())
            tied = {gid for gid, c in genre_counts.items() if c == max_count}
            if len(tied) == 1:
                genre_id = tied.pop()
            else:
                for r in group_reviews:
                    if r.genre_id in tied:
                        genre_id = r.genre_id
                        break

        book = Book.objects.create(
            title=title, author=author, genre_id=genre_id,
            slug=unique_slug(title, author),
        )
        Review.objects.filter(id__in=[r.id for r in group_reviews]).update(book=book)


def reverse_migrate_book_data(apps, schema_editor):
    Review = apps.get_model('reviews', 'Review')
    Book = apps.get_model('reviews', 'Book')
    Review.objects.update(book=None)
    Book.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('reviews', '0005_book_review_book'),
    ]

    operations = [
        migrations.RunPython(migrate_book_data, reverse_migrate_book_data),
    ]
