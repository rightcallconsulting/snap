from __future__ import unicode_literals

from django.db import models

class QuestionAttempted(models.Model):
	player = models.ForeignKey('dashboard.Player', on_delete=models.CASCADE)
	team = models.ForeignKey('getsnap.Team', on_delete=models.CASCADE, blank=True)
	time = models.DateTimeField(auto_now_add=True)
	quiz = models.ForeignKey('quizzes.Quiz', null=True) #Allow null for custom quizzes

	formation = models.ForeignKey('playbook.Formation', blank=True, null=True)
	play = models.ForeignKey('playbook.Play', blank=True, null=True)
	concept = models.ForeignKey('playbook.Concept', blank=True, null=True)

	score = models.IntegerField(null=True) # 0 = incorrect, 1 = correct, null = skipped

	class Meta:
		verbose_name = "Question Attempted"
		verbose_name_plural = "Questions Attempted"

	def __str__(self):
		return ''
