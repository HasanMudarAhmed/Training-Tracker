from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Department


class DepartmentSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ['id', 'name', 'description', 'member_count', 'created_at']
        read_only_fields = ['id', 'created_at', 'member_count']

    def get_member_count(self, obj):
        return obj.members.filter(is_active=True).count()


class UserMinimalSerializer(serializers.ModelSerializer):
    """Lightweight serializer for nested references."""
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'full_name', 'role']

    def get_full_name(self, obj):
        return obj.get_full_name()


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    department_name = serializers.CharField(source='department.name', read_only=True)
    supervisor_name = serializers.SerializerMethodField()
    completion_rate = serializers.SerializerMethodField()
    active_training_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'job_title', 'phone',
            'department', 'department_name',
            'supervisor', 'supervisor_name',
            'is_active', 'date_joined',
            'completion_rate', 'active_training_count',
        ]
        read_only_fields = ['id', 'date_joined', 'full_name', 'department_name',
                            'supervisor_name', 'completion_rate', 'active_training_count']

    def get_full_name(self, obj):
        return obj.get_full_name()

    def get_supervisor_name(self, obj):
        if obj.supervisor:
            return obj.supervisor.get_full_name()
        return None

    def get_completion_rate(self, obj):
        assignments = obj.training_assignments.all()
        total = assignments.count()
        if total == 0:
            return 0
        completed = assignments.filter(status='completed').count()
        return round((completed / total) * 100, 1)

    def get_active_training_count(self, obj):
        return obj.training_assignments.filter(status__in=['assigned', 'in_progress']).count()


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'role',
            'job_title', 'phone', 'department', 'supervisor',
            'password', 'password_confirm',
        ]

    def validate(self, data):
        if data['password'] != data.pop('password_confirm'):
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({'new_password_confirm': 'Passwords do not match.'})
        return data
