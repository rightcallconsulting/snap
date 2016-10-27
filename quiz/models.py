from __future__ import unicode_literals

from datetime import datetime, timedelta
from django.db import models
from IPython import embed
from django.contrib.auth.models import User
from django.forms.models import model_to_dict
import code
import copy
import json



# This function returns a datetime object for the deadline
# of anything that is published. The deadline defaults to
# 1 day.
def deadline_time():
	deadline = datetime.now() + timedelta(days=1)
	return deadline

class Team(models.Model):
	name = models.CharField(max_length=100)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	sidebar_image = models.ImageField(blank=True, null=True)
	banner_image = models.ImageField(blank=True, null=True)
	midfield_art = models.ImageField(blank=True, null=True)
	endzone_art = models.ImageField(blank=True, null=True)

	def __str__(self):
		return self.name

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

class Group(models.Model):
	name = models.CharField(max_length=100)
	created_at = models.DateTimeField(auto_now_add=True) # set when it's created
	updated_at = models.DateTimeField(auto_now=True) # set every time it's updated
	members = models.ManyToManyField(Player)

	def __str__(self):
		return self.name

	def players(self):
		return self.members
