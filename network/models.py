from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField('self', blank=True, related_name="followers", symmetrical=False)
    #test = models.ForeignKey('Comment', blank=True, null=True, on_delete=models.CASCADE, related_name="test")


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="poster")
    comment = models.TextField(max_length=500, blank=False, null=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    #peopleWhoLike = models.ForeignKey(User, blank=False, null=False, on_delete=models.PROTECT, related_name="liked")
    likes = models.PositiveIntegerField(default=0, blank=True, null=True)
    editTimestamp = models.DateTimeField(blank=True, null=True)
    
    
    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.id,
            "comment": self.comment,
            "timestamp": self.timestamp.strftime("%m-%d-%Y %H:%M:%S"),
            "likes": self.likes,
        }