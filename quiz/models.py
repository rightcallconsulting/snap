from __future__ import unicode_literals

from datetime import datetime, timedelta
from django.db import models
from IPython import embed
from django.contrib.auth.models import User
from django.forms.models import model_to_dict
import code
import copy
import json

# This function returns a datetime object for the deadline
# of anything that is published. The deadline defaults to
# 1 day.
def deadline_time():
	deadline = datetime.now() + timedelta(days=1)
	return deadline

class Team(models.Model):
	name = models.CharField(max_length=100)
	created_at = models.DateTimeField(auto_now_add=True) # set when it's created
	updated_at = models.DateTimeField(auto_now=True) # set every time it's updated

	def __str__(self):
		return self.name

	def formations(self):
		positions = []
		for formation in self.formation_set.all():
			for position in formation.position_set.all():
				positions.append(position)
		return positions

	def play_positions(self):
		positions = []
		for play in self.play_set.all():
			for position in play.positions.all():
				positions.append(position)
		return positions

class Player(models.Model):
	YEAR_CHOICES = (
		('FR', 'Freshman'),
		('SO', 'Sophomore'),
		('JR', 'Junior'),
		('SR', 'Senior'),
		('RS FR', 'Redshirt Freshman'),
		('RS SO', 'Redshirt Sophomore'),
		('RS JR', 'Redshirt Junior'),
		('RS SR', 'Redshirt Senior'),
	)

	user = models.OneToOneField(User, on_delete=models.CASCADE, blank=True, null=True)
	first_name = models.CharField(max_length=30, blank=True, null=True)
	last_name = models.CharField(max_length=30, blank=True, null=True)
	position = models.CharField(max_length=10, blank=True, null=True) # QB, WR, RB, LT, LG, C, RG, RT, DE, DT, OLB, MLB, SS, FS, CB
	year = models.CharField(max_length=25, blank=True, null=True, choices=YEAR_CHOICES)
	unit = models.CharField(max_length=20, blank=True, null=True) # offense or defense
	number = models.IntegerField(blank=True, null=True)
	team = models.ForeignKey(Team, on_delete=models.CASCADE, blank=True, null=True)
	is_being_tested = models.BooleanField(default=False) # true if player has been assigned a test
	image_url = models.ImageField(blank=True, null=True)
	starter = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True) # set when it's created
	updated_at = models.DateTimeField(auto_now=True) # set every time it's updated

	def __str__(self):
		if self.user is not None:
			return self.user.get_full_name()
		else:
			return self.full_name()

	def full_name(self):
		return "{0} {1}".format(self.first_name, self.last_name)

	def duplicate_and_assign_test(self, existing_test_id, coach):
		new_test = Test.objects.filter(pk=existing_test_id)[0]
		new_test.pk = None
		new_test.player = self
		new_test.coach_who_created = coach.user
		new_test.save()

	def dict_for_json(self):
		"""Dict representation of the instance (used in JSON APIs)."""
		json_dict = model_to_dict(self)
		json_dict.pop('image_url', None) # Don't try to encode image in JSON
		return json_dict

class Group(models.Model):
	name = models.CharField(max_length=100)
	created_at = models.DateTimeField(auto_now_add=True) # set when it's created
	updated_at = models.DateTimeField(auto_now=True) # set every time it's updated
	members = models.ManyToManyField(Player)

	def __str__(self):
		return self.name

	def players(self):
		return self.members

class Formation(models.Model):
	name = models.CharField(max_length=100)
	team = models.ForeignKey(Team, on_delete=models.CASCADE)
	unit = models.CharField(max_length=100, default="offense")
	scout = models.BooleanField(default=False)

	formationJson = models.TextField(max_length=None, blank=True, null=True)

	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ["-created_at"]

	def __str__(self):
		return self.name

