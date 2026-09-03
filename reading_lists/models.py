from django.conf import settings
from django.db import models


class ReadingList(models.Model):
    class DefaultKey(models.TextChoices):
        WANT_TO_READ = 'want_to_read', 'Want to Read'
        CURRENTLY_READING = 'currently_reading', 'Currently Reading'
        READ = 'read', 'Read'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reading_lists'
    )
    name = models.CharField(max_length=100)
    default_key = models.CharField(
        max_length=20, choices=DefaultKey.choices, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'default_key')
        ordering = ['created_at']

    def __str__(self):
        return f"{self.user}'s {self.name}"


class ReadingListItem(models.Model):
    reading_list = models.ForeignKey(
        ReadingList,
        on_delete=models.CASCADE,
        related_name='items'
    )
    book = models.ForeignKey(
        'reviews.Book',
        on_delete=models.PROTECT,
        related_name='reading_list_items'
    )
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('reading_list', 'book')
        ordering = ['-added_at']

    def __str__(self):
        return f"{self.book} in {self.reading_list}"
