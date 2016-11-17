from django.contrib.auth.models import User
from django import forms
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.shortcuts import render, render_to_response
from django.template import RequestContext, loader
from django.contrib.auth.decorators import login_required, user_passes_test
from django.core.urlresolvers import reverse
from django.conf import settings
import json
import simplejson
from random import shuffle
from IPython import embed
from datetime import datetime, timedelta
from django.utils import timezone
from django.core import serializers
from django.core.files.uploadedfile import SimpleUploadedFile

from .models import PlayerForm, CoachForm, UserForm, PlayerGroupForm, Coach, Authentication, myUser, PlayerGroup, Quiz, QuestionAttempted, CustomQuiz, Player
from getsnap.models import Team
from playbook.models import Concept, Formation, Play


@login_required
def homepage(request):
	if request.user.myuser.is_a_player:
		player = request.user.player
		team = player.team
		quizzes = Quiz.objects.filter(team=team, players__in=[player])
		quizzes_table = []
		position_groups = PlayerGroup.objects.filter(team=team, position_group=True, players__in=[player])

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

		formations = Formation.objects.filter(team=team)

		for formation in formations:
			news_item = []
			news_item.append("playbook")
			news_item.append("formation")
			news_item.append(formation.name)
			news_item.append("created")
			news_item.append(formation.created_at)
			news_item.append("/playbook")
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
			news_item.append("/playbook")
			newsfeed.append(news_item)

		concepts = Concept.objects.filter(team=team)

		for concept in concepts:
			news_item = []
			news_item.append("playbook")
			news_item.append("concept")
			news_item.append(concept.name)
			news_item.append("created")
			news_item.append(concept.created_at)
			news_item.append("/playbook")
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

		return render(request, 'dashboard/player_homepage.html', {
			'newsfeed': newsfeed,
			'quizzes': quizzes_table,
			'team': team,
			'position_groups': position_groups,
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
		if request.user.myuser.is_a_player:
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
		if request.user.myuser.is_a_player:
			team = request.user.player.team
		else:
			team = request.user.coach.team
		return render(request, 'dashboard/change_password.html', {
			'team': team,
			'page_header': 'EDIT PROFILE'
		})

# Groups
@user_passes_test(lambda u: not u.myuser.is_a_player)
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

@user_passes_test(lambda u: not u.myuser.is_a_player)
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

@user_passes_test(lambda u: not u.myuser.is_a_player)
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

# Quizzes
@user_passes_test(lambda u: not u.myuser.is_a_player)
def assigned_quizzes(request):
	team = request.user.coach.team
	quizzes = Quiz.objects.filter(team=team)
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

		if number_of_attempts > 0:
			percentage_correct = (number_correct/number_of_attempts)*100
			percentage_incorrect = (number_incorrect/number_of_attempts)*100
			percentage_skipped = (number_skipped/number_of_attempts)*100

			quiz_information.append(percentage_correct)
			quiz_information.append(percentage_incorrect)
			quiz_information.append(percentage_skipped)
		else:
			quiz_information.append(0.0)
			quiz_information.append(0.0)
			quiz_information.append(0.0)

		quiz_information.append(str(quiz.id))

		quizzes_table.append(quiz_information)

	return render(request, 'dashboard/quizzes.html', {
			'quizzes': quizzes_table,
			'team': team,
			'page_header': 'QUIZZES'
		})

@user_passes_test(lambda u: not u.myuser.is_a_player)
def create_quiz(request):
	team = request.user.coach.team
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
			player = Player.objects.filter(team=team, pk=int(player_id))[0]
			quiz.players.add(player)
			quiz.save()

		quiz.save()
		return HttpResponseRedirect(reverse('manage_quiz', args=[quiz.id]))
	else:
		groups = PlayerGroup.objects.filter(team=team)
		plays = request.user.coach.team.play_set.all()

		if len(groups) > 0:
			players_in_group = groups[0].players.all()
			analytics = None #PlayerAnalytics(players_in_group)
		else:
			players_in_group = []
			analytics = None

		return render(request, 'dashboard/create_quiz.html', {
			'groups': groups,
			'players_in_group': players_in_group,
			'team': team,
			'page_header': 'CREATE QUIZ'
		})

@user_passes_test(lambda u: not u.myuser.is_a_player)
def manage_quiz(request, quiz_id):
	team = request.user.coach.team
	if request.method == 'POST':
		quiz = Quiz.objects.filter(team=team, name=request.POST['name'])[0]
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
		quiz = Quiz.objects.filter(team=team, id=quiz_id)[0]
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
			'team': team,
			'page_header': 'MANAGE QUIZ'
		})

