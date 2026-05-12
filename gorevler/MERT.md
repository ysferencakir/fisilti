# Fısıltı — Mert Kaan Candemir

**Rol:** Web Geliştirici / Test Uzmanı  
**Modül:** Raporlama & Admin Paneli  
**Branch adı:** `feature/mert-reports`

---

## Genel Bilgiler

**Stack:** Django + DRF · React + Vite · PostgreSQL · JWT  
**Backend:** http://localhost:8000  
**Frontend:** http://localhost:5173

### Kurulum

```bash
git clone <repo-url> && cd fısıltı
cp .env.example backend/.env

cd backend && pip install -r requirements.txt
cd ../frontend && npm install
```

**Çalıştırma:**
```bash
# Terminal 1
cd backend && python manage.py runserver

# Terminal 2
cd frontend && npm run dev
```

### Git Workflow

```bash
git checkout -b feature/mert-reports

git add .
git commit -m "feat(reports): kısa açıklama"
# Örnekler:
#   feat(reports): Report ve AuditLog modelleri
#   feat(admin): ban/unban ve istatistik endpoint'leri

git pull origin main --rebase
git push origin feature/mert-reports
# GitHub'da Pull Request aç → Yusuf merge eder
```

---

## Bağımlılık Durumu

- **Senden önce gelmesi gereken:** Yusuf (altyapı) + Kadircan (`User`) + Görkem (`Post`) migration'ları
- **Sana bağımlı olan:** Kimse — sen son paralel modülsün.
- **Önemli:** Admin endpoint'leri `IsAdmin` permission class'ına bağlı — `User.role == 'admin'` olmalı. Kadircan'ın admin kullanıcı oluşturduğundan emin ol.

---

## Modülün: `apps/reports/`

### `models.py`

```
Report
├── reporter        FK → User, on_delete=CASCADE
├── post            FK → Post, on_delete=CASCADE
├── reason          CharField — zorunlu
│                   Seçenekler: 'spam', 'inappropriate', 'harassment', 'misinformation', 'other'
│                   Türkçe: Spam / Uygunsuz İçerik / Taciz / Yanlış Bilgi / Diğer
├── created_at      DateTimeField, auto_now_add
└── Meta
    └── unique_together = ('reporter', 'post')   ← aynı gönderi iki kez raporlanamaz

AuditLog  (kritik admin işlemlerinin logu)
├── admin           FK → User, on_delete=SET_NULL, null=True
│                   → İşlemi yapan admin
├── action          CharField
│                   Seçenekler: 'ban', 'unban', 'deactivate', 'activate'
├── target_user     FK → User, on_delete=SET_NULL, null=True
│                   → Hedef kullanıcı (ban/unban için)
├── target_post     FK → Post, on_delete=SET_NULL, null=True
│                   → Hedef gönderi (deactivate/activate için)
├── detail          TextField, blank=True
│                   → Ban süresi, ek açıklama vb.
└── created_at      DateTimeField, auto_now_add
```

> ⚠️ `AuditLog.detail` alanına asla şifre, token veya tam e-posta yazma (PV-11). Username veya ID yeterli.

---

### `serializers.py`

**`ReportSerializer`** — kullanıcı rapor oluştururken:

| Alan | Yön | Kural |
|---|---|---|
| `post_id` | write-only | Input — hangi gönderi raporlanıyor |
| `reason` | write + read | Zorunlu; seçeneklerden biri olmalı |
| `id`, `reporter_username`, `post_id`, `post_content`, `post_author`, `reason`, `created_at` | read-only | Output |

**Validasyonlar:**
- `post_id`: gerçek ve `is_active=True` olan gönderi mi? → değilse 400
- `reason`: geçerli seçeneklerden biri mi? → DRF choices otomatik kontrol eder
- Aynı kullanıcı bu gönderiyi daha önce raporladı mı? → 400
- `reporter = request.user` olarak kaydet

---

**`ReportedPostSerializer`** — admin özet görünümü için (post bazında gruplu):

