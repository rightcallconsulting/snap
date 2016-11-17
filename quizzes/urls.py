from django.conf.urls import url, include
from django.contrib.auth.views import login
from django.contrib.auth.decorators import user_passes_test
from django.conf import settings

from django.views import static

from . import views

urlpatterns = [
	url(r'^assigned$', views.assigned_quizzes, name='assigned_quizzes'),
	url(r'^create$', views.create_quiz, name='create_quiz'),
	url(r'^manage/(?P<quiz_id>[0-9]+)$', views.manage_quiz, name='manage_quiz'),
	url(r'^todo$', views.quizzes_todo, name='quizzes_todo'),
	url(r'^take/(?P<quiz_id>[0-9]+)/(?P<position>.+)$', views.take_quiz, name='take_quiz'),
	url(r'^take/(?P<quiz_id>[0-9]+)$', views.take_quiz, name='take_quiz'),
	url(r'^submit$', views.submit_quiz, name='submit_quiz'),
	url(r'^custom$', views.custom_quizzes, name='custom_quizzes'),


	url(r'^custom/concept$', views.concept_quizzes, name='concept_quizzes'),
	url(r'^custom/formation$', views.formation_quizzes, name='formation_quizzes'),
	url(r'^custom/play$', views.play_quizzes, name='play_quizzes')
]