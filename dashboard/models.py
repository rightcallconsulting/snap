from __future__ import unicode_literals
from django import forms
from django.forms import ModelForm
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.db import models
from django.utils import timezone
from django.utils.translation import ugettext_lazy as _
from quiz.models import Team, Player, Group
from django.contrib.admin import widgets
from django.forms.models import model_to_dict
from datetimewidget.widgets import DateTimeWidget
from passwords.fields import PasswordField
from datetime import datetime
from IPython import embed

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
	POSITIONS = [
			["QB", "Quarterback"],
			["SK", "Skill Position"],
			["OL", "Offensive Lineman"],
			["DL", "Defensive Lineman"],
			["LB", "Linebacker"],
			["DB", "Defensive Back"],
			["SP", "Specialist"],
		]

	name = models.CharField(max_length=30, blank=True, null=True)
	team = models.ForeignKey(Team, on_delete=models.CASCADE, null=True, blank=True)
	players = models.ManyToManyField(Player, blank=True)

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

	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ["-created_at"]

	def __str__(self):
		return self.name

	def get_average_score_for_players(self, players):
		results = []
		for player in players:
			results.extend(QuestionAttempted.objects.filter(concept=self,player=player))
		if len(results) == 0:
			return 0.0
		score = 0
		skips = 0
		for result in results:
			if result.score != None:
				score += result.score
			else:
				skips += 1
		return score / len(results)

class Formation(models.Model):
	name = models.CharField(max_length=100)
	team = models.ForeignKey(Team, on_delete=models.CASCADE)
	unit = models.CharField(max_length=100, default="offense")
	scout = models.BooleanField(default=False)

	formationJson = models.TextField(max_length=None, blank=True, null=True)

	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ["-created_at"]

	def __str__(self):
		return self.name

	def get_average_score_for_players(self, players):
		results = []
		for player in players:
			results.extend(QuestionAttempted.objects.filter(formation=self,player=player))
		if len(results) == 0:
			return 0.0
		score = 0
		skips = 0
		for result in results:
			if result.score != None:
				score += result.score
			else:
				skips += 1
		return score / len(results)

class Play(models.Model):
	name = models.CharField(max_length=100)
	scoutName = models.CharField(max_length=100, default="", blank=True, null=False)
	team = models.ForeignKey(Team, on_delete=models.CASCADE)
	formation = models.ForeignKey(Formation, on_delete=models.CASCADE)
	scout = models.BooleanField(default=False)

	playJson = models.TextField(max_length=None, blank=True, null=True)

	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ["-created_at"]

	def get_average_score_for_players(self, players):
		results = []
		for player in players:
			results.extend(QuestionAttempted.objects.filter(play=self,player=player))
		if len(results) == 0:
			return 0.0
		score = 0
		skips = 0
		for result in results:
			if result.score != None:
				score += result.score
			else:
				skips += 1
		return score / len(results)

	def __str__(self):
		display_name = self.name + " from " + self.formation.name

		if (self.scoutName != ""):
			display_name += " vs " + self.scoutName

		return display_name
class Position(models.Model):
	startX = models.FloatField()
	startY = models.FloatField()
	name = models.CharField(max_length=100)
	formation = models.ForeignKey(Formation, on_delete=models.CASCADE, null=True, blank=True)
	routeCoordinates = models.CharField(max_length=200, null=True, blank=True)
	runCoordinates = models.CharField(max_length=200, null=True, blank=True)
	blockingCoordinates = models.CharField(max_length=200, null=True, blank=True)
	motionCoordinates = models.CharField(max_length=200, null=True, blank=True)
	progressionRank = models.IntegerField(null=True, blank=True)
	playerIndex = models.IntegerField(null=True, blank=True)
	routeNum = models.IntegerField(null=True, blank=True)
	blocker = models.NullBooleanField()
	runner = models.NullBooleanField()
	CBAssignmentPlayerIndex = models.IntegerField(null=True, blank=True)
	CBAssignmentPlayerID = models.IntegerField(null=True, blank=True)
	CBAssignmentPlayerIndex = models.IntegerField(null=True, blank=True)
	CBAssignmentPlayerPosition = models.CharField(max_length=200, null=True, blank=True)
	zoneYardX = models.FloatField(null=True, blank=True)
	zoneYardY = models.FloatField(max_length=200, null=True, blank=True)
	zoneHeight = models.FloatField(max_length=200, null=True, blank=True)
	zoneWidth = models.FloatField(max_length=200, null=True, blank=True)
	gapYardX = models.FloatField(max_length=200, null=True, blank=True)
	gapYardY = models.FloatField(max_length=200, null=True, blank=True)
	blockingAssignmentPlayerIndex = models.IntegerField(null=True, blank=True)
	blockingAssignmentUnitIndex = models.IntegerField(null=True, blank=True)
	blockingAssignmentObject = models.CharField(max_length=200, null=True, blank=True)
	runAssignment = models.CharField(max_length=200, null=True, blank=True)

	def __str__(self):
		return self.name

	def set_route_coordinates(self, coords):
		self.routeCoordinates = json.dumps(coords)

	def get_route_coordinates(self):
		return json.loads(self.routeCoordinates)

	def set_blocking_coordinates(self, coords):
		self.blockingCoordinates = json.dumps(coords)

	def get_blocking_coordinates(self):
		return json.loads(self.blockingCoordinates)

	def set_motion_coordinates(self, coords):
		self.motionCoordinates = json.dumps(coords)

	def get_motion_coordinates(self):
		return json.loads(self.motionCoordinates)

	def set_run_coordinates(self, coords):
		self.routeCoordinates = json.dumps(coords)

	def get_run_coordinates(self):
		return json.loads(self.routeCoordinates)

	def dict_for_json(self):
		"""Dict representation of the instance (used in JSON APIs)."""
		return model_to_dict(self)

class Quiz(models.Model):
	name = models.CharField(max_length=50, blank=True, null=True)
	team = models.ForeignKey(Team, on_delete=models.CASCADE)
	author = models.ForeignKey(User, on_delete=models.CASCADE)
	unit = models.CharField(max_length=25, default="offense")
	players = models.ManyToManyField(Player, related_name="players")
	submissions = models.ManyToManyField(Player, blank=True, related_name="submissions")

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
