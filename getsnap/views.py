from datetime import datetime, timedelta
from django.contrib.auth import logout, authenticate, login
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.shortcuts import render

from IPython import embed

import braintree

import settings

from .models import CustomUser, Team
from dashboard.models import Admin, Coach, Player


braintree.Configuration.configure(braintree.Environment.Sandbox,
    merchant_id=settings.BRAINTREE_MERCHANT_ID,
    public_key=settings.BRAINTREE_PUBLIC_KEY,
    private_key=settings.BRAINTREE_PRIVATE_KEY)


# Login/Logout
def auth_login(request):
	if request.user.is_authenticated():
		return HttpResponseRedirect("/")
	elif request.method == 'POST':
		email = request.POST['email']
		password = request.POST['password']
		user = authenticate(email=email, password=password)
		if user is not None:
			if user.is_active:
				login(request, user)
				return HttpResponseRedirect("/")
		else:
			return HttpResponseRedirect("/login")
	else:
		return render(request, 'getsnap/login.html', {})

def auth_logout(request):
	logout(request)
	return HttpResponseRedirect("/login")

# Snap Demo
def demo(request):
	return render(request, 'getsnap/demo.html', {})

# Get Snap
def getsnap(request):
	if request.method == 'POST':
		first_name = request.POST['fname']
		last_name = request.POST['lname']
		email = request.POST['email']
		phone_number = request.POST['number']

		new_user = CustomUser.objects.create_user(username=email, email=email)
		new_user.is_active = False
		new_user.first_name = first_name
		new_user.last_name = last_name
		new_user.phone_number = phone_number
		new_user.save()

		# Send email here and set notifications

		return HttpResponseRedirect("/getsnap/thanks")
	else:
		return render(request, 'getsnap/getsnap.html', {})

def client_token(request):
	return braintree.ClientToken.generate()

#Post only
def create_purchase(request):
	nonce_from_the_client = request.POST['payment_method_nonce']

	result = braintree.Transaction.sale({
    "amount": "10.00",
    "payment_method_nonce": nonce_from_the_client,
    "options": {
      "submit_for_settlement": True
    }})

	if result.transaction.status_history[0].status == 'authorized':
		team = request.user.coach.team
		team.payment_status = 'authorized' #Change to 'settled' upon receipt of funds
		team.payment_renew_date = datetime.today() + timedelta(days=365)
		team.service_tier = 'platinum' #TBI for other options
		team.save()

	return render(request, 'getsnap/purchase_complete.html', {})

@user_passes_test(lambda u: not u.isPlayer())
def purchase(request):
	if request.method == 'GET':
		return render(request, 'getsnap/purchase.html', {'braintree_client_token': braintree.ClientToken.generate()})

	#Otherwise it's a post
	if not form.is_valid():
		return render(request, 'getsnap/purchase.html', {})
	else:  # The transaction can be finalized.
		return render(request, 'getsnap/thanks.html', {})

def thanks(request):
	return render(request, 'getsnap/thanks.html', {})

# Register - This link is only used internally to create accounts
def register(request):
	if request.method == 'POST':
		email = request.POST['email']
		password1 = request.POST['password1']
		password2 = request.POST['password2']

		if password1 != password2:
			HttpResponseRedirect("/register")

		user_type = request.POST['type']

		new_user = CustomUser.objects.create_user(username=email, email=email, password=password1)
		new_user.user_type = user_type[0].upper()
		new_user.save()

		team = Team.objects.get(id=request.POST['team'])
		if user_type == "admin":
			admin = Admin(user=new_user)
			admin.save()
		elif user_type == "coach":
			coach = Coach(user=new_user, team=team, admin=True)
			coach.save()
		elif user_type == "player":
			player = Player(user=new_user, team=team)
			player.save()

		user = authenticate(email=email, password=password1)
		login(request, user)

		return HttpResponseRedirect("/")
	else:
		teams = Team.objects.all()
	return render(request, 'getsnap/register.html', { 'teams': teams })
