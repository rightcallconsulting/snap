from __future__ import unicode_literals
from django import forms
from django.forms import ModelForm
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.db import models
from django.utils import timezone
from django.utils.translation import ugettext_lazy as _
from quiz.models import Team, Player, Formation, Play, Position, Test, Group
from django.contrib.admin import widgets
from django.forms.models import model_to_dict
from datetimewidget.widgets import DateTimeWidget
from passwords.fields import PasswordField
from datetime import datetime

class UserCreateForm(UserCreationForm):
	POSITIONS = (
			("", ""),
			("QB", "Quarterback"),
			("WR", "Wide Receiver"),
			("RB", "Running Back"),
			("OL", "Offensive Lineman"),
			("DL", "Defensive Lineman"),
			("LB", "Linebacker"),
			("DB", "Defensive Back"),
			("LS", "Long Snapper"),
			("K", "Kicker"),
			("P", "Punter"),
		)
	first_name = forms.CharField(required=True, widget=forms.TextInput(attrs={'class': 'form-control input-sm bounceIn animation-delay2', 'placeholder' : 'First Name'}))
	last_name = forms.CharField(required=True, widget=forms.TextInput(attrs={'class': 'form-control input-sm bounceIn animation-delay2', 'placeholder' : 'Last Name'}))
	username = forms.CharField(required=True, widget=forms.TextInput(attrs={'class': 'form-control input-sm bounceIn animation-delay2', 'placeholder' : 'Username'}))
	email = forms.EmailField(required=True, widget=forms.TextInput(attrs={'class': 'form-control input-sm bounceIn animation-delay2', 'placeholder' : 'Email'}))
	password1 = PasswordField(required=True, widget=forms.PasswordInput(attrs={'class': 'form-control input-sm bounceIn animation-delay2', 'placeholder' : 'Password'}), label=_("Password"))
	password2 = PasswordField(required=True, widget=forms.PasswordInput(attrs={'class': 'form-control input-sm bounceIn animation-delay2', 'placeholder' : 'Confirm Password'}), label=_("Confirm Password"))
	player = forms.BooleanField(required=False, widget=forms.CheckboxInput(attrs={'class': ''}), label=_("Player"))
	coach = forms.BooleanField(required=False, widget=forms.CheckboxInput(attrs={'class': ''}), label=_("Coach"))
	team = forms.ModelChoiceField(queryset=None)
	position = forms.ChoiceField(required=False, choices=POSITIONS)
	avatar_image = forms.ImageField(required=False)

	class Meta:
		model = User
		fields = ("first_name", "last_name", "username", "email", "password1", "password2", "team", "avatar_image")

	def __init__(self, *args, **kwargs):
		super(UserCreateForm, self).__init__(*args, **kwargs)
		self.fields['team'].queryset = Team.objects.all()

	def save(self, commit=True):
		user = super(UserCreateForm, self).save(commit=False)
		user.email = self.cleaned_data["email"]
		if commit:
			user.save()
		return user

class RFPAuthForm(AuthenticationForm):
	username = forms.EmailField(widget=forms.TextInput(attrs={'class': 'form-control input-sm bounceIn animation-delay2','placeholder': 'Username'}))
	password = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'form-control input-sm bounceIn animation-delay4','placeholder':'Password'}))


class Coach(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE, blank=True, null=True)
	title = models.CharField(max_length=120, blank=True, null=True)
	created_at = models.DateTimeField(auto_now_add=True) # set when it's created
	updated_at = models.DateTimeField(auto_now=True) # set every time it's updated
	team = models.ForeignKey(Team, on_delete=models.CASCADE, null=True, blank=True)

	def testing_this(self):
		return self.first_name

class myUser(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE, blank=True, null=True)
	is_a_player = models.BooleanField(default=False)
	avatar_image  = models.ImageField(blank=True, null=True, upload_to='profile')

class PlayerGroup(models.Model):
	name = models.CharField(max_length=30, blank=True, null=True)
	team = models.ForeignKey(Team, on_delete=models.CASCADE, null=True, blank=True)
	players = models.ManyToManyField(Player)

	class Meta:
		verbose_name="Player Group"
		verbose_name_plural="Player Groups"
		ordering = ['pk']

	def __str__(self):
		return self.name

	def build_dict_for_json_seed(self):
		jsonPlayers = []
		for player in self.players.all():
			jsonPlayers.append(player.dict_for_json())
		return {
			'name': self.name,
			'players': jsonPlayers,
			'id': self.pk
		}

	def duplicate_and_assign_test_to_all_players(self, test_id, coach):
		players = self.players.all()
		for player in players:
			player.duplicate_and_assign_test(test_id, coach)

