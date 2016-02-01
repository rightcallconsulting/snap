from __future__ import unicode_literals

from django.db import models
from IPython import embed
from django.contrib.auth.models import User
import code
import copy
import json


# Create your models here.

class Team(models.Model):
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True) # set when it's created
    updated_at = models.DateTimeField(auto_now=True) # set every time it's updated

    def __str__(self):
        return self.name

    def formations(self):
        positions = []
        for formation in self.formation_set.all():
            for position in formation.position_set.all():
                positions.append(position)
        return positions

    def play_positions(self):
        positions = []
        for play in self.play_set.all():
            for position in play.positions.all():
                positions.append(position)
        return positions

class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, blank=True, null=True)
    first_name = models.CharField(max_length=30, blank=True, null=True)
    last_name = models.CharField(max_length=30, blank=True, null=True)
    position = models.CharField(max_length=10, blank=True, null=True) # QB, WR, RB, LT, LG, C, RG, RT, DE, DT, OLB, MLB, SS, FS, CB
    unit = models.CharField(max_length=20, blank=True, null=True) # offense or defense
    number = models.IntegerField(blank=True, null=True)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, blank=True, null=True)
    is_being_tested = models.BooleanField(default=False) # true if player has been assigned a test
    image_url = models.ImageField(blank=True, null=True)
    starter = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True) # set when it's created
    updated_at = models.DateTimeField(auto_now=True) # set every time it's updated

    def __str__(self):
        if self.user is not None:
            return self.user.get_full_name()
        else:
            return self.full_name()

    def full_name(self):
        return "{0} {1}".format(self.first_name, self.last_name)

    def duplicate_and_assign_test(self, existing_test_id, coach):
        new_test = Test.objects.filter(pk=existing_test_id)[0]
        new_test.pk = None
        new_test.player = self
        new_test.coach_who_created = coach.user
        new_test.save()


class Formation(models.Model):
    name = models.CharField(max_length=100)
    offensivePlayers = models.ManyToManyField(Player)
    playName = models.CharField(max_length=100)
    offensiveFormationID = models.IntegerField(null=True, blank=True)
    unit = models.CharField(max_length=100, default="offense")
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True) # set when it's created
    updated_at = models.DateTimeField(auto_now=True) # set every time it's updated

    def __str__(self):
        return self.name

    @classmethod
    def from_json(cls, json):
        new_formation = Formation(name=json['playName'], team=Team.objects.get(pk=1), unit=json['unit'])
        new_formation.save()
        if(json['unit'] == "offense"):
            for player in json['offensivePlayers']:
                new_position = Position(name=player['pos'], startX=player['startX'],
                startY=player['startY'], formation=new_formation, playerIndex=player['playerIndex'])
                new_position.save()
        else:
            new_formation.offensiveFormationID = json['offensiveFormationID']
            new_formation.save()
            for player in json['defensivePlayers']:
                new_position = Position(name=player['pos'], startX=player['startX'],
                startY=player['startY'], formation=new_formation)
                if(player['CBAssignment']):
                    new_position.CBAssignmentPlayerID=player['CBAssignment']['id']
                    new_position.CBAssignmentPlayerIndex=player['CBAssignment']['playerIndex']
                    new_position.CBAssignmentPlayerPosition=player['CBAssignment']['pos']
                new_position.save()

class Position(models.Model):
    startX = models.FloatField()
    startY = models.FloatField()
    name = models.CharField(max_length=100)
    formation = models.ForeignKey(Formation, on_delete=models.CASCADE, null=True, blank=True)
    routeCoordinates = models.CharField(max_length=200, null=True, blank=True)
    progressionRank = models.IntegerField(null=True, blank=True)
    playerIndex = models.IntegerField(null=True, blank=True)
    routeNum = models.IntegerField(null=True, blank=True)
    blocker = models.NullBooleanField()
    runner = models.NullBooleanField()
    CBAssignmentPlayerIndex = models.IntegerField(null=True, blank=True)
    CBAssignmentPlayerID = models.IntegerField(null=True, blank=True)
    CBAssignmentPlayerPosition = models.CharField(max_length=200, null=True, blank=True)
    blockingAssignmentPlayerIndex = models.IntegerField(null=True, blank=True)
    blockingAssignmentUnitIndex = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.name

    def set_route_coordinates(self, coords):
        self.routeCoordinates = json.dumps(coords)

    def get_route_coordinates(self):
        return json.loads(self.routeCoordinates)

