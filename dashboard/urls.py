from django.conf.urls import url, include
from django.contrib.auth.views import login
from django.contrib.auth.decorators import user_passes_test
from django.conf import settings

from django.views import static

from . import views

urlpatterns = [
	url(r'^$', views.homepage, name='homepage'),

	url(r'^edit_profile$', views.edit_profile, name='edit_profile'),
	url(r'^change_password$', views.change_password, name='change_password'),

	url(r'^groups/delete/(?P<group_id>[0-9]+)$', views.delete_group, name='delete_group'),

	# Admin
	url(r'^team/$', views.team, name='team'),
	url(r'^team/edit$', views.edit_team, name='edit_team'),
	url(r'^roster/$', views.roster, name='roster'),
	url(r'^groups/create$', views.create_group, name='create_group'),
	url(r'^groups/manage$', views.manage_groups, name='manage_groups'),

	# JSON requests
	url(r'^teams/(?P<team_id>[0-9]+)/players/json$', views.players_on_team_json, name='players_on_team_json'),
	url(r'^groups/json$', views.all_groups_json, name='all_groups_json'),
	url(r'^groups/(?P<group_id>[0-9]+)/json$', views.group_json, name='group_json'),
	url(r'^groups/(?P<group_id>[0-9]+)/(?P<team_id>[0-9]+)/json$', views.players_on_team_but_not_in_group_json, name='players_on_team_but_not_in_group_json'),
	url(r'^concepts/(?P<concept_id>[0-9]+)/json$', views.concept_json, name='group_json'),
	url(r'^concepts/json$', views.concepts_json, name='group_json'),

	# Token API requests
	url(r'^api/authenticate$', views.remote_login, name='remote login'),
]
