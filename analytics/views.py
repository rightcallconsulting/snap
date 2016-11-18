from django.contrib.auth.decorators import login_required, user_passes_test
from django.shortcuts import render

from dashboard.models import Player, PlayerGroup
from getsnap.models import Team
from playbook.models import Concept, Formation, Play
from quizzes.models import Quiz

@login_required
def analytics(request):
	return render(request, 'analytics/analytics.html', {
		'team': team,
		'page_header': 'ANALYTICS'
	})

@user_passes_test(lambda u: not u.isPlayer())
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

	return render(request, 'analytics/plays_analytics.html', {
		'plays_analytics': plays_analytics,
		'team': team,
		'page_header': 'PLAYS ANALYTICS'
	})

@user_passes_test(lambda u: u.isPlayer())
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

	return render(request, 'analytics/plays_analytics.html', {
		'plays_analytics': plays_analytics,
		'team': team,
		'page_header': player.first_name.upper() + " " + player.last_name.upper()
	})

@user_passes_test(lambda u: not u.isPlayer())
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

	return render(request, 'analytics/players_analytics.html', {
		'players_analytics': players_analytics,
		'team': team,
		'page_header': 'PLAYERS ANALYTICS'
	})

@user_passes_test(lambda u: not u.isPlayer())
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

	return render(request, 'analytics/quiz_analytics.html', {
		'plays_analytics': plays_analytics,
		'team': team,
		'page_header': 'QUIZ ANALYTICS'
	})
