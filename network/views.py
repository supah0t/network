import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from .models import User, Comment
from .forms import Comment_Form
from django.forms.models import model_to_dict
from django.core import serializers
from django.core.paginator import Paginator
from datetime import datetime


def index(request):
    form = Comment_Form()
    user = request.user
    return render(request, "network/index.html", {
        'form': form,
        'user': user
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@csrf_exempt
def new_post(request):
    
    #Ensure that method is POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)    
        
    #Get contents of post
    data = json.loads(request.body)
    post = data.get("comment", "")
    user = User.objects.get(pk=request.user.id)
    
    comment = Comment(
        user = user,
        comment = post,
        likes = 0
    )
    comment.save()
    
    return JsonResponse({"message": "Post posted successfully."}, status=201)
    
@csrf_exempt
def edit_post(request):
    if request.method != "POST": 
        return JsonResponse({"error": "POST request required"}, status=400)
    
    data = json.loads(request.body)
    postText = data.get("comment", "")
    postId = data.get("id", "mistake")
    post = Comment.objects.get(pk=postId)
    post.comment = postText
    post.editTimestamp = datetime.now()
    post.save()
    
    return JsonResponse({"message": f"editTime: {post.editTimestamp}, likes: {post.likes}"}, status=201)

@csrf_exempt
def like_post(request):
    if request.method != "POST":
        return JsonResponse({'error': 'POST request required'}, status=400)
    data = json.loads(request.body)
    postId = data.get("id", "")
    post = Comment.objects.get(pk=postId)
    user = request.user
    if post in user.liked.all():
        user.liked.remove(postId)
        post.likes = 0 if (int(post.likes) == 0) else (int(post.likes) - 1)
        post.save()
        return JsonResponse({'likes': f'{post.likes}', 'liked': False})
    else:
        user.liked.add(postId)
        post.likes = 1 if (post.likes=="likes") else (int(post.likes) + 1)
        post.save()
        return JsonResponse({'likes': f'{post.likes}', 'liked': True})
    
    
#Super awesome inefficient way to add a value to the response data. Works tho
def show_posts(request):
    
    posts = Comment.objects.all()

    data = []
    posts = posts.order_by("-timestamp").all()
    for i in range(len(posts)):
        username = posts[i].user.get_username()
        myself = True if request.user==posts[i].user else False
        data.append(posts[i].serialize())
        data[i]['username'] = username
        data[i]['myself'] = myself
        data[i]['liked'] = False
        if posts[i] in request.user.liked.all():
            data[i]['liked'] = True

    paginator = Paginator(data, 10)
    finalData = []
    for i in range(paginator.num_pages):
        finalData.append(paginator.page(i + 1).object_list)
        
    return JsonResponse(finalData, safe=False)


def followed_posts(request):
    user = request.user
    
    people = user.following.all()
    data = []
    for j in range(len(people)):
        person = people[j].id
        posts = Comment.objects.filter(user = person)
        posts = posts.order_by("-timestamp").all()
        for i in range(len(posts)):
            data.append(posts[i].serialize())
            myself = True if user==posts[i].user else False
            data[len(data) - 1]['username'] = posts[i].user.get_username() 
            data[len(data) - 1]['myself'] = myself
            data[len(data) - 1]['liked'] = False
            if posts[i] in request.user.liked.all():
                data[len(data) - 1]['liked'] = True

    paginator = Paginator(data, 10)
    finalData = []
    for i in range((paginator.num_pages)):
        finalData.append(paginator.page(i + 1).object_list)

    return JsonResponse(finalData, safe=False)

def show_profile(request, user):
    
    if not isinstance(user, int):
        user = 0
    data = []
    user = User.objects.get(pk=user)
    posts = Comment.objects.filter(user=user)
    posts = posts.order_by("-timestamp").all()
    follow = False
    if request.user in user.followers.all():
        follow = True

    myself = False
    if request.user == user:
        myself =True

    username = posts[0].user.get_username()
    info = {
        'username': username,
        'following': len(user.following.all()),
        'followers': len(user.followers.all()),
        'follow': follow,
        'myself': myself
    }
    
    for i in range(len(posts)):
        data.append(posts[i].serialize())
        data[i]['username'] = username
        data[i]['myself'] = myself
        data[i]['liked'] = False
        if posts[i] in request.user.liked.all():
            data[i]['liked'] = True

    paginator = Paginator(data, 10)
    finalData = []
    for i in range(paginator.num_pages):
        finalData.append(paginator.page(i+1).object_list)
    
    finalData.insert(0, info)
    
    return JsonResponse(finalData, safe=False)


@csrf_exempt
def follow_user(request):
    #Ensure that method is POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)   

    #Get contents of post
    data = json.loads(request.body)
    toFollow = data.get("id", "error")
    follow = data.get("follow", "error")
    user = request.user
    
    if follow:
        user.following.remove(toFollow)
    else:
        user.following.add(toFollow)

    return JsonResponse({"message": "User followed successfully."}, status=201)
