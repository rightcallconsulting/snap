from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django import forms
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.template import RequestContext, loader
from django.contrib.auth import logout, authenticate, login
from django.contrib.auth.decorators import login_required

from quiz.models import Player, Team, Play, Formation
from dashboard.models import UserCreateForm, RFPAuthForm, AthleteForm, UserForm, Athlete, Coach
from IPython import embed

# Create your views here.

@login_required
def homepage(request):
    return render(request, 'dashboard/homepage.html')

def auth_login(request):
    if request.user.is_authenticated():
        return HttpResponseRedirect("/")
    elif request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                login(request, user)
                return HttpResponseRedirect("/")
            # else:
                # Return a 'disabled account' error message
    else:
        form = RFPAuthForm()
        return render(request, 'dashboard/login.html', {
            'form': form,
        })

def auth_logout(request):
    logout(request)
    return HttpResponseRedirect("/login")


def register(request):
    if request.method == 'POST':
        form = UserCreateForm(request.POST)
        if form.is_valid():
            new_user = form.save()
            if 'Athlete' in request.POST.keys():
                new_athlete = Athlete(user=new_user)
                new_athlete.save()
            elif 'Coach' in request.POST.keys():
                new_coach = Coach(user=new_user)
                new_coach.save()
            user = authenticate(username=new_user.username, password=request.POST['password1'])
            login(request, user)
            return HttpResponseRedirect("/")

    else:
        form = UserCreateForm()
    return render(request, 'dashboard/register.html', {
        'form': form,
    })


def timeline(request):
    return render(request, 'dashboard/timeline.html')

@login_required
def messages(request):
    return render(request, 'dashboard/messages.html')

@login_required
def analytics(request):
    return render(request, 'dashboard/analytics.html')

@login_required
def playbook(request):
    return render(request, 'dashboard/playbook.html')

@login_required
def profile(request):
    return render(request, 'dashboard/profile.html')

@login_required
def settings(request):
    return render(request, 'dashboard/settings.html')

@login_required
def todo(request):
    return render(request, 'dashboard/to-do.html')

@login_required
def calendar(request):
    return render(request, 'dashboard/calendar.html')

def edit_profile(request):
    if request.method == 'POST':
        request.user.username = request.POST['username']
        request.user.first_name = request.POST['first_name']
        request.user.last_name = request.POST['last_name']
        request.user.email = request.POST['email']
        request.user.save()
        return HttpResponseRedirect("/edit_profile")
    else:
        athlete_form = AthleteForm(instance = request.user)
        user_form = UserForm(instance = request.user)
        return render(request, 'dashboard/edit_profile.html', {
            'athlete_form': athlete_form,
            'user_form': user_form,
        })
