from django.shortcuts import render, render_to_response
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django import forms
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.template import RequestContext, loader
from django.contrib.auth import logout, authenticate, login
from django.contrib.auth.decorators import login_required, user_passes_test
from django.core.urlresolvers import reverse
from django.conf import settings
import json
import simplejson

# from chartit import DataPool, Chart
from quiz.models import Player, Team, Play, Formation, Test, TestResult
from dashboard.models import UserCreateForm, RFPAuthForm, PlayerForm, CoachForm, TestForm, UserForm, PlayerGroupForm, Coach, Authentication, myUser, PlayerGroup
from IPython import embed
from datetime import datetime, timedelta
from django.utils import timezone
from django.core import serializers
import json
import simplejson
from graphos.sources.model import ModelDataSource, SimpleDataSource
from graphos.renderers import flot, gchart
from django.core.files.uploadedfile import SimpleUploadedFile
from dashboard.utils import PlayerAnalytics

@login_required
def homepage(request):
    if request.user.myuser.is_a_player:
        player = request.user.player
        players = [player]
        all_tests = player.test_set.all()
        completed_tests = all_tests.filter(completed=True).order_by('-created_at')
        uncompleted_tests = all_tests.filter(completed=False).order_by('-created_at')
        in_progress_tests = all_tests.filter(in_progress=True).order_by('-created_at')
        analytics = PlayerAnalytics(players)
        return render(request, 'dashboard/homepage.html', {
            'completed_tests': completed_tests,
            'uncompleted_tests': uncompleted_tests,
            'in_progress_tests': in_progress_tests,
            'current_time': timezone.now(),
            'new_time_threshold': timezone.now() + timedelta(days=3),
            'analytics': analytics,
            'page_header': 'DASHBOARD'
        })
    else:
        uncompleted_tests = Test.objects.filter(coach_who_created=request.user)
        groups = PlayerGroup.objects.filter(team=request.user.coach.team)
        if len(groups) > 0:
            first_group = groups[0]
            players = first_group.players.all()
            analytics = PlayerAnalytics(players)
            alarms = analytics.get_play_alarms()
        else:
            players = []
            analytics = None
            alarms = {}
        return render(request, 'dashboard/coachhome.html', {
            'uncompleted_tests': uncompleted_tests,
            'groups': groups,
            'players': players,
            'analytics': analytics,
            'alarms': alarms,
            'page_header': 'DASHBOARD',
            'MEDIA_ROOT': '/media/'
        })

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
        return render(request, 'dashboard/login.html', { 'form': form, })

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
                new_boolean_user = myUser(user=new_user, is_a_player=True, avatar_image=request.FILES['avatar_image'])
                new_boolean_user.save()
                new_player = Player(user=new_user, team=team)
                new_player.first_name = new_user.first_name
                new_player.last_name = new_user.last_name
                new_player.position = request.POST['position']
                new_player.save()
            elif 'Coach' in request.POST.keys():
                new_boolean_user = myUser(user=new_user, is_a_player=False, avatar_image=request.FILES['avatar_image'])
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
    if request.user.myuser.is_a_player:
        analytics = PlayerAnalytics.for_single_player(request.user.player)
        groups = []
    else:
        # If the user is a coach, the default analytics player set is a their
        # entire team, but they can use request.GET params to specify the pk of
        # one of their PlayerGroups or individual Players
        if 'player' in request.GET:
            player = Player.objects.get(pk=request.GET['player'])
            players = [player]
        elif 'playergroup' in request.GET:
            group = PlayerGroup.objects.get(pk=request.GET['playergroup'])
            players = group.players.all()
        else:
            players = request.user.coach.team.player_set.all()

        groups = PlayerGroup.objects.all()
        analytics = PlayerAnalytics.for_players(players)

    #embed()
    return render(request, 'dashboard/show_player_list.html', {
        # 'team': team,
        # 'players': players,
        'page_header': 'ANALYTICS',
        'analytics': analytics,
        'groups': groups,
    })

