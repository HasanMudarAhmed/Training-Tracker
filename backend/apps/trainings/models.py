import uuid
import os
from django.db import models
from django.utils import timezone


def certificate_upload_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = f'{instance.id}.{ext}'
    return os.path.join('certificates', str(instance.employee.id), filename)


class Training(models.Model):
    CATEGORY_CHOICES = [
        ('safety', 'Safety'),
        ('health', 'Health & Wellness'),
        ('fire_safety', 'Fire Safety'),
        ('hazmat', 'Hazardous Materials'),
        ('emergency', 'Emergency Preparedness'),
        ('electrical', 'Electrical Safety'),
        ('environmental', 'Environmental'),
        ('machinery', 'Machinery & Equipment'),
        ('materials_handling', 'Materials Handling'),
        ('housekeeping', 'Housekeeping & Storage'),
        ('compliance', 'Compliance'),
        ('technical', 'Technical'),
        ('soft_skills', 'Soft Skills'),
        ('hr', 'HR & Workplace'),
        ('leadership', 'Leadership'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    duration_hours = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    is_recurring = models.BooleanField(default=False)
    recurrence_months = models.IntegerField(
        null=True, blank=True,
        help_text='Number of months before renewal is required'
    )
    created_by = models.ForeignKey(
        'accounts.User', null=True,
        on_delete=models.SET_NULL, related_name='created_trainings'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return self.title


class TrainingAssignment(models.Model):
    STATUS_CHOICES = [
        ('assigned', 'Assigned'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('overdue', 'Overdue'),
        ('expired', 'Expired'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    training = models.ForeignKey(
        Training, on_delete=models.CASCADE, related_name='assignments'
    )
    employee = models.ForeignKey(
        'accounts.User', on_delete=models.CASCADE,
        related_name='training_assignments',
        limit_choices_to={'role': 'employee'}
    )
    assigned_by = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL, null=True,
        related_name='assignments_given'
    )
    assigned_date = models.DateField(default=timezone.now)
    due_date = models.DateField()
    completion_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='assigned')
    certificate_file = models.FileField(
        upload_to=certificate_upload_path, null=True, blank=True
    )
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-due_date']
        # Prevent duplicate active assignments
        constraints = [
            models.UniqueConstraint(
                fields=['training', 'employee'],
                condition=models.Q(status__in=['assigned', 'in_progress']),
                name='unique_active_assignment'
            )
        ]

    def __str__(self):
        return f'{self.employee.get_full_name()} — {self.training.title}'

    def save(self, *args, **kwargs):
        # Auto-calculate expiry date for recurring trainings on completion
        if (
            self.status == 'completed'
            and self.completion_date
            and self.training.is_recurring
            and self.training.recurrence_months
            and not self.expiry_date
        ):
            from dateutil.relativedelta import relativedelta
            self.expiry_date = self.completion_date + relativedelta(
                months=self.training.recurrence_months
            )
        super().save(*args, **kwargs)
