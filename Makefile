all: local

# Install required libraries
install:
	sudo pip install -r requirements.txt

###############################################################################
# Local build 
###############################################################################

# Flush the database
flush:
	python manage.py flush --settings=quiz_master.settings.local

# Make migrations to the database
migrations:
	python manage.py makemigrations --settings=quiz_master.settings.local 
	python manage.py migrate --settings=quiz_master.settings.local

# Build the local version of the website
# If issues with build, check to make sure postgres is running, flush the database, and reinstall the requirements
# General workflow to begin - make flush, make install, make local
local:
	python manage.py migrate --settings=quiz_master.settings.local 
	python manage.py loaddata seed.json --settings=quiz_master.settings.local 
	python manage.py runserver --settings=quiz_master.settings.local

# Run the server
run:
	python manage.py runserver --settings=quiz_master.settings.local

# f - flush, i -install, r - run
fir:
	python manage.py flush --settings=quiz_master.settings.local
	sudo pip install -r requirements.txt
	python manage.py migrate --settings=quiz_master.settings.local 
	python manage.py loaddata seed.json --settings=quiz_master.settings.local 
	python manage.py runserver --settings=quiz_master.settings.local

###############################################################################
# Database dump and load commands
###############################################################################

# Dump data into seed.json
dump:
	python manage.py dumpdata --exclude contenttypes --exclude auth.permission > quiz/fixtures/seed.json --settings=quiz_master.settings.local

# Dump data into dylan_seed.json
dylan_dump:
	python manage.py dumpdata --exclude contenttypes --exclude auth.permission > quiz/fixtures/dylan_seed.json --settings=quiz_master.settings.local

# Make a local build using dylan_seed.json
dylan_local:
	python manage.py migrate --settings=quiz_master.settings.local 
	python manage.py loaddata dylan_seed.json --settings=quiz_master.settings.local 
	python manage.py runserver --settings=quiz_master.settings.local

###############################################################################
# Django/python development commands 
###############################################################################
shell:
	python manage.py shell --settings=quiz_master.settings.local

# Run unit tests for all apps
# If you want to run tests on only one app, use the APP variable
# Example: 'make test APP=dashboard'
test:
	python manage.py test $(APP) --settings=quiz_master.settings.local

###############################################################################
# Make clean commands
###############################################################################

# Flush the database and clean out all .pyc files
clean:
	python manage.py flush --settings=quiz_master.settings.local
	find . -name "*.pyc" -exec rm -rf {} \;
