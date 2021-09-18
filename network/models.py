from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField('self', blank=True, related_name="followers", symmetrical=False)
    liked = models.ManyToManyField('Comment', blank=True, related_name="peopleWhoLike")


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="poster")
    comment = models.TextField(max_length=500, blank=False, null=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.PositiveIntegerField(default=0, blank=True, null=True)
    editTimestamp = models.DateTimeField(blank=True, null=True)
    
    
    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.id,
            "comment": self.comment,
            "timestamp": self.timestamp.strftime("%d-%m-%Y %H:%M:%S"),
            "likes": self.likes,
            "latestEdit": None if (self.editTimestamp is None) else self.editTimestamp.strftime("%d-%m-%Y %H:%M:%S")
        }