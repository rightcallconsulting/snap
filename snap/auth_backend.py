from getsnap.models import CustomUser

class CustomBackend:

	# My custom authentication method checks email and password.
	# If those credentials are valid it returns the user, else it
	# returns None.
	def authenticate(self, email=None, password=None):
		try:
			# Try to find a user matching your email
			user = CustomUser.objects.get(email=email)

			# If the password is correct then return the user, else return None.
			if user.check_password(password):
				return user
			else:
				return None
		except User.DoesNotExist:
			return None

	# Required for your backend to work properly - unchanged in most scenarios
	def get_user(self, user_id):
		try:
			return CustomUser.objects.get(pk=user_id)
		except CustomUser.DoesNotExist:
			return None