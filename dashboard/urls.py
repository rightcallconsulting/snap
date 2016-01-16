from django.conf.urls import url
from django.contrib.auth.views import login
from django.contrib.auth.decorators import user_passes_test

from . import views

urlpatterns = [
    url(r'^$', views.homepage, name='homepage'),
    url(r'^login$', views.auth_login, name='auth_login'),
    url(r'^logout$', views.auth_logout, name='auth_logout'),
    url(r'^register$', views.register, name='register'),
    url(r'^timeline$', views.timeline, name='timeline'),
    url(r'^messages$', views.messages, name='messages'),
    url(r'^analytics$', views.analytics, name='analytics'),
    url(r'^playbook$', views.playbook, name='playbook'),
    url(r'^to-do$', views.todo, name='to-do'),
    url(r'^calendar$', views.calendar, name='calendar'),
    url(r'^edit_profile$', views.edit_profile, name='edit_profile'),
    url(r'^create_test$', views.create_test, name='create_test'),
    url(r'^tests/(?P<test_id>[0-9]+)/edit$', views.edit_test, name='edit_test'),



]