class Position(models.Model):
	startX = models.FloatField()
	startY = models.FloatField()
	name = models.CharField(max_length=100)
	formation = models.ForeignKey(Formation, on_delete=models.CASCADE, null=True, blank=True)
	routeCoordinates = models.CharField(max_length=200, null=True, blank=True)
	runCoordinates = models.CharField(max_length=200, null=True, blank=True)
	blockingCoordinates = models.CharField(max_length=200, null=True, blank=True)
	motionCoordinates = models.CharField(max_length=200, null=True, blank=True)
	progressionRank = models.IntegerField(null=True, blank=True)
	playerIndex = models.IntegerField(null=True, blank=True)
	routeNum = models.IntegerField(null=True, blank=True)
	blocker = models.NullBooleanField()
	runner = models.NullBooleanField()
	CBAssignmentPlayerIndex = models.IntegerField(null=True, blank=True)
	CBAssignmentPlayerID = models.IntegerField(null=True, blank=True)
	CBAssignmentPlayerIndex = models.IntegerField(null=True, blank=True)
	CBAssignmentPlayerPosition = models.CharField(max_length=200, null=True, blank=True)
	zoneYardX = models.FloatField(null=True, blank=True)
	zoneYardY = models.FloatField(max_length=200, null=True, blank=True)
	zoneHeight = models.FloatField(max_length=200, null=True, blank=True)
	zoneWidth = models.FloatField(max_length=200, null=True, blank=True)
	gapYardX = models.FloatField(max_length=200, null=True, blank=True)
	gapYardY = models.FloatField(max_length=200, null=True, blank=True)
	blockingAssignmentPlayerIndex = models.IntegerField(null=True, blank=True)
	blockingAssignmentUnitIndex = models.IntegerField(null=True, blank=True)
	blockingAssignmentObject = models.CharField(max_length=200, null=True, blank=True)
	runAssignment = models.CharField(max_length=200, null=True, blank=True)

	def __str__(self):
		return self.name

	def set_route_coordinates(self, coords):
		self.routeCoordinates = json.dumps(coords)

	def get_route_coordinates(self):
		return json.loads(self.routeCoordinates)

	def set_blocking_coordinates(self, coords):
		self.blockingCoordinates = json.dumps(coords)

	def get_blocking_coordinates(self):
		return json.loads(self.blockingCoordinates)

	def set_motion_coordinates(self, coords):
		self.motionCoordinates = json.dumps(coords)

	def get_motion_coordinates(self):
		return json.loads(self.motionCoordinates)

	def set_run_coordinates(self, coords):
		self.routeCoordinates = json.dumps(coords)

	def get_run_coordinates(self):
		return json.loads(self.routeCoordinates)

	def dict_for_json(self):
		"""Dict representation of the instance (used in JSON APIs)."""
		return model_to_dict(self)

class Test(models.Model):
	types_of_tests = ["QBProgression",
						"CBAssignment",
						"OLView",
						"WRRoute"]

	name = models.CharField(max_length=100, null=True, blank=True)
	team = models.ForeignKey(Team, on_delete=models.CASCADE, blank=True, null=True)
	type_of_test = models.CharField(max_length=100)
	players = models.ManyToManyField(Player)
	score = models.IntegerField(null=True, blank=True)
	skips = models.IntegerField(null=True, blank=True)
	incorrect_guesses = models.IntegerField(null=True, blank=True)
	formations = models.ManyToManyField(Formation, blank=True)
	deadline = models.DateTimeField(default=deadline_time, null=True, blank=True)
	completed = models.BooleanField(default=False)
	in_progress = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True) # set when it's created
	updated_at = models.DateTimeField(auto_now=True) # set every time it's updated
	coach_who_created = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)


	def __str__(self):
		return self.type_of_test

	def change_in_progress_status(self, user):
		if user.myuser.is_a_player:
			if user.player == self.player:
				self.in_progress = True
				self.save()

	def generate_missed_plays_dict(self):
		missed_play_dict = {}
		test_results = self.testresult_set.all()
		for test_result in test_results:
			for test_result_play in test_result.testresultplay_set.all():
				if test_result_play.play.name in missed_play_dict.keys():
					if test_result_play.incorrect == True:
						missed_play_dict[test_result_play.play.name] += 1
				else:
					missed_play_dict[test_result_play.play.name] = 1
		return missed_play_dict

	def format_for_graphos(self, missed_play_dict):
		formatted_list_for_graphos = [["Test Result"], [self.name]]
		for play in missed_play_dict.keys():
			formatted_list_for_graphos[0].append(play)
			formatted_list_for_graphos[1].append(missed_play_dict[play])
		return formatted_list_for_graphos

	def get_missed_play_chart(self, num):
		test_results = self.testresult_set.all()
		plays = self.play_set.all()
		formatted_list_for_graphos = [["Test ID"]]
		for test_result in test_results:
			new_data_row = [str(test_result.id)]
			missed_play_dict = {}
			for play in self.play_set.all():
				missed_play_dict[play.name] = 0
			# This weird way of iterating is to maintain the same order for the arrays that Graphos needs
			for play in missed_play_dict.keys():
				if len(formatted_list_for_graphos[0]) is not len(plays) + 1:
					formatted_list_for_graphos[0].append(play)
			for test_result_play in test_result.testresultplay_set.all():
				if test_result_play.incorrect == True:
					missed_play_dict[test_result_play.play.name] += 1

			for play_name, times_missed in missed_play_dict.iteritems():
				new_data_row.append(times_missed)
			formatted_list_for_graphos.append(new_data_row)
		header_array = formatted_list_for_graphos.pop(0)
		if len(formatted_list_for_graphos) <= num:
			final_data = formatted_list_for_graphos
		else:
			final_data = formatted_list_for_graphos[-num:]
		final_list =[header_array]
		for data in final_data:
			final_list.append(data)
		return final_list

	def get_skipped_play_chart(self, num):
		test_results = self.testresult_set.all()
		plays = self.play_set.all()
		formatted_list_for_graphos = [["Test ID"]]
		for test_result in test_results:
			new_data_row = [str(test_result.id)]
			skipped_play_dict = {}
			for play in self.play_set.all():
				skipped_play_dict[play.name] = 0
			# This weird way of iterating is to maintain the same order for the arrays that Graphos needs
			for play in skipped_play_dict.keys():
				if len(formatted_list_for_graphos[0]) is not len(plays) + 1:
					formatted_list_for_graphos[0].append(play)
			for test_result_play in test_result.testresultplay_set.all():
				if test_result_play.skipped == True:
					skipped_play_dict[test_result_play.play.name] += 1

			for play_name, times_missed in skipped_play_dict.iteritems():
				new_data_row.append(times_missed)
			formatted_list_for_graphos.append(new_data_row)
		header_array = formatted_list_for_graphos.pop(0)
		if len(formatted_list_for_graphos) <= num:
			final_data = formatted_list_for_graphos
		else:
			final_data = formatted_list_for_graphos[-num:]
		final_list =[header_array]
		for data in final_data:
			final_list.append(data)
		return final_list

	def unit(self):
		if self.type_of_test == "CBAssignment":
			return "defense"
		else:
			return "offense"

