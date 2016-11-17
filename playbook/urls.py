from django.conf.urls import url, include
from django.contrib.auth.views import login
from django.contrib.auth.decorators import user_passes_test
from django.conf import settings

from django.views import static

from . import views

urlpatterns = [
	# Playbook
	url(r'^$', views.playbook, name='playbook'),

	# Formations
	url(r'^formations/create$', views.create_formation, name='create_formation'),
	url(r'^formations/create/defensive_look$', views.create_defensive_look, name='create_defensive_look'),

	# Plays
	url(r'^plays/create$', views.create_play, name='create_play'),

	# Concepts
	url(r'^concepts/create$', views.create_concept, name='create_concept')
]