@login_required
def playbook(request, unit="offense"):
    if request.user.myuser.is_a_player:
        player = request.user.player
        return render(request, 'dashboard/playerbook.html', {
            'page_header': 'PLAYBOOK',
            'player': player
        })
    else:
        team = request.user.coach.team
        
        formations = team.formation_set.all()
        offensive_formations = formations.filter(unit="offense")
        defensive_formations = formations.filter(unit="defense")
        
        play_id_array = []
        
        unique_defensive_formations_dict = {}
        
        for formation in defensive_formations:
            unique_defensive_formations_dict[formation.name] = formation
            unique_defensive_formations = unique_defensive_formations_dict.values()
        
        return render(request, 'dashboard/playbook.html', {
            'formations': formations,
            'offensive_formations': offensive_formations,
            'defensive_formations': defensive_formations,
            'team': team,
            'play_id_array': play_id_array,
            'page_header': 'PLAYBOOK',
            'selected_unit': unit,
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
            'page_header': 'TO DO'
        })
    else:
        coach = request.user.coach
        tests_assigned = Test.objects.filter(coach_who_created=request.user)
        groups = PlayerGroup.objects.all()
        #embed()
        return render(request, 'dashboard/to-do.html', {
            'uncompleted_tests': tests_assigned,
            'current_time': timezone.now(),
            'new_time_threshold': timezone.now() + timedelta(days=3),
            'page_header': 'ASSIGNED QUIZZES',
            'groups': groups,
            'groups_seed': serializers.serialize("json", groups)
        })

@login_required
def calendar(request):
    return render(request, 'dashboard/calendar.html',{
        'page_header': 'CALENDAR',
    })

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
        type_of_test = request.POST['type_of_test']
        new_test = Test(name= request.POST['name'], player=player, type_of_test=request.POST['type_of_test'], deadline=request.POST['deadline_0'], coach_who_created=request.user)
        new_test.save()
        return HttpResponseRedirect(reverse('edit_test', args=[new_test.id]))
    else:
        form = TestForm()
        plays = request.user.coach.team.play_set.all()
        groups = PlayerGroup.objects.all()
        safeGroups = []
        for g in groups:
            safeGroups.append(g.build_dict_for_json_seed())
        return render(request, 'dashboard/create_test.html', {
            'form': form,
            'plays': plays,
            'types_of_tests': Test.types_of_tests,
            'page_header': 'CREATE TEST',
            'groups': json.dumps(safeGroups)
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
            'page_header': 'EDIT PROFILE'
        })

@user_passes_test(lambda u: not u.myuser.is_a_player)
def edit_test(request, test_id):
    if request.method == 'POST':
        test = Test.objects.filter(id=test_id)[0]
        add_or_remove = request.POST['add_or_remove']
        if request.POST['defense'] == "false":
            play_id = request.POST['play_id']
            play = Play.objects.filter(id=play_id)[0]
            if add_or_remove == "add":
                play.tests.add(test)
            else:
                play.tests.remove(test)
            play.save()
        else:
            defensive_formation_id = request.POST['defensive_formation_id']
            defensive_formation = Formation.objects.filter(id=defensive_formation_id)[0]
            if add_or_remove == "add":
                test.formations.add(defensive_formation)
            else:
                test.formations.remove(defensive_formation)
        test.save()
        return HttpResponse('')
    else:
        test = Test.objects.filter(id=test_id)[0]
        unit = test.unit()
        player = test.player
        team = test.player.team
        formations = team.formation_set.all()
        offensive_formations = formations.filter(unit="offense")
        defensive_formations = formations.filter(unit="defense")
        play_id_array = []
        plays_in_test = test.play_set.all()
        for play in test.play_set.all():
            play_id_array.append(play.id)
        defensive_formation_id_array = []
        defensive_formations_in_test = test.formations.all()
        for formation in defensive_formations_in_test:
            defensive_formation_id_array.append([formation.name, formation.offensiveFormationID])
        unique_defensive_formations_dict = {}
        for formation in defensive_formations:
            unique_defensive_formations_dict[formation.name] = formation
            unique_defensive_formations = unique_defensive_formations_dict.values()
        return render(request, 'dashboard/edit_test.html', {
            'test': test,
            'formations': formations,
            'offensive_formations': offensive_formations,
            'defensive_formations': defensive_formations,
            'team': team,
            'player': player,
            'play_id_array': play_id_array,
            'plays_in_test': plays_in_test,
            'unit': unit,
            'unique_defensive_formations': unique_defensive_formations,
            'defensive_formation_id_array': json.dumps(defensive_formation_id_array),
            'page_header': 'EDIT TEST'
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
            'page_header': 'CREATE GROUP'
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
            'group': group,
            'page_header': 'EDIT GROUP'
        })

def delete_group(request):
    if request.method == 'POST':
        group_id = request.POST['group_id']
        group = PlayerGroup.objects.filter(id=group_id)[0]
        group.delete()
        return HttpResponse('')

def delete_player_from_group(request):
    if request.method == 'POST':
        group_id = request.POST['groupID']
        player_id = request.POST['playerID']
        player = group.players.all().filter(pk=player_id)[0]
        group = PlayerGroup.objects.filter(pk=group_id)[0]
        embed()
        group.players.remove(player)
        return HttpResponse('')
    #return HttpResponse('')

