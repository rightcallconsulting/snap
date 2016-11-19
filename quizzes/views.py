from django.contrib.auth.decorators import login_required, user_passes_test
from django.core.urlresolvers import reverse
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.shortcuts import render

from .models import CustomQuiz, Quiz
from getsnap.models import Team
from dashboard.models import Admin, Coach, Player, PlayerGroup
from playbook.models import Concept, Formation, Play
from analytics.models import QuestionAttempted

import json

@user_passes_test(lambda u: not u.isPlayer())
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

	return render(request, 'quizzes/quizzes.html', {
			'quizzes': quizzes_table,
			'team': team,
			'page_header': 'QUIZZES'
		})

@user_passes_test(lambda u: not u.isPlayer())
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

		return render(request, 'quizzes/create_quiz.html', {
			'groups': groups,
			'players_in_group': players_in_group,
			'team': team,
			'page_header': 'CREATE QUIZ'
		})

@user_passes_test(lambda u: not u.isPlayer())
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

		return render(request, 'quizzes/manage_quiz.html', {
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

@user_passes_test(lambda u: u.isPlayer())
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

	return render(request, 'quizzes/todo.html', {
			'quizzes': quizzes_table,
			'team': team,
			'position_groups': position_groups,
			'page_header': 'TODO'
		})

@user_passes_test(lambda u: u.isPlayer())
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

		return render(request, 'quizzes/take_quiz.html', {
			'quiz': quiz,
			'quizFormations': quiz_formations,
			'quizPlays': quiz_plays,
			'quizConcepts': quiz_concepts,
			'positionGroups': position_groups,
			'team': team,
			'page_header': quiz.name.upper()
		})

@user_passes_test(lambda u: u.isPlayer())
def submit_quiz(request):
	team = request.user.player.team
	if request.method == 'POST':
		name = request.POST['name']
		quiz = Quiz.objects.filter(team=team, name=name)[0]

		player = request.user.player
		quiz.submissions.add(player)
		quiz.save()

		return HttpResponse('')

@user_passes_test(lambda u: u.isPlayer())
def custom_quizzes(request, unit="offense"):
	player = request.user.player
	team = player.team
	position_groups = PlayerGroup.objects.filter(team=team, position_group=True, players__in=[player])
	return render(request, 'quizzes/custom_quizzes.html', {
		'player': player,
		'position_groups': position_groups,
		'team': team,
		'page_header': 'CUSTOM QUIZZES'
	})

@user_passes_test(lambda u: u.isPlayer())
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
		return render(request, 'quizzes/identification_quiz.html', {
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
		return render(request, 'quizzes/assignment_quiz.html', {
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
						break

		concepts = filtered_concepts[0:number_of_questions]

		custom_quiz.position = position
		custom_quiz.save()
		return render(request, 'quizzes/call_quiz.html', {
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
					break
			defensive_players = concept_dict['defensivePlayers']
			for player_dict in defensive_players:
				player_position = str(player_dict['pos'])
				if player_position == position:
					filtered_concepts.append(concept)
					if 'call' in player_dict and len(player_dict['call']) > 0:
						call_options.append(player_dict['call'])
					break

		concepts = filtered_concepts[0:number_of_questions]

		custom_quiz.position = position
		custom_quiz.save()
		return render(request, 'quizzes/game_mode_quiz.html', {
			'player': player,
			'team': team,
			'concepts': concepts,
			'position': position,
			'position_type': position_type,
			'answer_choices': call_options,
			'page_header': 'GAME MODE QUIZ'
		})


@user_passes_test(lambda u: u.isPlayer())
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
		return render(request, 'quizzes/identification_quiz.html', {
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
		return render(request, 'quizzes/assignment_quiz.html', {
			'player': player,
			'team': team,
			'formations': formations,
			'position_groups': position_groups,
			'page_header': 'FORMATION QUIZ'
		})

@user_passes_test(lambda u: u.isPlayer())
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
		return render(request, 'quizzes/identification_quiz.html', {
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
						break
					elif 'defensiveMovement' in player_dict and len(player_dict['defensiveMovement']) > 0 and (type_of_assignment == "all" or type_of_assignment == "movement"):
						filtered_plays.append(play)
						break
					elif 'zoneCoverage' in player_dict and player_dict['zoneCoverage'] and len(player_dict['zoneCoverage']) > 0 and (type_of_assignment == "all" or type_of_assignment == "coverage"):
						filtered_plays.append(play)
						break
					elif 'manCoverage' in player_dict and player_dict['manCoverage'] and (type_of_assignment == "all" or type_of_assignment == "coverage"):
						filtered_plays.append(play)
						break
		plays = filtered_plays[0:number_of_questions]
		return render(request, 'quizzes/assignment_quiz.html', {
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
						break

		plays = filtered_plays[0:number_of_questions]

		custom_quiz.position = position
		custom_quiz.save()

		return render(request, 'quizzes/call_quiz.html', {
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
					break
			defensive_players = play_dict['defensivePlayers']
			for player_dict in defensive_players:
				player_position = str(player_dict['pos'])
				if player_position == position:
					filtered_plays.append(play)
					if 'call' in player_dict and len(player_dict['call']) > 0:
						call_options.append(player_dict['call'])
					break

		plays = filtered_plays[0:number_of_questions]

		return render(request, 'quizzes/game_mode_quiz.html', {
			'player': player,
			'team': team,
			'plays': plays,
			'position': position,
			'position_type': position_type,
			'answer_choices': call_options,
			'page_header': 'GAME MODE QUIZ'
		})
