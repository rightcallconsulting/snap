from django.shortcuts import render
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.template import RequestContext, loader
from django.http import JsonResponse
from django.core import serializers
from django.db.models import Q
from django.views import generic
import json
import simplejson
from IPython import embed
from operator import attrgetter

from .models import Player, Team, Play, Formation, Test, Position, TestResult
from .utils import QuizOrders
from dashboard.utils import PlayerAnalytics

def index(request):
    player_list = Player.objects.all()
    context = {'player_list': player_list}
    return render(request, 'quiz/index.html', context)

def qb_progression(request):
    return render(request, 'quiz/qb_progression.html')

def cadence_quiz(request):
    return render(request, 'quiz/cadence_quiz.html')

def simple_audible_quiz(request):
    return render(request, 'quiz/simple_audible_quiz.html')

def simple_route_quiz(request):
    return render(request, 'quiz/simple_route_quiz.html')

def audible_quiz(request):
    return render(request, 'quiz/audible_quiz.html')

def option_quiz(request):
    if(request.user.myuser.is_a_player):
        player = request.user.player
        #playerID = player.id
    return render(request, 'quiz/option_quiz.html', {
        'player': player,
        'page_header': 'OPTION ASSIGNMENT'
    })

def blitz_quiz(request):
    return render(request, 'quiz/blitz_quiz.html')

def call_quiz(request):
    if(request.user.myuser.is_a_player):
        player = request.user.player
        #playerID = player.id
    return render(request, 'quiz/call_quiz.html', {
        'player': player
    })

def db_call_quiz(request):
    if(request.user.myuser.is_a_player):
        player = request.user.player
        #playerID = player.id
    return render(request, 'quiz/db_call_quiz.html', {
        'player': player
    })

def motion_quiz(request):
    if(request.user.myuser.is_a_player):
        player = request.user.player
        #playerID = player.id
    return render(request, 'quiz/motion_quiz.html', {
        'player': player,
        'page_header': 'MOTION QUIZ'
    })

def blocking_quiz(request):
    if(request.user.myuser.is_a_player):
        player = request.user.player
        #playerID = player.id
    return render(request, 'quiz/blocking_quiz.html', {
        'player': player,
        'page_header': 'BLOCKING QUIZ'
    })

def run_quiz(request):
    if(request.user.myuser.is_a_player):
        player = request.user.player
        #playerID = player.id
    return render(request, 'quiz/run_quiz.html', {
        'player': player,
        'page_header': 'RUN QUIZ'
    })

def qb_run_quiz(request):
    if(request.user.myuser.is_a_player):
        player = request.user.player
        #playerID = player.id
    return render(request, 'quiz/qb_run_quiz.html', {
        'player': player,
        'page_header': 'QB RUN QUIZ'
    })

def cb_assignment(request):
    return render(request, 'quiz/cb_assignment.html')

def create_formation(request):
    coach = request.user.coach
    team = coach.team
    formations = team.formation_set.all()
    offensive_formations = formations.filter(unit="offense")
    defensive_formations = formations.filter(unit="defense")
    return render(request, 'quiz/create_formation.html', {
        'formations': formations,
        'offensive_formations': offensive_formations,
        'defensive_formations': defensive_formations,
        'team': team,
        'page_header': 'CREATE FORMATION',
    })

def create_defense_formation(request):
    coach = request.user.coach
    team = coach.team
    formations = team.formation_set.all()
    offensive_formations = formations.filter(unit="offense")
    defensive_formations = formations.filter(unit="defense")
    personnel = ["Base", "Nickel"]
    return render(request, 'quiz/create_defense_formation.html', {
        'formations': formations,
        'offensive_formations': offensive_formations,
        'defensive_formations': defensive_formations,
        'team': team,
        'personnel': personnel,
        'page_header': 'CREATE DEFENSIVE FORMATION',
    })

