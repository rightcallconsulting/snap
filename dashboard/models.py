from __future__ import unicode_literals
from django import forms
from django.forms import ModelForm
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.db import models
from django.utils.translation import ugettext_lazy as _
from quiz.models import Team, Player, Formation, Play, Position, Test
from django.contrib.admin import widgets

# Create your models here.

class UserCreateForm(UserCreationForm):
    first_name = forms.CharField(required=True, widget=forms.TextInput(attrs={'class' : 'form-control input-sm bounceIn animation-delay2', 'placeholder' : 'First Name'}))
    last_name = forms.CharField(required=True, widget=forms.TextInput(attrs={'class' : 'form-control input-sm bounceIn animation-delay2', 'placeholder' : 'Last Name'}))
    username = forms.CharField(required=True, widget=forms.TextInput(attrs={'class' : 'form-control input-sm bounceIn animation-delay2', 'placeholder' : 'Username'}))
    email = forms.EmailField(required=True, widget=forms.TextInput(attrs={'class' : 'form-control input-sm bounceIn animation-delay2', 'placeholder' : 'Email'}))
    password1 = forms.CharField(required=True, widget=forms.PasswordInput(attrs={'class' : 'form-control input-sm bounceIn animation-delay2', 'placeholder' : 'Password'}), label=_("Password"))
    password2 = forms.CharField(required=True, widget=forms.PasswordInput(attrs={'class' : 'form-control input-sm bounceIn animation-delay2', 'placeholder' : 'Confirm Password'}), label=_("Confirm Password"))
    player = forms.BooleanField(required=False, widget=forms.CheckboxInput(attrs={'class' : ''}), label=_("Player"))
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


class Coach(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=30, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True) # set when it's created
    updated_at = models.DateTimeField(auto_now=True) # set every time it's updated
    team = models.ForeignKey(Team, on_delete=models.CASCADE, null=True, blank=True)

    def testing_this(self):
        return self.first_name


class PlayerForm(ModelForm):

    class Meta:
        model = Player
        fields = ['position', 'number']

class UserForm(ModelForm):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'email', 'password']

class TestForm(ModelForm):
    OPTIONS = (
            ("QB_Progression", "QB_Progression"),
            ("WR_Route", "WR_Route"),
            ("OL_View", "OL_View"),
            ("CB_Assignment", "CB_Assignment"),
        )
    type_of_test = forms.MultipleChoiceField(widget=forms.CheckboxSelectMultiple,
                                     choices=OPTIONS)

    class Meta:
        model = Test
        fields = ['name','type_of_test', 'deadline']

    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user','')
        super(TestForm, self).__init__(*args, **kwargs)
        self.fields['player']=forms.ModelChoiceField(queryset=Player.objects.all())
        self.fields['deadline'].widget = widgets.AdminSplitDateTime()


class UserMethods(User):
  def custom_method(self):
    pass
  class Meta:
    proxy=True