class Play(models.Model):
	name = models.CharField(max_length=100)
	scoutName = models.CharField(max_length=100, default="")
	team = models.ForeignKey(Team, on_delete=models.CASCADE)
	formation = models.ForeignKey(Formation, on_delete=models.CASCADE)
	scout = models.BooleanField(default=False)

	playJson = models.TextField(max_length=None, blank=True, null=True)

	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ["-created_at"]

	def __str__(self):
		display_name = self.name + " from " + self.formation.name

		if (self.scoutName != ""):
			display_name += " vs " + self.scoutName

		return display_name

class TestResult(models.Model):
	score = models.FloatField(null=True, blank=True) # number of correct answers in the attempt
	skips = models.FloatField(null=True, blank=True)
	incorrect_guesses = models.FloatField(null=True, blank=True)
	string_id = models.CharField(null=True, blank=True, default="Temp", max_length=100)
	time_taken = models.IntegerField(null=True, blank=True) # time taken to complete the test, in seconds
	test = models.ForeignKey(Test, on_delete=models.CASCADE)
	player = models.ForeignKey(Player, on_delete=models.CASCADE, null=True, blank=False)
	missed_plays = models.ManyToManyField(Play, related_name="missed_plays", blank=True)
	correct_plays = models.ManyToManyField(Play, blank=True)
	skipped_plays = models.ManyToManyField(Play, related_name="skipped_plays", blank=True)
	most_recent = models.BooleanField(default=False)
	completed = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True) # set when it's created
	updated_at = models.DateTimeField(auto_now=True, null=True, blank=True) # set every time it's updated

	class Meta:
		ordering = ['created_at']

	def update_result(self, js_test_object, play_object):
		self.create_test_result_play(js_test_object, play_object)
		self.score = js_test_object['score']
		self.skips = js_test_object['skips']
		self.incorrect_guesses = js_test_object['incorrectGuesses']
		if len(self.test.play_set.all()) == (int(js_test_object['questionNum']) + 1):
			self.completed = True
			self.time_taken = (js_test_object['endTime'] - js_test_object['startTime'])/-1000
		self.save()

	def create_test_result_play(self, js_test_object, play_object):
		new_test_result_play = TestResultPlay(play=play_object, testresult=self)
		if float(js_test_object['score']) > self.score:
			self.correct_plays.add(play_object)
			new_test_result_play.correct = True
		elif float(js_test_object['skips']) > self.skips:
			self.skipped_plays.add(play_object)
			new_test_result_play.skipped = True
		elif float(js_test_object['incorrectGuesses']) > self.incorrect_guesses:
			self.missed_plays.add(play_object)
			new_test_result_play.incorrect = True
		new_test_result_play.save()


class TestResultPlay(models.Model):
	testresult = models.ForeignKey(TestResult, null=True, blank=True)
	play = models.ForeignKey(Play, null=True, blank=True)
	count = models.IntegerField(null=True, blank=True)
	correct = models.BooleanField(default=False)
	incorrect = models.BooleanField(default=False)
	skipped = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True) # set when it's created
	updated_at = models.DateTimeField(auto_now=True, null=True, blank=True) # set every time it's updated