def create_play(request):
    coach = request.user.coach
    team = coach.team
    formations = team.formation_set.all()
    offensive_formations = formations.filter(unit="offense")
    defensive_formations = formations.filter(unit="defense")
    
    json_seed = {
        'offensive_formations': [f.dict_for_json() for f in offensive_formations],
        'defensive_formations': [f.dict_for_json() for f in defensive_formations]
    }

    return render(request, 'quiz/create_play.html', {
        'formations': formations,
        'offensive_formations': offensive_formations,
        'defensive_formations': defensive_formations,
        'team': team,
        'page_header': 'CREATE PLAY',
        'json_seed': json.dumps(json_seed)
    })


class CustomPlayerQuizView(generic.TemplateView):
    """Display different types of custom player quizzes.

    This template view is MEANT TO BE SUBCLASSED. Children must implement
    the get_ordered_questions() method to customize the JSON seed data
    for that particular type of quiz.

    Attributes:
        template_name: Template file path (inherited from generic.TemplateView)
        page_header: String title of the paged passed into template context
        num_questions: Integer # of questions to include in the quiz
        order: QuizOrder url_key representing the order questions should be in
    """

    def get_ordered_questions(self):
        """Gets the list of questions that makes up the quiz.

        Questions are ordered according to self.order. Must be implemented by
        subclasses.

        Returns:
            An ordered list of dictionaries with data needed to seed each
            question in the quiz.
        """
        raise Exception('Subclasses of CustomPlayerQuizView must implement ' +
            'get_ordered_questions().')

    def resize_questions_data(self, questions):
        """Sizes a list of dict objects as specified in the GET param.

        If len(questions) is larger than self.num_questions, cuts off extra
        questions at the end. If smaller, repeats the unique question data
        until the list is the desired length.
        """
        if len(questions) == 0: return []

        #if self.num_questions > len(questions):
            # Repeat unique questions until we have desired quiz length
            #num_unique_questions = len(questions)
            #for i in range(len(questions), self.num_questions):
                #questions.append(questions[i % num_unique_questions])

        if self.num_questions < len(questions):
            # Remove additional questions beyond desired quiz length
            questions = questions[0:self.num_questions]

        return questions

    def build_dict_for_json_seed(self):
        """Builds dict() seed to be converted into JSON, which the JS assets
        will use to initialize the quiz. Quiz is sized & ordered as specified
        in data attributes."""
        questions = self.get_ordered_questions()
        questions = self.resize_questions_data(questions)
        return questions

    def store_quiz_options_from_request(self, request):
        """Save data attributes for use by instance methods."""
        # TODO: Redirect if URL params we need are not present?
        #       Or user is not a player?
        if request.user.myuser.is_a_player:
            self.player = request.user.player
        if 'num_qs' in request.GET:
            self.num_questions = int(request.GET['num_qs'])
        if 'order' in request.GET:
            self.order = request.GET['order']

    def get(self, request):
        self.store_quiz_options_from_request(request)
        return super(CustomPlayerQuizView, self).get(request)

    def get_context_data(self, **kwargs):
        context = super(CustomPlayerQuizView, self).get_context_data(**kwargs)
        context['page_header'] = self.page_header
        context['json_seed'] = json.dumps(self.build_dict_for_json_seed())
        return context


class PlayQuizView(CustomPlayerQuizView):
    template_name = 'quiz/play_quiz.html'
    page_header = 'PLAY QUIZ'

    exclude_plays_that_dont_include_players_position = False

    def get_ordered_questions(self):
        plays = self.player.team.play_set.all()
        formations = self.player.team.formation_set.all()

        if self.exclude_plays_that_dont_include_players_position:
            plays = [p for p in plays if self.player.position
                in p.position_strings()]

        # Sorting

        if self.order == QuizOrders.RECENT.url_key:
            plays = sorted(plays, reverse=True,
                key=attrgetter('created_at'))

        elif self.order == QuizOrders.WORST.url_key:
            analytics = PlayerAnalytics.for_single_player(self.player)
            plays = sorted(plays, reverse=True,
                key=analytics.total_incorrect_for_play)

        defensive_plays = []
        for p in plays:
            if p.defenseID:
                for f in formations:
                    if f.pk == p.defenseID:
                        defensive_plays.append(f)
        offenseAndDefense = [p.dict_for_json() for p in plays]
        offenseAndDefense.extend([f.dict_for_json() for f in defensive_plays])

        return offenseAndDefense

