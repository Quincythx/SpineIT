from rest_framework.routers import DefaultRouter
from .views import FollowViewSet, NotificationViewSet

router = DefaultRouter()
router.register('follows', FollowViewSet, basename='follow')
router.register('notifications', NotificationViewSet, basename='notification')

urlpatterns = router.urls
