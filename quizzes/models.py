from __future__ import unicode_literals

from django.contrib.auth.models import User
from django.db import models

class CustomQuiz(models.Model):
	team = models.ForeignKey('getsnap.Team', on_delete=models.CASCADE)
	player = models.ForeignKey('dashboard.Player', on_delete=models.CASCADE)

	content_type = models.CharField(max_length=25, default="play") #formation, play, concept
	number_of_questions = models.IntegerField(default=0)
	ordering = models.CharField(max_length=25, default="recent") #recent, missed, random
	quiz_type = models.CharField(max_length=25, default="identification") #identification, assignment, alignment
	position = models.CharField(max_length=25, default="") #abbreviation
	type_of_assignment = models.CharField(max_length=25, default="all") #all, blocks, etc.

	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)


class Quiz(models.Model):
	name = models.CharField(max_length=50, blank=True, null=True)
	team = models.ForeignKey('getsnap.Team', on_delete=models.CASCADE)
	author = models.ForeignKey(User, on_delete=models.CASCADE)
	unit = models.CharField(max_length=25, default="offense")
	players = models.ManyToManyField('dashboard.Player', related_name="players")
	submissions = models.ManyToManyField('dashboard.Player', blank=True, related_name="submissions")

	formations = models.ManyToManyField('playbook.Formation', blank=True)
	plays = models.ManyToManyField('playbook.Play', blank=True)
	concepts = models.ManyToManyField('playbook.Concept', blank=True)

	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		verbose_name = "Quiz"
		verbose_name_plural = "Quizzes"
		ordering = ["-created_at"]

	def __str__(self):
		return self.name
