from django.conf import settings
from django.db import models


class Follow(models.Model):
    follower = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='following',
    )
    following = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='followers',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'following')
        constraints = [
            models.CheckConstraint(
                condition=~models.Q(follower=models.F('following')),
                name='social_follow_no_self_follow',
            )
        ]

    def __str__(self):
        return f"{self.follower} follows {self.following}"


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        LIKE = 'like', 'Like'
        COMMENT = 'comment', 'Comment'
        FOLLOW = 'follow', 'Follow'

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='+',
    )
    type = models.CharField(max_length=10, choices=NotificationType.choices)
    review = models.ForeignKey(
        'reviews.Review',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
    )
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.actor} {self.type} -> {self.recipient}"

