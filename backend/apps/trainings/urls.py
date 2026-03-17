from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('trainings', views.TrainingViewSet, basename='training')
router.register('assignments', views.TrainingAssignmentViewSet, basename='assignment')

urlpatterns = [
    path('', include(router.urls)),
]
