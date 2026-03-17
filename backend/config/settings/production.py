from .base import *

DEBUG = False

SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Serve React frontend build via whitenoise at root URL
FRONTEND_DIST = BASE_DIR.parent / 'frontend' / 'dist'
WHITENOISE_ROOT = str(FRONTEND_DIST)
WHITENOISE_INDEX_FILE = True
