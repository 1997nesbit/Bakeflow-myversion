import environ
from .base import *  # noqa

env = environ.Env()

DEBUG = False

# Railway terminates TLS at the proxy and forwards requests as HTTP internally.
# SECURE_PROXY_SSL_HEADER tells Django to trust the X-Forwarded-Proto header
# so it knows the original request was HTTPS and stops redirecting.
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Secure cookies
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True

# Response headers
X_FRAME_OPTIONS = 'DENY'
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'
