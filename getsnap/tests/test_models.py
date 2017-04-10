from django.test import TestCase
from getsnap.models import CustomUser, Team

class CustomUserTestCase(TestCase):
	# Create test users and test that the amount of users is correct
	def setUp(self):
		CustomUser.objects.create_user(username='admin', 
																		email='admin@rightcallconsulting.com',
																		user_type='A')

		CustomUser.objects.create_user(username='coach', 
																		email='coach@rightcallconsulting.com',
																		user_type='C')

		CustomUser.objects.create_user(username='player', 
																		email='player@rightcallconsulting.com',
																		user_type='P')

		self.assertEqual(CustomUser.objects.all().count(), 3)

	# test that the users cast to a string based on their email address
	def test_username(self):
		admins = CustomUser.objects.filter(user_type='A')
		self.assertEqual(admins.count(), 1)
		self.assertEqual(str(admins[0]), 'admin@rightcallconsulting.com')

		coaches = CustomUser.objects.filter(user_type='C')
		self.assertEqual(coaches.count(), 1)
		self.assertEqual(str(coaches[0]), 'coach@rightcallconsulting.com')

		players = CustomUser.objects.filter(user_type='P')
		self.assertEqual(players.count(), 1)
		self.assertEqual(str(players[0]), 'player@rightcallconsulting.com')

	# test that the users type functions work
	def test_user_type(self):
		admin = CustomUser.objects.get(username='admin')
		self.assertEqual(admin.isAdmin(), True)
		self.assertEqual(admin.isCoach(), False)
		self.assertEqual(admin.isPlayer(), False)

		coach = CustomUser.objects.get(username='coach')
		self.assertEqual(coach.isAdmin(), False)
		self.assertEqual(coach.isCoach(), True)
		self.assertEqual(coach.isPlayer(), False)

		player = CustomUser.objects.get(username='player')
		self.assertEqual(player.isAdmin(), False)
		self.assertEqual(player.isCoach(), False)
		self.assertEqual(player.isPlayer(), True)
		