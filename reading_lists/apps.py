from django.apps import AppConfig


class ReadingListsConfig(AppConfig):
    name = 'reading_lists'

    def ready(self):
        import reading_lists.signals  # noqa: F401
