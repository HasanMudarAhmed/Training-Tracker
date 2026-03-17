import uuid
from django.db import models


class Notification(models.Model):
    TYPE_CHOICES = [
        ('assignment', 'Training Assigned'),
        ('reminder', 'Due Date Reminder'),
        ('overdue', 'Training Overdue'),
        ('expiry', 'Certificate Expiring'),
        ('expired', 'Certificate Expired'),
        ('completed', 'Training Completed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        'accounts.User', on_delete=models.CASCADE, related_name='notifications'
    )
    assignment = models.ForeignKey(
        'trainings.TrainingAssignment', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='notifications'
    )
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    email_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-sent_at']

    def __str__(self):
        return f'{self.user.get_full_name()} — {self.title}'
