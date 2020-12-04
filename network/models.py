from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="poster")
    comment = models.TextField(max_length=500, blank=False, null=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.id,
            "comment": self.comment,
            "timestamp": self.timestamp.strftime("%m-%d-%Y %H:%I%p")
        }