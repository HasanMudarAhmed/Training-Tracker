@echo off
cd /d "%~dp0backend"
call venv\Scripts\activate.bat
set DJANGO_SETTINGS_MODULE=config.settings.production
python manage.py migrate
python manage.py collectstatic --noinput
python -m waitress --port=8000 --threads=8 config.wsgi:application
pause
