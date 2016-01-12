from django.shortcuts import render
from django.http import HttpResponse, Http404
from django.template import RequestContext, loader

from quiz.models import Player, Team, Play, Formation
from IPython import embed

# Create your views here.

def homepage(request):
    return render(request, 'dashboard/homepage.html')

def login(request):
    return render(request, 'dashboard/login.html')

def register(request):
    return render(request, 'dashboard/register.html')

def timeline(request):
    return render(request, 'dashboard/timeline.html')