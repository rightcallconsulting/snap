from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, Http404
from django.shortcuts import render

from .models import Concept, Formation, Play
from dashboard.models import Admin, Coach, Player, PlayerGroup

from IPython import embed

# Playbook
@login_required
def playbook(request, unit="offense"):
	if request.user.isPlayer():
		user_is_a_coach = False
		team = request.user.player.team
	else:
		user_is_a_coach = True
		team = request.user.coach.team

	formations = Formation.objects.filter(team=team, scout=False)
	scout_formations = Formation.objects.filter(team=team, scout=True)
	plays = Play.objects.filter(team=team)
	concepts = Concept.objects.filter(team=team)

	initial_playbook = request.GET.get('initial_playbook')
	initial_formation = request.GET.get('initial_formation')
	initial_play = request.GET.get('initial_play')
	initial_scout_defense = request.GET.get('initial_scout_defense')
	initial_concept = request.GET.get('initial_concept')
	initial_defense = request.GET.get('initial_defense')

	return render(request, 'playbook/playbook.html', {
		'user_is_a_coach': user_is_a_coach,
		'unit': unit,
		'formations': formations,
		'scoutFormations': scout_formations,
		'plays': plays,
		'concepts': concepts,
		'team': team,
		'initial_playbook': initial_playbook,
		'initial_formation': initial_formation,
		'initial_play': initial_play,
		'initial_scout_defense': initial_scout_defense,
		'initial_concept': initial_concept,
		'initial_defense': initial_defense,
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
		unit = request.POST['unit']
		formation = Formation.objects.filter(team=team, unit=unit, scout=False, name=formation_name)[0]
		if request.POST['save'] == "true":
			playJson = request.POST['play']
			play = Play.objects.filter(team=team, scout=False, unit=unit, formation=formation, name=name, scoutName=scout_name)
			if play.count() == 1:
				play = play[0]
				play.playJson = playJson
				play.save()
			elif play.count() == 0:
				play = Play()
				play.name = name
				play.scoutName = scout_name
				play.team = request.user.coach.team
				play.unit = unit
				play.scout = False
				play.formation = formation
				play.playJson = playJson
				play.save()
		elif request.POST['delete'] == "true":
			if scout_name == "":
				Play.objects.filter(team=team, scout=False, formation=formation, name=name).delete()
			else:
				Play.objects.filter(team=team, scout=False, formation=formation, name=name, scoutName=scout_name).delete()

		return HttpResponse('')
	else:
		formations = Formation.objects.filter(team=team, unit="offense", scout=False)
		scout_formations = Formation.objects.filter(team=team, unit="offense", scout=True)
		offensive_looks = Formation.objects.filter(team=team, unit="defense", scout=True)
		offensive_plays = Play.objects.filter(team=team, scout=False, unit="offense")
		base_defenses = Formation.objects.filter(team=team, scout=False, unit="defense")
		defensive_plays = Play.objects.filter(team=team, scout=False, unit="defense")

		initial_view = request.GET.get('initial_view') #offense or defense
		initial_formation = request.GET.get('initial_formation') #or base look?
		initial_play = request.GET.get('initial_play')
		initial_scout = request.GET.get('initial_scout')

		return render(request, 'playbook/create_play.html', {
			'formations': formations,
			'scoutFormations': scout_formations,
			'offensive_looks': offensive_looks,
			'offensive_plays': offensive_plays,
			'defensive_plays': defensive_plays,
			'base_defenses': base_defenses,
			'team': team,
			'initial_view': initial_view,
			'initial_formation': initial_formation,
			'initial_play': initial_play,
			'initial_scout': initial_scout,
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