class Test(models.Model):

    types_of_tests = ["QBProgression", "CBAssignment", "OLView", "WRRoute"]
    name = models.CharField(max_length=100, null=True, blank=True)
    type_of_test = models.CharField(max_length=100)
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    score = models.IntegerField(null=True, blank=True)
    skips = models.IntegerField(null=True, blank=True)
    incorrect_guesses = models.IntegerField(null=True, blank=True)
    formations = models.ManyToManyField(Formation, null=True, blank=True)
    deadline = models.DateTimeField(null=True, blank=True)
    completed = models.BooleanField(default=False)
    in_progress = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True) # set when it's created
    updated_at = models.DateTimeField(auto_now=True) # set every time it's updated
    coach_who_created = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)


    def __str__(self):
        return self.type_of_test

    def generate_missed_plays_dict(self):
        missed_play_dict = {}
        test_results = self.testresult_set.all()
        for test_result in test_results:
            for missed_play in test_result.missed_plays.all():
                if missed_play.name in missed_play_dict.keys():
                    missed_play_dict[missed_play.name] += 1
                else:
                    missed_play_dict[missed_play.name] = 1
        return missed_play_dict

    def format_for_graphos(self, missed_play_dict):
        formatted_list_for_graphos = [[], []]
        for play in missed_play_dict.keys():
            formatted_list_for_graphos[0].append(play)
            formatted_list_for_graphos[1].append(missed_play_dict[play])
        return formatted_list_for_graphos

class Play(models.Model):
    name = models.CharField(max_length=100)
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    formation = models.ForeignKey(Formation, on_delete=models.CASCADE)
    players = models.ManyToManyField(Player, null=True, blank=True)
    positions = models.ManyToManyField(Position)
    tests = models.ManyToManyField(Test)
    created_at = models.DateTimeField(auto_now_add=True) # set when it's created
    updated_at = models.DateTimeField(auto_now=True) # set every time it's updated

    def __str__(self):
        return self.name

    @classmethod
    def from_json(cls, json):
        new_play = Play(name=json['name'], team=Team.objects.get(pk=1),
        formation=Formation.objects.get(pk=json['formation']['id']))
        new_play.save()
        for player in json['offensivePlayers']:
            new_position = new_play.positions.create(name=player['pos'], startX=player['startX'],
            startY=player['startY'], blocker=player['blocker'], runner=player['runner'],
            progressionRank=player['progressionRank'],
            blockingAssignmentPlayerIndex=player['blockingAssignmentPlayerIndex'],
            blockingAssignmentUnitIndex=player['blockingAssignmentUnitIndex'])
            new_position.set_route_coordinates(player['routeCoordinates'])
            new_position.save()
        new_play.save()

class TestResult(models.Model):
    score = models.FloatField(null=True, blank=True)
    skips = models.FloatField(null=True, blank=True)
    incorrect_guesses = models.FloatField(null=True, blank=True)
    time_taken = models.IntegerField(null=True, blank=True)
    test = models.ForeignKey(Test, on_delete=models.CASCADE)
    player = models.ForeignKey(Player, on_delete=models.CASCADE, null=True, blank=True)
    missed_plays = models.ManyToManyField(Play, related_name="missed_plays", null=True, blank=True)
    correct_plays = models.ManyToManyField(Play, null=True, blank=True)
    skipped_plays = models.ManyToManyField(Play, related_name="skipped_playes", null=True, blank=True)
    most_recent = models.BooleanField(default=False)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True) # set when it's created
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True) # set every time it's updated


    class Meta:
         ordering = ['created_at']

    def update_result(self, js_test_object, play_object):
        if float(js_test_object['score']) > self.score:
            self.correct_plays.add(play_object)
        elif float(js_test_object['skips']) > self.skips:
            self.skipped_plays.add(play_object)
        elif float(js_test_object['incorrectGuesses']) > self.incorrect_guesses:
            self.missed_plays.add(play_object)
        self.score = js_test_object['score']
        self.skips = js_test_object['skips']
        self.incorrect_guesses = js_test_object['incorrectGuesses']
        if len(self.test.play_set.all()) == (int(js_test_object['questionNum']) + 1):
            self.completed = True
            self.time_taken = (js_test_object['endTime'] - js_test_object['startTime'])/-1000
        self.save()
