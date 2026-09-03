from rest_framework.routers import DefaultRouter
from .views import ReadingListViewSet, ReadingListItemViewSet

router = DefaultRouter()
router.register('reading-lists', ReadingListViewSet, basename='reading-list')
router.register('reading-list-items', ReadingListItemViewSet, basename='reading-list-item')

urlpatterns = router.urls
