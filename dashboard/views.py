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
from dashboard.models import UserCreateForm, RFPAuthForm, PlayerForm, CoachForm, TestForm, UserForm, PlayerGroupForm, Coach, Authentication, myUser, PlayerGroup, Concept, Quiz, QuestionAttempted
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

def edit_profile(request):
	if request.method == 'POST':
		username = request.POST['username']
		users_with_desired_username = User.objects.filter(username=username)
		if (users_with_desired_username.count() == 0 or (users_with_desired_username.count() == 1 and request.user.username == username)):
			request.user.first_name = request.POST['first-name']
			request.user.last_name = request.POST['last-name']
			request.user.username = request.POST['username']
			request.user.email = request.POST['email']
			request.user.save()
			'''if(Authentication.get_player(request.user)):
				player = Authentication.get_player(request.user)
				player.position = request.POST['position']
				player.number = int(request.POST['number'])
				player.save()'''
		return HttpResponseRedirect("/edit_profile")
	else:
		first_name = request.user.first_name
		last_name = request.user.last_name
		username = request.user.username
		email = request.user.email
		return render(request, 'dashboard/edit_profile.html', {
			'first_name': first_name,
			'last_name': last_name,
			'username': username,
			'email': email,
			'page_header': 'EDIT PROFILE'
		})

