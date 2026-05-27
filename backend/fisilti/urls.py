from django.contrib import admin
from django.urls import path, include, re_path
from django.http import JsonResponse
from django.views.generic import TemplateView
from django.shortcuts import render
from django.conf import settings
from django.conf.urls.static import static


def health(request):
    return JsonResponse({"status": "ok"})


def handler404(request, exception=None):
    """Custom 404 error page"""
    return render(request, '404.html', status=404)


def handler500(request):
    """Custom 500 error page"""
    return render(request, '500.html', status=500)


urlpatterns = [
    path('health/', health),
    path('admin/', admin.site.urls),
    path('api/', include('apps.users.urls')),
    path('api/posts/', include('apps.posts.urls')),
    path('api/follows/', include('apps.follows.urls')),
    path('api/reports/', include('apps.reports.urls')),
    path('api/admin/', include('apps.reports.urls')),
]

# Serve React app for all non-API routes (SPA fallback)
if settings.DEBUG:
    # In development, the React dev server handles the SPA routing
    # This fallback is for testing or when serving built files
    urlpatterns += [
        path('', TemplateView.as_view(template_name='index.html'), name='index'),
        # Catch-all for React Router paths
        re_path(r'^(?!api|admin|health|static).*$', TemplateView.as_view(template_name='index.html')),
    ]
else:
    # In production, serve the built React app
    urlpatterns += [
        path('', TemplateView.as_view(template_name='index.html'), name='index'),
        re_path(r'^(?!api|admin|health|static).*$', TemplateView.as_view(template_name='index.html')),
    ]

# Serve static files
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Custom error handlers
handler404 = "fisilti.urls.handler404"
handler500 = "fisilti.urls.handler500"
