from django.contrib import admin
from .models import ReadingList, ReadingListItem

# Register your models here.
admin.site.register(ReadingList)
admin.site.register(ReadingListItem)
