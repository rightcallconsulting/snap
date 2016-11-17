"""
Django settings for snap project.

Generated by 'django-admin startproject' using Django 1.8.3.

For more information on this file, see
https://docs.djangoproject.com/en/1.8/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.8/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
import os.path

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

LOGIN_URL = '/login'

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.8/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'fgz^7hqp3hohi64gm)v$rvg54@po=pznce*$j$db9h1drp4m9i'

# Allow all host headers
ALLOWED_HOSTS = []

# Application installed in my project
INSTALLED_APPS = (
    'django.contrib.admin',
	'django.contrib.auth',
	'django.contrib.contenttypes',
	'django.contrib.sessions',
	'django.contrib.messages',
	'django.contrib.staticfiles',
	'dashboard',
	'getsnap',
	'playbook',
	'quizzes',
	'debug_toolbar',
	'storages',
	'datetimewidget',
	'bootstrap3_datetime',
	'graphos',
)

DEBUG_TOOLBAR_PATCH_SETTINGS = False

MIDDLEWARE_CLASSES = (
    'debug_toolbar.middleware.DebugToolbarMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.locale.LocaleMiddleware',
)

ROOT_URLCONF = 'snap.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.contrib.auth.context_processors.auth',
                'django.template.context_processors.debug',
                'django.template.context_processors.i18n',
                'django.template.context_processors.media',
                'django.template.context_processors.static',
                'django.template.context_processors.tz',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.request'
            ],
        },
    },
]

WSGI_APPLICATION = 'snap.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.8/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'snapdb',
        'USER': '',
        'PASSWORD': '',
        'HOST': '',
        'PORT': '5432',
    }
}


# Internationalization
# https://docs.djangoproject.com/en/1.8/topics/i18n/

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.8/howto/static-files/

# Honor the 'X-Forwarded-Proto' header for request.is_secure()
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Static asset configuration
STATIC_ROOT = 'staticfiles'
STATIC_URL = '/static/'

# Password settings
# https://github.com/dstufft/django-passwords
PASSWORD_MIN_LENGTH         = 2     # Defaults to 6
PASSWORD_MAX_LENGTH         = 120   # Defaults to none
PASSWORD_DICTIONARY         = ""    # Defaults to None, Should have a directory path to a dictionary
PASSWORD_MATCH_THRESHOLD    = 1.0   # Defaults to 0.9, should be 0.0 - 1.0 where 1.0 means exactly the same.
PASSWORD_COMMON_SEQUENCES   = []    # Should be a list of strings, see passwords/validators.py for default
PASSWORD_COMPLEXITY = { 
    "UPPER": 	0,  	# Uppercase
    "LOWER": 	0, 		# Lowercase
    "LETTERS": 	0, 		# Either uppercase or lowercase letters
    "DIGITS": 	0, 		# Digits
    "SPECIAL": 	0, 		# Not alphanumeric, space or punctuation character
    "WORDS": 	0  		# Words (alphanumeric sequences separated by a whitespace or punctuation character)
}
