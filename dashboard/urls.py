from django.conf.urls import url, include
from django.contrib.auth.views import login
from django.contrib.auth.decorators import user_passes_test
from django.conf import settings

from django.views import static

from . import views

urlpatterns = [
	url(r'^$', views.homepage, name='homepage'),
	
	url(r'^login$', views.auth_login, name='auth_login'),
	url(r'^register$', views.register, name='register'),
	url(r'^logout$', views.auth_logout, name='auth_logout'),

	# Get Snap
	url(r'^getsnap/info$', views.getsnap_info, name='getsnap_info'),


	url(r'^edit_profile$', views.edit_profile, name='edit_profile'),
	url(r'^change_password$', views.change_password, name='change_password'),

	# Playbook
	url(r'^playbook$', views.playbook, name='playbook'),
	url(r'^playbook/?(?P<unit>defense)$', views.playbook, name='playbook'), # I'm not sure this is used anymore

	# Formations
	url(r'^formations/create$', views.create_formation, name='create_formation'),
	url(r'^formations/create/defensive_look$', views.create_defensive_look, name='create_defensive_look'),

	# Plays
	url(r'^plays/create$', views.create_play, name='create_play'),

	# Concepts
	url(r'^concepts/create$', views.create_concept, name='create_concept'),

	# Groups
	url(r'^groups/$', views.groups, name='groups'),
	url(r'^groups/create$', views.create_group, name='create_group'),
	url(r'^groups/manage$', views.manage_groups, name='manage_groups'),
	url(r'^groups/delete/(?P<group_id>[0-9]+)$', views.delete_group, name='delete_group'),

	# Quizzes
	url(r'^quizzes/assigned$', views.assigned_quizzes, name='assigned_quizzes'),
	url(r'^quizzes/create$', views.create_quiz, name='create_quiz'),
	url(r'^quizzes/manage/(?P<quiz_id>[0-9]+)$', views.manage_quiz, name='manage_quiz'),
	url(r'^quizzes/todo$', views.quizzes_todo, name='quizzes_todo'),
	url(r'^quizzes/take/(?P<quiz_id>[0-9]+)$', views.take_quiz, name='take_quiz'),
	url(r'^quizzes/submit$', views.submit_quiz, name='submit_quiz'),
	url(r'^quizzes/custom$', views.custom_quizzes, name='custom_quizzes'),

	url(r'^quizzes/custom/formation$', views.formation_quizzes, name='formation_quizzes'),
	url(r'^quizzes/custom/play$', views.play_quizzes, name='play_quizzes'),
	url(r'^quizzes/custom/concept$', views.concept_quizzes, name='concept_quizzes'),

	# Analytics
	url(r'^analytics$', views.plays_analytics, name='plays_analytics'), # this will direct to the play analyitics until I implement an analytics page
	url(r'^analytics/plays$', views.plays_analytics, name='plays_analytics'),
	url(r'^analytics/player$', views.player_analytics, name='player_analytics'),
	url(r'^analytics/players$', views.players_analytics, name='players_analytics'),
	url(r'^analytics/quiz/(?P<quiz_id>[0-9]+)$', views.quiz_analytics, name='quiz_analytics'),

	# JSON requests
	url(r'^teams/(?P<team_id>[0-9]+)/players/json$', views.players_on_team_json, name='players_on_team_json'),
	url(r'^groups/json$', views.all_groups_json, name='all_groups_json'),
	url(r'^groups/(?P<group_id>[0-9]+)/json$', views.group_json, name='group_json'),
	url(r'^groups/(?P<group_id>[0-9]+)/(?P<team_id>[0-9]+)/json$', views.players_on_team_but_not_in_group_json, name='players_on_team_but_not_in_group_json'),
	url(r'^concepts/(?P<concept_id>[0-9]+)/json$', views.concept_json, name='group_json'),
	url(r'^concepts/json$', views.concepts_json, name='group_json'),
]

if settings.DEBUG:
    urlpatterns += [
        url(r'^media/(?P<path>.*)$', static.serve, {
            'document_root': settings.MEDIA_ROOT,
        }),
    ]
