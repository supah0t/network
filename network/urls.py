
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("post", views.new_post, name="post"),
    path("show", views.show_posts, name="show"),
    path("<str:user>", views.show_profile, name="user")
]