def change_password(request):
	if request.method == 'POST':
		username = request.user.username
		current_password_input_by_user = request.POST['current-password']
		user = authenticate(username=username, password=current_password_input_by_user)

		new_password_1 = request.POST['new-password-1']
		new_password_2 = request.POST['new-password-2']
		if (user == request.user and new_password_1 == new_password_2):
			request.user.set_password(new_password_1)
			request.user.save()
			user = authenticate(username=username, password=new_password_1)
			login(request, user)
			return HttpResponseRedirect("/edit_profile")
		else:
			return HttpResponseRedirect("/change_password")
	else:
		return render(request, 'dashboard/change_password.html', {
			'page_header': 'EDIT PROFILE'
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

# Playbook
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

		formations = Formation.objects.filter(team=team, scout=False)
		scout_formations = Formation.objects.filter(team=team, scout=True)
		plays = Play.objects.filter(team=team)
		concepts = Concept.objects.filter(team=team)

		return render(request, 'dashboard/playbook.html', {
			'unit': unit,
			'formations': formations,
			'scoutFormations': scout_formations,
			'plays': plays,
			'concepts': concepts,
			'page_header': 'PLAYBOOK'
		})

# Formations
@login_required
def create_formation(request):
	if request.method == "POST":
		name = request.POST['name']
		if request.POST['save'] == "true":
			formationJson = request.POST['formation']
			formation = Formation.objects.filter(scout=False, name=name)
			if formation.count() == 1:
				formation = formation[0]
				formation.formationJson = formationJson
				formation.save()
			elif formation.count() == 0:
				formation = Formation()
				formation.name = name
				formation.team = request.user.coach.team
				formation.unit = request.POST['unit']
				formation.scout = False
				formation.formationJson = formationJson
				formation.save()
		elif request.POST['delete'] == "true":
			formation = Formation.objects.filter(scout=False, name=name)
			formation.delete()
		return HttpResponse('')
	else:
		coach = request.user.coach
		team = coach.team
		formations = Formation.objects.filter(team=team, scout=False)
		return render(request, 'dashboard/create_formation.html', {
			'team': team,
			'formations': formations,
			'page_header': 'CREATE FORMATION',
		})

def create_defensive_look(request):
	if request.method == "POST":
		name = request.POST['name']
		if request.POST['save'] == "true":
			formationJson = request.POST['formation']
			formation = Formation.objects.filter(scout=True, name=name)
			if formation.count() == 1:
				formation = formation[0]
				formation.formationJson = formationJson
				formation.save()
			elif formation.count() == 0:
				formation = Formation()
				formation.name = name
				formation.team = request.user.coach.team
				formation.unit = request.POST['unit']
				formation.scout = True
				formation.formationJson = formationJson
				formation.save()
		elif request.POST['delete'] == "true":
			formation = Formation.objects.filter(scout=True, name=name)
			formation.delete()
		return HttpResponse('')
	else:
		coach = request.user.coach
		team = coach.team
		formations = Formation.objects.filter(team=team, scout=True)
		return render(request, 'dashboard/create_defensive_look.html', {
			'team': team,
			'formations': formations,
			'page_header': 'CREATE DEFENSIVE LOOK',
		})

# Plays
def create_play(request):
	if request.method == "POST":
		name = request.POST['name']
		scout_name = request.POST['scout_name']
		formation_name = request.POST['formation']
		formation = Formation.objects.filter(scout=False, name=formation_name)[0]
		if request.POST['save'] == "true":
			playJson = request.POST['play']
			play = Play.objects.filter(scout=False, formation=formation, name=name, scoutName=scout_name)
			if play.count() == 1:
				play = play[0]
				play.playJson = playJson
				play.save()
			elif play.count() == 0:
				play = Play()
				play.name = name
				play.scoutName = scout_name
				play.team = request.user.coach.team
				play.unit = request.POST['unit']
				play.scout = False
				play.formation = Formation.objects.filter(name=formation_name)[0]
				play.playJson = playJson
				play.save()
		elif request.POST['delete'] == "true":
			play = Play.objects.filter(scout=False, formation=formation, name=name, scoutName=scout_name)
			play.delete()
		return HttpResponse('')
	else:
		coach = request.user.coach
		team = coach.team
		formations = Formation.objects.filter(team=team, scout=False)
		scout_formations = Formation.objects.filter(team=team, scout=True)
		plays = Play.objects.filter(team=team, scout=False)
		return render(request, 'dashboard/create_play.html', {
			'team': team,
			'formations': formations,
			'scoutFormations': scout_formations,
			'plays': plays,
			'page_header': 'CREATE PLAY',
		})

# Concepts
@login_required
def create_concept(request):
	if request.method == "POST":
		name = request.POST['name']
		if request.POST['save'] == "true":
			conceptJson = request.POST['concept']
			concept = Concept.objects.filter(scout=False, name=name)
			if concept.count() == 1:
				concept = concept[0]
				concept.conceptJson = conceptJson
				concept.save()
			elif concept.count() == 0:
				concept = Concept()
				concept.name = name
				concept.team = request.user.coach.team
				concept.unit = request.POST['unit']
				concept.scout = False
				concept.conceptJson = conceptJson
				concept.save()
		elif request.POST['delete'] == "true":
			concept = Concept.objects.filter(scout=False, name=name)
			concept.delete()
		return HttpResponse('')
	else:
		coach = request.user.coach
		team = coach.team
		concepts = Concept.objects.filter(team=team, scout=False)
		return render(request, 'dashboard/create_concept.html', {
			'team': team,
			'concepts': concepts,
			'page_header': 'CREATE CONCEPT',
		})

# Groups
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

def delete_group(request):
	if request.method == 'POST':
		group_id = request.POST['group_id']
		group = PlayerGroup.objects.filter(id=group_id)[0]
		group.delete()
		return HttpResponse('')

# Quizzes
@user_passes_test(lambda u: not u.myuser.is_a_player)
def quizzes(request):
	team = request.user.coach.team
	quizzes = Quiz.objects.filter(team=team)
	return render(request, 'dashboard/quizzes.html', {
			'quizzes': quizzes,
			'page_header': 'CREATE QUIZ',
		})

@user_passes_test(lambda u: not u.myuser.is_a_player)
def create_quiz(request):
	if request.method == 'POST':
		quiz = Quiz()
		quiz.name = request.POST['name']
		quiz.team = request.user.coach.team
		quiz.author = request.user
		quiz.unit = "offense" # Need to change this
		#quiz.deadline = deadline=request.POST['deadline_0'] #TODO implement dealine functionality
		quiz.save()

		# Loop through player ids and assign them to the quiz.
		for player_id in request.POST.getlist('player'):
			player = Player.objects.filter(pk=int(player_id))[0]
			quiz.players.add(player)
			quiz.save()

		quiz.save()
		return HttpResponseRedirect(reverse('manage_quiz', args=[quiz.id]))
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
			'groups': groups,
			'players_in_group': players_in_group,
			'page_header': 'CREATE QUIZ',
		})

