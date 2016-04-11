from django.test import TestCase
from django.contrib.auth.models import User

from dashboard.models import myUser, Coach
from quiz.models import Team, Player, Test, TestResult, Formation, Play
from dashboard.utils import PlayerAnalytics
from .test_views import create_player

# Test Helpers:

def create_test_result(test, correct=0, incorrect=0, skipped=0, **kwargs):
    """Helper function to create TestResult objects.

    Creates a TestResult object for the given Test, with the given number of
    correct, incorrect, and skipped answers. Creates new Play objects to
    populate the missed/correct/skipped_plays relations. Additional TestResult
    attributes can be passed through kwargs.
    """

    result = TestResult.objects.create(test=test, player=test.player, **kwargs)
    team = test.player.team
    formation = Formation.objects.create(team=team)

    # Create new plays to populate the TestResult relation fields
    for _ in range(correct):
        play = Play.objects.create(formation=formation, team=team)
        result.correct_plays.add(play)

    for _ in range(incorrect):
        play = Play.objects.create(formation=formation, team=team)
        result.missed_plays.add(play)

    for _ in range(skipped):
        play = Play.objects.create(formation=formation, team=team)
        result.skipped_plays.add(play)

    result.score = correct
    result.incorrect_guesses = incorrect
    result.skips = skipped
    result.save()
    return result

# Test Cases:

