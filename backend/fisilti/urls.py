from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.users.urls')),
    path('api/posts/', include('apps.posts.urls')),
    path('api/', include('apps.follows.urls')),
    path('api/', include('apps.reports.urls')),
]
