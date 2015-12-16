from __future__ import unicode_literals

from django.db import models

# Create your models here.

class Team(models.Model):
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True) # set when it's created
    updated_at = models.DateTimeField(auto_now=True) # set every time it's updated

class Player(models.Model):
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    position = models.CharField(max_length=10) # QB, WR, RB. LT, LG, C, RG, RT, DE, DT, OLB, MLB, SS, FS, CB
    unit = models.CharField(max_length=20) # offense or defense
    number = models.IntegerField()
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    is_being_tested = models.BooleanField() # true if player has been assigned a test
    image_url = models.ImageField()
    created_at = models.DateTimeField(auto_now_add=True) # set when it's created
    updated_at = models.DateTimeField(auto_now=True) # set every time it's updated
