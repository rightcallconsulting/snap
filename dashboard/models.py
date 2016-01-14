from __future__ import unicode_literals
from django import forms
from django.forms import ModelForm
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.db import models
from django.utils.translation import ugettext_lazy as _

# Create your models here.

class UserCreateForm(UserCreationForm):
    first_name = forms.CharField(required=True, widget=forms.TextInput(attrs={'class' : 'form-control input-sm bounceIn animation-delay2', 'placeholder' : 'First Name'}))
    last_name = forms.CharField(required=True, widget=forms.TextInput(attrs={'class' : 'form-control input-sm bounceIn animation-delay2', 'placeholder' : 'Last Name'}))
    username = forms.CharField(required=True, widget=forms.TextInput(attrs={'class' : 'form-control input-sm bounceIn animation-delay2', 'placeholder' : 'Username'}))
    email = forms.EmailField(required=True, widget=forms.TextInput(attrs={'class' : 'form-control input-sm bounceIn animation-delay2', 'placeholder' : 'Email'}))
    password1 = forms.CharField(required=True, widget=forms.PasswordInput(attrs={'class' : 'form-control input-sm bounceIn animation-delay2', 'placeholder' : 'Password'}))
    password2 = forms.CharField(required=True, widget=forms.PasswordInput(attrs={'class' : 'form-control input-sm bounceIn animation-delay2', 'placeholder' : 'Confirm Password'}), label=_("Confirm Password"))
    athlete = forms.BooleanField(required=False, widget=forms.CheckboxInput(attrs={'class' : ''}), label=_("Athlete"))
    coach = forms.BooleanField(required=False, widget=forms.CheckboxInput(attrs={'class' : ''}), label=_("Coach"))


    class Meta:
        model = User
        fields = ("first_name", "last_name", "username", "email", "password1", "password2")

    def save(self, commit=True):
        user = super(UserCreateForm, self).save(commit=False)
        user.email = self.cleaned_data["email"]
        if commit:
            user.save()
        return user

class RFPAuthForm(AuthenticationForm):
    username = forms.EmailField(widget=forms.TextInput(attrs={'class': 'form-control input-sm bounceIn animation-delay2','placeholder': 'Username'}))
    password = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'form-control input-sm bounceIn animation-delay4','placeholder':'Password'}))

class Athlete(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    position = models.CharField(max_length=30, blank=True, null=True)
    number = number = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True) # set when it's created
    updated_at = models.DateTimeField(auto_now=True) # set every time it's updated

    def get_full_name(self):
        return self.first_name + " " + self.last_name

class Coach(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=30, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True) # set when it's created
    updated_at = models.DateTimeField(auto_now=True) # set every time it's updated

class AthleteForm(ModelForm):
    class Meta:
        model = Athlete
        fields = ['position', 'number']

class UserForm(ModelForm):
    class Meta:
        model = User
        fields = ['first_name', 'last_name']
