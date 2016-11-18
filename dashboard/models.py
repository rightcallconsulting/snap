from __future__ import unicode_literals
from django import forms
from django.forms import ModelForm
from django.db import models
from django.utils import timezone
from django.utils.translation import ugettext_lazy as _
from django.contrib.admin import widgets
from django.forms.models import model_to_dict
from datetimewidget.widgets import DateTimeWidget
from datetime import datetime
from IPython import embed

class Admin(models.Model):
	user = models.OneToOneField('getsnap.CustomUser', on_delete=models.CASCADE)

	def __str__(self):
		return self.user.username

class Coach(models.Model):
	UNITS = [
			['O', 'Offense'],
			['D', 'Defense'],
			['S', 'Special Teams']
		]

	user = models.OneToOneField('getsnap.CustomUser', on_delete=models.CASCADE)
	team = models.ForeignKey('getsnap.Team', on_delete=models.CASCADE)
	admin = models.BooleanField(default=False)
	unit = models.CharField(max_length=1, choices=UNITS, blank=True, null=True)

	def __str__(self):
		return self.user.username

class Player(models.Model):
	YEARS = [
			['FR', 'Freshman'],
			['SO', 'Sophomore'],
			['JR', 'Junior'],
			['SR', 'Senior'],
			['RFR', 'Redshirt Freshman'],
			['RSO', 'Redshirt Sophomore'],
			['RJR', 'Redshirt Junior'],
			['RSR', 'Redshirt Senior']
		]

	user = models.OneToOneField('getsnap.CustomUser', on_delete=models.CASCADE)
	team = models.ForeignKey('getsnap.Team', on_delete=models.CASCADE)
	unit = models.CharField(max_length=30, blank=True, null=True)
	primary_position = models.ForeignKey('PlayerGroup', blank=True, null=True)
	
	year = models.CharField(max_length=3, choices=YEARS, blank=True, null=True)
	number = models.IntegerField(blank=True, null=True)

	def __str__(self):
			return self.user.username

class PlayerGroup(models.Model):
	POSITIONS = [
			['QB', 'Quarterback'],
			['SK', 'Skill Position'],
			['OL', 'Offensive Lineman'],
			['DL', 'Defensive Lineman'],
			['LB', 'Linebacker'],
			['DB', 'Defensive Back'],
			['SP', 'Specialist']
		]

	name = models.CharField(max_length=30, blank=True, null=True)
	team = models.ForeignKey('getsnap.Team', on_delete=models.CASCADE, null=True, blank=True)
	players = models.ManyToManyField('Player', blank=True)

	position_group = models.BooleanField(default=False)
	position_type = models.CharField(choices=POSITIONS, max_length=20, default="Skill Position")
	abbreviation = models.CharField(max_length=3, blank=True, null=True)

	class Meta:
		verbose_name="Player Group"
		verbose_name_plural="Player Groups"

	def __str__(self):
		return self.name

class DeletePlayerFromGroupForm(forms.Form):
	groupID = forms.CharField(max_length=10)
	playerID = forms.CharField(max_length=10)
