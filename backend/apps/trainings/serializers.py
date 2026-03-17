from rest_framework import serializers
from django.utils import timezone
from .models import Training, TrainingAssignment
from apps.accounts.serializers import UserMinimalSerializer


class TrainingSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    assignment_count = serializers.SerializerMethodField()
    completion_rate = serializers.SerializerMethodField()

    class Meta:
        model = Training
        fields = [
            'id', 'title', 'description', 'category', 'duration_hours',
            'is_recurring', 'recurrence_months', 'is_active',
            'created_by', 'created_by_name',
            'assignment_count', 'completion_rate',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_assignment_count(self, obj):
        return obj.assignments.count()

    def get_completion_rate(self, obj):
        total = obj.assignments.count()
        if total == 0:
            return 0
        completed = obj.assignments.filter(status='completed').count()
        return round((completed / total) * 100, 1)

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class TrainingMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Training
        fields = ['id', 'title', 'category', 'is_recurring', 'duration_hours']


class TrainingAssignmentSerializer(serializers.ModelSerializer):
    training_detail = TrainingMinimalSerializer(source='training', read_only=True)
    employee_detail = UserMinimalSerializer(source='employee', read_only=True)
    assigned_by_name = serializers.CharField(source='assigned_by.get_full_name', read_only=True)
    is_overdue = serializers.SerializerMethodField()
    days_until_due = serializers.SerializerMethodField()

    class Meta:
        model = TrainingAssignment
        fields = [
            'id', 'training', 'training_detail',
            'employee', 'employee_detail',
            'assigned_by', 'assigned_by_name',
            'assigned_date', 'due_date', 'completion_date', 'expiry_date',
            'status', 'notes',
            'certificate_file',
            'is_overdue', 'days_until_due',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'assigned_by', 'assigned_date',
            'training_detail', 'employee_detail', 'assigned_by_name',
            'is_overdue', 'days_until_due',
            'created_at', 'updated_at',
        ]

    def get_is_overdue(self, obj):
        return obj.status == 'overdue'

    def get_days_until_due(self, obj):
        if obj.due_date and obj.status in ('assigned', 'in_progress'):
            delta = obj.due_date - timezone.now().date()
            return delta.days
        return None

    def validate(self, data):
        request = self.context.get('request')
        if self.instance is None:  # Creating
            training = data.get('training')
            employee = data.get('employee')
            if training and employee:
                existing = TrainingAssignment.objects.filter(
                    training=training,
                    employee=employee,
                    status__in=['assigned', 'in_progress']
                ).exists()
                if existing:
                    raise serializers.ValidationError(
                        'This employee already has an active assignment for this training.'
                    )
        return data

    def create(self, validated_data):
        validated_data['assigned_by'] = self.context['request'].user
        return super().create(validated_data)


class BulkAssignSerializer(serializers.Serializer):
    training_ids = serializers.ListField(child=serializers.UUIDField(), min_length=1)
    employee_ids = serializers.ListField(child=serializers.UUIDField(), min_length=1)
    due_date = serializers.DateField()
    notes = serializers.CharField(required=False, allow_blank=True, default='')


class CertificateUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingAssignment
        fields = ['certificate_file']

    def validate_certificate_file(self, value):
        allowed_types = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
        if value.content_type not in allowed_types:
            raise serializers.ValidationError('Only PDF, JPEG, and PNG files are allowed.')
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError('File size must be under 10MB.')
        return value
