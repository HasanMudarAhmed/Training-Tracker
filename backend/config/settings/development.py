from .base import *

DEBUG = True

# Use real SMTP in development (Gmail)
# EMAIL_BACKEND stays as smtp from base.py

INSTALLED_APPS += ['debug_toolbar']
MIDDLEWARE = ['debug_toolbar.middleware.DebugToolbarMiddleware'] + MIDDLEWARE
INTERNAL_IPS = ['127.0.0.1']
