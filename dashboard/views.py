from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django import forms
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.template import RequestContext, loader
from django.contrib.auth import logout, authenticate, login

from quiz.models import Player, Team, Play, Formation
from dashboard.models import UserCreateForm
from IPython import embed

# Create your views here.

def homepage(request):
    return render(request, 'dashboard/homepage.html')

def login(request):
    embed()
    return render(request, 'dashboard/login.html')

# def login_user(request):
#     embed()
#     # username = request.POST['username']
#     # password = request.POST['password']
#     # user = authenticate(username=username, password=password)
#     # if user is not None:
#     #     if user.is_active:
#     #         login(request, user)
#     #         # Redirect to a success page.
#     #     else:
#     #         # Return a 'disabled account' error message
#     # else:
#     #     # Return an 'invalid login' error message.
#     return render(request, 'dashboard/login.html')
#
# def logout_user(request):
#     # logout(request)
#     # Redirect to a success page
#     return render(request, 'dashboard/login.html')


def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            new_user = form.save()
            return HttpResponseRedirect("/books/")
        # user = User.objects.create_user(username=request.POST['username'],
        # password=request.POST['password'], email=request.POST['email'])
        # return HttpResponseRedirect("/")
    else:
        form = UserCreateForm()
    return render(request, 'dashboard/register.html', {
        'form': form,
    })
    # return render(request, 'dashboard/register.html')

def timeline(request):
    return render(request, 'dashboard/timeline.html')

def messages(request):
    return render(request, 'dashboard/messages.html')

def analytics(request):
    return render(request, 'dashboard/analytics.html')

def playbook(request):
    return render(request, 'dashboard/playbook.html')

def todo(request):
    return render(request, 'dashboard/to-do.html')

def calendar(request):
    return render(request, 'dashboard/calendar.html')
