from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import FileResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from pathlib import Path


def serve_frontend(request, *args, **kwargs):
    index = Path(settings.BASE_DIR).parent / 'frontend' / 'dist' / 'index.html'
    return FileResponse(open(index, 'rb'), content_type='text/html')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/', include('apps.trainings.urls')),
    path('api/', include('apps.notifications.urls')),
    path('api/', include('apps.reports.urls')),
    path('api/', include('apps.audit.urls')),
    # API Docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    try:
        import debug_toolbar
        urlpatterns = [path('__debug__/', include(debug_toolbar.urls))] + urlpatterns
    except ImportError:
        pass
else:
    # Serve media files and React SPA in production
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += [re_path(r'^(?!api/|admin/|media/|static/).*$', serve_frontend)]
