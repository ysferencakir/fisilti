from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def health(request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path('health/', health),
    path('admin/', admin.site.urls),
    path('api/', include('apps.users.urls')),
    path('api/posts/', include('apps.posts.urls')),
    path('api/follows/', include('apps.follows.urls')),
    path('api/reports/', include('apps.reports.urls')),
    path('api/admin/', include('apps.reports.urls')),
]
