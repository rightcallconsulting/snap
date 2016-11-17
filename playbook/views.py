from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, Http404
from django.shortcuts import render

from .models import Concept, Formation, Play
from dashboard.models import Player, Coach, myUser, PlayerGroup

# Playbook
@login_required
def playbook(request, unit="offense"):
	if request.user.myuser.is_a_player:
		user_is_a_coach = False
		team = request.user.player.team
	else:
		user_is_a_coach = True
		team = request.user.coach.team

	formations = Formation.objects.filter(team=team, scout=False)
	scout_formations = Formation.objects.filter(team=team, scout=True)
	plays = Play.objects.filter(team=team)
	concepts = Concept.objects.filter(team=team)

	return render(request, 'playbook/playbook.html', {
		'user_is_a_coach': user_is_a_coach,
		'unit': unit,
		'formations': formations,
		'scoutFormations': scout_formations,
		'plays': plays,
		'concepts': concepts,
		'team': team,
		'page_header': 'PLAYBOOK'
	})

# Formations
@login_required
def create_formation(request):
	coach = request.user.coach
	team = coach.team
	if request.method == "POST":
		name = request.POST['name']
		if request.POST['save'] == "true":
			formationJson = request.POST['formation']
			formation = Formation.objects.filter(team=team, scout=False, name=name)
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
			formation = Formation.objects.filter(team=team, scout=False, name=name)
			formation.delete()
		return HttpResponse('')
	else:
		formations = Formation.objects.filter(team=team, scout=False)
		positions = PlayerGroup.objects.filter(team=team, position_group=True)
		return render(request, 'playbook/create_formation.html', {
			'team': team,
			'formations': formations,
			'positions': positions,
			'team': team,
			'page_header': 'CREATE FORMATION'
		})

@login_required
def create_defensive_look(request):
	coach = request.user.coach
	team = coach.team
	if request.method == "POST":
		name = request.POST['name']
		if request.POST['save'] == "true":
			formationJson = request.POST['formation']
			formation = Formation.objects.filter(team=team, scout=True, name=name)
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
			formation = Formation.objects.filter(team=team, scout=True, name=name)
			formation.delete()
		return HttpResponse('')
	else:
		formations = Formation.objects.filter(team=team, scout=True)
		positions = PlayerGroup.objects.filter(team=team, position_group=True)
		return render(request, 'playbook/create_defensive_look.html', {
			'formations': formations,
			'team': team,
			'positions': positions,
			'page_header': 'CREATE DEFENSIVE LOOK'
		})

# Plays
@login_required
def create_play(request):
	coach = request.user.coach
	team = coach.team
	if request.method == "POST":
		name = request.POST['name']
		scout_name = request.POST['scout_name']
		formation_name = request.POST['formation']
		formation = Formation.objects.filter(team=team, scout=False, name=formation_name)[0]
		if request.POST['save'] == "true":
			playJson = request.POST['play']
			play = Play.objects.filter(team=team, scout=False, formation=formation, name=name, scoutName=scout_name)
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
				play.formation = Formation.objects.filter(team=team, name=formation_name)[0]
				play.playJson = playJson
				play.save()
		elif request.POST['delete'] == "true":
			if scout_name == "":
				Play.objects.filter(team=team, scout=False, formation=formation, name=name).delete()
			else:
				Play.objects.filter(team=team, scout=False, formation=formation, name=name, scoutName=scout_name).delete()

		return HttpResponse('')
	else:
		formations = Formation.objects.filter(team=team, scout=False)
		scout_formations = Formation.objects.filter(team=team, scout=True)
		plays = Play.objects.filter(team=team, scout=False)
		return render(request, 'playbook/create_play.html', {
			'formations': formations,
			'scoutFormations': scout_formations,
			'plays': plays,
			'team': team,
			'page_header': 'CREATE PLAY'
		})

# Concepts
@login_required
def create_concept(request):
	coach = request.user.coach
	team = coach.team
	if request.method == "POST":
		name = request.POST['name']
		if request.POST['save'] == "true":
			conceptJson = request.POST['concept']
			concept = Concept.objects.filter(team=team, scout=False, name=name)
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
			concept = Concept.objects.filter(team=team, scout=False, name=name)
			concept.delete()
		return HttpResponse('')
	else:
		concepts = Concept.objects.filter(team=team, scout=False)
		positions = PlayerGroup.objects.filter(team=team, position_group=True)
		return render(request, 'playbook/create_concept.html', {
			'concepts': concepts,
			'positions': positions,
			'team': team,
			'page_header': 'CREATE CONCEPT'
		})
