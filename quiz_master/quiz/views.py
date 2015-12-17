from django.shortcuts import render
from django.http import HttpResponse, Http404
from django.template import RequestContext, loader

# Create your views here.

from .models import Player, Team, Play, Formation


def index(request):
    player_list = Player.objects.all()
    context = {'player_list': player_list}
    return render(request, 'quiz/index.html', context)

def players(request):
    player_list = Player.objects.all()
    context = {'player_list': player_list}
    return render(request, 'quiz/index.html', context)

def player_detail(request, player_id):
    try:
        player = Player.objects.get(pk=player_id)
    except Player.DoesNotExist:
        raise Http404("Player does not exist")
    return render(request, 'quiz/player_detail.html', {'player': player})
