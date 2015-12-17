from django.shortcuts import render
from django.http import HttpResponse, Http404
from django.template import RequestContext, loader

from quiz.models import Player, Team, Play, Formation

# Create your views here.

def homepage(request):
    player_list = Player.objects.all()
    context = {'player_list': player_list}
    return render(request, 'dashboard/homepage.html', context)
