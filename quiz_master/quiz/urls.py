from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^players$', views.players, name='players'),
    url(r'^qb_progression$', views.qb_progression, name='qb_progression'),
    url(r'^cb_assignment$', views.cb_assignment, name='cb_assignment'),
    url(r'^create_formation$', views.create_formation, name='create_formation'),
    url(r'^create_play$', views.create_play, name='create_play'),
    url(r'^formation_quiz$', views.formation_quiz, name='formation_quiz'),
    url(r'^ol_view$', views.ol_view, name='ol_view'),
    url(r'^results$', views.results, name='results'),
    url(r'^results_chart$', views.results_chart, name='results_chart'),
    url(r'^wr_route$', views.wr_route, name='wr_route'),
    url(r'^players/(?P<player_id>[0-9]+)$', views.player_detail, name='player_detail'),
    url(r'^players/(?P<player_id>[0-9]+)/tests$', views.player_tests, name='player_tests'),
    url(r'^players/(?P<player_id>[0-9]+)/tests/(?P<test_id>[0-9]+)$', views.player_test, name='player_test'),
    url(r'^players/(?P<player_id>[0-9]+)/update$', views.update_player, name='update_player'),
    url(r'^players/(?P<player_id>[0-9]+)/tests/(?P<test_id>[0-9]+)/update$', views.update_test, name='update_test'),
    url(r'^teams/broncos/formations/new$', views.new_play, name='new_play'),

]