@user_passes_test(lambda u: u.myuser.is_a_player)
def quizzes_todo(request):
	player = request.user.player
	team = player.team
	quizzes = Quiz.objects.filter(team=team, players__in=[player])
	quizzes_table = []
	position_groups = PlayerGroup.objects.filter(team=team, position_group=True, players__in=[player])

	for quiz in quizzes:
		quiz_information = []
		quiz_information.append(quiz.name)

		if player in quiz.submissions.all():
			quiz_information.append(True)
		else:
			quiz_information.append(False)

		number_correct = float(QuestionAttempted.objects.filter(team=team, quiz=quiz, player=player, score=1).count())
		number_incorrect = float(QuestionAttempted.objects.filter(team=team, quiz=quiz, player=player, score=0).count())
		number_skipped = float(QuestionAttempted.objects.filter(team=team, quiz=quiz, player=player, score=None).count())

		number_of_attempts = float(number_correct + number_incorrect + number_skipped)

		if number_of_attempts > 0:
			percentage_correct = (number_correct/number_of_attempts)*100
			percentage_incorrect = (number_incorrect/number_of_attempts)*100
			percentage_skipped = (number_skipped/number_of_attempts)*100

			quiz_information.append(percentage_correct)
			quiz_information.append(percentage_incorrect)
			quiz_information.append(percentage_skipped)
		else:
			quiz_information.append(0.0)
			quiz_information.append(0.0)
			quiz_information.append(0.0)

		quiz_information.append(str(quiz.id))
		quizzes_table.append(quiz_information)

	return render(request, 'dashboard/todo.html', {
			'quizzes': quizzes_table,
			'team': team,
			'position_groups': position_groups,
			'page_header': 'TODO'
		})

@user_passes_test(lambda u: u.myuser.is_a_player)
def take_quiz(request, quiz_id, position=''):
	team = request.user.player.team
	player = request.user.player
	if request.method == 'POST':
		quiz = Quiz.objects.filter(team=team, id=quiz_id)[0]
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
		quiz = Quiz.objects.filter(team=team, id=quiz_id)[0]
		quiz_formations = quiz.formations.all()
		quiz_plays = quiz.plays.all()
		quiz_concepts = quiz.concepts.all()
		position_groups = PlayerGroup.objects.filter(team=team, position_group=True, players__in=[player])

		if len(position) > 0:
			position_groups = PlayerGroup.objects.filter(team=team, position_group=True, players__in=[player], abbreviation=position)

		return render(request, 'dashboard/take_quiz.html', {
			'quiz': quiz,
			'quizFormations': quiz_formations,
			'quizPlays': quiz_plays,
			'quizConcepts': quiz_concepts,
			'positionGroups': position_groups,
			'team': team,
			'page_header': quiz.name.upper()
		})

@user_passes_test(lambda u: u.myuser.is_a_player)
def submit_quiz(request):
	team = request.user.player.team
	if request.method == 'POST':
		name = request.POST['name']
		quiz = Quiz.objects.filter(team=team, name=name)[0]

		player = request.user.player
		quiz.submissions.add(player)
		quiz.save()

		return HttpResponse('')

@user_passes_test(lambda u: u.myuser.is_a_player)
def custom_quizzes(request, unit="offense"):
	player = request.user.player
	team = player.team
	position_groups = PlayerGroup.objects.filter(team=team, position_group=True, players__in=[player])
	return render(request, 'dashboard/custom_quizzes.html', {
		'player': player,
		'position_groups': position_groups,
		'team': team,
		'page_header': 'CUSTOM QUIZZES'
	})

