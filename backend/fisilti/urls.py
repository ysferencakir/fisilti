from django.contrib import admin
from django.urls import path, include, re_path
from django.http import JsonResponse
from django.views.generic import TemplateView
from django.shortcuts import render
from django.conf import settings
from django.conf.urls.static import static


def health(request):
    return JsonResponse({"status": "ok"})


def react_app_fallback(request, fallback=''):
    """Serve React app for all non-API routes (SPA routing)"""
    import os
    from django.http import FileResponse

    # Try to serve from built frontend first
    index_path = os.path.join(settings.BASE_DIR.parent, 'frontend', 'dist', 'index.html')
    if os.path.exists(index_path):
        return FileResponse(open(index_path, 'rb'))

    # Fallback to template
    try:
        return render(request, 'index.html')
    except:
        # Last resort: return minimal HTML
        return render(request, '404.html', {'message': 'React app not found. Please rebuild frontend.'}, status=500)


def handler404(request, exception=None):
    from django.http import HttpResponse
    try:
        return render(request, '404.html', status=404)
    except Exception:
        return HttpResponse('<h1>404 Not Found</h1>', status=404)


def handler500(request):
    from django.http import HttpResponse
    try:
        return render(request, '500.html', status=500)
    except Exception:
        return HttpResponse('<h1>500 Server Error</h1>', status=500)


urlpatterns = [
    path('health/', health),
    path('admin/', admin.site.urls),
    path('api/', include('apps.users.urls')),
    path('api/posts/', include('apps.posts.urls')),
    path('api/follows/', include('apps.follows.urls')),
    path('api/reports/', include('apps.reports.urls')),
    path('api/admin/', include('apps.reports.urls')),

    # Serve React app at root
    path('', react_app_fallback, name='index'),
]

# Serve static files
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Catch-all for React Router paths — MUST be last
urlpatterns.append(
    re_path(r'^(?!api|admin|health|static)(?P<fallback>.*)$', react_app_fallback)
)

# Custom error handlers — must reference the callable directly, not as strings
# (string form causes ViewDoesNotExist when the module itself has errors)
