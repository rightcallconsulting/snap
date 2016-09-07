from django.conf.urls import url, include
from django.contrib.auth.views import login
from django.contrib.auth.decorators import user_passes_test
from django.conf import settings

from django.views import static

from . import views

urlpatterns = [
	url(r'^$', views.homepage, name='homepage'),
	url(r'^login$', views.auth_login, name='auth_login'),
	#url(r'^register$', views.register, name='register'), # Registration feature is commented out until we are ready for people to sign up - Have to add button back then
	url(r'^logout$', views.auth_logout, name='auth_logout'),
	url(r'^edit_profile$', views.edit_profile, name='edit_profile'),
	url(r'^change_password$', views.change_password, name='change_password'),
	url(r'^playbook/?(?P<unit>defense)$', views.playbook, name='playbook'),
	url(r'^todo$', views.todo, name='todo'),
	url(r'^analytics$', views.analytics, name='analytics'),

	# Playbook
	url(r'^playbook$', views.playbook, name='playbook'),

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
	url(r'^quizzes$', views.quizzes, name='quizzes'),
	url(r'^quizzes/create$', views.create_quiz, name='create_quiz'),
	url(r'^quizzes/manage/(?P<quiz_id>[0-9]+)$', views.manage_quiz, name='manage_quiz'),
	url(r'^quizzes/analytics/(?P<test_id>[0-9]+)$', views.quiz_analytics, name='quiz_analytics'),
	url(r'^my_quizzes$', views.my_quizzes, name='my_quizzes'),

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
