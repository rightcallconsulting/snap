from django.contrib.auth.models import User
from django import forms
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.shortcuts import render, render_to_response
from django.template import RequestContext, loader
from django.conf import settings
from django.contrib.auth.decorators import login_required, user_passes_test
from django.core.urlresolvers import reverse
import json
import simplejson
from random import shuffle
from IPython import embed
from datetime import datetime, timedelta
from django.utils import timezone
from django.core import serializers
from django.core.files.uploadedfile import SimpleUploadedFile

from .models import Admin, Coach, Player, PlayerGroup
from getsnap.models import Team
from playbook.models import Concept, Formation, Play
from quizzes.models import CustomQuiz, Quiz
from analytics.models import QuestionAttempted


@login_required
def homepage(request):
	if request.user.isPlayer():
		player = request.user.player
		team = player.team
		quizzes = Quiz.objects.filter(team=team, players__in=[player])
		quizzes_table = []
		position_groups = list(PlayerGroup.objects.filter(team=team, position_group=True, players__in=[player]))
		primary_position = player.primary_position

		if primary_position != None and primary_position in position_groups:
			position_groups.remove(primary_position)

		for quiz in quizzes:
			quiz_information = []
			quiz_information.append(quiz.name)

			if player in quiz.submissions.all():
				quiz_information.append(True)
			else:
				quiz_information.append(False)

			quiz_information.append(str(quiz.id))
			quizzes_table.append(quiz_information)

		if len(quizzes_table) > 4:
			quizzes_table = quizzes_table[0:4]

		newsfeed = []

		formations = Formation.objects.filter(team=team, scout=False)

		for formation in formations:
			news_item = []
			news_item.append("playbook")
			news_item.append("formation")
			news_item.append(formation.name)
			news_item.append("created")
			news_item.append(formation.created_at)
			full_link = "/playbook?initial_formation=" + formation.name
			news_item.append(full_link)
			newsfeed.append(news_item)

		plays = Play.objects.filter(team=team)

		for play in plays:
			news_item = []
			news_item.append("playbook")
			news_item.append("play")
			news_item.append(play.name)
			if play.scoutName == "":
				news_item.append("created")
			else:
				newstext = "created for scout formation " + play.scoutName
				news_item.append(newstext)

			news_item.append(play.created_at)
			full_link = "/playbook?initial_playbook=Offensive Playbook&initial_formation=" + play.formation.name + "&initial_play=" + play.name
			if play.scoutName != "":
				full_link += "&initial_scout_defense=" + play.scoutName
			news_item.append(full_link)
			newsfeed.append(news_item)

		concepts = Concept.objects.filter(team=team)

		for concept in concepts:
			news_item = []
			news_item.append("playbook")
			news_item.append("concept")
			news_item.append(concept.name)
			news_item.append("created")
			news_item.append(concept.created_at)
			full_link = "/playbook?initial_playbook=Offensive Concepts&initial_concept=" + concept.name
			news_item.append(full_link)
			newsfeed.append(news_item)

		defensive_looks = Formation.objects.filter(team=team, scout=True)

		for formation in defensive_looks:
			news_item = []
			news_item.append("playbook")
			news_item.append("formation")
			news_item.append(formation.name)
			news_item.append("created")
			news_item.append(formation.created_at)
			full_link = "/playbook?initial_playbook=Defensive Looks&initial_defense=" + formation.name
			news_item.append(full_link)
			newsfeed.append(news_item)

		quizzes = Quiz.objects.filter(team=team, players__in=[player])

		for quiz in quizzes:
			news_item = []
			news_item.append("quiz")
			news_item.append("quiz")
			news_item.append(quiz.name)
			news_item.append("assigned to you")
			news_item.append(quiz.created_at)
			news_item.append("/quizzes/take/" + str(quiz.id))
			newsfeed.append(news_item)

		newsfeed.sort(key=lambda x: x[4], reverse=True)
		if len(newsfeed) > 20:
			newsfeed = newsfeed[0:20]

		custom_quizzes = list(CustomQuiz.objects.filter(team=team, player=player))
		#sort by recent (if not default?)
		custom_quizzes.sort(key=lambda quiz: quiz.created_at, reverse=True)
		custom_quizzes = custom_quizzes[0:5] #keep it recent

		custom_quiz_tuples = []
		for quiz in custom_quizzes:
			custom_quiz_tuples.append((str(quiz), quiz.launch_url()))

		custom_quizzes = custom_quiz_tuples

		return render(request, 'dashboard/player_homepage.html', {
			'newsfeed': newsfeed,
			'quizzes': quizzes_table,
			'custom_quizzes': custom_quizzes,
			'team': team,
			'primary_position': player.primary_position,
			'other_positions': position_groups,
			'page_header': 'DASHBOARD'
		})
	else:
		recent_results = []
		team = request.user.coach.team
		time_range = [timezone.now()-timedelta(days=5), timezone.now()]

		formations = Formation.objects.filter(team=team)

		for formation in formations:
			result = []
			result.append(formation.name)

			result.append("formation")

			number_correct = float(QuestionAttempted.objects.filter(team=team, time__range=time_range, formation=formation, play=None, score=1).count())
			number_incorrect = float(QuestionAttempted.objects.filter(team=team, time__range=time_range, formation=formation, play=None, score=0).count())
			number_skipped = float(QuestionAttempted.objects.filter(team=team, time__range=time_range, formation=formation, play=None, score=None).count())

			number_of_attempts = float(number_correct + number_incorrect + number_skipped)

			if number_of_attempts > 0:
				percentage_incorrect = (number_incorrect/number_of_attempts)*100
				result.append(percentage_incorrect)
				recent_results.append(result)

		plays = Play.objects.filter(team=team)

		for play in plays:
			result = []
			result.append(play.name)

			result.append("play")

			number_correct = float(QuestionAttempted.objects.filter(team=team, time__range=time_range, play__name=play.name, score=1).count())
			number_incorrect = float(QuestionAttempted.objects.filter(team=team, time__range=time_range, play__name=play.name, score=0).count())
			number_skipped = float(QuestionAttempted.objects.filter(team=team, time__range=time_range, play__name=play.name, score=None).count())

			number_of_attempts = float(number_correct + number_incorrect + number_skipped)

			if number_of_attempts > 0:
				percentage_incorrect = (number_incorrect/number_of_attempts)*100
				result.append(percentage_incorrect)
				if result not in recent_results:
					recent_results.append(result)

		concepts = Concept.objects.filter(team=team)

		for concept in concepts:
			result = []
			result.append(concept.name)

			result.append("concept")

			number_correct = float(QuestionAttempted.objects.filter(team=team, time__range=time_range, concept=concept, score=1).count())
			number_incorrect = float(QuestionAttempted.objects.filter(team=team, time__range=time_range, concept=concept, score=0).count())
			number_skipped = float(QuestionAttempted.objects.filter(team=team, time__range=time_range, concept=concept, score=None).count())

			number_of_attempts = float(number_correct + number_incorrect + number_skipped)

			if number_of_attempts > 0:
				percentage_incorrect = (number_incorrect/number_of_attempts)*100
				result.append(percentage_incorrect)
				recent_results.append(result)

		# Sort the list of results in decending order by percent wrong
		recent_results.sort(key=lambda x: -x[2])
		if len(recent_results) > 7:
			recent_results = recent_results[0:7]

		quizzes = Quiz.objects.filter(team=team)[:7]
		quizzes_table = []

		for quiz in quizzes:
			quiz_information = []
			quiz_information.append(quiz.name)

			number_correct = float(QuestionAttempted.objects.filter(team=team, quiz=quiz, score=1).count())
			number_incorrect = float(QuestionAttempted.objects.filter(team=team, quiz=quiz, score=0).count())
			number_skipped = float(QuestionAttempted.objects.filter(team=team, quiz=quiz, score=None).count())

			number_of_attempts = float(number_correct + number_incorrect + number_skipped)

			quiz_information.append(quiz.submissions.count())
			quiz_information.append(quiz.players.count())

			quiz_information.append(str(quiz.id))

			quizzes_table.append(quiz_information)

		return render(request, 'dashboard/coach_homepage.html', {
			'recent_results': recent_results,
			'quizzes': quizzes_table,
			'team': team,
			'page_header': 'DASHBOARD'
		})

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
		if request.user.isPlayer():
			team = request.user.player.team
		else:
			team = request.user.coach.team
		first_name = request.user.first_name
		last_name = request.user.last_name
		username = request.user.username
		email = request.user.email
		return render(request, 'dashboard/edit_profile.html', {
			'first_name': first_name,
			'last_name': last_name,
			'username': username,
			'email': email,
			'team': team,
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
		if request.user.isPlayer():
			team = request.user.player.team
		else:
			team = request.user.coach.team
		return render(request, 'dashboard/change_password.html', {
			'team': team,
			'page_header': 'EDIT PROFILE'
		})

# Groups
@user_passes_test(lambda u: not u.isPlayer())
def groups(request):
	team = request.user.coach.team
	groups = PlayerGroup.objects.filter(team=team)

	if request.method == "POST" and request.POST['action'] == "DELETE":
		group_id = int(request.POST['group_id'])
		groups = groups.filter(pk=group_id)
		if len(groups) > 0:
			groups[0].delete()
		return

	if len(groups) > 0:
		players_in_group = groups[0].players.all()
		analytics = None #PlayerAnalytics(players_in_group)
	else:
		players_in_group = []
		analytics = None

	return render(request, 'dashboard/groups.html', {
		'groups': groups,
		'players_in_group': players_in_group,
		'analytics': analytics,
		'team': team,
		'page_header': 'GROUPS'
	})

@user_passes_test(lambda u: not u.isPlayer())
def create_group(request):
	team = request.user.coach.team
	if request.method == "POST":
		group = PlayerGroup()
		group.name = request.POST['name']
		group.team = request.user.coach.team
		group.save()

		if 'position-group' in request.POST.keys():
			group.position_group = True
			group.position_type = request.POST['position-type']
			group.abbreviation = request.POST['abbreviation']

			if len(group.abbreviation) > 3:
				group.abbreviation = group.abbreviation[0:3]
				group.save()
			elif len(group.abbreviation) == 0:
				group.abbreviation = group.name[0:1]
				group.save()

		for player_id in request.POST.getlist('player'):
			player = Player.objects.filter(team=team, pk=int(player_id))[0]
			group.players.add(player)
			group.save()

		group.save()

		return HttpResponseRedirect(reverse('groups'))
	else:
		players = Player.objects.filter(team=team)
		groups = PlayerGroup()
		groups = groups.POSITIONS
		return render(request, 'dashboard/create_group.html', {
			'players': players,
			'groups': groups,
			'team': team,
			'page_header': 'CREATE GROUP'
		})

@user_passes_test(lambda u: not u.isPlayer())
def manage_groups(request):
	team = request.user.coach.team
	if request.method == "POST":
		group_id = int(request.POST['group'])
		group = PlayerGroup.objects.filter(team=team, pk=group_id)[0]

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
				group.players.add(Player.objects.filter(team=team, pk=(pk+1))[0])
				group.save()
			elif diff == -1:
				group.players.remove(Player.objects.filter(team=team, pk=(pk+1))[0])
				group.save()
			elif diff == 0:
				group.save()
			else:
				sys.exit(1)

		return HttpResponseRedirect(reverse('groups'))
	else:
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
			'team': team,
			'page_header': 'MANAGE GROUPS'
		})