| Alan | Açıklama |
|---|---|
| `post_id` | Gönderi ID |
| `post_content` | Gönderi içeriği |
| `post_author` | Yazar kullanıcı adı |
| `post_is_active` | Aktif mi / pasif mi |
| `report_count` | Kaç kez raporlandı |
| `reasons` | Verilen gerekçelerin listesi: `["spam", "harassment", ...]` |
| `reports` | Detay: `[{reporter_username, reason, created_at}]` |

---

**`AuditLogSerializer`:**
Alanlar: `id`, `admin_username`, `action`, `target_user_username`, `target_post_id`, `detail`, `created_at`

---

### `views.py`

#### `IsAdmin` permission class

```python
from rest_framework.permissions import IsAuthenticated

class IsAdmin(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == 'admin'
```

---

#### Kullanıcı endpoint'leri

| View | Endpoint | Yetki | İş Mantığı |
|---|---|---|---|
| `ReportCreateView` | `POST /api/reports/` | Giriş + doğrulanmış | `permission_classes = [IsEmailVerified]`; `from apps.users.permissions import IsEmailVerified` |

---

#### Admin endpoint'leri — hepsinde `IsAdmin` zorunlu

| View | Endpoint | İş Mantığı |
|---|---|---|
| `AdminReportedPostsView` | `GET /api/admin/reports/` | Raporlanan gönderileri **post bazında grupla** — her gönderi için `report_count` + `reasons` + tüm `reports` detayı |
| `AdminPostListView` | `GET /api/admin/posts/?is_active=false` | Tüm gönderileri listele; query param string olarak gelir — `'false'`/`'true'`/`None` karşılaştır: `qs.filter(is_active=False)` / `qs.filter(is_active=True)` / `qs.all()` |
| `AdminPostDeactivateView` | `POST /api/admin/posts/<id>/deactivate/` | `is_active = False`; **AuditLog yaz** |
| `AdminPostActivateView` | `POST /api/admin/posts/<id>/activate/` | `is_active = True`; **AuditLog yaz** |
| `AdminUserListView` | `GET /api/admin/users/?search=<q>` | Tüm kullanıcıları listele (e-posta + ban durumu dahil) |
| `AdminBanView` | `POST /api/admin/users/<username>/ban/` | `is_banned=True`; `banned_until` hesapla; **AuditLog yaz**; **BR-16 kontrolü** |
| `AdminUnbanView` | `POST /api/admin/users/<username>/unban/` | `is_banned=False`, `banned_until=None`; **AuditLog yaz**; **BR-16 kontrolü** |
| `AdminStatsView` | `GET /api/admin/stats/` | Genel istatistikler + coğrafi dağılım |
| `AdminPostStatsView` | `GET /api/admin/stats/posts/?start=<date>&end=<date>` | Tarih aralığına göre günlük gönderi sayıları |
| `AdminAuditLogView` | `GET /api/admin/audit-log/` | Sayfalı AuditLog listesi |

---

**`AdminBanView` — geçici vs kalıcı ban:**

Request body:
```json
{ "duration_days": 7 }   // geçici ban
{ }                       // kalıcı ban (duration_days yok ya da null)
```

Mantık:
```python
duration_days = request.data.get('duration_days')
user.is_banned = True
user.banned_until = timezone.now() + timedelta(days=duration_days) if duration_days else None
user.save()

# AuditLog'a detail ekle
detail = f"Geçici ban: {duration_days} gün" if duration_days else "Kalıcı ban"
AuditLog.objects.create(admin=request.user, action='ban', target_user=user, detail=detail)
```

**BR-16 kontrolü (ban + unban):**
```python
if target.username == request.user.username:
    return Response({'detail': 'Kendi hesabınıza işlem yapamazsınız.'}, status=400)
```

---

**`AdminReportedPostsView` — post bazında gruplama (N+1 olmadan):**

```python
from django.db.models import Count
from apps.posts.models import Post

# Raporlanmış gönderileri tek sorguda çek — N+1 YOK
reported_posts = (
    Post.objects
    .filter(reports__isnull=False)   # en az 1 raporu olan gönderiler
    .annotate(report_count=Count('reports'))
    .prefetch_related('reports__reporter')   # reporter'ları önceden yükle
    .select_related('author')
    .distinct()
    .order_by('-report_count')
)

# Sonra ReportedPostSerializer ile serialize et
```

