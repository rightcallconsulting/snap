from snap.settings.base import *
import dj_database_url

DEBUG = True

DATABASES['default'] = dj_database_url.parse('postgres://localhost:5432/snapdb')

MEDIA_ROOT = os.path.normpath(os.path.join(BASE_DIR, '../../media'))
MEDIA_URL = '/media/'
