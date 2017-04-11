from snap.settings.base import *
import dj_database_url

DEBUG = True

# Database
# https://docs.djangoproject.com/en/1.8/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'snapdb',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '' # default postgres port is 5432
    }
}

MEDIA_ROOT = os.path.normpath(os.path.join(BASE_DIR, '../../media'))
MEDIA_URL = '/media/'