> ⚠️ `Report.objects.all()` çekip Python'da gruplamaya **çalışma** — büyük veri setlerinde çöker. Yukarıdaki `annotate` + `prefetch_related` yaklaşımı tek sorguda hepsini çeker.

---

**`AdminStatsView` dönecek JSON:**

```json
{
  "total_users": 150,
  "verified_users": 120,
  "banned_users": 5,
  "active_users": 145,    // is_active=True AND is_banned=False olan kullanıcılar
  "total_posts": 800,
  "active_posts": 780,
  "passive_posts": 20,
  "total_reports": 45,
  "posts_today": 12,
  "users_by_country": [
    { "country": "Türkiye", "count": 90 },
    { "country": "KKTC", "count": 40 },
    { "country": "", "count": 20 }
  ]
}
```

`users_by_country` için:
```python
from django.db.models import Count
User.objects.values('country').annotate(count=Count('id')).order_by('-count')
```

---

**`AdminPostStatsView` dönecek JSON:**

```json
{
  "start": "2026-05-01",
  "end": "2026-05-12",
  "daily": [
    { "date": "2026-05-01", "count": 12 },
    { "date": "2026-05-02", "count": 8 }
  ],
  "total": 20
}
```

Sorgu:
```python
from django.db.models import Count
Post.objects.filter(
    created_at__date__range=[start_date, end_date]
).values('created_at__date').annotate(count=Count('id')).order_by('created_at__date')
```

---

### `urls.py`

```
POST  /api/reports/
GET   /api/admin/reports/
GET   /api/admin/posts/
POST  /api/admin/posts/<id>/deactivate/
POST  /api/admin/posts/<id>/activate/
GET   /api/admin/users/
POST  /api/admin/users/<username>/ban/
POST  /api/admin/users/<username>/unban/
GET   /api/admin/stats/
GET   /api/admin/stats/posts/
GET   /api/admin/audit-log/
```

---

## Frontend

Tüm metinler Türkçe (OR-6). Mobil uyumlu (QA-13).

### `pages/Admin.jsx`

Erişim: `user.role === 'admin'` — Yusuf'un `AdminRoute` bileşeni bunu zaten kontrol eder.

---

**1. İstatistik Kartları** — `GET /api/admin/stats/`

Sayfa yüklenince çek. Kart düzeni:

| Kart | Değer |
|---|---|
| Toplam Kullanıcı | `total_users` |
| Doğrulanmış | `verified_users` |
| Banlı | `banned_users` |
| Toplam Gönderi | `total_posts` |
| Aktif Gönderi | `active_posts` |
| Pasif Gönderi | `passive_posts` |
| Toplam Rapor | `total_reports` |
| Bugünkü Gönderi | `posts_today` |

**Coğrafi Dağılım Tablosu** (`users_by_country`):
| Ülke | Kullanıcı Sayısı |
|---|---|
| Türkiye | 90 |
| KKTC | 40 |

---

**2. Tarih Aralığı Gönderi İstatistiği** — `GET /api/admin/stats/posts/?start=...&end=...`

- Başlangıç tarihi + bitiş tarihi seçici (date input)
- "Listele" butonu → API çağır
- Sonucu tablo olarak göster: Tarih | Gönderi Sayısı

---

**3. Raporlar Tablosu** — `GET /api/admin/reports/`

Sütunlar: **Gönderi İçeriği** | **Yazar** | **Rapor Sayısı** | **Gerekçeler** | **Durum** | **İşlemler**

- Her satır genişletilebilir (accordion) → Raporlayan kullanıcılar + tarihleri + gerekçeleri listeler
- **"Pasife Al"** butonu → `POST /api/admin/posts/<id>/deactivate/` → satırda durum güncellenir
- **"Aktif Et"** butonu → `POST /api/admin/posts/<id>/activate/` → satırda durum güncellenir

---