class WRQuizView(CustomPlayerQuizView):
    template_name = 'quiz/wr_quiz.html'
    page_header = 'WR QUIZ'

    exclude_plays_that_dont_include_players_position = False

    def get_ordered_questions(self):
        plays = self.player.team.play_set.all()

        if self.exclude_plays_that_dont_include_players_position:
            plays = [p for p in plays if self.player.position
                in p.position_strings()]

        # Sorting

        if self.order == QuizOrders.RECENT.url_key:
            plays = sorted(plays, reverse=True,
                key=attrgetter('created_at'))

        elif self.order == QuizOrders.WORST.url_key:
            analytics = PlayerAnalytics.for_single_player(self.player)
            plays = sorted(plays, reverse=True,
                key=analytics.total_incorrect_for_play)

        return [p.dict_for_json() for p in plays]


class QbCallQuizView(PlayQuizView):
    template_name = 'quiz/qb_call_quiz.html'
    page_header = 'QB CHECK QUIZ'

    def build_dict_for_json_seed(self):
        plays = super(QbCallQuizView, self).build_dict_for_json_seed()
        return {
            'player': self.player.dict_for_json(),
            'plays': plays,
        }


class RouteQuizView(PlayQuizView):
    template_name = 'quiz/route_quiz.html'
    page_header = 'ROUTE QUIZ'
    exclude_plays_that_dont_include_players_position = True

    def build_dict_for_json_seed(self):
        plays = super(RouteQuizView, self).build_dict_for_json_seed()
        return {
            'player': self.player.dict_for_json(),
            'plays': plays,
        }

class QBRouteQuizView(PlayQuizView):
    template_name = 'quiz/qb_route_quiz.html'
    page_header = 'DRAW ROUTE TREE'
    exclude_plays_that_dont_include_players_position = True

    def build_dict_for_json_seed(self):
        plays = super(QBRouteQuizView, self).build_dict_for_json_seed()
        return {
            'player': self.player.dict_for_json(),
            'plays': plays,
        }


class FormationQuizView(CustomPlayerQuizView):
    template_name = 'quiz/formation_quiz.html'
    page_header = 'FORMATION QUIZ'

    formation_unit = 'offense'
    exclude_formations_that_dont_include_players_position = False

    def get_ordered_questions(self):

        formations = self.player.team.formation_set.filter(
            unit=self.formation_unit
        )

        if self.exclude_formations_that_dont_include_players_position:
            formations = [
                f for f in formations if self.player.position in f.positions()
            ]

        # Sorting

        if self.order == QuizOrders.RECENT.url_key:
            formations = sorted(formations, reverse=True,
                key=attrgetter('created_at'))

        elif self.order == QuizOrders.WORST.url_key:
            analytics = PlayerAnalytics.for_single_player(self.player)
            formations = sorted(formations, reverse=True,
                key=analytics.total_incorrect_for_formation)

        return [f.dict_for_json() for f in formations]


class AlignmentQuizView(FormationQuizView):
    template_name = 'quiz/alignment_quiz.html'
    page_header = 'ALIGNMENT QUIZ'
    formation_unit = 'offense'
    exclude_formations_that_dont_include_players_position = True

    def build_dict_for_json_seed(self):
        formations = super(AlignmentQuizView, self).build_dict_for_json_seed()
        return {
            'player': self.player.dict_for_json(),
            'formations': formations,
        }

class OptionQuizMCView(FormationQuizView):
    template_name = 'quiz/option_quiz_mc.html'
    page_header = 'OPTION QUIZ'
    formation_unit = 'defense'
    exclude_formations_that_dont_include_players_position = True

    def build_dict_for_json_seed(self):
        formations = super(OptionQuizMCView, self).build_dict_for_json_seed()
        return {
            'player': self.player.dict_for_json(),
            'defensive_formations': formations,
        }


