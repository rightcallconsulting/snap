from django.conf.urls import url, include
from django.contrib.auth.views import login
from django.contrib.auth.decorators import user_passes_test
from django.conf import settings

from django.views import static

from . import views

urlpatterns = [
    url(r'^$', views.homepage, name='homepage'),
    url(r'^login$', views.auth_login, name='auth_login'),
    url(r'^logout$', views.auth_logout, name='auth_logout'),
    url(r'^register$', views.register, name='register'),
    url(r'^analytics$', views.analytics, name='analytics'),
    url(r'^playbook$', views.playbook, name='playbook'),
    url(r'^playbook/?(?P<unit>defense)$', views.playbook, name='playbook'),
    url(r'^todo$', views.todo, name='todo'),
    url(r'^tests$', views.all_tests, name='all_tests'),
    url(r'^my_tests$', views.my_tests, name='my_tests'),
    url(r'^tests/(?P<test_id>[0-9]+)/edit$', views.edit_test, name='edit_test'),
    url(r'^tests/(?P<test_id>[0-9]+)/analytics$', views.test_analytics, name='test_analytics'),
    url(r'^groups/$', views.groups, name='groups'),
    url(r'^groups/create$', views.create_group, name='create_group'),
    url(r'^groups/manage$', views.manage_groups, name='manage_groups'),
    url(r'^groups/delete/(?P<group_id>[0-9]+)$', views.delete_group, name='delete_group'),
    url(r'^edit_profile$', views.edit_profile, name='edit_profile'),
    url(r'^create_test$', views.create_test, name='create_test'),
    # JSON requests
    url(r'^teams/(?P<team_id>[0-9]+)/players/json$', views.players_on_team_json, name='players_on_team_json'),
    url(r'^groups/json$', views.all_groups_json, name='all_groups_json'),
    url(r'^groups/(?P<group_id>[0-9]+)/json$', views.group_json, name='group_json'),
    url(r'^groups/(?P<group_id>[0-9]+)/(?P<team_id>[0-9]+)/json$', views.players_on_team_but_not_in_group_json, name='players_on_team_but_not_in_group_json'),
]

if settings.DEBUG:
    urlpatterns += [
        url(r'^media/(?P<path>.*)$', static.serve, {
            'document_root': settings.MEDIA_ROOT,
        }),
    ]
