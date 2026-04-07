#!/usr/bin/env bash
# Bakeflow backend startup script.
#
# Dev:  bash backend/start.sh          (from repo root)
# Prod: ./start.sh                     (Railway runs this from backend/)
#
# Behaviour is controlled by the DJANGO_ENV environment variable:
#   DJANGO_ENV=production  → migrate + gunicorn (Railway)
#   anything else          → migrate + create_dev_superuser + runserver (local)

set -e  # exit on first error

cd "$(dirname "$0")"  # always run from backend/

if [ "$DJANGO_ENV" = "production" ]; then
  echo "==> [production] Applying migrations..."
  python manage.py migrate --noinput

  echo "==> [production] Creating dev superuser (skips if already exists)..."
  python manage.py create_dev_superuser

  echo "==> [production] Starting Gunicorn on port ${PORT:-8000}..."
  exec gunicorn config.wsgi:application --bind "0.0.0.0:${PORT:-8000}" --workers 2

else
  PYTHON="../.venv/Scripts/python.exe"

  echo "==> [dev] Applying migrations..."
  $PYTHON manage.py migrate

  echo "==> [dev] Creating dev superuser (skips if already exists)..."
  $PYTHON manage.py create_dev_superuser

  echo "==> [dev] Starting Django dev server on http://localhost:8000"
  $PYTHON manage.py runserver
fi
