#!/usr/bin/env bash
# Bakeflow backend dev startup script.
# Run from the repo root: bash backend/start.sh

set -e  # exit on first error

PYTHON="../.venv/Scripts/python.exe"
cd "$(dirname "$0")"  # always run from backend/

echo "==> Applying migrations..."
$PYTHON manage.py migrate

echo "==> Creating dev superuser (skips if already exists)..."
$PYTHON manage.py create_dev_superuser

echo "==> Starting Django dev server on http://localhost:8000"
$PYTHON manage.py runserver
