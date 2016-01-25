from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django import forms
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.template import RequestContext, loader
from django.contrib.auth import logout, authenticate, login
from django.contrib.auth.decorators import login_required, user_passes_test
from django.core.urlresolvers import reverse

from quiz.models import Player, Team, Play, Formation, Test
from dashboard.models import UserCreateForm, RFPAuthForm, PlayerForm, CoachForm, TestForm, UserForm, PlayerGroupForm, Coach, Authentication, myUser, PlayerGroup
from IPython import embed
from datetime import datetime, timedelta
from django.utils import timezone
from django.core import serializers
import json
import simplejson

# Create your views here.

@login_required
def homepage(request):
    Test.objects.filter(coach_who_created=request.user)
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
                # return HttpResponseRedirect("/login")
        else:
            # [TBD] Display an error message that login failed
            return HttpResponseRedirect("/login")
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
        team = Team.objects.filter(id=request.POST['team'])[0]
        form = UserCreateForm(request.POST)
        if form.is_valid():
            new_user = form.save()
            if 'Player' in request.POST.keys():
                new_boolean_user = myUser(user=new_user, is_a_player=True)
                new_boolean_user.save()
                new_player = Player(user=new_user, team=team)
                new_player.first_name = new_user.first_name
                new_player.last_name = new_user.last_name
                new_player.position = request.POST['position']
                new_player.save()
            elif 'Coach' in request.POST.keys():
                new_boolean_user = myUser(user=new_user, is_a_player=False)
                new_boolean_user.save()
                new_coach = Coach(user=new_user, team=team)
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
    team = request.user.coach.team
    formations = team.formation_set.all()
    offensive_formations = formations.filter(unit="offense")
    defensive_formations = formations.filter(unit="defense")
    play_id_array = []
    return render(request, 'dashboard/playbook.html', {
        'formations': formations,
        'offensive_formations': offensive_formations,
        'defensive_formations': defensive_formations,
        'team': team,
        'play_id_array': play_id_array,
    })

@login_required
def profile(request):
    return render(request, 'dashboard/profile.html')

@login_required
def settings(request):
    return render(request, 'dashboard/settings.html')

@login_required
def todo(request):
    if request.user.myuser.is_a_player:
        player = request.user.player
        all_tests = player.test_set.all()
        completed_tests = all_tests.filter(completed=True).order_by('-created_at')
        uncompleted_tests = all_tests.filter(completed=False).order_by('-created_at')
        in_progress_tests = all_tests.filter(in_progress=True).order_by('-created_at')
        return render(request, 'dashboard/to-do.html', {
            'completed_tests': completed_tests,
            'uncompleted_tests': uncompleted_tests,
            'in_progress_tests': in_progress_tests,
            'current_time': timezone.now(),
            'new_time_threshold': timezone.now() + timedelta(days=3),
        })
    else:
        coach = request.user.coach
        tests_assigned = Test.objects.filter(coach_who_created=request.user)
        return render(request, 'dashboard/to-do.html', {
            'uncompleted_tests': tests_assigned,
            'current_time': timezone.now(),
            'new_time_threshold': timezone.now() + timedelta(days=3),
        })

@login_required
def calendar(request):
    return render(request, 'dashboard/calendar.html')

@login_required
def my_tests(request):
    player = request.user.player
    return render(request, 'dashboard/my_tests.html')

def all_tests(request):
    tests = Test.objects.all()
    return HttpResponse(serializers.serialize("json", tests))

@user_passes_test(lambda u: not u.myuser.is_a_player)
def create_test(request):
    if request.method == 'POST':
        player_id = Player.objects.filter(id=request.POST['player'])
        player = Player.objects.filter(id=player_id)[0]
        new_test = Test(name= request.POST['name'], player=player, type_of_test=request.POST['type_of_test'], deadline=request.POST['deadline_0'], coach_who_created=request.user)
        new_test.save()
        return HttpResponseRedirect(reverse('edit_test', args=[new_test.id]))
    else:
        form = TestForm()
        plays = request.user.coach.team.play_set.all()
        return render(request, 'dashboard/create_test.html', {
            'form': form,
            'plays': plays,
            'types_of_tests': Test.types_of_tests,
        })

def edit_profile(request):
    if request.method == 'POST':
        request.user.username = request.POST['username']
        request.user.first_name = request.POST['first_name']
        request.user.last_name = request.POST['last_name']
        request.user.email = request.POST['email']
        request.user.save()
        if(Authentication.get_player(request.user)):
            player = Authentication.get_player(request.user)
            player.position = request.POST['position']
            player.number = int(request.POST['number'])
            player.save()
        return HttpResponseRedirect("/edit_profile")
    else:
        if request.user.myuser.is_a_player:
            edit_profile_form = PlayerForm(instance = request.user.player)
        else:
            edit_profile_form = CoachForm(instance = request.user.coach)
        user_form = UserForm(instance = request.user)
        return render(request, 'dashboard/edit_profile.html', {
            'user_form': user_form,
            'edit_profile_form': edit_profile_form,
        })

@user_passes_test(lambda u: not u.myuser.is_a_player)
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
        plays_in_test = test.play_set.all()
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
            'plays_in_test': plays_in_test,

        })

@user_passes_test(lambda u: not u.myuser.is_a_player)
def create_group(request):
    if request.method == 'POST':
        new_group = PlayerGroup(name=request.POST['name'], team=request.user.coach.team)
        new_group.save()
        for player_id in request.POST.getlist('players'):
            player = Player.objects.filter(pk=int(player_id))[0]
            new_group.players.add(player)
        new_group.save()
        return HttpResponseRedirect(reverse('group_detail', args=[new_group.id]))
    else:
        form = PlayerGroupForm()
        return render(request, 'dashboard/create_group.html', {
            'form': form,
        })

def edit_group(request, group_id):
    group = PlayerGroup.objects.filter(id=group_id)[0]
    if request.method == 'POST':
        group.name = request.POST['name']
        group.players.clear()
        for player_id in request.POST.getlist('players'):
            player = Player.objects.filter(pk=int(player_id))[0]
            group.players.add(player)
        group.save()
        return HttpResponseRedirect(reverse('group_detail', kwargs={'group_id': group.id}))
    else:
        edit_group_form = PlayerGroupForm(instance = group)
        return render(request, 'dashboard/edit_group.html', {
            'edit_group_form': edit_group_form,
            'group': group
        })

@user_passes_test(lambda u: not u.myuser.is_a_player)
def all_groups(request):
    team = request.user.coach.team
    groups = PlayerGroup.objects.filter(team=team)
    return render(request, 'dashboard/all_groups.html', {
        'team': team,
        'groups': groups,
    })

@user_passes_test(lambda u: not u.myuser.is_a_player)
def group_detail(request, group_id):
    coach = request.user.coach
    group = PlayerGroup.objects.filter(id=group_id)[0]
    players = group.players.all()
    if request.POST:
        test_id = int(request.POST['testID'])
        group.duplicate_and_assign_test_to_all_players(test_id, coach)
        return HttpResponse('')
    else:
        tests = Test.objects.filter(player__team=coach.team)
        return render(request, 'dashboard/group_detail.html', {
            'group': group,
            'players': players,
            'tests': tests,
        })
