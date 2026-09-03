from django.db.models.signals import post_save
from django.dispatch import receiver

from reviews.models import Like, Comment
from .models import Follow, Notification


@receiver(post_save, sender=Like)
def create_like_notification(sender, instance, created, **kwargs):
    if not created:
        return
    recipient = instance.review.user
    if recipient == instance.user:
        return
    Notification.objects.create(
        recipient=recipient,
        actor=instance.user,
        type=Notification.NotificationType.LIKE,
        review=instance.review,
    )


@receiver(post_save, sender=Comment)
def create_comment_notification(sender, instance, created, **kwargs):
    if not created:
        return
    recipient = instance.review.user
    if recipient == instance.user:
        return
    Notification.objects.create(
        recipient=recipient,
        actor=instance.user,
        type=Notification.NotificationType.COMMENT,
        review=instance.review,
    )


@receiver(post_save, sender=Follow)
def create_follow_notification(sender, instance, created, **kwargs):
    if not created:
        return
    Notification.objects.create(
        recipient=instance.following,
        actor=instance.follower,
        type=Notification.NotificationType.FOLLOW,
    )