class PlayerAnalyticsTests(TestCase):

    def setUp(self):
        self.team = Team.objects.create(name='team')

    def test_avg_time_with_single_player(self):
        """avg_time_per_question() should return total time divided by
        total questions for a single player."""

        player = create_player(team=self.team, username='single')
        test = player.test_set.create()
        result1 = create_test_result(test=test, correct=10, time_taken=100)
        result2 = create_test_result(test=test, correct=10, time_taken=50)
        analytics = PlayerAnalytics.for_single_player(player)
        self.assertEqual(analytics.avg_time_per_question(), 7.5) # 150 / 20

    def test_avg_time_with_multiple_players(self):
        """avg_time_per_question() should return total time divided by
        total questions for multiple players."""

        player1 = create_player(team=self.team, username='p1')
        player2 = create_player(team=self.team, username='p2')
        test1 = player1.test_set.create()
        test2 = player2.test_set.create()
        result1 = create_test_result(test=test1, correct=10, time_taken=100)
        result2 = create_test_result(test=test2, correct=10, time_taken=50)
        analytics = PlayerAnalytics.for_players([player1, player2])
        self.assertEqual(analytics.avg_time_per_question(), 7.5) # 150 / 20

    def test_total_responses_with_single_player(self):
        """total_correct(), total_skipped(), and total_incorrect() should
        return the correct counts for given test results of a single player."""

        player = create_player(team=self.team, username='single')
        test = player.test_set.create()
        create_test_result(test=test, correct=1, incorrect=2, skipped=3)
        create_test_result(test=test, correct=1, incorrect=2, skipped=3)
        analytics = PlayerAnalytics.for_single_player(player)
        self.assertEqual(analytics.total_correct(), 2)
        self.assertEqual(analytics.total_incorrect(), 4)
        self.assertEqual(analytics.total_skipped(), 6)

    def test_total_responses_with_multiple_players(self):
        """total_correct(), total_skipped(), and total_incorrect() should
        return the correct counts for given test results of many players."""

        player1 = create_player(team=self.team, username='p1')
        player2 = create_player(team=self.team, username='p2')
        test1 = player1.test_set.create()
        test2 = player2.test_set.create()
        create_test_result(test=test1, correct=1, incorrect=2, skipped=3)
        create_test_result(test=test2, correct=1, incorrect=2, skipped=3)
        analytics = PlayerAnalytics.for_players([player1, player2])
        self.assertEqual(analytics.total_correct(), 2)
        self.assertEqual(analytics.total_incorrect(), 4)
        self.assertEqual(analytics.total_skipped(), 6)

    def test_sorted_play_lists_with_single_player(self):
        """Should populate and sort the correct_plays, incorrect_plays, and
        skipped_plays attributes for a single player."""

        player = create_player(team=self.team, username='single')
        test = player.test_set.create()
        result1 = create_test_result(test=test)
        result2 = create_test_result(test=test)
        result3 = create_test_result(test=test)

        # Create Play objects
        formation = Formation.objects.create(team=self.team)
        play1 = Play.objects.create(team=self.team, formation=formation)
        play2 = Play.objects.create(team=self.team, formation=formation)
        play3 = Play.objects.create(team=self.team, formation=formation)

        # play1: 3 correct, play2: 2 correct, play3: 1 correct, 
        result1.correct_plays.add(play1)
        result2.correct_plays.add(play1, play2)
        result3.correct_plays.add(play1, play2, play3)

        # play2: 3 incorrect, play3: 2 incorrect, play1: 1 incorrect, 
        result1.missed_plays.add(play2)
        result2.missed_plays.add(play2, play3)
        result3.missed_plays.add(play2, play3, play1)

        # play3: 3 skipped, play1: 2 skipped, play2: 1 skipped, 
        result1.skipped_plays.add(play3)
        result2.skipped_plays.add(play3, play1)
        result3.skipped_plays.add(play3, play1, play2)

        analytics = PlayerAnalytics.for_single_player(player)
        self.assertEqual(analytics.correct_plays, [
            (play1, 3),
            (play2, 2),
            (play3, 1),
        ])
        self.assertEqual(analytics.incorrect_plays, [
            (play2, 3),
            (play3, 2),
            (play1, 1),
        ])
        self.assertEqual(analytics.skipped_plays, [
            (play3, 3),
            (play1, 2),
            (play2, 1),
        ])

    def test_sorted_play_lists_with_multiple_players(self):
        """Should populate and sort the correct_plays, incorrect_plays, and
        skipped_plays attributes for multiple players."""

        # Same as previous test except the test / test results are split
        # between 3 different players rather than the same player
        player1 = create_player(team=self.team, username='p1')
        player2 = create_player(team=self.team, username='p2')
        player3 = create_player(team=self.team, username='p3')
        test1 = player1.test_set.create()
        test2 = player2.test_set.create()
        test3 = player3.test_set.create()
        result1 = create_test_result(test=test1)
        result2 = create_test_result(test=test2)
        result3 = create_test_result(test=test3)

        # Create Play objects
        form = Formation.objects.create(team=self.team)
        play1 = Play.objects.create(team=self.team, formation=form)
        play2 = Play.objects.create(team=self.team, formation=form)
        play3 = Play.objects.create(team=self.team, formation=form)

        # play1: 3 correct, play2: 2 correct, play3: 1 correct, 
        result1.correct_plays.add(play1)
        result2.correct_plays.add(play1, play2)
        result3.correct_plays.add(play1, play2, play3)

        # play2: 3 incorrect, play3: 2 incorrect, play1: 1 incorrect, 
        result1.missed_plays.add(play2)
        result2.missed_plays.add(play2, play3)
        result3.missed_plays.add(play2, play3, play1)

        # play3: 3 skipped, play1: 2 skipped, play2: 1 skipped, 
        result1.skipped_plays.add(play3)
        result2.skipped_plays.add(play3, play1)
        result3.skipped_plays.add(play3, play1, play2)

        analytics = PlayerAnalytics.for_players([player1, player2, player3])
        self.assertEqual(analytics.correct_plays, [
            (play1, 3),
            (play2, 2),
            (play3, 1),
        ])
        self.assertEqual(analytics.incorrect_plays, [
            (play2, 3),
            (play3, 2),
            (play1, 1),
        ])
        self.assertEqual(analytics.skipped_plays, [
            (play3, 3),
            (play1, 2),
            (play2, 1),
        ])
