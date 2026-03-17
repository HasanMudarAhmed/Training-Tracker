from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    training_title = serializers.CharField(
        source='assignment.training.title', read_only=True
    )

    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'title', 'message',
            'is_read', 'email_sent', 'sent_at',
            'assignment', 'training_title',
        ]
        read_only_fields = ['id', 'notification_type', 'title', 'message',
                            'email_sent', 'sent_at', 'training_title']
