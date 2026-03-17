from django.urls import path
from . import views

urlpatterns = [
    path('reports/summary/', views.SummaryReportView.as_view(), name='report_summary'),
    path('reports/by-department/', views.DepartmentReportView.as_view(), name='report_department'),
    path('reports/by-employee/', views.EmployeeReportView.as_view(), name='report_employee'),
    path('reports/overdue/', views.OverdueReportView.as_view(), name='report_overdue'),
    path('reports/expiring/', views.ExpiringReportView.as_view(), name='report_expiring'),
    path('reports/export/', views.ExportReportView.as_view(), name='report_export'),
]