@user_passes_test(lambda u: u.myuser.is_a_player)
def formation_quizzes(request, unit="offense"):
	player = request.user.player
	team = player.team
	type_of_quiz = request.GET['type']
	number_of_questions = int(request.GET['number_of_questions'])
	order_of_questions = str(request.GET['order'])
	formations = list(Formation.objects.filter(team=team, scout=False))

	custom_quiz = CustomQuiz(team=team, player=player, content_type="formation",number_of_questions=number_of_questions,ordering=order_of_questions,quiz_type=type_of_quiz)

	### SORT THE FORMATIONS BY WHICHEVER METHOD IS SELECTED ###
	if order_of_questions == "random":
		shuffle(formations)
	elif order_of_questions == "recent":
		formations.sort(key=lambda formation: formation.created_at, reverse=True)
	elif order_of_questions == "missed":
		#sort is more complicated, so for now we do recent order
		formations.sort(key=lambda formation: formation.get_average_score_for_players([player]), reverse=True)
	### END SORT ###

	if type_of_quiz == "identification":
		formation_names = []
		for formation in formations:
			formation_names.append(formation.name)
		formations = formations[0:number_of_questions]

		custom_quiz.save()
		return render(request, 'dashboard/identification_quiz.html', {
			'player': player,
			'team': team,
			'formations': formations,
			'answer_choices': formation_names,
			'page_header': 'FORMATION QUIZ'
		})
	elif type_of_quiz == "alignment":
		position = request.GET['position'].upper()
		position_groups = PlayerGroup.objects.filter(team=team, position_group=True, abbreviation=position)
		filtered_formations = []
		for formation in formations:
			formation_dict = json.loads(formation.formationJson)
			offensive_players = formation_dict['offensivePlayers']
			for player_dict in offensive_players:
				player_position = str(player_dict['pos'])
				if player_position == position:
					filtered_formations.append(formation)

		formations = filtered_formations[0:number_of_questions]

		custom_quiz.position = position
		custom_quiz.save()
		return render(request, 'dashboard/assignment_quiz.html', {
			'player': player,
			'team': team,
			'formations': formations,
			'position_groups': position_groups,
			'page_header': 'FORMATION QUIZ'
		})

