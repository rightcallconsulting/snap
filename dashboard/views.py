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
		order = ['Random', 'Difficulty', ]
		return render(request, 'dashboard/playerbook.html', {
			'page_header': 'PLAYBOOK',
			'player': player,
			'quiz_order_options': order,
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
def todo(request):
	if request.user.myuser.is_a_player:
		player = request.user.player
		all_tests = player.test_set.all()
		completed_tests = all_tests.filter(completed=True).order_by('-created_at')
		uncompleted_tests = all_tests.filter(completed=False).order_by('-created_at')
		in_progress_tests = all_tests.filter(in_progress=True).order_by('-created_at')
		return render(request, 'dashboard/todo.html', {
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
		return render(request, 'dashboard/todo.html', {
			'uncompleted_tests': tests_assigned,
			'current_time': timezone.now(),
			'new_time_threshold': timezone.now() + timedelta(days=3),
			'page_header': 'ASSIGNED QUIZZES',
			'groups': groups,
			'groups_seed': serializers.serialize("json", groups)
		})

@login_required
def create_formation(request):
	if request.method == "POST":
		return HttpResponseRedirect(reverse('playbook'))
	else:
		coach = request.user.coach
		team = coach.team
		formations = team.formation_set.all()
		return render(request, 'dashboard/create_formation.html', {
			'team': team,
			'formations': formations,
			'page_header': 'CREATE FORMATION',
		})

def quizzes(request):
	quizzes = Test.objects.all()
	return HttpResponse(serializers.serialize("json", quizzes))

@user_passes_test(lambda u: not u.myuser.is_a_player)
def create_quiz(request):
	if request.method == 'POST':
		# Get arguments for the quiz from the POST arguments and create
		# a new quiz using these values
		name = request.POST['name']
		team = request.user.coach.team
		type_of_quiz = request.POST['type_of_quiz']
		#deadline = deadline=request.POST['deadline_0'] #TODO implement dealine functionality
		new_quiz = Test(name=name, team=team, type_of_test=type_of_quiz, coach_who_created=request.user)
		new_quiz.save()

		# Loop through player ids and assign them to the quiz.
		for player_id in request.POST.getlist('player'):
			player = Player.objects.filter(pk=int(player_id))[0]
			new_quiz.players.add(player)
			new_quiz.save()

		new_quiz.save()
		return HttpResponseRedirect(reverse('manage_quiz', args=[new_quiz.id]))
	else:
		team = request.user.coach.team
		groups = PlayerGroup.objects.filter(team=team)
		plays = request.user.coach.team.play_set.all()

		if len(groups) > 0:
			players_in_group = groups[0].players.all()
			analytics = PlayerAnalytics(players_in_group)
		else:
			players_in_group = []
			analytics = None

		return render(request, 'dashboard/create_quiz.html', {
			'plays': plays,
			'types_of_quizzes': Test.types_of_tests,
			'groups': groups,
			'players_in_group': players_in_group,
			'page_header': 'CREATE QUIZ',
		})

@user_passes_test(lambda u: not u.myuser.is_a_player)
# I'm going to have to blow this view up and recreate it but I'm not sure what it
# should look like. - Dylan
def manage_quiz(request, quiz_id):
	if request.method == 'POST':
		quiz = Test.objects.filter(id=quiz_id)[0]
		add_or_remove = request.POST['add_or_remove']
		if request.POST['defense'] == "false":
			play_id = request.POST['play_id']
			play = Play.objects.filter(id=play_id)[0]
			if add_or_remove == "add":
				play.tests.add(quiz)
			else:
				play.tests.remove(quiz)
			play.save()
		else:
			defensive_formation_id = request.POST['defensive_formation_id']
			defensive_formation = Formation.objects.filter(id=defensive_formation_id)[0]
			if add_or_remove == "add":
				quiz.formations.add(defensive_formation)
			else:
				quiz.formations.remove(defensive_formation)
		quiz.save()
		return HttpResponse('')
	else:
		quiz = Test.objects.filter(id=quiz_id)[0]
		unit = quiz.unit()
		players = quiz.players
		player = None # Gonna need to fix this
		team = quiz.team
		formations = team.formation_set.all()
		offensive_formations = formations.filter(unit="offense")
		defensive_formations = formations.filter(unit="defense")
		unique_defensive_formations = []
		play_id_array = []
		plays_in_quiz = quiz.play_set.all()
		for play in quiz.play_set.all():
			play_id_array.append(play.id)
		defensive_formation_id_array = []
		defensive_formations_in_quiz = quiz.formations.all()
		for formation in defensive_formations_in_quiz:
			defensive_formation_id_array.append([formation.name, formation.offensiveFormationID])
		unique_defensive_formations_dict = {}
		for formation in defensive_formations:
			unique_defensive_formations_dict[formation.name] = formation
			unique_defensive_formations = unique_defensive_formations_dict.values()
		return render(request, 'dashboard/manage_quiz.html', {
			'quiz': quiz,
			'formations': formations,
			'offensive_formations': offensive_formations,
			'defensive_formations': defensive_formations,
			'team': team,
			'player': player,
			'play_id_array': play_id_array,
			'plays_in_quiz': plays_in_quiz,
			'unit': unit,
			'unique_defensive_formations': unique_defensive_formations,
			'defensive_formation_id_array': json.dumps(defensive_formation_id_array),
			'page_header': 'EDIT QUIZZES'
		})

@login_required
def my_quizzes(request):
	player = request.user.player
	return render(request, 'dashboard/my_quizzes.html')

@user_passes_test(lambda u: not u.myuser.is_a_player)
def groups(request):
	team = request.user.coach.team
	groups = PlayerGroup.objects.filter(team=team)
	
	if len(groups) > 0:
		players_in_group = groups[0].players.all()
		analytics = PlayerAnalytics(players_in_group)
	else:
		players_in_group = []
		analytics = None
	
	return render(request, 'dashboard/groups.html', {
		'team': team,
		'groups': groups,
		'players_in_group': players_in_group,
		'analytics': analytics,
		'page_header': 'GROUPS',
	})

@user_passes_test(lambda u: not u.myuser.is_a_player)
def create_group(request):
	if request.method == "POST":
		new_player_group = PlayerGroup()
		new_player_group.name = request.POST['name']
		new_player_group.team = request.user.coach.team
		new_player_group.save()

		for player_id in request.POST.getlist('player'):
			player = Player.objects.filter(pk=int(player_id))[0]
			new_player_group.players.add(player)

		new_player_group.save()

		return HttpResponseRedirect(reverse('groups'))
	else:
		form = PlayerGroupForm()
		players = Player.objects.filter(team=request.user.coach.team)
		return render(request, 'dashboard/create_group.html', {
			'form': form,
			'players': players,
			'page_header': 'CREATE GROUP',
		})

@user_passes_test(lambda u: not u.myuser.is_a_player)
def manage_groups(request):
	if request.method == "POST":
		group_id = int(request.POST['group'])
		group = PlayerGroup.objects.filter(pk=group_id)[0]

		# Lists to contain the primary keys to be operated on including duplicates.
		add_pks = [0]
		remove_pks = [0]
		
		# Loop through and place player pks on add list including duplicates.
		for player_id in request.POST.getlist('add_player'):
			add_pks.append(int(player_id))
		
		# Loop through and place player pks on remove list including duplicates.
		for player_id in request.POST.getlist('remove_player'):
			remove_pks.append(int(player_id))

		# The maximum primary key value in either list.
		max_pk = max(max(add_pks), max(remove_pks))

		# Lists of the number of respective operation per pk.
		number_adds = []
		number_removes = []

		# Loop through player pks starting from 0.
		for pk in range(max_pk):
			# Append the number of adds per player pk.
			number_adds.append(add_pks.count(pk+1))
			# Append the number of removes per player pk.
			number_removes.append(remove_pks.count(pk+1))

			# Calculate the difference between the number of adds and number of 
			# removes for player pk. This number should only ever be -1, 0, or 1. 
			# A player can only be added to the group if they started out of the
			# group or have already been removed and equal amount of times as they
			# have they been added.
			diff = number_adds[pk] - number_removes[pk]

			# If the diff is positve 1 then add the player associated with that pk
			# to the group. If the diff is negative 1 then remove the player. If it
			# is 0, do nothing. Otherwise, return an error for an invalid operation.
			if diff == 1:
				group.players.add(Player.objects.filter(pk=(pk+1))[0])
				group.save()
			elif diff == -1:
				group.players.remove(Player.objects.filter(pk=(pk+1))[0])
				group.save()
			elif diff == 0:
				group.save()
			else:
				sys.exit(1)

		return HttpResponseRedirect(reverse('groups'))
	else:
		team = request.user.coach.team
		groups = PlayerGroup.objects.filter(team=team)
		all_players_on_team = Player.objects.filter(team=team)
		players_not_in_group = []
		
		# If there is at least one group then add all the players
		# in the first group to the players_in_group list, and add
		# everyone else to the players_not_in_group list. Otherwise,
		# add no one to the players_in_group list and the whole team
		# to the players_not_in_group list.
		#
		# TODO: If there is no group then redirect to the create
		# group page because a coach can't manage groups if there
		# are none.
		if len(groups) > 0:
			players_in_group = groups[0].players.all()
			for player in all_players_on_team:
				if player not in players_in_group:
					players_not_in_group.append(player)
		else:
			players_in_group = []
			players_not_in_group = all_players_on_team
		
		return render(request, 'dashboard/manage_groups.html', {
			'team': team,
			'groups': groups,
			'players_in_group': players_in_group,
			'players_not_in_group': players_not_in_group,
			'page_header': 'MANAGE GROUPS',
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

def delete_group(request):
	if request.method == 'POST':
		group_id = request.POST['group_id']
		group = PlayerGroup.objects.filter(id=group_id)[0]
		group.delete()
		return HttpResponse('')

@user_passes_test(lambda u: not u.myuser.is_a_player)
def quiz_analytics(request, quiz_id):
	coach = request.user.coach
	quiz = Test.objects.filter(pk=quiz_id)[0]
	formatted_list_for_graphos_missed_plays = quiz.get_missed_play_chart(5)
	quiz_results = quiz.quizresult_set.all()
	quiz_result_queryset = quiz_results.reverse()[:5][::-1]
	data_source = ModelDataSource(quiz_result_queryset,
								  fields=['string_id', 'score', 'skips', 'incorrect_guesses', 'time_taken'])
	chart = gchart.ColumnChart(data_source, options=
		{
			'title': "Quiz Results",
			'isStacked': 'true',
			'width': 700,
			'xaxis':
			{
				'label': "categories",
				'side': 'top'
			},
			'legend': {'position': 'bottom'},
			'series': 
			{
				'0': {'targetAxisIndex':'0', 'axis': 'score'},
				'1':{'targetAxisIndex':'0', 'axis': 'score'},
				'2':{'targetAxisIndex':'0', 'axis': 'score'},
				'3':{'targetAxisIndex':'1', 'type': 'line'},

			},
			'axes': 
			{
				'x': 
				{
					'discrete': 'string',
				},
			  	'y': 
			  	{
					'score': {'label': '# of Quesitons'},
					'Time Taken': {'label': 'Time Taken'}
				}
			}
		}
	)
	missed_play_data =  formatted_list_for_graphos_missed_plays
	missed_play_chart = gchart.ColumnChart(SimpleDataSource(data=missed_play_data), options=
		{
			'title': "Missed Plays",
			'isStacked': 'true',
			'width': 700,
			'height': 300,
			'legend': {'position': 'bottom'}
		}
	)

	skipped_play_data =  test.get_skipped_play_chart(5)
	skipped_play_chart = gchart.ColumnChart(SimpleDataSource(data=skipped_play_data), options=
		{
			'title': "Skipped Plays",
			'isStacked': 'true',
			'width': 700,
			'legend': {'position': 'bottom'}
		}
	)
	quiz_results_length = len(quiz_results)
	return render_to_response('dashboard/analytics.html',{
		'test': quiz,
		'test_results': quiz_results,
		'chart': chart,
		'missed_play_chart': missed_play_chart,
		'skipped_play_chart': skipped_play_chart,
		'test_results_length': quiz_results_length,
		'page_header': 'ANALYTICS',
	})

# Concepts
@login_required
def concepts(request):
	if request.method == "POST":
		return HttpResponseRedirect(reverse('playbook'))
	else:
		coach = request.user.coach
		team = coach.team
		concepts = team.concept_set.all()
		return render(request, 'dashboard/concepts.html', {
			'team': team,
			'concepts': concepts,
			'page_header': 'CONCEPTS',
		})

@login_required
def create_concept(request):
	if request.method == "POST":
		conceptJson = request.POST['concept']
		concept = Concept()
		concept.name = conceptJson['name']
		concept.team = request.user.coach.team
		concept.unit = conceptJson['unit']
		concept.conceptJson = conceptJson
		concept.save()
		return HttpResponse('')
	else:
		coach = request.user.coach
		team = coach.team
		concepts = team.concept_set.all()
		return render(request, 'dashboard/create_concept.html', {
			'team': team,
			'concepts': concepts,
			'page_header': 'CREATE CONCEPT',
		})

# JSON requests
@user_passes_test(lambda u: not u.myuser.is_a_player)
def players_on_team_json(request, team_id):
	team = Team.objects.filter(id=team_id)[0]
	players = Player.objects.filter(team=team)
	return HttpResponse(serializers.serialize("json", players, fields = ['first_name', 'last_name', 'position', 'year']))

@user_passes_test(lambda u: not u.myuser.is_a_player)
def players_on_team_but_not_in_group_json(request, group_id, team_id):
	team = Team.objects.filter(id=team_id)[0]
	group = PlayerGroup.objects.filter(id=group_id)[0]
	players_on_team = Player.objects.filter(team=team)
	players_in_group = group.players.all()
	players_not_in_group = list(players_on_team)
	for player in list(players_in_group):
		players_not_in_group.remove(player)

	return HttpResponse(serializers.serialize("json", players_not_in_group, fields = ['first_name', 'last_name', 'position', 'year']))

@user_passes_test(lambda u: not u.myuser.is_a_player)
def all_groups_json(request):
	groups = PlayerGroup.objects.all()
	players = Player.objects.filter(playergroup__in=groups)
	return HttpResponse(serializers.serialize("json", players, fields = ['first_name', 'last_name', 'position', 'year']))

@user_passes_test(lambda u: not u.myuser.is_a_player)
def group_json(request, group_id):
	group = PlayerGroup.objects.filter(id=group_id)[0]
	players = group.players.all()
	return HttpResponse(serializers.serialize("json", players, fields = ['first_name', 'last_name', 'position', 'year']))
