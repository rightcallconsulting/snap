from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.homepage, name='homepage'),
    url(r'^login$', views.login, name='login'),
    url(r'^register$', views.register, name='register'),
    url(r'^timeline$', views.timeline, name='timeline'),
    url(r'^quizzes$', views.quizzes, name='quizzes'),
    url(r'^analytics$', views.analytics, name='analytics'),
    url(r'^playbook$', views.playbook, name='playbook'),
    url(r'^to-do$', views.todo, name='to-do'),
    url(r'^calendar$', views.calendar, name='calendar'),
]
