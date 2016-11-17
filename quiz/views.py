from django.shortcuts import render
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.template import RequestContext, loader
from django.http import JsonResponse
from django.core import serializers
from django.db.models import Q
from django.views import generic
import json
import simplejson
import random
from IPython import embed
from operator import attrgetter

from .models import Player, Team
from dashboard.models import Concept, Position, Formation, Play
from .utils import QuizOrders
from dashboard.utils import PlayerAnalytics

def index(request):
    player_list = Player.objects.all()
    context = {'player_list': player_list}
    return render(request, 'quiz/index.html', context)
