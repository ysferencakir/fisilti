from django.urls import path

from .views import (
    AdminAuditLogView,
    AdminBanView,
    AdminPostActivateView,
    AdminPostDeactivateView,
    AdminPostListView,
    AdminPostStatsView,
    AdminReportedPostsView,
    AdminStatsView,
    AdminUnbanView,
    AdminUserListView,
    ReportCreateView,
)

urlpatterns = [
    path('reports/', ReportCreateView.as_view(), name='report-create'),
    path('admin/reports/', AdminReportedPostsView.as_view(), name='admin-reported-posts'),
    path('admin/posts/', AdminPostListView.as_view(), name='admin-post-list'),
    path('admin/posts/<int:pk>/deactivate/', AdminPostDeactivateView.as_view(), name='admin-post-deactivate'),
    path('admin/posts/<int:pk>/activate/', AdminPostActivateView.as_view(), name='admin-post-activate'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<str:username>/ban/', AdminBanView.as_view(), name='admin-user-ban'),
    path('admin/users/<str:username>/unban/', AdminUnbanView.as_view(), name='admin-user-unban'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('admin/stats/posts/', AdminPostStatsView.as_view(), name='admin-post-stats'),
    path('admin/audit-log/', AdminAuditLogView.as_view(), name='admin-audit-log'),
]
