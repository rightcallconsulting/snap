from django.test import TestCase
from django.contrib.auth.models import User

from dashboard.models import myUser, Coach, PlayerGroup
from quiz.models import Team, Player

# Test Helpers:

def login_player(client):
    """Logs in a test player."""
    u = User.objects.create_user(username='test', password='test')
    client.login(username='test', password='test')
    myUser.objects.create(user=u, is_a_player=True)
    t = Team.objects.create(name='Test Team')
    return Player.objects.create(user=u, team=t)

def login_coach(client):
    """Logs in a test coach."""
    u = User.objects.create_user(username='test', password='test')
    client.login(username='test', password='test')
    myUser.objects.create(user=u, is_a_player=False)
    t = Team.objects.create(name='Test Team')
    return Coach.objects.create(user=u, team=t)

def create_player(team, username):
    """Creates a new player for the given team with the given username."""
    u = User.objects.create_user(username=username, password='asdf')
    myUser.objects.create(user=u, is_a_player=True)
    return Player.objects.create(user=u, team=team)

analytics_url = '/analytics'

# Test Cases:

class AnalyticsViewTests(TestCase):

    # Authentication tests:

    def test_without_authenticated_user(self):
        """Should redirect to login path if no logged in user."""
        response = self.client.get(analytics_url)
        expected_redirect = '/login?next={}'.format(analytics_url)
        self.assertRedirects(response, expected_redirect)

    def test_authenticated_user(self):
        """Should respond with status code 200 for logged in player."""
        login_player(self.client)
        response = self.client.get(analytics_url)
        self.assertEqual(response.status_code, 200)

    # Generic context tests:

    def test_page_header(self):
        """Should set 'page_header' context variable = to 'ANALYTICS'."""
        login_player(self.client)
        response = self.client.get(analytics_url)
        self.assertEqual(response.context['page_header'], 'ANALYTICS')

    # Player set selection tests:

    def test_single_player_analytics_object(self):
        """If a player is logged in, the view should create an analytics 
        object with metrics for only that logged in player."""
        
        player = login_player(self.client)
        response = self.client.get(analytics_url)
        analyzed_players = response.context['analytics'].players
        self.assertEqual(analyzed_players, [player])

    def test_coach_default_player_set_is_whole_team(self):
        """The default analytics view for a coach should be for the whole 
        team."""
        
        coach = login_coach(self.client)
        team = coach.team
        player1 = create_player(team=team, username='team_member_1')
        player2 = create_player(team=team, username='team_member_2')

        # Create a different team & add a player
        other_team = Team.objects.create(name='other')
        other_player = create_player(team=other_team, username='other')

        response = self.client.get(analytics_url)
        analyzed_players = response.context['analytics'].players
        self.assertIn(player1, analyzed_players)
        self.assertIn(player2, analyzed_players)
        self.assertNotIn(other_player, analyzed_players)

    def test_coach_looking_at_player_group(self):
        """When playergroup=pk is included as a GET parameter, the view should
        create an analytics object for only the players in the specified 
        PlayerGroup."""
        
        coach = login_coach(self.client)
        team = coach.team
        player1 = create_player(team=team, username='team_member_1')
        player2 = create_player(team=team, username='team_member_2')
        player_not_in_group = create_player(team=team, username='lonely')

        # Add player1 & player2 to a PlayerGroup
        group = PlayerGroup.objects.create(team=team)
        group.players.add(player1, player2)

        player_group_url = '{}?playergroup=1'.format(
            analytics_url,
            group.pk
        ) # /analytics?playergroup=1
        response = self.client.get(player_group_url)
        analyzed_players = response.context['analytics'].players
        self.assertIn(player1, analyzed_players)
        self.assertIn(player2, analyzed_players)
        self.assertNotIn(player_not_in_group, analyzed_players)


    def test_coach_looking_at_specific_player(self):
        """When player=pk is included as a GET parameter, the view should
        create an analytics object for only that specific player."""

        coach = login_coach(self.client)
        team = coach.team
        player1 = create_player(team=team, username='team_member_1')
        player2 = create_player(team=team, username='team_member_2')

        player_url = '{}?player={}'.format(
            analytics_url, 
            player1.pk
        ) # /analytics?player=1
        response = self.client.get(player_url)
        analyzed_players = response.context['analytics'].players
        self.assertIn(player1, analyzed_players)
        self.assertNotIn(player2, analyzed_players)
