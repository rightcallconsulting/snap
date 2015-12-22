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
        player = Player.objects.filter(pk=player_id)
    except Player.DoesNotExist:
        raise Http404("Player does not exist")
    return HttpResponse(serializers.serialize("json", player))

def update_player(request, player_id):
    embed()
    try:
        player = Player.objects.filter(pk=player_id)
    except Player.DoesNotExist:
        raise Http404("Player does not exist")
    return HttpResponse(serializers.serialize("json", player))
