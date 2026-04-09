from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Department


class DepartmentSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()
    managers = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ['id', 'name', 'description', 'member_count', 'managers', 'created_at']
        read_only_fields = ['id', 'created_at', 'member_count', 'managers']

    def get_member_count(self, obj):
        return obj.members.filter(is_active=True).count()

    def get_managers(self, obj):
        return [
            {'id': str(m.id), 'full_name': m.get_full_name(), 'email': m.email}
            for m in obj.members.filter(role='manager', is_active=True)
        ]


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
    manager_name = serializers.SerializerMethodField()
    supervisor_name = serializers.SerializerMethodField()
    completion_rate = serializers.SerializerMethodField()
    active_training_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'job_title', 'phone',
            'department', 'department_name',
            'manager', 'manager_name',
            'supervisor', 'supervisor_name',
            'is_active', 'date_joined',
            'completion_rate', 'active_training_count',
        ]
        read_only_fields = ['id', 'date_joined', 'full_name', 'department_name',
                            'manager_name', 'supervisor_name', 'completion_rate', 'active_training_count']

    def get_full_name(self, obj):
        return obj.get_full_name()

    def get_manager_name(self, obj):
        if obj.manager:
            return obj.manager.get_full_name()
        return None

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
            'job_title', 'phone', 'department', 'manager', 'supervisor',
            'password', 'password_confirm',
        ]

    def validate(self, data):
        if data['password'] != data.pop('password_confirm'):
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})

        request = self.context.get('request')
        if request:
            role = data.get('role', 'employee')
            if request.user.role == 'supervisor':
                if role != 'employee':
                    raise serializers.ValidationError('Supervisors can only create employees.')
                data['supervisor'] = request.user
                data['department'] = request.user.department
            elif request.user.role == 'manager':
                if role == 'supervisor':
                    data['manager'] = request.user
                    data['department'] = request.user.department
                elif role == 'employee':
                    supervisor = data.get('supervisor')
                    if supervisor:
                        if supervisor.role != 'supervisor' or supervisor.department_id != request.user.department_id:
                            raise serializers.ValidationError({'supervisor': 'Supervisor must be in your department.'})
                    # supervisor is optional — employee can belong directly to the department
                    data['department'] = request.user.department
                else:
                    raise serializers.ValidationError('Managers can only create supervisors or employees.')

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
