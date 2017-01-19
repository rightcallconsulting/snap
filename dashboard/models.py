from __future__ import unicode_literals
from django import forms
from django.forms import ModelForm
from django.db import models
from django.utils import timezone
from django.utils.translation import ugettext_lazy as _
from django.contrib.admin import widgets
from django.forms.models import model_to_dict
from datetimewidget.widgets import DateTimeWidget
from datetime import datetime, timedelta
import random

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
	team = models.ForeignKey('getsnap.Team', on_delete=models.CASCADE, blank=True, null=True)
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
	team = models.ForeignKey('getsnap.Team', on_delete=models.CASCADE, blank=True, null=True)
	unit = models.CharField(max_length=30, blank=True, null=True)
	primary_position = models.ForeignKey('PlayerGroup', blank=True, null=True)

	year = models.CharField(max_length=3, choices=YEARS, blank=True, null=True)
	number = models.IntegerField(blank=True, null=True)

	def __str__(self):
			return self.user.email

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

	def getUnit(self):
		if(self.position_type == "Quarterback" or self.position_type == "Skill Position" or self.position_type == "Offensive Lineman"):
			return "offense"
		if(self.position_type == "Defensive Lineman" or self.position_type == "Linebacker" or self.position_type == "Defensive Back"):
			return "defense"
		return None

class DeletePlayerFromGroupForm(forms.Form):
	groupID = forms.CharField(max_length=10)
	playerID = forms.CharField(max_length=10)

class APIToken(models.Model):
	token = models.CharField(max_length=40, blank=False, null=False)
	expiration = models.DateTimeField()
	user = models.ForeignKey('getsnap.CustomUser', on_delete=models.CASCADE, blank=False, null=False)

	def is_valid(self):
		if datetime.today() < self.expiration.replace(tzinfo=None):
			return True
		return False
	@classmethod
	def getTokenFor(cls, user):
		api_token = APIToken(user=user)
		api_token.expiration = datetime.today() + timedelta(days=7)

		random.seed()
		existing_tokens = list(APIToken.objects.all())
		existing_token_strings = []
		for t in existing_tokens:
			if t.user == user and t.is_valid():
				return t.token
			existing_token_strings.append(str(t.token))
		new_token = APIToken.generateTokenString()
		while(new_token in existing_token_strings):
			new_token = APIToken.generateTokenString()
		api_token.token = new_token
		api_token.save()
		return new_token #success

	@classmethod
	def generateTokenString(cls):
		token_length = 20
		token = ""
		valid_symbols = []
		for i in range(10):
			valid_symbols.append(chr(ord('0')+i))
		for i in range(26):
			valid_symbols.append(chr(ord('a')+i))
			valid_symbols.append(chr(ord('A')+i))
		for i in range(token_length):
			token += valid_symbols[random.randint(0, len(valid_symbols)-1)]
		return token

	@classmethod
	def verifyAPIToken(cls, token):
		existing_tokens = list(APIToken.objects.all())
		token_found = None
		for t in existing_tokens:
			if t.token == token:
				token_found = t
				break
		if token_found:
			if datetime.today() < token_found.expiration.replace(tzinfo=None):
				return token_found.user
			else:
				return None#"Token Expired"
		else:
			return None#"Invalid Token"
