from django.conf.urls import url, include
from django.contrib.auth.views import login
from django.contrib.auth.decorators import user_passes_test
from django.conf import settings

from django.views import static

from . import views

urlpatterns = [
	# Login/Logout
	url(r'^login$', views.auth_login, name='auth_login'),
	url(r'^logout$', views.auth_logout, name='auth_logout'),

	# Snap Demo
	url(r'^demosnap$', views.demo, name='demo'),

	# Get Snap
	url(r'^getsnap$', views.getsnap, name='getsnap'),
	url(r'^getsnap/client-token$', views.client_token, name='client_token'),
	url(r'^getsnap/create-purchase$', views.create_purchase, name='create_purchase'),
	url(r'^getsnap/purchase$', views.purchase, name='purchase'),
	url(r'^getsnap/thanks$', views.thanks, name='thanks'),

	# Register - This link is only used internally to create accounts
	url(r'^register$', views.register, name='register'),
]
