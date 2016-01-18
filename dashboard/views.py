from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django import forms
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.template import RequestContext, loader
from django.contrib.auth import logout, authenticate, login
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse

from quiz.models import Player, Team, Play, Formation, Test
from dashboard.models import UserCreateForm, RFPAuthForm, PlayerForm, TestForm, UserForm, Coach
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
            if 'Player' in request.POST.keys():
                new_player = Player(user=new_user)
                new_player.first_name = new_user.first_name
                new_player.last_name = new_user.last_name
                new_player.save()
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

def create_test(request):
    if request.method == 'POST':
        player_id = Player.objects.filter(id=request.POST['player'])
        player = Player.objects.filter(id=player_id)[0]
        new_test = Test(player=player, type_of_test=request.POST['type_of_test'])
        new_test.save()
        return HttpResponseRedirect(reverse('edit_test', args=[new_test.id]))
    else:
        form = TestForm()
        plays = request.user.player.team.play_set.all()
        return render(request, 'dashboard/create_test.html', {
            'form': form,
            'plays': plays,
        })

def edit_profile(request):
    if request.method == 'POST':
        request.user.username = request.POST['username']
        request.user.first_name = request.POST['first_name']
        request.user.last_name = request.POST['last_name']
        request.user.email = request.POST['email']
        request.user.save()
        return HttpResponseRedirect("/edit_profile")
    else:
        player_form = PlayerForm(instance = request.user)
        user_form = UserForm(instance = request.user)
        return render(request, 'dashboard/edit_profile.html', {
            'player_form': player_form,
            'user_form': user_form,
        })

def edit_test(request, test_id):
    if request.method == 'POST':
        play_id = request.POST['play_id']
        add_or_remove = request.POST['add_or_remove']
        test = Test.objects.filter(id=test_id)[0]
        play = Play.objects.filter(id=play_id)[0]
        if add_or_remove == "add":
            play.tests.add(test)
        else:
            play.tests.remove(test)
        play.save()
        test.save()
        return HttpResponse('')
    else:
        test = Test.objects.filter(id=test_id)[0]
        player = test.player
        team = test.player.team
        formations = team.formation_set.all()
        offensive_formations = formations.filter(unit="offense")
        defensive_formations = formations.filter(unit="defense")
        play_id_array = []
        for play in test.play_set.all():
            play_id_array.append(play.id)
        return render(request, 'dashboard/edit_test.html', {
            'test': test,
            'formations': formations,
            'offensive_formations': offensive_formations,
            'defensive_formations': defensive_formations,
            'team': team,
            'player': player,
            'play_id_array': play_id_array,
        })
