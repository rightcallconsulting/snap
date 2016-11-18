from django.conf.urls import url, include
from django.contrib.auth.views import login
from django.contrib.auth.decorators import user_passes_test
from django.conf import settings

from django.views import static

from . import views

urlpatterns = [
	url(r'^$', views.plays_analytics, name='plays_analytics'), # this will direct to the play analyitics until I implement an analytics page
	url(r'^plays$', views.plays_analytics, name='plays_analytics'),
	url(r'^player$', views.player_analytics, name='player_analytics'),
	url(r'^players$', views.players_analytics, name='players_analytics'),
	url(r'^quiz/(?P<quiz_id>[0-9]+)$', views.quiz_analytics, name='quiz_analytics')
]