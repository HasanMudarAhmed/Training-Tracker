import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

app = Celery('training_tracker')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

app.conf.beat_schedule = {
    'update-overdue-statuses': {
        'task': 'apps.trainings.tasks.update_overdue_statuses',
        'schedule': crontab(hour=0, minute=0),  # midnight daily
    },
    'send-due-reminders': {
        'task': 'apps.notifications.tasks.send_due_reminders',
        'schedule': crontab(hour=8, minute=0),  # 8am daily
    },
    'send-expiry-reminders': {
        'task': 'apps.notifications.tasks.send_expiry_reminders',
        'schedule': crontab(hour=8, minute=30),  # 8:30am daily
    },
}
