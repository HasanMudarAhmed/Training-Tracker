import logging
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger(__name__)


def _create_notification(user, assignment, notification_type, title, message, send_email=True):
    """Helper to create an in-app notification and optionally send email."""
    from .models import Notification
    notification = Notification.objects.create(
        user=user,
        assignment=assignment,
        notification_type=notification_type,
        title=title,
        message=message,
        email_sent=False,
    )
    if send_email and user.email:
        try:
            html_message = render_to_string(
                f'email/{notification_type}.html',
                {
                    'user': user,
                    'assignment': assignment,
                    'training': assignment.training if assignment else None,
                    'frontend_url': settings.FRONTEND_URL,
                }
            )
            send_mail(
                subject=title,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=False,
            )
            notification.email_sent = True
            notification.save(update_fields=['email_sent'])
            logger.info('Email sent to %s for %s', user.email, notification_type)
        except Exception as e:
            logger.error('Failed to send email to %s: %s', user.email, str(e))
    return notification


@shared_task(bind=True, max_retries=3)
def send_assignment_notification(self, assignment_id):
    """Notify employee when a training is assigned to them."""
    from apps.trainings.models import TrainingAssignment
    try:
        assignment = TrainingAssignment.objects.select_related(
            'employee', 'training', 'assigned_by'
        ).get(id=assignment_id)
    except TrainingAssignment.DoesNotExist:
        return

    title = f'New Training Assigned: {assignment.training.title}'
    message = (
        f'Hi {assignment.employee.first_name},\n\n'
        f'You have been assigned the training "{assignment.training.title}" '
        f'with a due date of {assignment.due_date.strftime("%B %d, %Y")}.\n\n'
        f'Please log in to view your training details.\n\n'
        f'Training Tracker'
    )
    _create_notification(assignment.employee, assignment, 'assignment', title, message)


@shared_task
def send_due_reminders():
    """Send reminders for trainings due in 1 and 7 days. Runs daily at 8am."""
    from apps.trainings.models import TrainingAssignment
    today = timezone.now().date()

    for days in [7, 1]:
        target_date = today + timedelta(days=days)
        assignments = TrainingAssignment.objects.filter(
            due_date=target_date,
            status__in=['assigned', 'in_progress']
        ).select_related('employee', 'training', 'employee__supervisor')

        for assignment in assignments:
            label = '7 days' if days == 7 else 'tomorrow'
            title = f'Training Due {label.title()}: {assignment.training.title}'
            message = (
                f'Hi {assignment.employee.first_name},\n\n'
                f'Your training "{assignment.training.title}" is due {label}.\n'
                f'Please complete it before {assignment.due_date.strftime("%B %d, %Y")}.\n\n'
                f'Training Tracker'
            )
            _create_notification(assignment.employee, assignment, 'reminder', title, message)

            # Also notify supervisor
            if assignment.employee.supervisor:
                sup_title = f'Team Training Due {label.title()}: {assignment.training.title}'
                sup_message = (
                    f'Hi {assignment.employee.supervisor.first_name},\n\n'
                    f'{assignment.employee.get_full_name()}\'s training '
                    f'"{assignment.training.title}" is due {label}.\n\n'
                    f'Training Tracker'
                )
                _create_notification(
                    assignment.employee.supervisor, assignment,
                    'reminder', sup_title, sup_message
                )


@shared_task
def update_overdue_statuses():
    """Mark overdue and expired assignments. Runs daily at midnight."""
    from apps.trainings.models import TrainingAssignment
    today = timezone.now().date()

    overdue_ids = list(
        TrainingAssignment.objects.filter(
            due_date__lt=today,
            status__in=['assigned', 'in_progress']
        ).values_list('id', flat=True)
    )
    TrainingAssignment.objects.filter(id__in=overdue_ids).update(status='overdue')

    # Send overdue notifications
    for assignment in TrainingAssignment.objects.filter(
        id__in=overdue_ids
    ).select_related('employee', 'training', 'employee__supervisor'):
        title = f'Training Overdue: {assignment.training.title}'
        message = (
            f'Hi {assignment.employee.first_name},\n\n'
            f'Your training "{assignment.training.title}" is now overdue.\n'
            f'It was due on {assignment.due_date.strftime("%B %d, %Y")}.\n\n'
            f'Please complete it as soon as possible.\n\nTraining Tracker'
        )
        _create_notification(assignment.employee, assignment, 'overdue', title, message)

    # Mark expired certificates
    TrainingAssignment.objects.filter(
        expiry_date__lt=today,
        status='completed'
    ).update(status='expired')


@shared_task
def send_expiry_reminders():
    """Send reminders for certificates expiring in 30 and 7 days. Runs daily at 8:30am."""
    from apps.trainings.models import TrainingAssignment
    today = timezone.now().date()

    for days in [30, 7]:
        target_date = today + timedelta(days=days)
        assignments = TrainingAssignment.objects.filter(
            expiry_date=target_date,
            status='completed'
        ).select_related('employee', 'training', 'employee__supervisor')

        for assignment in assignments:
            label = f'{days} days'
            title = f'Certificate Expiring in {label}: {assignment.training.title}'
            message = (
                f'Hi {assignment.employee.first_name},\n\n'
                f'Your certificate for "{assignment.training.title}" '
                f'will expire in {label} on {assignment.expiry_date.strftime("%B %d, %Y")}.\n\n'
                f'Please renew your training.\n\nTraining Tracker'
            )
            _create_notification(assignment.employee, assignment, 'expiry', title, message)
