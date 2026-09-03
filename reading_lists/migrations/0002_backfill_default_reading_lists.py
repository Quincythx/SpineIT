from django.conf import settings
from django.db import migrations

DEFAULT_LISTS = [
    ('want_to_read', 'Want to Read'),
    ('currently_reading', 'Currently Reading'),
    ('read', 'Read'),
]


def backfill_default_reading_lists(apps, schema_editor):
    ReadingList = apps.get_model('reading_lists', 'ReadingList')
    User = apps.get_model(*settings.AUTH_USER_MODEL.split('.'))

    for user in User.objects.all():
        for key, label in DEFAULT_LISTS:
            ReadingList.objects.get_or_create(
                user=user, default_key=key, defaults={'name': label},
            )


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('reading_lists', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RunPython(backfill_default_reading_lists, noop_reverse),
    ]
