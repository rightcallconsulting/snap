from __future__ import unicode_literals
from django import forms
from django.forms import ModelForm
from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone
from django.utils.translation import ugettext_lazy as _
from django.contrib.admin import widgets
from django.forms.models import model_to_dict
from datetimewidget.widgets import DateTimeWidget
from datetime import datetime
from IPython import embed

from getsnap.models import UserCreateForm, Team
from playbook.models import Concept, Formation, Play

class Player(models.Model):
	YEAR_CHOICES = (
		('FR', 'Freshman'),
		('SO', 'Sophomore'),
		('JR', 'Junior'),
		('SR', 'Senior'),
		('RS FR', 'Redshirt Freshman'),
		('RS SO', 'Redshirt Sophomore'),
		('RS JR', 'Redshirt Junior'),
		('RS SR', 'Redshirt Senior'),
	)

	user = models.OneToOneField(User, on_delete=models.CASCADE, blank=True, null=True)
	first_name = models.CharField(max_length=30, blank=True, null=True)
	last_name = models.CharField(max_length=30, blank=True, null=True)
	position = models.CharField(max_length=10, blank=True, null=True) # QB, WR, RB, LT, LG, C, RG, RT, DE, DT, OLB, MLB, SS, FS, CB
	year = models.CharField(max_length=25, blank=True, null=True, choices=YEAR_CHOICES)
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

	def dict_for_json(self):
		"""Dict representation of the instance (used in JSON APIs)."""
		json_dict = model_to_dict(self)
		json_dict.pop('image_url', None) # Don't try to encode image in JSON
		return json_dict


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

class CustomQuiz(models.Model):
	team = models.ForeignKey(Team, on_delete=models.CASCADE)
	player = models.ForeignKey(Player, on_delete=models.CASCADE)

	content_type = models.CharField(max_length=25, default="play") #formation, play, concept
	number_of_questions = models.IntegerField(default=0)
	ordering = models.CharField(max_length=25, default="recent") #recent, missed, random
	quiz_type = models.CharField(max_length=25, default="identification") #identification, assignment, alignment
	position = models.CharField(max_length=25, default="") #abbreviation
	type_of_assignment = models.CharField(max_length=25, default="all") #all, blocks, etc.

	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)


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