@user_passes_test(lambda u: u.myuser.is_a_player)
def play_quizzes(request, unit="offense"):
	player = request.user.player
	team = player.team
	type_of_quiz = request.GET['type']
	number_of_questions = int(request.GET['number_of_questions'])
	order_of_questions = str(request.GET['order'])

	plays = list(Play.objects.filter(team=team, scout=False))

	custom_quiz = CustomQuiz(team=team, player=player, content_type="play",number_of_questions=number_of_questions,ordering=order_of_questions,quiz_type=type_of_quiz)

	### SORT THE PLAYS BY WHICHEVER METHOD IS SELECTED ###
	if order_of_questions == "random":
		shuffle(plays)
	elif order_of_questions == "recent":
		plays.sort(key=lambda play: play.created_at, reverse=True)
	elif order_of_questions == "missed":
		#sort is more complicated, so for now we do recent order
		plays.sort(key=lambda play: play.get_average_score_for_players([player]), reverse=True)
	### END SORT ###

	if type_of_quiz == "identification":
		play_names = []
		for play in plays:
			play_names.append(play.name)
		plays = plays[0:number_of_questions]
		custom_quiz.save()
		return render(request, 'dashboard/identification_quiz.html', {
			'player': player,
			'team': team,
			'plays': plays,
			'answer_choices': play_names,
			'page_header': 'PLAY QUIZ'
		})
	elif type_of_quiz == "assignment":
		position = request.GET['position'].upper()
		position_groups = PlayerGroup.objects.filter(team=team, position_group=True, abbreviation=position)
		type_of_assignment = str(request.GET['type-of-assignment'])

		custom_quiz.position = position
		custom_quiz.type_of_assignment = type_of_assignment
		custom_quiz.save()

		filtered_plays = []
		for play in plays:
			play_dict = json.loads(play.playJson)
			offensive_players = play_dict['offensivePlayers']
			for player_dict in offensive_players:
				player_position = str(player_dict['pos'])
				if player_position == position:

					### Do additional filtering for type of assignment here eventually ###
					if 'blockingAssignmentArray' in player_dict and len(player_dict['blockingAssignmentArray']) > 0 and (type_of_assignment == "all" or type_of_assignment == "blocks"):
						filtered_plays.append(play)
						break
					elif 'route' in player_dict and len(player_dict['route']) > 0 and (type_of_assignment == "all" or type_of_assignment == "routes"):
						filtered_plays.append(play)
						break
				elif type_of_assignment == "progression" and 'progressionRank' in player_dict and player_dict['progressionRank'] > 0:
					filtered_plays.append(play)
					break

			defensive_players = play_dict['defensivePlayers']
			for player_dict in defensive_players:
				player_position = str(player_dict['pos'])
				if player_position == position:
					### Do additional filtering for type of assignment here eventually ###
					if 'blitz' in player_dict and len(player_dict['blitz']) > 0 and (type_of_assignment == "all" or type_of_assignment == "blitz"):
						filtered_plays.append(play)
					elif 'defensiveMovement' in player_dict and len(player_dict['defensiveMovement']) > 0 and (type_of_assignment == "all" or type_of_assignment == "movement"):
						filtered_plays.append(play)
					elif 'zoneCoverage' in player_dict and player_dict['zoneCoverage'] and len(player_dict['zoneCoverage']) > 0 and (type_of_assignment == "all" or type_of_assignment == "coverage"):
						filtered_plays.append(play)
					elif 'manCoverage' in player_dict and player_dict['manCoverage'] and (type_of_assignment == "all" or type_of_assignment == "coverage"):
						filtered_plays.append(play)
		plays = filtered_plays[0:number_of_questions]
		return render(request, 'dashboard/assignment_quiz.html', {
			'player': player,
			'team': team,
			'plays': plays,
			'position_groups': position_groups,
			'player_position': position,
			'type_of_assignment': type_of_assignment,
			'page_header': 'PLAY QUIZ'
		})
	elif type_of_quiz == "calls":
		call_options = [""]
		position = request.GET['position'].upper()

		filtered_plays = []
		for play in plays:
			play_dict = json.loads(play.playJson)
			offensive_players = play_dict['offensivePlayers']
			for player_dict in offensive_players:
				player_position = str(player_dict['pos'])
				if player_position == position:
					### Filters out plays that don't have calls ###
					if 'call' in player_dict and len(player_dict['call']) > 0:
						filtered_plays.append(play)
						call_options.append(player_dict['call'])

		plays = filtered_plays[0:number_of_questions]

		custom_quiz.position = position
		custom_quiz.save()

		return render(request, 'dashboard/call_quiz.html', {
			'player': player,
			'team': team,
			'plays': plays,
			'position': position,
			'answer_choices': call_options,
			'page_header': 'CALL QUIZ'
		})
	elif type_of_quiz == "game":
		call_options = ["No Call"]
		position = request.GET['position'].upper()
		position_type = PlayerGroup.objects.filter(team=team, position_group=True, abbreviation=position)[0].position_type

		custom_quiz.position = position
		custom_quiz.save()

		filtered_plays = []
		for play in plays:
			play_dict = json.loads(play.playJson)
			offensive_players = play_dict['offensivePlayers']
			for player_dict in offensive_players:
				player_position = str(player_dict['pos'])
				if player_position == position:
					filtered_plays.append(play)
					if 'call' in player_dict and len(player_dict['call']) > 0:
						call_options.append(player_dict['call'])
			defensive_players = play_dict['defensivePlayers']
			for player_dict in defensive_players:
				player_position = str(player_dict['pos'])
				if player_position == position:
					filtered_plays.append(play)
					if 'call' in player_dict and len(player_dict['call']) > 0:
						call_options.append(player_dict['call'])

		plays = filtered_plays[0:number_of_questions]

		return render(request, 'dashboard/game_mode_quiz.html', {
			'player': player,
			'team': team,
			'plays': plays,
			'position': position,
			'position_type': position_type,
			'answer_choices': call_options,
			'page_header': 'GAME MODE QUIZ'
		})