@user_passes_test(lambda u: not u.myuser.is_a_player)
def manage_quiz(request, quiz_id):
	if request.method == 'POST':
		team = request.user.coach.team
		quiz = Quiz.objects.filter(name=request.POST['name'])[0]
		if request.POST['save'] == "true":
			quiz.formations.clear()
			quiz.plays.clear()
			quiz.concepts.clear()
			quiz.save()

			quiz_data = json.loads(request.POST['quiz'])
			
			formations_data = quiz_data["formations"]
			for formation_data in formations_data:
				formation = Formation.objects.filter(team=team, scout=False, name=formation_data["name"])[0]
				quiz.formations.add(formation)
				quiz.save()

			plays_data = quiz_data["plays"]
			for play_data in plays_data:
				play = Play.objects.filter(team=team, scout=False, name=play_data["name"], scoutName=play_data["scoutName"])[0]
				quiz.plays.add(play)
				quiz.save()

			concepts_data = quiz_data["concepts"]
			for concept_data in concepts_data:
				concept = Concept.objects.filter(team=team, scout=False, name=concept_data["name"])[0]
				quiz.concepts.add(concept)
				quiz.save()

			return HttpResponse('')
		elif request.POST['delete'] == "true":
			quiz.delete()
			return HttpResponseRedirect(reverse('create_quiz'))
	else:
		quiz = Quiz.objects.filter(id=quiz_id)[0]
		team = quiz.team
		unit = quiz.unit

		formations = Formation.objects.filter(team=team, scout=False)
		scout_formations = Formation.objects.filter(team=team, scout=True)
		plays = Play.objects.filter(team=team)
		concepts = Concept.objects.filter(team=team)

		quiz_formations = quiz.formations.all()
		quiz_plays = quiz.plays.all()
		quiz_concepts = quiz.concepts.all()

		return render(request, 'dashboard/manage_quiz.html', {
			'quiz': quiz,
			'quizFormations': quiz_formations,
			'quizPlays': quiz_plays,
			'quizConcepts': quiz_concepts,
			'scoutFormations': scout_formations,
			'formations': formations,
			'plays': plays,
			'concepts': concepts,
			'page_header': 'MANAGE QUIZ'
		})

@user_passes_test(lambda u: u.myuser.is_a_player)
def take_quiz(request, quiz_id):
	if request.method == 'POST':
		team = request.user.player.team
		quiz = Quiz.objects.filter(id=quiz_id)[0]
		player = request.user.player
		question_type = request.POST['type']
		score = request.POST['score']
		name = request.POST['name']

		questionAttempt = QuestionAttempted()
		questionAttempt.player = player
		questionAttempt.team = team
		questionAttempt.quiz = quiz
		questionAttempt.save()

		if question_type == "formation":
			formation = Formation.objects.filter(team=team, name=name)[0]
			questionAttempt.formation = formation
			questionAttempt.save()
		elif question_type == "play":
			formation_name = request.POST['formationName']
			scout_name = request.POST['scoutName']
			formation = Formation.objects.filter(team=team, scout=False, name=formation_name)[0]
			play = Play.objects.filter(team=team, formation=formation, scoutName=scout_name, name=name)[0]
			questionAttempt.play = play
			questionAttempt.save()
		elif question_type == "concept":
			concept = Concept.objects.filter(team=team, name=name)[0]
			questionAttempt.concept = concept
			questionAttempt.save()

		if score:
			questionAttempt.score = int(score)
			questionAttempt.save()

		return HttpResponse('')
	else:
		quiz = Quiz.objects.filter(id=quiz_id)[0]
		quiz_formations = quiz.formations.all()
		quiz_plays = quiz.plays.all()
		quiz_concepts = quiz.concepts.all()

		return render(request, 'dashboard/take_quiz.html', {
			'quiz': quiz,
			'quizFormations': quiz_formations,
			'quizPlays': quiz_plays,
			'quizConcepts': quiz_concepts,
			'page_header': quiz.name.upper()
		})