class CoverageQuizView(FormationQuizView):
    template_name = 'quiz/coverage_quiz.html'
    page_header = 'COVERAGE QUIZ'
    formation_unit = 'defense'
    exclude_formations_that_dont_include_players_position = True

    def build_dict_for_json_seed(self):
        formations = super(CoverageQuizView, self).build_dict_for_json_seed()
        return {
            'player': self.player.dict_for_json(),
            'defensive_plays': formations,
        }


class LinebackerQuizView(FormationQuizView):
    template_name = 'quiz/linebacker_call_quiz.html'
    page_header = 'PASS STRENGTH CALL QUIZ'
    formation_unit = 'defense'
    exclude_formations_that_dont_include_players_position = False

    def build_dict_for_json_seed(self):
        formations = super(LinebackerQuizView, self).build_dict_for_json_seed()
        return {
            'player': self.player.dict_for_json(),
            'defensive_formations': formations,
        }

class LinebackerMotionQuizView(FormationQuizView):
    template_name = 'quiz/linebacker_motion_quiz.html'
    page_header = 'LB MOTION QUIZ'
    formation_unit = 'defense'
    exclude_formations_that_dont_include_players_position = False

    def build_dict_for_json_seed(self):
        formations = super(LinebackerMotionQuizView, self).build_dict_for_json_seed()
        return {
            'player': self.player.dict_for_json(),
            'defensive_formations': formations,
        }

class OLineBlitzQuizView(FormationQuizView):
    template_name = 'quiz/oline_blitz_quiz.html'
    page_header = 'OLine Blitz Quiz'
    formation_unit = 'defense'
    exclude_formations_that_dont_include_players_position = False

    def build_dict_for_json_seed(self):
        formations = super(OLineBlitzQuizView, self).build_dict_for_json_seed()
        return {
            'player': self.player.dict_for_json(),
            'defensive_formations': formations,
        }

class MotionAlignmentQuizView(FormationQuizView):
    template_name = 'quiz/motion_alignment_quiz.html'
    page_header = 'MOTION ALIGNMENT QUIZ'
    formation_unit = 'defense'
    exclude_formations_that_dont_include_players_position = True

    def build_dict_for_json_seed(self):
        formations = super(MotionAlignmentQuizView, self).build_dict_for_json_seed()
        return {
            'player': self.player.dict_for_json(),
            'defensive_formations': formations,
        }

class CallAlignmentQuizView(FormationQuizView):
    template_name = 'quiz/call_alignment_quiz.html'
    page_header = 'CALL ALIGNMENT QUIZ'
    formation_unit = 'defense'
    exclude_formations_that_dont_include_players_position = True

    def build_dict_for_json_seed(self):
        formations = super(CallAlignmentQuizView, self).build_dict_for_json_seed()
        return {
            'player': self.player.dict_for_json(),
            'defensive_formations': formations,
        }


class PassRushQuizView(FormationQuizView):
    template_name = 'quiz/pass_rush_quiz.html'
    page_header = 'PASS RUSH QUIZ'
    formation_unit = 'defense'
    exclude_formations_that_dont_include_players_position = True

    def build_dict_for_json_seed(self):
        formations = super(PassRushQuizView, self).build_dict_for_json_seed()
        return {
            'player': self.player.dict_for_json(),
            'defensive_plays': formations,
        }


class PassZonesQuizView(FormationQuizView):
    template_name = 'quiz/pass_zones.html'
    page_header = 'PASS ZONES QUIZ'
    formation_unit = 'defense'
    exclude_formations_that_dont_include_players_position = False

    def build_dict_for_json_seed(self):
        formations = super(PassZonesQuizView, self).build_dict_for_json_seed()
        return {
            'player': self.player.dict_for_json(),
            'defensive_plays': formations,
        }


def defense_play_quiz(request):
    return render(request, 'quiz/defense_play_quiz.html')

def stunt_quiz(request):
    if(request.user.myuser.is_a_player):
        player = request.user.player
        #playerID = player.id
    return render(request, 'quiz/stunt_quiz.html', {
        'player': player,
        'page_header': 'STUNT QUIZ'
    })