@user_passes_test(lambda u: not u.myuser.is_a_player)
def all_groups(request):
    team = request.user.coach.team
    groups = PlayerGroup.objects.filter(team=team)
    if len(groups) > 0:
        first_group = groups[0].players.all()
        analytics = PlayerAnalytics(first_group)
    else:
        first_group = []
        analytics = None
    return render(request, 'dashboard/all_groups.html', {
        'team': team,
        'groups': groups,
        'first_players': first_group,
        'analytics': analytics,
        'page_header': 'GROUPS',
    })

@user_passes_test(lambda u: not u.myuser.is_a_player)
def group_detail(request, group_id):
    coach = request.user.coach
    group = PlayerGroup.objects.filter(id=group_id)[0]
    players = group.players.all()
    if request.POST:
        test_id = request.POST.get('testID')
        group_id = request.POST.get('groupID')
        player_id = request.POST.get('playerID')
        form_action = request.POST.get('form_action')
        if test_id:
            group.duplicate_and_assign_test_to_all_players(test_id, coach)
            return HttpResponse('')
        elif group_id and player_id and form_action == "delete_player_from_group":
            player = Player.objects.filter(pk=player_id)[0]
            group = PlayerGroup.objects.filter(pk=group_id)[0]
            group.players.remove(player)
            return HttpResponse('')
        elif group_id and player_id and form_action == "add_player_to_group":
            player = Player.objects.filter(pk=player_id)[0]
            group = PlayerGroup.objects.filter(pk=group_id)[0]
            group.players.add(player)
            return HttpResponse('')

    else:
        delete_group_form = PlayerGroupForm(instance = group)
        tests = Test.objects.filter(player__team=coach.team)
        groups = PlayerGroup.objects.filter(team=coach.team)
        return render(request, 'dashboard/group_detail.html', {
            'group': group,
            'groups': groups,
            'players': players,
            'tests': tests,
            'form': delete_group_form,
            'page_header': 'MANAGE GROUP'
        })

@user_passes_test(lambda u: not u.myuser.is_a_player)
def all_groups_json(request):
    groups = PlayerGroup.objects.all()
    players = Player.objects.filter(playergroup__in=groups)
    return HttpResponse(serializers.serialize("json", players))

@user_passes_test(lambda u: not u.myuser.is_a_player)
def group_json(request, group_id):
    group = PlayerGroup.objects.filter(id=group_id)[0]
    players = group.players.all()
    return HttpResponse(serializers.serialize("json", players))

@user_passes_test(lambda u: not u.myuser.is_a_player)
def test_analytics(request, test_id):
    coach = request.user.coach
    test = Test.objects.filter(pk=test_id)[0]
    formatted_list_for_graphos_missed_plays = test.get_missed_play_chart(5)
    test_results = test.testresult_set.all()
    test_result_queryset = test_results.reverse()[:5][::-1]
    data_source = ModelDataSource(test_result_queryset,
                                  fields=['string_id', 'score', 'skips', 'incorrect_guesses', 'time_taken'])
    chart = gchart.ColumnChart(data_source, options=
        {'title': "Test Results",
        'isStacked': 'true',
        'width': 700,
        'xaxis':
            {'label': "categories",
            'side': 'top'
            },
        'legend':
            { 'position': 'bottom' }
            ,
         'series': {'0': {'targetAxisIndex':'0', 'axis': 'score'},
                   '1':{'targetAxisIndex':'0', 'axis': 'score'},
                   '2':{'targetAxisIndex':'0', 'axis': 'score'},
                   '3':{'targetAxisIndex':'1', 'type': 'line'},

                  },
          'axes': {
              'x': {
                'discrete': 'string',
              },
              'y': {
                'score': {'label': '# of Quesitons'},
                'Time Taken': {'label': 'Time Taken'}
              }
            }
          }
    )
    missed_play_data =  formatted_list_for_graphos_missed_plays
    missed_play_chart = gchart.ColumnChart(SimpleDataSource(data=missed_play_data), options=
            {'title': "Missed Plays",
            'isStacked': 'true',
            'width': 700,
            'height': 300,
            'legend':
                { 'position': 'bottom' }
            }
    )

    skipped_play_data =  test.get_skipped_play_chart(5)
    skipped_play_chart = gchart.ColumnChart(SimpleDataSource(data=skipped_play_data), options=
            {'title': "Skipped Plays",
            'isStacked': 'true',
            'width': 700,
            'legend':
                { 'position': 'bottom' }
            }
    )
    test_results_length = len(test_results)
    return render_to_response('dashboard/analytics.html',{
        'test': test,
        'test_results': test_results,
        'chart': chart,
        'missed_play_chart': missed_play_chart,
        'skipped_play_chart': skipped_play_chart,
        'page_header': 'ANALYTICS',
        'test_results_length': test_results_length,
    })
