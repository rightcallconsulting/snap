from django.conf.urls import url

from . import views

urlpatterns = [
	url(r'^$', views.index, name='index'),
	url(r'^formation_identification_quiz$', views.formation_identification_quiz, name='formation_identification_quiz'),
	url(r'^formation_alignment_quiz$', views.formation_alignment_quiz, name='formation_alignment_quiz'),
	url(r'^play_identification_quiz$', views.play_identification_quiz, name='play_identification_quiz'),
	url(r'^concept_identification_quiz$', views.concept_identification_quiz, name='concept_identification_quiz'),
	url(r'^players$', views.players, name='players'),
	url(r'^qb_progression$', views.qb_progression, name='qb_progression'),
	url(r'^cb_assignment$', views.cb_assignment, name='cb_assignment'),
	url(r'^cadence_quiz$', views.cadence_quiz, name='cadence_quiz'),
	url(r'^simple_audible_quiz$', views.simple_audible_quiz, name='simple_audible_quiz'),
	url(r'^blitz_quiz$', views.blitz_quiz, name='blitz_quiz'),
	url(r'^option_quiz$', views.option_quiz, name='option_quiz'),
	url(r'^create_formation$', views.create_formation, name='create_formation'),
	url(r'^create_defense_formation$', views.create_defense_formation, name='create_defense_formation'),
	url(r'^create_play$', views.create_play, name='create_play'),
	url(r'^formation_quiz$', views.FormationQuizView.as_view(), name='formation_quiz'),
	url(r'^pass_zones$', views.PassZonesQuizView.as_view(), name='pass_zones'),
	url(r'^defense_play_quiz$', views.defense_play_quiz, name='defense_play_quiz'),
	url(r'^linebacker_call_quiz$', views.LinebackerQuizView.as_view(), name='linebacker_call_quiz'),
	url(r'^linebacker_motion_quiz$', views.LinebackerMotionQuizView.as_view(), name='linebacker_motion_quiz'),
	url(r'^oline_blitz_quiz$', views.OLineBlitzQuizView.as_view(), name='oline_blitz_quiz'),
	url(r'^motion_alignment_quiz$', views.MotionAlignmentQuizView.as_view(), name='motion_alignment_quiz'),
	url(r'^call_alignment_quiz$', views.CallAlignmentQuizView.as_view(), name='call_alignment_quiz'),
	url(r'^call_quiz$', views.call_quiz, name='call_quiz'),
	url(r'^db_call_quiz$', views.db_call_quiz, name='db_call_quiz'),
	url(r'^motion_quiz$', views.motion_quiz, name='motion_quiz'),
	url(r'^qb_call_quiz$', views.QbCallQuizView.as_view(), name='qb_call_quiz'),
	url(r'^blocking_quiz$', views.blocking_quiz, name='blocking_quiz'),
	url(r'^run_quiz$', views.run_quiz, name='run_quiz'),
	url(r'^qb_run_quiz$', views.qb_run_quiz, name='qb_run_quiz'),
	url(r'^coverage_quiz$', views.CoverageQuizView.as_view(), name='coverage_quiz'),
	url(r'^option_quiz_mc$', views.OptionQuizMCView.as_view(), name='option_quiz_mc'),
	url(r'^pass_rush_quiz$', views.PassRushQuizView.as_view(), name='pass_rush_quiz'),
	url(r'^stunt_quiz$', views.stunt_quiz, name='stunt_quiz'),
	url(r'^play_quiz$', views.PlayQuizView.as_view(), name='play_quiz'),
	url(r'^wr_quiz$', views.WRQuizView.as_view(), name='wr_quiz'),
	url(r'^route_quiz$', views.RouteQuizView.as_view(), name='route_quiz'),
	url(r'^qb_route_quiz$', views.QBRouteQuizView.as_view(), name='qb_route_quiz'),
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
	url(r'^teams/(?P<team_id>[0-9]+)/plays/(?P<play_id>[0-9]+)$', views.play_json, name='play_json'),
	url(r'^teams/(?P<team_id>[0-9]+)/plays/(?P<play_id>[0-9]+)/positions$', views.play_positions_json, name='play_positions_json'),
	url(r'^teams/(?P<team_id>[0-9]+)/plays/players$', views.team_play_players, name='team_play_players'),
	url(r'^QBProgression/(?P<test_id>[0-9]+)$', views.run_qb_progression_test, name='run_qb_progression_test'),
	url(r'^WRRoute/(?P<test_id>[0-9]+)$', views.run_wr_route_test, name='run_wr_route_test'),
	url(r'^OLView/(?P<test_id>[0-9]+)$', views.run_ol_view_test, name='run_ol_view_test'),
	url(r'^CBAssignment/(?P<test_id>[0-9]+)$', views.run_cb_view_test, name='run_cb_view_test'),
	url(r'^ConceptID/(?P<test_id>[0-9]+)$', views.concept_identification_quiz, name='concept_identification_quiz'),
	url(r'^tests/(?P<test_id>[0-9]+)$', views.single_test, name='single_test'),
	url(r'^createJSONSeedStanford$', views.create_json_seed_stanford, name='stanford_json'),
]
