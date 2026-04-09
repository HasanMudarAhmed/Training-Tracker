from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Only admins can access."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')


class IsManager(BasePermission):
    """Only managers can access."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'manager')


class IsManagerOrAdmin(BasePermission):
    """Admins and managers can access."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and request.user.role in ('admin', 'manager')
        )


class IsSupervisorOrAdmin(BasePermission):
    """Admins, managers, and supervisors can access."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and request.user.role in ('admin', 'manager', 'supervisor')
        )


class IsOwnerOrSupervisorOrAdmin(BasePermission):
    """Object-level: admin sees all, manager sees dept, supervisor sees team, employee sees own."""
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user.is_authenticated:
            return False
        if user.role == 'admin':
            return True
        # obj is a TrainingAssignment
        if user.role == 'manager':
            return obj.employee.department_id == user.department_id
        if user.role == 'supervisor':
            return obj.employee_id == user.id or obj.employee.supervisor_id == user.id
        return obj.employee_id == user.id


class IsOwnerOrAdmin(BasePermission):
    """Object-level: admin or the user themselves."""
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user.is_authenticated:
            return False
        if user.role == 'admin':
            return True
        return obj.id == user.id
