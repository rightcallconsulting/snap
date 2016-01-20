from django.shortcuts import render
from django.http import HttpResponse, Http404
from django.template import RequestContext, loader
from django.http import JsonResponse
from django.core import serializers
import json
import simplejson

# Create your views here.

from .models import Player, Team, Play, Formation, Test, Position
from IPython import embed



def index(request):
    player_list = Player.objects.all()
    context = {'player_list': player_list}
    return render(request, 'quiz/index.html', context)

def qb_progression(request):
    return render(request, 'quiz/qb_progression.html')

def cadence_quiz(request):
    return render(request, 'quiz/cadence_quiz.html')

def simple_audible_quiz(request):
    return render(request, 'quiz/simple_audible_quiz.html')

def option_quiz(request):
    return render(request, 'quiz/option_quiz.html')

def blitz_quiz(request):
    return render(request, 'quiz/blitz_quiz.html')

def cb_assignment(request):
    return render(request, 'quiz/cb_assignment.html')

def create_formation(request):
    return render(request, 'quiz/create_formation.html')

def create_defense_formation(request):
    return render(request, 'quiz/create_defense_formation.html')

def create_play(request):
    return render(request, 'quiz/create_play.html')

def formation_quiz(request):
    return render(request, 'quiz/formation_quiz.html')

def ol_view(request):
    return render(request, 'quiz/ol_view.html')

def rb_quiz(request):
    return render(request, 'quiz/rb_quiz.html')

def results_chart(request):
    return render(request, 'quiz/results_chart.html')

def results(request):
    return render(request, 'quiz/results.html')

def simple_route_quiz(request):
    return render(request, 'quiz/simple_route_quiz.html')

def another_route_quiz(request):
    return render(request, 'quiz/another_route_quiz.html')

def wr_route(request):
    return render(request, 'quiz/wr_route.html')

def players(request):
    player_list = Player.objects.all()
    context = {'player_list': player_list}
    return render(request, 'quiz/index.html', context)

def player_detail(request, player_id):
    try:
        player_array = Player.objects.filter(pk=player_id)
    except Player.DoesNotExist:
        raise Http404("Player does not exist")
    return HttpResponse(serializers.serialize("json", player_array))

def update_player(request, player_id):
    player = Player.objects.filter(pk=player_id)[0]
    test = player.test_set.all()[0]
    params = request.POST
    embed()
    return HttpResponse('')

def player_tests(request, player_id):
    player = Player.objects.filter(pk=player_id)[0]
    tests = player.test_set.all()
    return HttpResponse(serializers.serialize("json", tests))

def player_test(request, player_id, test_id):
    player = Player.objects.filter(pk=player_id)[0]
    tests = player.test_set.all()
    if len(tests) == 1:
        selected_test = tests[0]
    else:
        for test_object in tests:
            if test_object.pk == int(test_id):
                selected_test = test_object
    return HttpResponse(serializers.serialize("json", [selected_test]))

def new_formation(request):
    params = request.POST
    formation = json.loads(params['formation'])
    Formation.from_json(formation)
    return HttpResponse('')

def team_formations(request, team_id):
    team = Team.objects.filter(pk=team_id)[0]
    formations = team.formation_set.all().filter(unit="offense")
    return HttpResponse(serializers.serialize("json", formations))

def team_defensive_formations(request, team_id):
    team = Team.objects.filter(pk=team_id)[0]
    formations = team.formation_set.all().filter(unit="defense")
    return HttpResponse(serializers.serialize("json", formations))

def formation_positions(request, team_id, formation_id):
    team = Team.objects.filter(pk=team_id)[0]
    formation = Formation.objects.filter(pk=formation_id)[0]
    positions = formation.position_set.all()
    return HttpResponse(serializers.serialize("json", positions))

def team_formation_positions(request, team_id):
    team = Team.objects.filter(pk=team_id)[0]
    positions = team.formations()
    return HttpResponse(serializers.serialize("json", positions))

def update_test(request, player_id, test_id):
    params = request.POST
    jsTest = json.loads(params['test'])
    pythonTest = Test.objects.get(pk=jsTest['id'])
    return HttpResponse('')

def new_play(request):
    params = request.POST
    play = json.loads(params['play'])
    Play.from_json(play)
    return HttpResponse('')

def team_plays(request, team_id):
    team = Team.objects.filter(pk=team_id)[0]
    plays = team.play_set.all()
    return HttpResponse(serializers.serialize("json", plays))

def team_play_players(request, team_id):
    team = Team.objects.filter(pk=team_id)[0]
    positions = team.play_positions()
    return HttpResponse(serializers.serialize("json", positions))

def run_qb_progression_test(request, test_id):
    test = Test.objects.filter(pk=test_id)[0]
    return render(request, 'quiz/qb_progression.html', {
        'test': test,
    })

def run_wr_route_test(request, test_id):
    test = Test.objects.filter(pk=test_id)[0]
    return HttpResponse(serializers.serialize("json", positions))

def single_test(request, test_id):
    test = Test.objects.filter(pk=test_id)
    return HttpResponse(serializers.serialize("json", test))
