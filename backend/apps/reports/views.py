import csv
from datetime import timedelta
from django.utils import timezone
from django.http import HttpResponse
from django.db.models import Count, Q, Avg
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.accounts.permissions import IsAdmin, IsSupervisorOrAdmin
from apps.trainings.models import TrainingAssignment
from apps.accounts.models import User, Department


class SummaryReportView(APIView):
    permission_classes = [IsSupervisorOrAdmin]

    def get(self, request):
        user = request.user
        qs = self._base_qs(user)

        total = qs.count()
        completed = qs.filter(status='completed').count()
        overdue = qs.filter(status='overdue').count()
        in_progress = qs.filter(status='in_progress').count()
        assigned = qs.filter(status='assigned').count()
        expired = qs.filter(status='expired').count()
        expiring_soon = qs.filter(
            expiry_date__gte=timezone.now().date(),
            expiry_date__lte=timezone.now().date() + timedelta(days=30),
            status='completed'
        ).count()

        return Response({
            'total_assignments': total,
            'completed': completed,
            'overdue': overdue,
            'in_progress': in_progress,
            'assigned': assigned,
            'expired': expired,
            'expiring_soon': expiring_soon,
            'completion_rate': round((completed / total * 100), 1) if total else 0,
        })

    def _base_qs(self, user):
        qs = TrainingAssignment.objects.all()
        if user.role == 'supervisor':
            qs = qs.filter(employee__supervisor=user)
        return qs


class DepartmentReportView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        departments = Department.objects.prefetch_related('members__training_assignments').all()
        data = []
        for dept in departments:
            members = dept.members.filter(role='employee', is_active=True)
            assignments = TrainingAssignment.objects.filter(employee__in=members)
            total = assignments.count()
            completed = assignments.filter(status='completed').count()
            overdue = assignments.filter(status='overdue').count()
            data.append({
                'department': dept.name,
                'employee_count': members.count(),
                'total_assignments': total,
                'completed': completed,
                'overdue': overdue,
                'completion_rate': round((completed / total * 100), 1) if total else 0,
            })
        return Response(data)


class EmployeeReportView(APIView):
    permission_classes = [IsSupervisorOrAdmin]

    def get(self, request):
        user = request.user
        employees = User.objects.filter(role='employee', is_active=True).select_related(
            'department', 'supervisor'
        )
        if user.role == 'supervisor':
            employees = employees.filter(supervisor=user)

        data = []
        for emp in employees:
            assignments = emp.training_assignments.all()
            total = assignments.count()
            completed = assignments.filter(status='completed').count()
            overdue = assignments.filter(status='overdue').count()
            data.append({
                'id': str(emp.id),
                'name': emp.get_full_name(),
                'email': emp.email,
                'department': emp.department.name if emp.department else None,
                'total_assignments': total,
                'completed': completed,
                'overdue': overdue,
                'completion_rate': round((completed / total * 100), 1) if total else 0,
            })
        return Response(data)


class OverdueReportView(APIView):
    permission_classes = [IsSupervisorOrAdmin]

    def get(self, request):
        user = request.user
        qs = TrainingAssignment.objects.filter(status='overdue').select_related(
            'employee', 'employee__department', 'training'
        )
        if user.role == 'supervisor':
            qs = qs.filter(employee__supervisor=user)

        data = [{
            'id': str(a.id),
            'employee': a.employee.get_full_name(),
            'department': a.employee.department.name if a.employee.department else None,
            'training': a.training.title,
            'due_date': a.due_date,
            'days_overdue': (timezone.now().date() - a.due_date).days,
        } for a in qs]
        return Response(data)


class ExpiringReportView(APIView):
    permission_classes = [IsSupervisorOrAdmin]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        user = request.user
        target = timezone.now().date() + timedelta(days=days)
        qs = TrainingAssignment.objects.filter(
            expiry_date__lte=target,
            expiry_date__gte=timezone.now().date(),
            status='completed'
        ).select_related('employee', 'training')
        if user.role == 'supervisor':
            qs = qs.filter(employee__supervisor=user)

        data = [{
            'id': str(a.id),
            'employee': a.employee.get_full_name(),
            'training': a.training.title,
            'expiry_date': a.expiry_date,
            'days_until_expiry': (a.expiry_date - timezone.now().date()).days,
        } for a in qs]
        return Response(data)


class ExportReportView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="training_report.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'Employee', 'Email', 'Department', 'Supervisor',
            'Training', 'Category', 'Status',
            'Assigned Date', 'Due Date', 'Completion Date', 'Expiry Date',
        ])

        assignments = TrainingAssignment.objects.select_related(
            'employee', 'employee__department', 'employee__supervisor', 'training'
        ).all()

        for a in assignments:
            writer.writerow([
                a.employee.get_full_name(),
                a.employee.email,
                a.employee.department.name if a.employee.department else '',
                a.employee.supervisor.get_full_name() if a.employee.supervisor else '',
                a.training.title,
                a.training.get_category_display(),
                a.get_status_display(),
                a.assigned_date,
                a.due_date,
                a.completion_date or '',
                a.expiry_date or '',
            ])

        return response
