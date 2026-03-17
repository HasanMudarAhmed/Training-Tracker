from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['timestamp', 'user', 'action', 'model_name', 'object_repr', 'ip_address']
    list_filter = ['action', 'model_name']
    search_fields = ['user__email', 'object_repr']
    readonly_fields = ['id', 'user', 'action', 'model_name', 'object_id',
                       'object_repr', 'changes', 'ip_address', 'timestamp']
