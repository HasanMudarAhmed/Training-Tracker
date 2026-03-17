import uuid
from django.db import models


class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('assign', 'Assign Training'),
        ('complete', 'Complete Training'),
        ('upload', 'Upload Certificate'),
        ('login', 'Login'),
        ('logout', 'Logout'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL,
        null=True, related_name='audit_logs'
    )
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    model_name = models.CharField(max_length=100)
    object_id = models.CharField(max_length=100, blank=True, default='')
    object_repr = models.CharField(max_length=200, blank=True, default='')
    changes = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        user_str = self.user.get_full_name() if self.user else 'System'
        return f'{user_str} — {self.action} {self.model_name} at {self.timestamp}'
