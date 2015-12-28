from django.shortcuts import render
from django.http import HttpResponse, Http404
from django.template import RequestContext, loader
from django.http import JsonResponse
from django.core import serializers
import json

# Create your views here.

from .models import Player, Team, Play, Formation
from IPython import embed



def index(request):
    player_list = Player.objects.all()
    context = {'player_list': player_list}
    return render(request, 'quiz/index.html', context)

def qb_progression(request):
    return render(request, 'quiz/qb_progression.html')

def cb_assignment(request):
    return render(request, 'quiz/cb_assignment.html')

def create_formation(request):
    return render(request, 'quiz/create_formation.html')

def create_play(request):
    return render(request, 'quiz/create_play.html')

def formation_quiz(request):
    return render(request, 'quiz/formation_quiz.html')

def ol_view(request):
    return render(request, 'quiz/ol_view.html')

def results_chart(request):
    return render(request, 'quiz/results_chart.html')

def results(request):
    return render(request, 'quiz/results.html')

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
            selected_test = test if test_object.pk == test_id else None
    return HttpResponse(serializers.serialize("json", [selected_test]))

def new_play(request):
    params = request.POST
    formation = json.loads(params['formation'])
    return HttpResponse('')

def update_player(request):
    return HttpResponse('')
