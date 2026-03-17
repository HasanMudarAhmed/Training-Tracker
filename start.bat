@echo off
echo Starting Training Tracker...

cd /d "%~dp0backend"
call venv\Scripts\activate.bat

echo Running migrations...
python manage.py migrate --settings=config.settings.production

echo Collecting static files...
python manage.py collectstatic --noinput --settings=config.settings.production

echo Starting server on port 8000...
waitress-serve --port=8000 --threads=8 config.wsgi:application
