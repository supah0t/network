
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("post", views.new_post, name="post"),
    path("show", views.show_posts, name="show"),
    path("<int:user>", views.show_profile, name="user"),
    path("follow", views.follow_user, name="follow"),
    path('followed_posts', views.followed_posts, name="followed_posts"),
    path('edit', views.edit_post, name="edit_post"),
    path('like', views.like_post, name="like_post")
]
