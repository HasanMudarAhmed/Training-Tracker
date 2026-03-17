from django.contrib import admin
from .models import Training, TrainingAssignment


@admin.register(Training)
class TrainingAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'is_recurring', 'is_active', 'created_at']
    list_filter = ['category', 'is_recurring', 'is_active']
    search_fields = ['title', 'description']


@admin.register(TrainingAssignment)
class TrainingAssignmentAdmin(admin.ModelAdmin):
    list_display = ['employee', 'training', 'status', 'due_date', 'completion_date']
    list_filter = ['status', 'training__category']
    search_fields = ['employee__email', 'training__title']
    raw_id_fields = ['employee', 'training', 'assigned_by']
