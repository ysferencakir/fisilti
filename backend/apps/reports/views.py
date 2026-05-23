from datetime import timedelta

from django.db import models
from django.db.models import Count, Value, Q
from django.db.models.functions import Coalesce
from django.utils import timezone
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.posts.models import Post
from apps.users.models import User
from apps.users.permissions import IsEmailVerified

from .models import AuditLog, Report
from .serializers import AdminUserSerializer, AuditLogSerializer, ReportedPostSerializer, ReportSerializer


class IsAdmin(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == 'admin'


# --- Kullanıcı endpoint ---

class ReportCreateView(generics.CreateAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsEmailVerified]


# --- Admin endpoint'leri ---

class AdminReportedPostsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        status_filter = request.query_params.get('status', 'pending')
        reported_posts = (
            Post.objects
            .filter(reports__status=status_filter)
            .annotate(report_count=Count('reports', filter=models.Q(reports__status=status_filter)))
            .prefetch_related('reports')
            .select_related('author')
            .distinct()
            .order_by('-report_count')
        )
        serializer = ReportedPostSerializer(reported_posts, many=True)
        return Response(serializer.data)


class AdminPostListView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        from apps.posts.serializers import PostSerializer
        is_active_param = request.query_params.get('is_active')
        qs = Post.objects.select_related('author').prefetch_related('reports').all()
        if is_active_param == 'false':
            qs = qs.filter(is_active=False)
        elif is_active_param == 'true':
            qs = qs.filter(is_active=True)
        serializer = PostSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)


class AdminPostDeactivateView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            post = Post.objects.get(pk=pk)
        except Post.DoesNotExist:
            return Response({'detail': 'Gönderi bulunamadı.'}, status=404)
        post.is_active = False
        post.save()
        Report.objects.filter(post=post, status='pending').update(
            status='resolved',
            resolved_at=timezone.now()
        )
        AuditLog.objects.create(
            admin=request.user,
            action='deactivate',
            target_post=post,
            detail=f'Post {post.id} pasife alındı.',
        )
        return Response({'detail': 'Gönderi pasife alındı.'})


class AdminPostActivateView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            post = Post.objects.get(pk=pk)
        except Post.DoesNotExist:
            return Response({'detail': 'Gönderi bulunamadı.'}, status=404)
        post.is_active = True
        post.save()
        AuditLog.objects.create(
            admin=request.user,
            action='activate',
            target_post=post,
            detail=f'Post {post.id} aktife alındı.',
        )
        return Response({'detail': 'Gönderi aktife alındı.'})


class AdminUserListView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        search = request.query_params.get('search', '').strip()
        if search and len(search) > 100:
            return Response({'detail': 'Arama kriteri çok uzun.'}, status=400)
        qs = User.objects.all()
        if search:
            qs = qs.filter(username__icontains=search)[:100]
        serializer = AdminUserSerializer(qs, many=True)
        return Response(serializer.data)


class AdminBanView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, username):
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'detail': 'Kullanıcı bulunamadı.'}, status=404)

        if user.username == request.user.username:
            return Response({'detail': 'Kendi hesabınıza işlem yapamazsınız.'}, status=400)

        # Son admin koruması
        if user.role == 'admin' and User.objects.filter(role='admin', is_active=True).count() <= 1:
            return Response({'detail': 'Son admin hesabı banlanamaz.'}, status=400)

        duration_days = request.data.get('duration_days')
        user.is_banned = True
        user.banned_until = timezone.now() + timedelta(days=int(duration_days)) if duration_days else None
        user.save()

        detail = f'Geçici ban: {duration_days} gün' if duration_days else 'Kalıcı ban'
        AuditLog.objects.create(admin=request.user, action='ban', target_user=user, detail=detail)
        return Response({'detail': detail})


