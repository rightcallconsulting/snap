from __future__ import unicode_literals
from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.db import models

# Create your models here.

class UserCreateForm(UserCreationForm):
    username = forms.CharField(required=True, widget=forms.TextInput(attrs={'class' : 'form-control input-sm bounceIn animation-delay2"'}))
    email = forms.EmailField(required=True, widget=forms.TextInput(attrs={'class' : 'form-control input-sm bounceIn animation-delay2"'}))
    password1 = forms.CharField(required=True, widget=forms.PasswordInput(attrs={'class' : 'form-control input-sm bounceIn animation-delay2"'}))
    password2 = forms.CharField(required=True, widget=forms.PasswordInput(attrs={'class' : 'form-control input-sm bounceIn animation-delay2"'}))

    class Meta:
        model = User
        fields = ("username", "email", "password1", "password2")

    def save(self, commit=True):
        user = super(UserCreateForm, self).save(commit=False)
        user.email = self.cleaned_data["email"]
        if commit:
            user.save()
        return user
