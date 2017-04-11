all: local

# Install required libraries
install:
	sudo pip install --ignore-installed -r requirements.txt

###############################################################################
# Local build
###############################################################################

# Flush the database
flush:
	python manage.py flush --settings=snap.settings.local

# Make migrations to the database
migrations:
	python manage.py makemigrations --settings=snap.settings.local
	python manage.py migrate --settings=snap.settings.local

# Load seed file into database
load-data:
	python manage.py loaddata seed.json --settings=snap.settings.local

# Build the local version of the website
# If issues with build, check to make sure postgres is running, flush the database, and reinstall the requirements
# General workflow to begin - make flush, make install, make local
local:
	python manage.py runserver --settings=snap.settings.local

# Run the server
run:
	python manage.py runserver --settings=snap.settings.local

# f - flush, i -install, r - run
fir:
	python manage.py flush --settings=snap.settings.local
	sudo pip install -r requirements.txt
	python manage.py loaddata seed.json --settings=snap.settings.local
	python manage.py runserver --settings=snap.settings.local

###############################################################################
# Testing
###############################################################################

# Run unit tests for all apps with coverage reports
# If you want to run tests on only one app, use the APP variable
# Example: 'make test APP=dashboard'
tests:
	mkdir build && mkdir build/coverage
	coverage run manage.py test $(APP) --settings=snap.settings.local --parallel
	coverage xml --fail-under=55 -o build/coverage/coverage.xml  # TODO raise percentage 
	coverage html --fail-under=55 --title="Snap Coverage report" -d build/html # TODO raise percentage 

###############################################################################
# Heroku commands
###############################################################################

migrations-heroku:
	heroku run python manage.py makemigrations
	heroku run python manage.py migrate

flush-heroku:
	heroku run python manage.py flush

load-stanford-heroku:
	heroku run python manage.py loaddata stanford_seed.json

###############################################################################
# Database dump and load commands
###############################################################################

# Dump data into seed.json
seed:
	python manage.py dumpdata --exclude contenttypes --exclude auth.permission > fixtures/seed.json --settings=snap.settings.local

# Dump data into dylan_seed.json
dylan-seed:
	python manage.py dumpdata --exclude contenttypes --exclude auth.permission > fixtures/dylan_seed.json --settings=snap.settings.local

# Load dylan seed file into database
load-dylan:
	python manage.py loaddata fixtures/dylan_seed.json --settings=snap.settings.local
	python manage.py runserver --settings=snap.settings.local

# Dump data into sam_seed.json
sam-seed:
	python manage.py dumpdata --exclude contenttypes --exclude auth.permission > fixtures/sam_seed.json --settings=snap.settings.local

# Load dylan seed file into database
load-sam:
	python manage.py loaddata fixtures/sam_seed.json --settings=snap.settings.local
	python manage.py runserver --settings=snap.settings.local

# Dump data into stanford_seed.json
stanford-seed:
	python manage.py dumpdata --exclude contenttypes --exclude auth.permission > fixtures/stanford_seed.json --settings=snap.settings.local

# Load stanford seed file into database
load-stanford:
	python manage.py loaddata fixtures/stanford_seed.json --settings=snap.settings.local
	python manage.py runserver --settings=snap.settings.local

# Dump data into rcc_seed.json
rcc-seed:
	python manage.py dumpdata --exclude contenttypes --exclude auth.permission > fixtures/rcc_seed.json --settings=snap.settings.local

# Load stanford seed file into database
load-rcc:
	python manage.py loaddata fixtures/rcc_seed.json --settings=snap.settings.local
	python manage.py runserver --settings=snap.settings.local

###############################################################################
# Django/python development commands
###############################################################################
superuser:
	python manage.py createsuperuser --settings=snap.settings.local

shell:
	python manage.py shell --settings=snap.settings.local

###############################################################################
# Make clean commands
###############################################################################

# Flush the database and clean out all .pyc files
clean:
	python manage.py flush --settings=snap.settings.local
	find . -name "*.pyc" -exec rm -rf {} \;
	find . -name ".coverage" -exec rm -rf {} \;
	rm -rf "htmlcov"
	rm -rf "build"