def delete_group(request):
	team = request.user.coach.team
	if request.method == 'POST':
		group_id = request.POST['group_id']
		group = PlayerGroup.objects.filter(team=team, id=group_id)[0]
		group.delete()
		return HttpResponse('')

### Admin #################################################
@user_passes_test(lambda user: user.isCoach())
def team(request):
	team = request.user.coach.team
	return render(request, 'dashboard/team.html', {
			'team': team,
			'page_header': 'ADMIN'
		})

### JSON requests #########################################
@user_passes_test(lambda u: not u.isPlayer())
def players_on_team_json(request, team_id):
	team = Team.objects.filter(id=team_id)[0]
	players = Player.objects.filter(team=team)
	return HttpResponse(serializers.serialize("json", players, fields = ['first_name', 'last_name', 'position', 'year']))

@user_passes_test(lambda u: not u.isPlayer())
def players_on_team_but_not_in_group_json(request, group_id, team_id):
	team = Team.objects.filter(id=team_id)[0]
	group = PlayerGroup.objects.filter(team=team, id=group_id)[0]
	players_on_team = Player.objects.filter(team=team)
	players_in_group = group.players.all()
	players_not_in_group = list(players_on_team)
	for player in list(players_in_group):
		players_not_in_group.remove(player)

	return HttpResponse(serializers.serialize("json", players_not_in_group, fields = ['first_name', 'last_name', 'position', 'year']))

@user_passes_test(lambda u: not u.isPlayer())
def all_groups_json(request):
	groups = PlayerGroup.objects.all()
	players = Player.objects.filter(playergroup__in=groups)
	return HttpResponse(serializers.serialize("json", players, fields = ['first_name', 'last_name', 'position', 'year']))

@user_passes_test(lambda u: not u.isPlayer())
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
