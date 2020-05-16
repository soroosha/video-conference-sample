#!/bin/sh

# Entrypoint script to run in server container

# Apply migrations (if any) and start development server
cd app
pipenv run python manage.py runserver 0.0.0.0:80