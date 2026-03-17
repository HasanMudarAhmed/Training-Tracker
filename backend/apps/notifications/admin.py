from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'notification_type', 'title', 'is_read', 'email_sent', 'sent_at']
    list_filter = ['notification_type', 'is_read', 'email_sent']
    search_fields = ['user__email', 'title']
