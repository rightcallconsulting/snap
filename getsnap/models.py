from __future__ import unicode_literals

from datetime import datetime, timedelta
from django import forms
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.utils.translation import ugettext_lazy as _

from passwords.fields import PasswordField



class CustomUser(AbstractUser):
	TYPES = [
			['A', 'Admin'],
			['C', 'Coach'],
			['P', 'Player']
		]

	user_type = models.CharField(max_length=1,
								choices=TYPES,
								default='P')

	phone_number = models.CharField(max_length=15, blank=True, null=True)

	customer_id = models.CharField(max_length=30, blank=True, null=True) #braintree

	def __str__(self):
		return self.username

	def isAdmin(self):
		if self.user_type == 'A':
			return True
		return False

	def isCoach(self):
		if self.user_type == 'C':
			return True
		return False

	def isPlayer(self):
		if self.user_type == 'P':
			return True
		return False

''' Flagged for deletion'''
class RFPAuthForm(AuthenticationForm):
	username = forms.EmailField(widget=forms.TextInput(attrs={'class': 'form-control input-sm bounceIn animation-delay2','placeholder': 'Username'}))
	password = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'form-control input-sm bounceIn animation-delay4','placeholder':'Password'}))

''' Flagged for deletion'''
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
	'''
	first_name = forms.CharField(required=False, widget=forms.TextInput(attrs={'class': 'form-control input-sm bounceIn animation-delay2', 'placeholder' : 'First Name'}))
	last_name = forms.CharField(required=False, widget=forms.TextInput(attrs={'class': 'form-control input-sm bounceIn animation-delay2', 'placeholder' : 'Last Name'}))
	username = forms.CharField(required=True, widget=forms.TextInput(attrs={'class': 'form-control input-sm bounceIn animation-delay2', 'placeholder' : 'Username'}))
	email = forms.EmailField(required=False, widget=forms.TextInput(attrs={'class': 'form-control input-sm bounceIn animation-delay2', 'placeholder' : 'Email'}))
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
		return user'''

class Team(models.Model):
	name = models.CharField(max_length=100)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	sidebar_image = models.ImageField(blank=True, null=True)
	banner_image = models.ImageField(blank=True, null=True)
	midfield_art = models.ImageField(blank=True, null=True)
	endzone_art = models.ImageField(blank=True, null=True)

	field_type = models.CharField(max_length=10, default="HS", blank=True, null=True) #HS, NCAA, NFL or custom

	#payment info
	payment_status = models.CharField(max_length=20, default="", blank=True, null=True)
	payment_renew_date = models.DateField(null=True, blank=True)
	service_tier = models.CharField(max_length=20, default="", blank=True, null=False)

	def __str__(self):
		return self.name
