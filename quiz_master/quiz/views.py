from django.shortcuts import render
from django.http import HttpResponse
from django.template import RequestContext, loader

# Create your views here.

from .models import Player, Team, Play, Formation


def index(request):
    player_list = Player.objects.all()
    context = {'player_list': player_list}
    return render(request, 'quiz/index.html', context)

def players(request):
    player_list = Player.objects.all()
    output = ', '.join([p.full_name() for p in player_list])
    return HttpResponse(output)
