from __future__ import unicode_literals

from datetime import datetime, timedelta
from django import forms
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.utils.translation import ugettext_lazy as _

from passwords.fields import PasswordField

import random

from IPython import embed



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
		return self.email

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

class ActivationToken(models.Model):
	token = models.CharField(max_length=40, blank=False, null=False)
	expiration = models.DateTimeField()
	user = models.ForeignKey('getsnap.CustomUser', on_delete=models.CASCADE, blank=False, null=False)

	def is_valid(self):
		if datetime.today() < self.expiration.replace(tzinfo=None):
			return True
		return False
	@classmethod
	def generateTokenFor(cls, user):
		activation_token = ActivationToken(user=user)
		activation_token.expiration = datetime.today() + timedelta(days=7)

		random.seed()
		existing_tokens = list(ActivationToken.objects.all())
		existing_token_strings = []
		for t in existing_tokens:
			existing_token_strings.append(str(t.token))
		new_token = ActivationToken.generateTokenString()
		while(new_token in existing_token_strings):
			new_token = ActivationToken.generateTokenString()
		activation_token.token = new_token
		activation_token.save()
		return 0 #success

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
	def verifyActivationToken(cls, token):
		existing_tokens = list(ActivationToken.objects.all())
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
