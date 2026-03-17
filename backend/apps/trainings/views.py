import logging
from django.http import FileResponse
from django.utils import timezone
from django.db import transaction

logger = logging.getLogger(__name__)
from rest_framework import viewsets, generics, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Training, TrainingAssignment
from .serializers import (
    TrainingSerializer, TrainingAssignmentSerializer,
    BulkAssignSerializer, CertificateUploadSerializer
)
from .filters import TrainingFilter, TrainingAssignmentFilter
from apps.accounts.permissions import IsAdmin, IsSupervisorOrAdmin, IsOwnerOrSupervisorOrAdmin


class TrainingViewSet(viewsets.ModelViewSet):
    serializer_class = TrainingSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = TrainingFilter
    search_fields = ['title', 'description', 'category']
    ordering_fields = ['title', 'category', 'created_at']
    ordering = ['title']

    def get_queryset(self):
        return Training.objects.select_related('created_by').filter(is_active=True)

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAdmin()]
        return [IsAuthenticated()]

    def perform_destroy(self, instance):
        # Soft delete — check for active assignments first
        active = instance.assignments.filter(status__in=['assigned', 'in_progress']).exists()
        if active:
            from rest_framework.exceptions import ValidationError
            raise ValidationError(
                'Cannot delete a training with active assignments. '
                'Please complete or reassign them first.'
            )
        instance.is_active = False
        instance.save()


class TrainingAssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = TrainingAssignmentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = TrainingAssignmentFilter
    search_fields = ['employee__first_name', 'employee__last_name', 'training__title']
    ordering_fields = ['due_date', 'assigned_date', 'status']
    ordering = ['due_date']

    def get_queryset(self):
        user = self.request.user
        qs = TrainingAssignment.objects.select_related(
            'training', 'employee', 'employee__department',
            'employee__supervisor', 'assigned_by'
        )
        if user.role == 'admin':
            return qs.all()
        if user.role == 'supervisor':
            return qs.filter(employee__supervisor=user)
        return qs.filter(employee=user)

    def get_permissions(self):
        if self.action == 'create':
            return [IsSupervisorOrAdmin()]
        if self.action in ('update', 'partial_update', 'destroy'):
            return [IsOwnerOrSupervisorOrAdmin()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        assignment = serializer.save()
        try:
            from apps.notifications.tasks import send_assignment_notification
            send_assignment_notification(str(assignment.id))
        except Exception:
            pass

    @action(detail=False, methods=['post'], url_path='bulk',
            permission_classes=[IsSupervisorOrAdmin])
    def bulk_assign(self, request):
        serializer = BulkAssignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        training_ids = serializer.validated_data['training_ids']
        employee_ids = serializer.validated_data['employee_ids']
        due_date = serializer.validated_data['due_date']
        notes = serializer.validated_data.get('notes', '')

        from apps.accounts.models import User
        created = []
        skipped = []

        with transaction.atomic():
            trainings = Training.objects.filter(id__in=training_ids, is_active=True)
            employees = User.objects.filter(id__in=employee_ids, role='employee', is_active=True)

            for training in trainings:
                for employee in employees:
                    existing = TrainingAssignment.objects.filter(
                        training=training,
                        employee=employee,
                        status__in=['assigned', 'in_progress']
                    ).exists()
                    if existing:
                        skipped.append(f'{employee.get_full_name()} — {training.title}')
                        continue
                    assignment = TrainingAssignment.objects.create(
                        training=training,
                        employee=employee,
                        assigned_by=request.user,
                        due_date=due_date,
                        notes=notes,
                        status='assigned',
                    )
                    created.append(str(assignment.id))

        # Send notifications synchronously (no Celery required)
        try:
            from apps.notifications.tasks import send_assignment_notification
            for assignment_id in created:
                send_assignment_notification(assignment_id)
        except Exception as e:
            logger.error('Notification error: %s', str(e))

        return Response({
            'created': len(created),
            'skipped': len(skipped),
            'skipped_details': skipped,
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='upload-certificate')
    def upload_certificate(self, request, pk=None):
        assignment = self.get_object()
        serializer = CertificateUploadSerializer(assignment, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'detail': 'Certificate uploaded successfully.'})

    @action(detail=True, methods=['get'], url_path='certificate')
    def get_certificate(self, request, pk=None):
        assignment = self.get_object()
        if not assignment.certificate_file:
            return Response(
                {'detail': 'No certificate uploaded.'},
                status=status.HTTP_404_NOT_FOUND
            )
        return FileResponse(
            assignment.certificate_file.open('rb'),
            as_attachment=False,
            filename=assignment.certificate_file.name.split('/')[-1]
        )
