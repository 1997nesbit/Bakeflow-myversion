from .base import *  # noqa

DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# Relax axes lockout in dev so you're not locked out during testing
AXES_ENABLED = True