class DeletePlayerFromGroupForm(forms.Form):
	groupID = forms.CharField(max_length=10)
	playerID = forms.CharField(max_length=10)

class PlayerGroupForm(ModelForm):

	class Meta:
		model = PlayerGroup
		fields = ['name', 'players']

class UserForm(ModelForm):
	class Meta:
		model = User
		fields = ['first_name', 'last_name', 'username', 'email']

class PlayerForm(ModelForm):

	class Meta:
		model = Player
		fields = ['year', 'position', 'number']

class CoachForm(ModelForm):

	class Meta:
		model = Coach
		fields = ['title']

class TestForm(ModelForm):
	OPTIONS = (
			("QB_Progression", "QB_Progression"),
			("WR_Route", "WR_Route"),
			("OL_View", "OL_View"),
			("CB_Assignment", "CB_Assignment"),
		)

	class Meta:
		model = Test
		fields = ['name','type_of_test', 'deadline']
		widgets = {
		#Use localization and bootstrap 3
		}

	def __init__(self, *args, **kwargs):
		OPTIONS = (
			("QBProgression", "QB Progression"),
			("WRRoute", "WR Route"),
			("OLView", "OL View"),
			("CBAssignment", "CB Assignment"),
		)

		user = kwargs.pop('user','')
		super(TestForm, self).__init__(*args, **kwargs)
		self.fields['type_of_test']=forms.ChoiceField(OPTIONS)
		self.fields['group']=forms.ModelChoiceField(queryset=PlayerGroup.objects.all(), initial=0)
		self.fields['player']=forms.ModelChoiceField(queryset=Player.objects.all())
		self.fields['deadline'].widget=widgets.AdminSplitDateTime()

class UserMethods(User):
  def custom_method(self):
	pass
  class Meta:
	proxy=True

class Authentication(object):
	@staticmethod
	def get_coach(user_object):
		try:
			return user_object.coach
		except AttributeError:
			return None

	@staticmethod
	def get_player(user_object):
		try:
			return user_object.player
		except AttributeError:
			return None

class Concept(models.Model):
	name = models.CharField(max_length=50, blank=True, null=True)
	team = models.ForeignKey(Team, on_delete=models.CASCADE)
	unit = models.CharField(max_length=25, default="offense", blank=True, null=True)

	scout = models.BooleanField(default=False)

	conceptJson = models.TextField(max_length=None, blank=True, null=True)

	def __str__(self):
		return self.name

class Quiz(models.Model):
	name = models.CharField(max_length=50, blank=True, null=True)
	team = models.ForeignKey(Team, on_delete=models.CASCADE)
	author = models.ForeignKey(User, on_delete=models.CASCADE)
	unit = models.CharField(max_length=25, default="offense")
	players = models.ManyToManyField(Player)

	formations = models.ManyToManyField(Formation, blank=True)
	plays = models.ManyToManyField(Play, blank=True)
	concepts = models.ManyToManyField(Concept, blank=True)
	
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		verbose_name = "Quiz"
		verbose_name_plural = "Quizzes"
		ordering = ["-created_at"]

	def __str__(self):
		return self.name

class QuestionAttempted(models.Model):
	player = models.ForeignKey(Player, on_delete=models.CASCADE)
	team = models.ForeignKey(Team, on_delete=models.CASCADE, blank=True)
	time = models.DateTimeField(auto_now_add=True)
	quiz = models.ForeignKey(Quiz)

	formation = models.ForeignKey(Formation, blank=True, null=True)
	play = models.ForeignKey(Play, blank=True, null=True)
	concept = models.ForeignKey(Concept, blank=True, null=True)

	score = models.IntegerField(null=True) # 0 = incorrect, 1 = correct, null = skipped

	class Meta:
		verbose_name = "Question Attempted"
		verbose_name_plural = "Questions Attempted"

	def __str__(self):
		return self.player.first_name + " " + self.player.last_name + " on " + self.quiz.name