**4. Kullanıcı Yönetimi** — `GET /api/admin/users/?search=<q>`

- Kullanıcı adı arama alanı
- Tablo: **Kullanıcı Adı** | **E-Posta** | **Ülke** | **Doğrulanmış** | **Ban Durumu** | **Ban Bitiş** | **İşlemler**
- **"Banla"** butonu → küçük form açılır:
  - "Geçici" seçilirse gün sayısı giriş alanı
  - "Kalıcı" seçilirse süre yok
  - "Uygula" → `POST /api/admin/users/<username>/ban/ { duration_days: ... }`
- **"Ban Kaldır"** butonu → `POST /api/admin/users/<username>/unban/`
- **Kendi hesabı için butonlar devre dışı** (BR-16)
- Tıklama sonrası tablo satırı güncellenmeli

---

**5. Audit Log** — `GET /api/admin/audit-log/`

- Tablo: **Admin** | **İşlem** | **Hedef** | **Detay** | **Tarih**
- Sayfalama: "Daha fazla yükle"

---

## Sana Ait Çapraz Kesim Gereksinimleri

| Gereksinim | Ne Yapacaksın |
|---|---|
| BR-7: Aynı gönderi iki kez raporlanamaz | `unique_together` + serializer validasyon |
| BR-8/BR-9: Raporlar sadece admin görebilir | `IsAdmin` permission class |
| BR-10: Ban sadece admin yapabilir | `IsAdmin` permission class |
| BR-16: Admin kendi yetkisini kaldıramaz | ban/unban view'larında `target == request.user` kontrolü |
| BR-17: Kritik işlemler loglanır | Her admin işleminde `AuditLog.objects.create(...)` |
| BR-18: Veri silinmez | `is_active=False`, `is_banned=True`; `delete()` çağrılmaz |
| SR-4: Admin paneli yetkisiz erişime kapalı | `IsAdmin` permission class tüm admin view'larında |
| SR-11: Kritik işlem logu | `AuditLog` — ban, unban, deactivate, activate |
| SR-15: KVKK/GDPR | Veri silmek yerine pasife al |
| PV-11: Log'larda hassas veri yok | `AuditLog.detail`'e şifre/token/email yazma |
| PR-7: Admin istatistik ≤ 5 sn | `annotate` ile tek sorguda çek; N+1 yapma |

---

## Tamamlanma Kontrol Listesi

**Backend:**
- [ ] `models.py` — Report (reason dahil), AuditLog
- [ ] `serializers.py` — ReportSerializer, ReportedPostSerializer, AuditLogSerializer
- [ ] `permissions.py` (veya `views.py`) — `IsAdmin` sınıfı; `IsEmailVerified` Kadircan'dan import et
- [ ] `views.py` — 11 view (tablo üzerindeki tüm view'lar)
- [ ] `urls.py` — 11 endpoint
- [ ] Migration: `makemigrations reports` + `migrate`

**Frontend:**
- [ ] `pages/Admin.jsx` — 5 bölüm (istatistik + tarih aralığı + raporlar + kullanıcı yönetimi + audit log)

**Test (temel):**
- [ ] Normal kullanıcı `/api/admin/` endpoint'lerine erişince 403 geliyor mu?
- [ ] Aynı gönderiyi iki kez rapor etme → 400 geliyor mu?
- [ ] `reason` alanı olmadan rapor → 400 geliyor mu?
- [ ] Geçici ban → `banned_until` doğru tarih mi?
- [ ] Kalıcı ban → `banned_until = null` mı?
- [ ] Banlı kullanıcı login denesin → 403 geliyor mu?
- [ ] Admin kendi hesabını banlamaya çalışsın → 400 geliyor mu? (BR-16)
- [ ] Deactivate işlemi sonrası AuditLog kaydı oluştu mu?
- [ ] Ban işlemi sonrası AuditLog kaydı oluştu mu?
- [ ] Stats endpoint'i ≤ 5 sn'de dönüyor mu?
- [ ] `users_by_country` doğru verilerle geliyor mu?
- [ ] Tarih aralığı filtresi doğru çalışıyor mu?
