from django.contrib.auth import logout, authenticate, login
from django.contrib.auth.models import User
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.shortcuts import render

from .models import RFPAuthForm, UserCreateForm, Team
from dashboard.models import myUser, Coach, Player

def auth_login(request):
	if request.user.is_authenticated():
		return HttpResponseRedirect("/")
	elif request.method == 'POST':
		username = request.POST['username']
		password = request.POST['password']
		user = authenticate(username=username, password=password)
		if user is not None:
			if user.is_active:
				login(request, user)
				return HttpResponseRedirect("/")
			# else:
				# return HttpResponseRedirect("/login")
		else:
			# [TBD] Display an error message that login failed
			return HttpResponseRedirect("/login")
	else:
		form = RFPAuthForm()
		return render(request, 'getsnap/login.html', { 'form': form, })

def register(request):
	if request.method == 'POST':
		team = Team.objects.filter(id=request.POST['team'])[0]
		form = UserCreateForm(request.POST)
		if form.is_valid():
			new_user = form.save()
			if 'Player' in request.POST.keys():
				new_boolean_user = myUser(user=new_user, is_a_player=True)
				new_boolean_user.save()
				new_player = Player(user=new_user, team=team)
				new_player.position = request.POST['position']
				new_player.save()
			elif 'Coach' in request.POST.keys():
				new_boolean_user = myUser(user=new_user, is_a_player=False)
				new_boolean_user.save()
				new_coach = Coach(user=new_user, team=team)
				new_coach.save()
			user = authenticate(username=new_user.username, password=request.POST['password1'])
			login(request, user)
			return HttpResponseRedirect("/")
	else:
		form = UserCreateForm()
	return render(request, 'getsnap/register.html', { 'form': form })

def auth_logout(request):
	logout(request)
	return HttpResponseRedirect("/login")

def getsnap(request):
	return render(request, 'getsnap/getsnap.html', {})