@user_passes_test(lambda u: u.myuser.is_a_player)
def concept_quizzes(request, unit="offense"):
	player = request.user.player
	team = player.team
	type_of_quiz = request.GET['type']
	number_of_questions = int(request.GET['number_of_questions'])
	order_of_questions = str(request.GET['order'])
	concepts = list(Concept.objects.filter(team=team))

	custom_quiz = CustomQuiz(team=team, player=player, content_type="concept",number_of_questions=number_of_questions,ordering=order_of_questions,quiz_type=type_of_quiz)

	### SORT THE CONCEPTS BY WHICHEVER METHOD IS SELECTED ###
	if order_of_questions == "random":
		shuffle(concepts)
	elif order_of_questions == "recent":
		concepts.sort(key=lambda concept: concept.created_at, reverse=True)
	elif order_of_questions == "missed":
		#sort is more complicated, so for now we do recent order
		concepts.sort(key=lambda concept: concept.get_average_score_for_players([player]), reverse=False)
	### END SORT ###

	if type_of_quiz == "identification":
		concept_names = []
		for concept in concepts:
			concept_names.append(concept.name)
		concepts = concepts[0:number_of_questions]

		custom_quiz.save()
		return render(request, 'dashboard/identification_quiz.html', {
			'player': player,
			'team': team,
			'concepts': concepts,
			'answer_choices': concept_names,
			'page_header': 'CONCEPT QUIZ'
		})
	elif type_of_quiz == "assignment":
		position = request.GET['position'].upper()
		position_groups = PlayerGroup.objects.filter(team=team, position_group=True, abbreviation=position)
		type_of_assignment = str(request.GET['type-of-assignment'])
		filtered_concepts = []
		for concept in concepts:
			concept_dict = json.loads(concept.conceptJson)
			offensive_players = concept_dict['offensivePlayers']
			for player_dict in offensive_players:
				player_position = str(player_dict['pos'])
				if player_position == position:

					### Do additional filtering for type of assignment here eventually ###

					if 'blockingAssignmentArray' in player_dict and len(player_dict['blockingAssignmentArray']) > 0 and (type_of_assignment == "all" or type_of_assignment == "blocks"):
						filtered_concepts.append(concept)
						break
					elif 'route' in player_dict and len(player_dict['route']) > 0 and (type_of_assignment == "all" or type_of_assignment == "routes"):
						filtered_concepts.append(concept)
						break
				elif type_of_assignment == "progression" and 'progressionRank' in player_dict and player_dict['progressionRank'] > 0:
					filtered_concepts.append(concept)
					break

			defensive_players = concept_dict['defensivePlayers']
			for player_dict in defensive_players:
				player_position = str(player_dict['pos'])
				if player_position == position:
					### Do additional filtering for type of assignment here eventually ###
					if 'blitz' in player_dict and len(player_dict['blitz']) > 0 and (type_of_assignment == "all" or type_of_assignment == "blitz"):
						filtered_concepts.append(concept)
						break
					elif 'defensiveMovement' in player_dict and len(player_dict['defensiveMovement']) > 0 and (type_of_assignment == "all" or type_of_assignment == "movement"):
						filtered_concepts.append(concept)
						break
					elif 'zoneCoverage' in player_dict and player_dict['zoneCoverage'] and len(player_dict['zoneCoverage']) > 0 and (type_of_assignment == "all" or type_of_assignment == "coverage"):
						filtered_concepts.append(concept)
						break
					elif 'manCoverage' in player_dict and player_dict['manCoverage'] and (type_of_assignment == "all" or type_of_assignment == "coverage"):
						filtered_concepts.append(concept)
						break

		concepts = filtered_concepts[0:number_of_questions]

		custom_quiz.type_of_assignment = type_of_assignment
		custom_quiz.position = position
		custom_quiz.save()
		return render(request, 'dashboard/assignment_quiz.html', {
			'player': player,
			'team': team,
			'concepts': concepts,
			'position_groups': position_groups,
			'player_position': position,
			'type_of_assignment': type_of_assignment,
			'page_header': 'CONCEPT QUIZ'
		})
	elif type_of_quiz == "calls":
		call_options = []
		position = request.GET['position'].upper()

		filtered_concepts = []
		for concept in concepts:
			concept_dict = json.loads(concept.conceptJson)
			offensive_players = concept_dict['offensivePlayers']
			for player_dict in offensive_players:
				player_position = str(player_dict['pos'])
				if player_position == position:
					### Do additional filtering for type of assignment here ###
					if 'call' in player_dict and len(player_dict['call']) > 0:
						call_options.append(player_dict['call'])
						filtered_concepts.append(concept)

		concepts = filtered_concepts[0:number_of_questions]

		custom_quiz.position = position
		custom_quiz.save()
		return render(request, 'dashboard/call_quiz.html', {
			'player': player,
			'team': team,
			'concepts': concepts,
			'answer_choices': call_options,
			'position': position,
			'page_header': 'CALL QUIZ'
		})
	elif type_of_quiz == "game":
		call_options = ["No Call"]
		position = request.GET['position'].upper()
		position_type = PlayerGroup.objects.filter(team=team, position_group=True, abbreviation=position)[0].position_type

		filtered_concepts = []
		for concept in concepts:
			concept_dict = json.loads(concept.conceptJson)
			offensive_players = concept_dict['offensivePlayers']
			for player_dict in offensive_players:
				player_position = str(player_dict['pos'])
				if player_position == position:
					filtered_concepts.append(concept)
					if 'call' in player_dict and len(player_dict['call']) > 0:
						call_options.append(player_dict['call'])
			defensive_players = concept_dict['defensivePlayers']
			for player_dict in defensive_players:
				player_position = str(player_dict['pos'])
				if player_position == position:
					filtered_concepts.append(concept)
					if 'call' in player_dict and len(player_dict['call']) > 0:
						call_options.append(player_dict['call'])

		concepts = filtered_concepts[0:number_of_questions]

		custom_quiz.position = position
		custom_quiz.save()
		return render(request, 'dashboard/game_mode_quiz.html', {
			'player': player,
			'team': team,
			'concepts': concepts,
			'position': position,
			'position_type': position_type,
			'answer_choices': call_options,
			'page_header': 'GAME MODE QUIZ'
		})

