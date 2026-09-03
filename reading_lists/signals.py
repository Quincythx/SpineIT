from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import ReadingList

User = get_user_model()


@receiver(post_save, sender=User)
def create_default_reading_lists(sender, instance, created, **kwargs):
    if not created:
        return
    for key, label in ReadingList.DefaultKey.choices:
        ReadingList.objects.get_or_create(
            user=instance, default_key=key, defaults={'name': label},
        )
