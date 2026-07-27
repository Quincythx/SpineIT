from django.contrib.auth.models import AbstractUser
from django.db import models
import secrets
import hashlib

class User(AbstractUser):
    bio = models.TextField(blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    def __str__(self):
        return self.username


class EmailVerificationCode(models.Model):
    email = models.EmailField()
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=['email', 'code']),
        ]

    @staticmethod
    def generate_code():
        return ''.join(secrets.choice('0123456789') for _ in range(6))

    def is_expired(self):
        from django.utils import timezone
        return timezone.now() > self.expires_at