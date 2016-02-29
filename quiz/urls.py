from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^players$', views.players, name='players'),
    url(r'^qb_progression$', views.qb_progression, name='qb_progression'),
    url(r'^cb_assignment$', views.cb_assignment, name='cb_assignment'),
    url(r'^cadence_quiz$', views.cadence_quiz, name='cadence_quiz'),
    url(r'^simple_audible_quiz$', views.simple_audible_quiz, name='simple_audible_quiz'),
    url(r'^the_route_quiz$', views.the_route_quiz, name='the_route_quiz'),
    url(r'^audible_quiz$', views.audible_quiz, name='audible_quiz'),
    url(r'^blitz_quiz$', views.blitz_quiz, name='blitz_quiz'),
    url(r'^option_quiz$', views.option_quiz, name='option_quiz'),
    url(r'^create_formation$', views.create_formation, name='create_formation'),
    url(r'^create_defense_formation$', views.create_defense_formation, name='create_defense_formation'),
    url(r'^create_play$', views.create_play, name='create_play'),
    url(r'^formation_quiz$', views.formation_quiz, name='formation_quiz'),
    url(r'^alignment_quiz$', views.alignment_quiz, name='alignment_quiz'),
    url(r'^defense_play_quiz$', views.defense_play_quiz, name='defense_play_quiz'),
    url(r'^linebacker_call_quiz$', views.linebacker_call_quiz, name='linebacker_call_quiz'),
    url(r'^qb_call_quiz$', views.qb_call_quiz, name='qb_call_quiz'),
    url(r'^coverage_quiz$', views.coverage_quiz, name='coverage_quiz'),
    url(r'^pass_rush_quiz$', views.pass_rush_quiz, name='pass_rush_quiz'),
    url(r'^play_quiz$', views.play_quiz, name='play_quiz'),
    url(r'^simple_route_quiz$', views.simple_route_quiz, name='simple_route_quiz'),
    url(r'^another_route_quiz$', views.another_route_quiz, name='another_route_quiz'),
    url(r'^ol_view$', views.ol_view, name='ol_view'),
    url(r'^rb_quiz$', views.rb_quiz, name='rb_quiz'),
    url(r'^results$', views.results, name='results'),
    url(r'^results_chart$', views.results_chart, name='results_chart'),
    url(r'^wr_route$', views.wr_route, name='wr_route'),
    url(r'^players/(?P<player_id>[0-9]+)$', views.player_detail, name='player_detail'),
    url(r'^players/(?P<player_id>[0-9]+)/tests$', views.player_tests, name='player_tests'),
    url(r'^players/(?P<player_id>[0-9]+)/tests/(?P<test_id>[0-9]+)$', views.player_test, name='player_test'),
    url(r'^players/(?P<player_id>[0-9]+)/update$', views.update_player, name='update_player'),
    url(r'^players/(?P<player_id>[0-9]+)/tests/(?P<test_id>[0-9]+)/update$', views.update_test, name='update_test'),
    url(r'^teams/broncos/formations/new$', views.new_formation, name='new_formation'),
    url(r'^teams/(?P<team_id>[0-9]+)/formations$', views.team_formations, name='team_formations'),
    url(r'^teams/(?P<team_id>[0-9]+)/defensive_formations$', views.team_defensive_formations, name='team_defensive_formations'),
    url(r'^teams/(?P<team_id>[0-9]+)/formations/positions$', views.team_formation_positions, name='team_formation_positions'),
    url(r'^teams/(?P<team_id>[0-9]+)/formations/(?P<formation_id>[0-9]+)$', views.formation_detail, name='formation_detail'),
    url(r'^teams/(?P<team_id>[0-9]+)/formations/(?P<formation_id>[0-9]+)/positions$', views.formation_positions, name='formation_positions'),
    url(r'^teams/broncos/plays/new$', views.new_play, name='new_play'),
    url(r'^teams/(?P<team_id>[0-9]+)/plays$', views.team_plays, name='team_plays'),
    url(r'^teams/(?P<team_id>[0-9]+)/plays/players$', views.team_play_players, name='team_play_players'),
    url(r'^QBProgression/(?P<test_id>[0-9]+)$', views.run_qb_progression_test, name='run_qb_progression_test'),
    url(r'^WRRoute/(?P<test_id>[0-9]+)$', views.run_wr_route_test, name='run_wr_route_test'),
    url(r'^OLView/(?P<test_id>[0-9]+)$', views.run_ol_view_test, name='run_ol_view_test'),
    url(r'^CBAssignment/(?P<test_id>[0-9]+)$', views.run_cb_view_test, name='run_cb_view_test'),

    url(r'^tests/(?P<test_id>[0-9]+)$', views.single_test, name='single_test'),







]
