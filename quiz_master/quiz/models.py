from __future__ import unicode_literals

from django.db import models
from IPython import embed
import code


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

class Player(models.Model):
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    position = models.CharField(max_length=10) # QB, WR, RB, LT, LG, C, RG, RT, DE, DT, OLB, MLB, SS, FS, CB
    unit = models.CharField(max_length=20) # offense or defense
    number = models.IntegerField()
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    is_being_tested = models.BooleanField() # true if player has been assigned a test
    image_url = models.ImageField(blank=True, null=True)
    starter = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True) # set when it's created
    updated_at = models.DateTimeField(auto_now=True) # set every time it's updated

    def __str__(self):
        return self.full_name()

    def full_name(self):
        return "{0} {1}".format(self.first_name, self.last_name)

class Formation(models.Model):
    name = models.CharField(max_length=100)
    offensivePlayers = models.ManyToManyField(Player)
    playName = models.CharField(max_length=100)
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True) # set when it's created
    updated_at = models.DateTimeField(auto_now=True) # set every time it's updated

    def __str__(self):
        return self.name

    @classmethod
    def from_json(cls, json):
        new_formation = Formation(name=json['playName'], team=Team.objects.get(pk=1))
        new_formation.save()
        for player in json['offensivePlayers']:
            new_position = Position(name=player['pos'], startX=player['startX'],
            startY=player['startY'], formation=new_formation)
            new_position.save()

class Position(models.Model):
    startX = models.FloatField()
    startY = models.FloatField()
    name = models.CharField(max_length=100)
    formation = models.ForeignKey(Formation, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class Test(models.Model):
    type_of_test = models.CharField(max_length=100)
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    score = models.IntegerField()
    skips = models.IntegerField()
    incorrect_guesses = models.IntegerField()
    deadline = models.DateTimeField()
    completed = models.BooleanField()
    in_progress = models.BooleanField()
    created_at = models.DateTimeField(auto_now_add=True) # set when it's created
    updated_at = models.DateTimeField(auto_now=True) # set every time it's updated


    def __str__(self):
        return self.type_of_test

class Play(models.Model):
    name = models.CharField(max_length=100)
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    formation = models.ForeignKey(Formation, on_delete=models.CASCADE)
    players = models.ManyToManyField(Player)
    tests = models.ManyToManyField(Test)
    formation = models.ForeignKey(Formation, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True) # set when it's created
    updated_at = models.DateTimeField(auto_now=True) # set every time it's updated

    def __str__(self):
        return self.name
