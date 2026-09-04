from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import FeedView, FollowViewSet, NotificationViewSet

router = DefaultRouter()
router.register('follows', FollowViewSet, basename='follow')
router.register('notifications', NotificationViewSet, basename='notification')

urlpatterns = router.urls + [
    path('feed/', FeedView.as_view(), name='feed'),
]
