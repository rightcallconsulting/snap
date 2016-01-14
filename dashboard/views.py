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
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)
        embed()
        if user is not None:
            if user.is_active:
                login(request, user)
                embed()
                # Redirect to a success page.
                return HttpResponseRedirect("/")
            # else:
                # Return a 'disabled account' error message
    else:
        return render(request, 'dashboard/login.html')

def logout(request):
    logout(request)
    # Redirect to a success page
    # return render(request, '/')
    return HttpResponseRedirect("/")


def register(request):
    if request.method == 'POST':
        form = UserCreateForm(request.POST)
        if form.is_valid():
            new_user = form.save()
            return HttpResponseRedirect("/")

    else:
        form = UserCreateForm()
    return render(request, 'dashboard/register.html', {
        'form': form,
    })


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
