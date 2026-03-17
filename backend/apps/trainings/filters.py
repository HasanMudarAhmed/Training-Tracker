import django_filters
from .models import Training, TrainingAssignment


class TrainingFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(lookup_expr='exact')
    is_recurring = django_filters.BooleanFilter()
    is_active = django_filters.BooleanFilter()

    class Meta:
        model = Training
        fields = ['category', 'is_recurring', 'is_active']


class TrainingAssignmentFilter(django_filters.FilterSet):
    status = django_filters.MultipleChoiceFilter(choices=TrainingAssignment.STATUS_CHOICES)
    employee = django_filters.UUIDFilter(field_name='employee__id')
    training = django_filters.UUIDFilter(field_name='training__id')
    department = django_filters.UUIDFilter(field_name='employee__department__id')
    supervisor = django_filters.UUIDFilter(field_name='employee__supervisor__id')
    due_date_from = django_filters.DateFilter(field_name='due_date', lookup_expr='gte')
    due_date_to = django_filters.DateFilter(field_name='due_date', lookup_expr='lte')
    assigned_date_from = django_filters.DateFilter(field_name='assigned_date', lookup_expr='gte')
    assigned_date_to = django_filters.DateFilter(field_name='assigned_date', lookup_expr='lte')

    class Meta:
        model = TrainingAssignment
        fields = ['status', 'employee', 'training', 'department', 'supervisor',
                  'due_date_from', 'due_date_to']