# Analytics
@login_required
def analytics(request):
	return render(request, 'dashboard/analytics.html', {
		'page_header': 'ANALYTICS'
	})

@user_passes_test(lambda u: not u.myuser.is_a_player)
def plays_analytics(request):
	plays_analytics = []
	team = request.user.coach.team
	plays = Play.objects.filter(team=team)

	for play in plays:
		play_analytics = []
		play_analytics.append(play.name)
		
		if play.scoutName != "":
			play_analytics.append(play.scoutName)
		else:
			play_analytics.append("None")

		number_correct = float(QuestionAttempted.objects.filter(play=play, score=1).count())
		number_incorrect = float(QuestionAttempted.objects.filter(play=play, score=0).count())
		number_skipped = float(QuestionAttempted.objects.filter(play=play, score=None).count())

		number_of_attempts = float(number_correct + number_incorrect + number_skipped)

		if number_of_attempts > 0:
			percentage_correct = (number_correct/number_of_attempts)*100 
			percentage_incorrect = (number_incorrect/number_of_attempts)*100
			percentage_skipped = (number_skipped/number_of_attempts)*100

			play_analytics.append(percentage_correct)
			play_analytics.append(percentage_incorrect)
			play_analytics.append(percentage_skipped)

			plays_analytics.append(play_analytics)	

	# Sort the list of play analytics in decending order by percent wrong
	plays_analytics.sort(key=lambda x: 100.0 - x[3])

	return render(request, 'dashboard/plays_analytics.html', {
		'plays_analytics': plays_analytics,
		'page_header': 'PLAYS ANALYTICS'
	})

@user_passes_test(lambda u: not u.myuser.is_a_player)
def players_analytics(request):
	players_analytics = []
	team = request.user.coach.team
	players = Player.objects.filter(team=team)

	for player in players:
		player_analytics = []
		player_analytics.append(player.first_name + " ")
		player_analytics.append(player.last_name)

		number_correct = float(QuestionAttempted.objects.filter(player=player, score=1).count())
		number_incorrect = float(QuestionAttempted.objects.filter(player=player, score=0).count())
		number_skipped = float(QuestionAttempted.objects.filter(player=player, score=None).count())

		number_of_attempts = float(number_correct + number_incorrect + number_skipped)

		if number_of_attempts > 0:
			percentage_correct = (number_correct/number_of_attempts)*100 
			percentage_incorrect = (number_incorrect/number_of_attempts)*100
			percentage_skipped = (number_skipped/number_of_attempts)*100

			player_analytics.append(percentage_correct)
			player_analytics.append(percentage_incorrect)
			player_analytics.append(percentage_skipped)

			players_analytics.append(player_analytics)	

	# Sort the list of play analytics in decending order by percent wrong
	players_analytics.sort(key=lambda x: 100.0 - x[3])

	return render(request, 'dashboard/players_analytics.html', {
		'players_analytics': players_analytics,
		'page_header': 'PLAYERS ANALYTICS'
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

def concepts_json(request):
	concepts = Concept.objects.all()
	#concept = concepts[0]
	return HttpResponse(serializers.serialize("json", concepts))

def concept_json(request, concept_id):
	concepts = Concept.objects.filter(id=concept_id)
	#concept = concepts[0]
	return HttpResponse(serializers.serialize("json", concepts))
