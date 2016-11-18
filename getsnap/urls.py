from django.conf.urls import url, include
from django.contrib.auth.views import login
from django.contrib.auth.decorators import user_passes_test
from django.conf import settings

from django.views import static

from . import views

urlpatterns = [
	url(r'^login$', views.auth_login, name='auth_login'),
	url(r'^register$', views.register, name='register'),
	url(r'^logout$', views.auth_logout, name='auth_logout'),

	# Get Snap
	url(r'^getsnap$', views.getsnap, name='getsnap'),
	url(r'^getsnap/thanks$', views.thanks, name='thanks')
]