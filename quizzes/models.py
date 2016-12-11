from __future__ import unicode_literals

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

	def __str__(self):
		quiz_str = str(self.number_of_questions) + "-question " + str(self.content_type) + " " + str(self.quiz_type) + " quiz"
		if self.type_of_assignment and not (str(self.type_of_assignment) == "all"):
			quiz_str += " on " + str(self.type_of_assignment)
		if self.position and len(str(self.position)) > 0:
			quiz_str += " as the " + str(self.position)
		return quiz_str

	def launch_url(self):
		full_link = "/quizzes/custom/"
		full_link += (str(self.content_type) + "?")
		full_link += ("number_of_questions=" + str(self.number_of_questions))
		full_link += ("&order=" + str(self.ordering))
		full_link += ("&type=" + str(self.quiz_type))
		if self.position:
			full_link += ("&position=" + str(self.position))
			if self.type_of_assignment:
				full_link += ("&type-of-assignment=" + str(self.type_of_assignment))
		return full_link




class Quiz(models.Model):
	name = models.CharField(max_length=50, blank=True, null=True)
	team = models.ForeignKey('getsnap.Team', on_delete=models.CASCADE)
	author = models.ForeignKey('getsnap.CustomUser', on_delete=models.CASCADE)
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