def ol_view(request):
    return render(request, 'quiz/ol_view.html')

def rb_quiz(request):
    return render(request, 'quiz/rb_quiz.html')

def results_chart(request):
    return render(request, 'quiz/results_chart.html')

def results(request):
    return render(request, 'quiz/results.html')

def simple_route_quiz(request):
    return render(request, 'quiz/simple_route_quiz.html')

def another_route_quiz(request):
    return render(request, 'quiz/another_route_quiz.html')

def wr_route(request):
    return render(request, 'quiz/wr_route.html')

def players(request):
    player_list = Player.objects.all()
    context = {'player_list': player_list}
    return render(request, 'quiz/index.html', context)

def player_detail(request, player_id):
    try:
        player_array = Player.objects.filter(pk=player_id)
    except Player.DoesNotExist:
        raise Http404("Player does not exist")
    return HttpResponse(serializers.serialize("json", player_array))

def update_player(request, player_id):
    player = Player.objects.filter(pk=player_id)[0]
    test = player.test_set.all()[0]
    params = request.POST
    return HttpResponse('')

def player_tests(request, player_id):
    player = Player.objects.filter(pk=player_id)[0]
    tests = player.test_set.all()
    return HttpResponse(serializers.serialize("json", tests))

def player_test(request, player_id, test_id):
    player = Player.objects.filter(pk=player_id)[0]
    tests = player.test_set.all()
    if len(tests) == 1:
        selected_test = tests[0]
    else:
        for test_object in tests:
            if test_object.pk == int(test_id):
                selected_test = test_object
    return HttpResponse(serializers.serialize("json", [selected_test]))

def new_formation(request):
    params = request.POST
    formation = json.loads(params['formation'])
    Formation.from_json(formation)
    return HttpResponse('')

def team_formations(request, team_id):
    team = Team.objects.filter(pk=team_id)[0]
    formations = team.formation_set.all().filter(unit="offense")
    return HttpResponse(serializers.serialize("json", formations))

def team_defensive_formations(request, team_id):
    team = Team.objects.filter(pk=team_id)[0]
    formations = team.formation_set.all().filter(unit="defense")
    return HttpResponse(serializers.serialize("json", formations))

def formation_positions(request, team_id, formation_id):
    team = Team.objects.filter(pk=team_id)[0]
    formation = Formation.objects.filter(pk=formation_id)[0]
    positions = formation.position_set.all()
    return HttpResponse(serializers.serialize("json", positions))

def team_formation_positions(request, team_id):
    team = Team.objects.filter(pk=team_id)[0]
    positions = team.formations()
    return HttpResponse(serializers.serialize("json", positions))

def formation_detail(request, team_id, formation_id):
    team = Team.objects.filter(pk=team_id)[0]
    formation = Formation.objects.filter(pk=formation_id)
    return HttpResponse(serializers.serialize("json", formation))

def update_test(request, player_id, test_id):
    params = request.POST
    jsTest = json.loads(params['test'])
    current_play_id = int(params['play_id'])
    current_play = Play.objects.filter(pk=current_play_id)[0]
    pythonTest = Test.objects.get(pk=jsTest['id'])
    test_length = len(pythonTest.play_set.all())
    current_player = Player.objects.filter(pk=player_id)[0]
    if jsTest['newTest'] == True:
        # Create a new test result object assigned to the test
        new_test_result = TestResult(test=pythonTest, most_recent=True,
        score=0, skips=0, incorrect_guesses=0, player=current_player)
        new_test_result.save()
        new_test_result.string_id = str(new_test_result.id)
        new_test_result.save()
        new_test_result.update_result(jsTest, current_play)
        # Resets any other tests that were recent
        for test_result in TestResult.objects.filter(test=pythonTest):
            if test_result != new_test_result:
                test_result.most_recent = False
                test_result.save()
    else:
        # Update most_recent test result object
        existing_test_result = TestResult.objects.filter(Q(test=pythonTest)&Q(most_recent=True))[0]
        existing_test_result.update_result(jsTest, current_play)
    return HttpResponse('')

