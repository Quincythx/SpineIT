import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reviews', '0006_migrate_review_book_data'),
    ]

    operations = [
        migrations.AlterField(
            model_name='review',
            name='book',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name='reviews',
                to='reviews.book',
            ),
        ),
        migrations.RemoveField(model_name='review', name='book_title'),
        migrations.RemoveField(model_name='review', name='author'),
        migrations.RemoveField(model_name='review', name='genre'),
    ]