class AdminUnbanView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, username):
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'detail': 'Kullanıcı bulunamadı.'}, status=404)

        if user.username == request.user.username:
            return Response({'detail': 'Kendi hesabınıza işlem yapamazsınız.'}, status=400)

        user.is_banned = False
        user.banned_until = None
        user.save()

        AuditLog.objects.create(admin=request.user, action='unban', target_user=user, detail='Ban kaldırıldı.')
        return Response({'detail': 'Ban kaldırıldı.'})


class AdminStatsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        today = timezone.now().date()
        users_by_country = list(
            User.objects
            .annotate(country_label=Coalesce('country', Value('Bilinmeyen')))
            .values('country_label')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        # Boş string'leri de "Bilinmeyen" olarak birleştir
        merged = {}
        for row in users_by_country:
            key = row['country_label'] if row['country_label'] else 'Bilinmeyen'
            merged[key] = merged.get(key, 0) + row['count']
        users_by_country = [{'country': k, 'count': v} for k, v in sorted(merged.items(), key=lambda x: -x[1])]
        data = {
            'total_users': User.objects.count(),
            'verified_users': User.objects.filter(is_email_verified=True).count(),
            'banned_users': User.objects.filter(is_banned=True).count(),
            'active_users': User.objects.filter(is_active=True, is_banned=False).count(),
            'total_posts': Post.objects.count(),
            'active_posts': Post.objects.filter(is_active=True).count(),
            'passive_posts': Post.objects.filter(is_active=False).count(),
            'total_reports': Report.objects.count(),
            'posts_today': Post.objects.filter(created_at__date=today).count(),
            'users_by_country': users_by_country,  # [{'country': ..., 'count': ...}]
        }
        return Response(data)


class AdminPostStatsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        from datetime import date
        start_str = request.query_params.get('start')
        end_str = request.query_params.get('end')
        try:
            start_date = date.fromisoformat(start_str)
            end_date = date.fromisoformat(end_str)
        except (TypeError, ValueError):
            return Response({'detail': 'Geçerli start ve end tarihi girin (YYYY-MM-DD).'}, status=400)

        if start_date > end_date:
            return Response({'detail': 'Başlangıç tarihi bitiş tarihinden sonra olamaz.'}, status=400)

        daily_qs = (
            Post.objects
            .filter(created_at__date__range=[start_date, end_date])
            .values('created_at__date')
            .annotate(count=Count('id'))
            .order_by('created_at__date')
        )
        daily = [{'date': str(row['created_at__date']), 'count': row['count']} for row in daily_qs]
        return Response({
            'start': str(start_date),
            'end': str(end_date),
            'daily': daily,
            'total': sum(row['count'] for row in daily),
        })


class AdminReportResolveView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, report_id):
        try:
            report = Report.objects.get(pk=report_id)
        except Report.DoesNotExist:
            return Response({'detail': 'Rapor bulunamadı.'}, status=404)

        report.status = 'resolved'
        report.resolved_at = timezone.now()
        report.save()

        AuditLog.objects.create(
            admin=request.user,
            action='deactivate',
            target_post=report.post,
            detail=f'Rapor {report.id} çözüldü.',
        )
        return Response({'detail': 'Rapor çözüldü.'})


class AdminReportDismissView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, report_id):
        try:
            report = Report.objects.get(pk=report_id)
        except Report.DoesNotExist:
            return Response({'detail': 'Rapor bulunamadı.'}, status=404)

        report.status = 'dismissed'
        report.resolved_at = timezone.now()
        report.save()

        AuditLog.objects.create(
            admin=request.user,
            action='activate',
            target_post=report.post,
            detail=f'Rapor {report.id} reddedildi.',
        )
        return Response({'detail': 'Rapor reddedildi.'})


class AdminAuditLogView(generics.ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AuditLogSerializer
    queryset = AuditLog.objects.select_related('admin', 'target_user', 'target_post').all()
    page_size = 20

    def get_queryset(self):
        return super().get_queryset()
