from __future__ import unicode_literals

from django.db import models

#from dashboard.models import QuestionAttempted, Player
#from getsnap.models import Team

class Concept(models.Model):
	name = models.CharField(max_length=50, blank=True, null=True)
	team = models.ForeignKey('getsnap.Team', on_delete=models.CASCADE)
	unit = models.CharField(max_length=25, default="offense", blank=True, null=True)
	scout = models.BooleanField(default=False)

	conceptJson = models.TextField(max_length=None, blank=True, null=True)

	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ["-created_at"]

	def __str__(self):
		return self.name

	def get_average_score_for_players(self, players):
		results = []
		for player in players:
			results.extend(QuestionAttempted.objects.filter(concept=self,player=player))
		if len(results) == 0:
			return 0.0
		score = 0
		skips = 0
		for result in results:
			if result.score != None:
				score += result.score
			else:
				skips += 1
		return score / len(results)

class Formation(models.Model):
	name = models.CharField(max_length=100)
	team = models.ForeignKey('getsnap.Team', on_delete=models.CASCADE)
	unit = models.CharField(max_length=100, default="offense")
	scout = models.BooleanField(default=False)

	formationJson = models.TextField(max_length=None, blank=True, null=True)

	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ["-created_at"]

	def __str__(self):
		return self.name

	def get_average_score_for_players(self, players):
		results = []
		for player in players:
			results.extend(QuestionAttempted.objects.filter(formation=self,player=player))
		if len(results) == 0:
			return 0.0
		score = 0
		skips = 0
		for result in results:
			if result.score != None:
				score += result.score
			else:
				skips += 1
		return score / len(results)

class Play(models.Model):
	name = models.CharField(max_length=100)
	scoutName = models.CharField(max_length=100, default="", blank=True, null=False)
	team = models.ForeignKey('getsnap.Team', on_delete=models.CASCADE)
	formation = models.ForeignKey(Formation, on_delete=models.CASCADE)
	scout = models.BooleanField(default=False)

	playJson = models.TextField(max_length=None, blank=True, null=True)

	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ["-created_at"]

	def get_average_score_for_players(self, players):
		results = []
		for player in players:
			results.extend(QuestionAttempted.objects.filter(play=self,player=player))
		if len(results) == 0:
			return 0.0
		score = 0
		skips = 0
		for result in results:
			if result.score != None:
				score += result.score
			else:
				skips += 1
		return score / len(results)

	def __str__(self):
		display_name = self.name + " from " + self.formation.name

		if (self.scoutName != ""):
			display_name += " vs " + self.scoutName

		return display_name
