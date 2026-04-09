from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import viewsets, generics, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django_filters.rest_framework import DjangoFilterBackend
from .models import Department
from .serializers import (
    UserSerializer, UserCreateSerializer, UserMinimalSerializer,
    DepartmentSerializer, ChangePasswordSerializer
)
from .permissions import IsAdmin, IsSupervisorOrAdmin, IsManagerOrAdmin

User = get_user_model()


class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        access = serializer.validated_data['access']
        refresh = serializer.validated_data['refresh']

        # Decode token to get user
        from rest_framework_simplejwt.tokens import AccessToken as AT
        token_obj = AT(access)
        user = User.objects.get(id=token_obj['user_id'])

        resp = Response({'user': UserSerializer(user).data})
        resp.set_cookie(
            'access_token', access,
            httponly=True, samesite='Lax',
            secure=False,
            max_age=15 * 60,
        )
        resp.set_cookie(
            'refresh_token', refresh,
            httponly=True, samesite='Lax',
            secure=False,
            max_age=7 * 24 * 60 * 60,
        )
        return resp


class CookieTokenRefreshView(generics.GenericAPIView):
    """Read refresh token from cookie and return new access token in cookie."""
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response({'detail': 'Refresh token not found.'}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            token = RefreshToken(refresh_token)
            access = str(token.access_token)
            resp = Response({'detail': 'Token refreshed.'})
            resp.set_cookie(
                'access_token', access,
                httponly=True, samesite='Lax',
                secure=False,
                max_age=15 * 60,
            )
            if settings.SIMPLE_JWT.get('ROTATE_REFRESH_TOKENS'):
                token.blacklist()
                new_refresh = str(RefreshToken.for_user(
                    User.objects.get(id=token['user_id'])
                ))
                resp.set_cookie(
                    'refresh_token', new_refresh,
                    httponly=True, samesite='Lax',
                    secure=False,
                    max_age=7 * 24 * 60 * 60,
                )
            return resp
        except Exception:
            return Response({'detail': 'Invalid or expired refresh token.'}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.COOKIES.get('refresh_token') or request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass
        response = Response({'detail': 'Successfully logged out.'})
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response


class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'old_password': 'Wrong password.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'detail': 'Password updated successfully.'})


class PasswordResetRequestView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        try:
            user = User.objects.get(email=email, is_active=True)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
            send_mail(
                subject='Password Reset Request',
                message=f'Click the link to reset your password: {reset_url}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=True,
            )
        except User.DoesNotExist:
            pass  # Don't reveal if email exists
        return Response({'detail': 'If this email exists, a reset link has been sent.'})


class PasswordResetConfirmView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uid = request.data.get('uid', '')
        token = request.data.get('token', '')
        new_password = request.data.get('new_password', '')

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, User.DoesNotExist):
            return Response({'detail': 'Invalid reset link.'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({'detail': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({'detail': 'Password reset successfully.'})


class UserViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['role', 'department', 'supervisor', 'manager', 'is_active']
    search_fields = ['first_name', 'last_name', 'email', 'job_title']
    ordering_fields = ['first_name', 'last_name', 'date_joined']
    ordering = ['first_name']

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve', 'minimal', 'user_trainings'):
            return [IsAuthenticated()]
        if self.action == 'create':
            return [IsSupervisorOrAdmin()]
        if self.action in ('update', 'partial_update', 'destroy'):
            return [IsManagerOrAdmin()]
        return [IsAdmin()]

    def _check_manager_scope(self, target_user):
        """Raise PermissionDenied if manager tries to act on a user outside their dept."""
        from rest_framework.exceptions import PermissionDenied
        user = self.request.user
        if user.role == 'manager':
            if target_user.department_id != user.department_id:
                raise PermissionDenied('You can only manage users in your department.')
            if target_user.role not in ('supervisor', 'employee'):
                raise PermissionDenied('Managers can only edit supervisors and employees.')

    def perform_update(self, serializer):
        self._check_manager_scope(serializer.instance)
        serializer.save()

    def perform_destroy(self, instance):
        self._check_manager_scope(instance)
        instance.is_active = False
        instance.save()

    def get_queryset(self):
        from django.db.models import Q
        user = self.request.user
        qs = User.objects.select_related('department', 'supervisor', 'manager').all()
        if user.role == 'admin':
            return qs
        if user.role == 'manager':
            return qs.filter(
                Q(role='supervisor', department=user.department) |
                Q(role='employee', department=user.department)
            )
        if user.role == 'supervisor':
            return qs.filter(supervisor=user)
        return qs.filter(id=user.id)

    @action(detail=True, methods=['get'], url_path='trainings')
    def user_trainings(self, request, pk=None):
        from apps.trainings.serializers import TrainingAssignmentSerializer
        user = self.get_object()
        assignments = user.training_assignments.select_related('training', 'assigned_by').all()
        serializer = TrainingAssignmentSerializer(assignments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='minimal')
    def minimal(self, request):
        """Lightweight list for dropdowns. Managers get employees + supervisors; others get employees only."""
        qs = self.get_queryset().filter(is_active=True)
        if request.user.role == 'manager':
            qs = qs.filter(role__in=['employee', 'supervisor'])
        else:
            qs = qs.filter(role='employee')
        serializer = UserMinimalSerializer(qs, many=True)
        return Response(serializer.data)


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering = ['name']

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [IsAuthenticated()]
        return [IsAdmin()]