def new_play(request):
    params = request.POST
    play = json.loads(params['play'])
    Play.from_json(play)
    return HttpResponse('')

def team_plays(request, team_id):
    team = Team.objects.filter(pk=team_id)[0]
    plays = team.play_set.all()
    return HttpResponse(serializers.serialize("json", plays))

def team_play_players(request, team_id):
    team = Team.objects.filter(pk=team_id)[0]
    positions = team.play_positions()
    return HttpResponse(serializers.serialize("json", positions))

def run_qb_progression_test(request, test_id):
    test = Test.objects.filter(pk=test_id)[0]
    #test.change_in_progress_status(request.user)
    test_results = test.testresult_set.all()
    num_plays = len(test.play_set.all())
    if len(test.play_set.all()) > 0:
        has_plays = True
    else:
        has_plays = False
        return HttpResponseRedirect(reverse('homepage'))
    return render(request, 'quiz/qb_progression.html', {
        'test': test,
        'test_results': test_results,
        'has_plays': has_plays,
        'num_plays': num_plays,
        'page_header': 'QB PROGRESSION',
    })

def run_wr_route_test(request, test_id):
    test = Test.objects.filter(pk=test_id)[0]
    test.change_in_progress_status(request.user)
    player = request.user.player
    plays = test.play_set.all()
    json_plays = []
    for p in plays:
        json_plays.append(p.dict_for_json())
    if len(plays) > 0:
        has_plays = True
    else:
        has_plays = False
    json_seed = {
        'player': player.dict_for_json(),
        'plays': json_plays
    }
    return render(request, 'quiz/route_quiz.html', {
        'test': test,
        'has_plays': has_plays,
        'page_header': 'DRAW ROUTE QUIZ',
        'json_seed': json.dumps(json_seed),
    })

def run_qb_route_test(request, test_id):
    test = Test.objects.filter(pk=test_id)[0]
    test.change_in_progress_status(request.user)
    player = request.user.player
    plays = test.play_set.all()
    json_plays = []
    for p in plays:
        json_plays.append(p.dict_for_json())
    if len(plays) > 0:
        has_plays = True
    else:
        has_plays = False
    json_seed = {
        'player': player.dict_for_json(),
        'plays': json_plays
    }
    return render(request, 'quiz/qb_route_quiz.html', {
        'test': test,
        'has_plays': has_plays,
        'page_header': 'DRAW ROUTE QUIZ',
        'json_seed': json.dumps(json_seed),
    })

def run_ol_view_test(request, test_id):
    test = Test.objects.filter(pk=test_id)[0]
    test.change_in_progress_status(request.user)
    player = request.user.player
    plays = test.play_set.all()
    json_plays = []
    for p in plays:
        json_plays.append(p.dict_for_json())
    if len(plays) > 0:
        has_plays = True
    else:
        has_plays = False
    json_seed = {
        'player': player.dict_for_json(),
        'plays': json_plays
    }
    return render(request, 'quiz/blocking_quiz.html', {
        'test': test,
        'has_plays': has_plays,
        'page_header': 'OL TEST',
        'json_seed': json.dumps(json_seed),
    })

def run_cb_view_test(request, test_id):
	test = Test.objects.filter(pk=test_id)[0]
	test.change_in_progress_status(request.user)
	if len(test.play_set.all()) > 0:
		has_plays = True
	else:
		has_plays = False
	return render(request, 'quiz/cb_assignment.html', {
		'test': test,
		'has_plays': has_plays,
		'page_header': 'CB TEST',
	})

def concept_identification_quiz(request, test_id):
	test = Test.objects.filter(pk=test_id)[0]
	if len(test.play_set.all()) > 0:
		has_concepts = True
	else:
		has_concepts = False
	return render(request, 'quiz/concept_identification_quiz.html', {
		'test': test,
		'has_plays': has_plays,
		'page_header': 'CB TEST',
	})

def single_test(request, test_id):
    test = Test.objects.filter(pk=test_id)
    return HttpResponse(serializers.serialize("json", test))
