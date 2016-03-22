from quiz_master.settings.base import *
from IPython import embed


# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

DATABASES['default'] =  dj_database_url.parse('postgres://localhost:5432/quizdb')
MEDIA_ROOT = os.path.normpath(os.path.join(BASE_DIR, '../../media'))
MEDIA_URL = '/media/'
#embed()