# Analytics
@login_required
def analytics(request):
	return render(request, 'dashboard/analytics.html', {
		'team': team,
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

		number_correct = float(QuestionAttempted.objects.filter(team=team, play=play, score=1).count())
		number_incorrect = float(QuestionAttempted.objects.filter(team=team, play=play, score=0).count())
		number_skipped = float(QuestionAttempted.objects.filter(team=team, play=play, score=None).count())

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
	plays_analytics.sort(key=lambda x: x[3], reverse=True)

	return render(request, 'dashboard/plays_analytics.html', {
		'plays_analytics': plays_analytics,
		'team': team,
		'page_header': 'PLAYS ANALYTICS'
	})

@user_passes_test(lambda u: u.myuser.is_a_player)
def player_analytics(request):
	player = request.user.player
	team = player.team

	plays = Play.objects.filter(team=team)
	plays_analytics = []

	for play in plays:
		play_analytics = []
		play_analytics.append(play.name)

		if play.scoutName != "":
			play_analytics.append(play.scoutName)
		else:
			play_analytics.append("None")

		number_correct = float(QuestionAttempted.objects.filter(team=team, player=player, play=play, score=1).count())
		number_incorrect = float(QuestionAttempted.objects.filter(team=team, player=player, play=play, score=0).count())
		number_skipped = float(QuestionAttempted.objects.filter(team=team, player=player, play=play, score=None).count())

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
	plays_analytics.sort(key=lambda x: x[3], reverse=True)

	return render(request, 'dashboard/plays_analytics.html', {
		'plays_analytics': plays_analytics,
		'team': team,
		'page_header': player.first_name.upper() + " " + player.last_name.upper()
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

		number_correct = float(QuestionAttempted.objects.filter(team=team, player=player, score=1).count())
		number_incorrect = float(QuestionAttempted.objects.filter(team=team, player=player, score=0).count())
		number_skipped = float(QuestionAttempted.objects.filter(team=team, player=player, score=None).count())

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
	players_analytics.sort(key=lambda x: x[3], reverse=True)

	return render(request, 'dashboard/players_analytics.html', {
		'players_analytics': players_analytics,
		'team': team,
		'page_header': 'PLAYERS ANALYTICS'
	})

@user_passes_test(lambda u: not u.myuser.is_a_player)
def quiz_analytics(request, quiz_id):
	plays_analytics = []
	team = request.user.coach.team
	plays = Play.objects.filter(team=team)
	quiz = Quiz.objects.filter(team=team, id=quiz_id)

	for play in plays:
		play_analytics = []
		play_analytics.append(play.name)

		if play.scoutName != "":
			play_analytics.append(play.scoutName)
		else:
			play_analytics.append("None")

		number_correct = float(QuestionAttempted.objects.filter(team=team, quiz=quiz, play=play, score=1).count())
		number_incorrect = float(QuestionAttempted.objects.filter(team=team, quiz=quiz, play=play, score=0).count())
		number_skipped = float(QuestionAttempted.objects.filter(team=team, quiz=quiz, play=play, score=None).count())

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
	plays_analytics.sort(key=lambda x: x[3], reverse=True)

	return render(request, 'dashboard/quiz_analytics.html', {
		'plays_analytics': plays_analytics,
		'team': team,
		'page_header': 'QUIZ ANALYTICS'
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
	group = PlayerGroup.objects.filter(team=team, id=group_id)[0]
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
