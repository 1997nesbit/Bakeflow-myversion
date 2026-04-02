"""
Management command: create_dev_superuser

Creates a superuser from environment variables if no superuser exists.
Safe to call on every startup — idempotent, skips silently if a superuser
already exists. Only runs when DEBUG=True to prevent accidental use in prod.

Environment variables (all optional, defaults shown):
  DJANGO_SUPERUSER_EMAIL     admin@bakeflow.dev
  DJANGO_SUPERUSER_PASSWORD  admin123
  DJANGO_SUPERUSER_NAME      Admin
  DJANGO_SUPERUSER_PHONE     0700000000

Add these to backend/.env to customise:
  DJANGO_SUPERUSER_EMAIL=your@email.com
  DJANGO_SUPERUSER_PASSWORD=yourpassword
"""

import environ
from django.conf import settings
from django.core.management.base import BaseCommand

from apps.accounts.models import User

env = environ.Env()


class Command(BaseCommand):
    help = 'Create a superuser from env vars if none exists (dev only).'

    def handle(self, *args, **options):
        if not settings.DEBUG:
            self.stderr.write('Skipped: create_dev_superuser only runs when DEBUG=True.')
            return

        if User.objects.filter(is_superuser=True).exists():
            self.stdout.write('Superuser already exists — skipping.')
            return

        email    = env('DJANGO_SUPERUSER_EMAIL',    default='admin@bakeflow.dev')
        password = env('DJANGO_SUPERUSER_PASSWORD', default='admin123')
        name     = env('DJANGO_SUPERUSER_NAME',     default='Admin')
        phone    = env('DJANGO_SUPERUSER_PHONE',    default='0700000000')

        User.objects.create_superuser(
            email=email,
            password=password,
            name=name,
            phone=phone,
        )
        self.stdout.write(
            self.style.SUCCESS(
                f'Superuser created: {email} / {password}  (role: manager)'
            )
        )
