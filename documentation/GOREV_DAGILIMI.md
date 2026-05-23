# Fısıltı — Modül Bazlı Görev Dağılımı

> **Stack:** Django + DRF · React + Vite · PostgreSQL · JWT  
> **Deadline:** 12.06.2026  
> **Kaynak:** SRS v2 (03.05.26) + PPM v1

Her kişi bir modülün **backend (model → serializer → view → url) + frontend (sayfa/bileşen)** tarafını
uçtan uca geliştirir. Modüller arası bağımlılık asgari seviyede tutulmuştur.

---

## Bağımlılık Sırası

```
[1] Proje Altyapısı (Yusuf)
        ↓
[2] Auth Modülü (Kadircan)   ←─ diğer tüm modüller User modeline bağımlı
        ↓
[3] Post  (Görkem)  ──┐
[3] Follow (Kaan)  ──┤──── paralel geliştirilebilir
[3] Report (Mert)  ──┘
        ↓
[4] Entegrasyon Testi (Hepsi)
```

---

## Proje Dizin Yapısı

```
fısıltı/
├── .gitignore
├── .env.example
├── GOREV_DAGILIMI.md
├── docker-compose.yml              ← Yusuf
│
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env                        ← .env.example'dan kopyala
│   ├── fisilti/
│   │   ├── settings.py             ← Yusuf (hazır, dokunma)
│   │   └── urls.py                 ← Yusuf (tüm include'lar buraya)
│   │
│   └── apps/
│       ├── users/                  ← Kadircan
│       │   ├── models.py           (User, EmailVerification, PasswordResetToken, LoginAttempt)
│       │   ├── serializers.py
│       │   ├── views.py
│       │   └── urls.py
│       │
│       ├── posts/                  ← Görkem
│       │   ├── models.py           (Post, Repost)
│       │   ├── serializers.py
│       │   ├── views.py
│       │   └── urls.py
│       │
│       ├── follows/                ← Kaan
│       │   ├── models.py           (Follow)
│       │   ├── serializers.py
│       │   ├── views.py
│       │   └── urls.py
│       │
│       └── reports/                ← Mert
│           ├── models.py           (Report, AuditLog)
│           ├── serializers.py
│           ├── views.py            (report-create + tüm admin view'ları)
│           └── urls.py
│
└── frontend/
    └── src/
        ├── api/index.js            ← Yusuf
        ├── context/AuthContext.jsx ← Yusuf
        ├── App.jsx                 ← Yusuf
        ├── components/
        │   ├── Navbar.jsx          ← Yusuf
        │   └── PostCard.jsx        ← Görkem
        └── pages/
            ├── Login.jsx           ← Kadircan
            ├── Register.jsx        ← Kadircan
            ├── VerifyEmail.jsx     ← Kadircan
            ├── Home.jsx            ← Görkem
            ├── Profile.jsx         ← Kaan
            └── Admin.jsx           ← Mert
```

---

## Kurulum (Herkes)

```bash
git clone <repo-url> && cd fısıltı
cp .env.example backend/.env    # .env'i aç, DB bilgilerini düzenle

cd backend && pip install -r requirements.txt
cd ../frontend && npm install
```

**PostgreSQL:**
```bash
psql -U postgres
CREATE DATABASE fisilti;
CREATE USER fisilti_user WITH PASSWORD 'fisilti_pass';
GRANT ALL PRIVILEGES ON DATABASE fisilti TO fisilti_user;
```

**Çalıştırma:**
```bash
# Terminal 1 — Backend
cd backend && python manage.py runserver        # → http://localhost:8000

# Terminal 2 — Frontend
cd frontend && npm run dev                      # → http://localhost:5173
```

---

## Kararlaştırılan Parametreler

| TBD Kodu | Konu | Karar |
|---|---|---|
| TBD-03 | Gönderi karakter limiti | **280 karakter** |
| TBD-04 | Şifre politikası | **min 8 karakter** |
| TBD-05 | E-posta doğrulama kodu süresi | **10 dakika** |
| TBD-06 | Şifre sıfırlama | **e-posta ile UUID token linki, 1 saat geçerli** |
| TBD-09 | DB yedekleme periyodu | **günlük otomatik yedekleme** (OR-4) |
| TBD-10 | Log saklama süresi | **90 gün** |
| TBD-12 | Performans üst sınırı | **100 eşzamanlı kullanıcı** (PR-4) |
| TBD-13 | İçerik moderasyon kuralları | Küfür, şiddet, sahte bilgi → admin pasife alır |

---

## Modüller Arası Koordinasyon Notu

### `is_following` Alanı

`UserDetailView` (Kadircan / `apps/users/`) profil bilgisi dönerken `is_following` alanını da içermesi gerekir.
Follow modeli `apps/follows/models.py`'de olduğundan döngüsel import riskini önlemek için:

```python
# apps/users/serializers.py içinde UserSerializer'da
def get_is_following(self, obj):
    request = self.context.get('request')
    if not request or not request.user.is_authenticated:
        return False
    from apps.follows.models import Follow           # ← lazy import, döngüsel import yok
    return Follow.objects.filter(follower=request.user, following=obj).exists()
```

`UserDetailView`'da serializer'a `context={'request': request}` geçmeyi unutma.
Kaan bu alanı kullanır ama modeli Kadircan tanımlar. İki kişi bunu birlikte kontrol etmeli.

---

---

## Modül 1 — Proje Altyapısı · Yusuf Eren Çakır

**Bağımlılık:** Yok — ilk tamamlanacak.

### Backend

**`apps/*/apps.py`** — Her app için AppConfig:
- `name = 'apps.<appname>'`, `label = '<appname>'`
- Dört app: `users`, `posts`, `follows`, `reports`

**`fisilti/urls.py`**
- Dört app'in `urls.py`'sini `/api/` prefix'iyle `include()` ile ekle

**`fisilti/settings.py`** — aşağıdaki blokları ekle:

*Loglama (OR-19, PV-11):*
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs/django.log',
        },
    },
    'loggers': {
        'django': {'handlers': ['file'], 'level': 'ERROR'},
    },
}
```
> ⚠️ Log'lara asla şifre, token veya tam e-posta yazılmamalı (PV-11). Kullanıcı ID veya username yeterli.

*Sayfalama (PR-5):*
```python
REST_FRAMEWORK = {
    ...
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}
```

*Önbellekleme (PR-6) — isteğe bağlı, yoğun trafik için:*
```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}
```

*Test / Production ortam ayrımı (OR-20):*
- `settings.py` tek dosya kalacak; `.env` değişkeniyle `DEBUG=True/False` kontrol edilir
- `DEBUG=False` iken `ALLOWED_HOSTS` production domain'ini içermeli
- Docker'da `backend` servisi `gunicorn` ile çalışmalı (geliştirmede `runserver`)

### Frontend

**`src/api/index.js`**
- axios instance, `baseURL = 'http://localhost:8000/api'`
- **Request interceptor:** `Authorization: Bearer <accessToken>` header'ı ekle
- **Response interceptor:**
  - 401 gelince `POST /auth/token/refresh/` çağır → yeni access token al → isteği tekrarla
  - Refresh da başarısız olursa otomatik logout (SR-7)

**`src/context/AuthContext.jsx`**
- State: `{ user, accessToken, loading }`
- `login(email, password)` → token al → `GET /users/me/` → state kaydet
- `logout()` → `POST /auth/logout/` → state + localStorage temizle
- Uygulama açılışında localStorage'dan token okuyup user yükle
- `user.role` context üzerinden erişilebilir olmalı

**`src/App.jsx`**
- `BrowserRouter` + `Routes`
- `<ProtectedRoute>`: `user` yoksa `/login`'e yönlendir
- `<AdminRoute>`: `user.role !== 'admin'` ise `/`'a yönlendir

| Route | Bileşen | Koruma |
|---|---|---|
| `/` | `Home` | ProtectedRoute |
| `/login` | `Login` | Giriş yapılmışsa `/`'a yönlendir |
| `/register` | `Register` | Giriş yapılmışsa `/`'a yönlendir |
| `/verify-email` | `VerifyEmail` | — |
| `/profile/:username` | `Profile` | — |
| `/admin` | `Admin` | AdminRoute |

**`src/components/Navbar.jsx`**
- Giriş varsa: kullanıcı adı, `/profile/<username>` linki, çıkış butonu; admin ise "Admin Panel" linki
- Giriş yoksa: "Giriş Yap", "Kayıt Ol" linkleri

**`docker-compose.yml`**
- `db`: PostgreSQL, `.env`'den credentials, named volume ile veri kalıcılığı
- `backend`: Django (geliştirmede `runserver`, production `gunicorn`), `db`'ye bağımlı, port 8000
- `frontend`: Vite, port 5173

**Güvenlik notları (SR-8):**
- Django ORM SQL injection'a karşı korur — `raw()` veya `extra()` kullanılmasın
- DRF serializer'lar output'u escape eder
- `CORS_ALLOWED_ORIGINS` sadece frontend origin'ini içermeli
- `DEBUG=False` iken `SECRET_KEY` güçlü bir değer olmalı

---

## Modül 2 — Auth & Kullanıcı · Kadircan Alaca

**Bağımlılık:** Altyapı (Yusuf) hazır olmalı.  
**Diğer modüller User modeline bağımlı** — migration'ları tamamlayıp commit'le.

### Backend — `apps/users/`

**`models.py`**

`User` — `AbstractUser`'dan türet:
| Alan | Tip | Kural |
|---|---|---|
| `email` | EmailField, unique | `USERNAME_FIELD = 'email'` |
| `username` | CharField, unique | Görüntüleme adı |
| `role` | CharField | `'user'` / `'admin'`, default `'user'` |
| `is_email_verified` | BooleanField | default `False` |
| `is_banned` | BooleanField | default `False` |
| `banned_until` | DateTimeField | null=True, blank=True — null = kalıcı ban; gelecek tarih = geçici ban; PDF Madde 2 |
| `country` | CharField(100) | blank=True — kayıt sırasında alınan ülke; coğrafi istatistik için; PDF Madde 3 |
| `created_at` | DateTimeField | auto_now_add |

**`banned_until` mantığı (login kontrolünde):**
- `is_banned=True` ve `banned_until=None` → kalıcı ban, girişi engelle
- `is_banned=True` ve `banned_until <= now()` → süre dolmuş, otomatik olarak `is_banned=False` yap, girişe izin ver
- `is_banned=True` ve `banned_until > now()` → geçici ban, girişi engelle ("Banınız <tarih>'e kadar devam etmektedir.")

`EmailVerification`:
| Alan | Tip | Kural |
|---|---|---|
| `user` | FK → User | on_delete=CASCADE |
| `code` | CharField(6) | 6 rastgele rakam |
| `expires_at` | DateTimeField | oluşturulma + 10 dk (TBD-05) |
| `is_used` | BooleanField | default `False` |
| `create_for_user(cls, user)` | classmethod | Önceki aktif kodları iptal et, yeni üret |
| `is_expired` | property | `timezone.now() > expires_at` |

`PasswordResetToken` — şifre sıfırlama için (TBD-06):
| Alan | Tip | Kural |
|---|---|---|
| `user` | FK → User | on_delete=CASCADE |
| `token` | UUIDField | `default=uuid.uuid4`, unique |
| `expires_at` | DateTimeField | oluşturulma + 1 saat |
| `is_used` | BooleanField | default `False` |

`LoginAttempt` — brute-force koruması (SR-2):
| Alan | Tip | Kural |
|---|---|---|
| `email` | EmailField | Deneme yapılan e-posta |
| `attempted_at` | DateTimeField | auto_now_add |
| `is_successful` | BooleanField | default `False` |

> Son 15 dakikada aynı e-posta için 5+ başarısız login → 429 dön (SR-2)

---

**`serializers.py`**

| Serializer | Alanlar | Kural |
|---|---|---|
| `RegisterSerializer` | `username`, `email`, `password`, `country` | password write-only, min 8 karakter (TBD-04); `country` opsiyonel; kayıt formunda T&C onayı gerekli (OR-12) |
| `VerifyEmailSerializer` | `email`, `code` | — |
| `PasswordResetRequestSerializer` | `email` | — |
| `PasswordResetConfirmSerializer` | `token`, `new_password` | token UUID formatında, new_password min 8 karakter |
| `UserSerializer` | `id`, `username`, `role`, `is_email_verified`, `is_banned`, `created_at`, `followers_count`, `following_count`, `is_following` | **email YOKTUR** (PV-1); `is_following` SerializerMethodField — *"Modüller Arası Koordinasyon Notu"* bölümüne bakınız |
| `MeSerializer` | `UserSerializer` alanları + `email` | Sadece `/users/me/` endpoint'inde kullanılır |

> ⚠️ `UserSerializer` email içermez. `MeSerializer` içerir. Kendi profilin dışında asla `MeSerializer` kullanma.

---

**`views.py`**

| View | Endpoint | Yetki | İş Mantığı |
|---|---|---|---|
| `RegisterView` | `POST /api/auth/register/` | Herkese açık | Kullanıcı oluştur → `EmailVerification.create_for_user()` → `send_mail()` |
| `VerifyEmailView` | `POST /api/auth/verify-email/` | Herkese açık | Kod + süre kontrolü → `is_email_verified = True`; throttle: 5 başarısız deneme / 10 dk → 429 (GEREKLILIK-4) |
| `ResendVerificationView` | `POST /api/auth/resend-verification/` | Herkese açık | E-posta ile yeni kod üret ve gönder — kayıt endpoint'inden ayrı olmalı |
| `LoginView` | `POST /api/auth/login/` | Herkese açık | SimpleJWT override: brute-force + ban + doğrulama kontrolü |
| `LogoutView` | `POST /api/auth/logout/` | Giriş zorunlu | SimpleJWT `TokenBlacklistView` |
| `TokenRefreshView` | `POST /api/auth/token/refresh/` | — | SimpleJWT hazır view |
| `PasswordResetRequestView` | `POST /api/auth/password-reset/` | Herkese açık | `PasswordResetToken` oluştur → link e-postayla gönder |
| `PasswordResetConfirmView` | `POST /api/auth/password-reset/confirm/` | Herkese açık | Token doğrula + süre kontrol + `is_used` kontrol → şifreyi güncelle |
| `UserListView` | `GET /api/users/?search=<q>` | Giriş zorunlu | Kullanıcı adına göre arama — kullanıcılar birbirini böyle bulur (UX) |
| `MeView` | `GET /api/users/me/` | Giriş zorunlu | `MeSerializer(request.user)` — email dahil |
| `UserDetailView` | `GET /api/users/<username>/` | Herkese açık | `UserSerializer(user, context={'request': request})` — email YOK, `is_following` var |
| `AccountDeactivateView` | `DELETE /api/users/me/` | Giriş zorunlu | `is_active = False`; veriyi silme (PV-10, BR-18) |

**`LoginView` için zorunlu kontrol sırası:**
1. Son 15 dakikada bu e-posta için 5+ başarısız deneme var mı? → `429` (SR-2)
2. Kimlik bilgileri doğru mu? → `LoginAttempt` kaydı oluştur (`is_successful` uygun şekilde)
3. `is_banned = True` → `403` + `"Hesabınız askıya alınmıştır."` (SR-10, BR-11)
4. `is_email_verified = False` → `403` + `"E-postanızı doğrulayın."` (BR-3)
5. Tüm kontroller geçilirse JWT access + refresh token üret

**`VerifyEmailView` için throttle (GEREKLILIK-4):**
- Aynı e-posta için son 10 dakikada 5 başarısız kod denemesi → `429`
- Bu `LoginAttempt`'ten bağımsız; ayrı bir sayaç veya DRF `throttle_classes` kullanılabilir

**`urls.py`**

```
POST  /api/auth/register/
POST  /api/auth/verify-email/
POST  /api/auth/resend-verification/
POST  /api/auth/login/
POST  /api/auth/logout/
POST  /api/auth/token/refresh/
POST  /api/auth/password-reset/
POST  /api/auth/password-reset/confirm/
GET   /api/users/?search=<q>
GET   /api/users/me/
DELETE /api/users/me/
GET   /api/users/<username>/
```

**Migration ve admin:**
```bash
python manage.py makemigrations users
python manage.py migrate
python manage.py createsuperuser
# Shell'den role'ü admin yap:
# python manage.py shell
# >>> from apps.users.models import User
# >>> User.objects.filter(email='admin@...').update(role='admin', is_email_verified=True)
```

---

### Frontend — Auth Sayfaları

Tüm frontend metinleri Türkçe olmalı (OR-6). Tüm sayfalar mobil uyumlu (responsive) tasarlanmalı (QA-13).

**`pages/Register.jsx`**
- Form: kullanıcı adı + email + şifre (min 8 karakter göstergesi) + **ülke (opsiyonel dropdown)** (PDF Madde 3: coğrafi dağılım için)
- **Kullanım Şartları + Gizlilik Politikası onay kutusu** — işaretlenmeden kayıt yapılamaz (OR-10, OR-12, PV-15)
- Submit → `api.post('/auth/register/')`
- Başarılı: `/verify-email`'e yönlendir (e-postayı state/queryParam ile taşı)

**`pages/VerifyEmail.jsx`**
- Form: email + 6 haneli kod
- Submit → `api.post('/auth/verify-email/')`
- **"Kodu Tekrar Gönder" butonu** → `api.post('/auth/resend-verification/', { email })` (kayıt endpoint'i değil)
- 429 gelince: "Çok fazla deneme, lütfen bekleyin." göster
- Başarılı: `/login`'e yönlendir

**`pages/Login.jsx`**
- Form: email + şifre
- Submit → `AuthContext.login()` çağır
- 429 → "Çok fazla hatalı deneme. Lütfen bekleyin."
- 403 ban → "Hesabınız askıya alınmıştır."
- 403 unverified → "E-postanızı doğrulayın." + `/verify-email`'e link
- Şifremi Unuttum linki → `/password-reset` (opsiyonel sayfa, Kadircan ekleyebilir)
- Başarılı: `/`'a yönlendir

---

## Modül 3 — Gönderi (Post) & Feed · Görkem Yümsel

**Bağımlılık:** Auth modülü (Kadircan) migration'ları hazır olmalı.

### Backend — `apps/posts/`

**`models.py`**

`Post`:
| Alan | Tip | Kural |
|---|---|---|
| `author` | FK → User | related_name `'posts'`; `on_delete=CASCADE` |
| `content` | TextField | max_length **280** (TBD-03) |
| `is_active` | BooleanField | default `True`; admin pasife alır, **DB'den delete() çağrılmaz** (BR-18) |
| `created_at` | DateTimeField | auto_now_add |
| `updated_at` | DateTimeField | auto_now — düzenleme tarihini tutar |
| Meta | ordering | `['-created_at']` |
| Meta | indexes | `[models.Index(fields=['author', 'is_active'])]` — feed sorgusu için (OR-3, PR-3) |

`Repost` — yeniden paylaşım:
| Alan | Tip | Kural |
|---|---|---|
| `user` | FK → User | Yeniden paylaşan kullanıcı; related_name `'reposts'`; `on_delete=CASCADE` |
| `post` | FK → Post | Orijinal gönderi; related_name `'reposts'`; `on_delete=CASCADE` |
| `created_at` | DateTimeField | auto_now_add |
| Meta | `unique_together` | `('user', 'post')` — aynı gönderi bir kez repost edilir |
| Meta | indexes | `[models.Index(fields=['user']), models.Index(fields=['post'])]` |

**Repost iş kuralları:**
- Kullanıcı kendi gönderisini repost edemez → 400
- `is_active=False` olan gönderi repost edilemez → 400
- E-posta doğrulanmamış kullanıcı repost edemez → 403 (BR-4)
- Admin bir gönderiyi pasife alınca, o gönderinin repost'ları feed'de artık görünmez (orijinal `is_active` kontrolünden geçer)

---

**`serializers.py`**

`PostSerializer` — tüm post yanıtlarında kullanılır:
| Alan | Kural |
|---|---|
| `id` | read-only |
| `author_username` | `source='author.username'`, read-only |
| `content` | max_length 280, yazılabilir |
| `is_active` | read-only — sadece admin değiştirir |
| `created_at`, `updated_at` | read-only |
| `repost_count` | SerializerMethodField — `obj.reposts.count()` |
| `is_reposted` | SerializerMethodField — `request.user` bu gönderiyi repost etti mi? (`context['request']` gerekir) |

`FeedItemSerializer` — feed endpoint'inde her öğe bu yapıda döner:
| Alan | Tip | Açıklama |
|---|---|---|
| `type` | string | `"post"` veya `"repost"` |
| `timestamp` | datetime | Sıralama için: post için `created_at`, repost için repost'un `created_at`'i |
| `reposted_by` | string \| null | `"repost"` ise repost eden kullanıcının `username`'i, `"post"` ise `null` |
| `reposted_at` | datetime \| null | `"repost"` ise repost tarihi, `"post"` ise `null` |
| `post` | PostSerializer | Orijinal gönderinin tüm verisi |

---

**`views.py`**

| View | Endpoint | Yetki | İş Mantığı |
|---|---|---|---|
| `FeedView` | `GET /api/posts/feed/` | Giriş zorunlu | Takip edilenlerden gelen orijinal post'lar + repost'lar birleştirilir, `timestamp` sıralı, sayfalı döner (aşağıda) |
| `PostCreateView` | `POST /api/posts/` | Giriş + doğrulanmış | `is_email_verified` kontrolü; `author = request.user` (BR-4) |
| `PostUpdateView` | `PATCH /api/posts/<id>/` | Sadece gönderi sahibi | Sadece `content` güncellenir (SRS 2.2, BR-5) |
| `UserPostsView` | `GET /api/posts/user/<username>/` | Herkese açık | Kullanıcının orijinal gönderileri (`is_active=True`, `author__is_banned=False`) |
| `UserRepostsView` | `GET /api/posts/user/<username>/reposts/` | Herkese açık | Kullanıcının yaptığı repost'lar — orijinal gönderi verisiyle birlikte döner |
| `PostDeleteView` | `DELETE /api/posts/<id>/` | Sadece gönderi sahibi | `author != request.user` ise `403` (BR-5) |
| `RepostView` | `POST /api/posts/<id>/repost/` | Giriş + doğrulanmış | Repost oluştur; kendi gönderisiyse 400; pasif gönderi ise 400; zaten repost ettiyse 400 |
| `RepostView` | `DELETE /api/posts/<id>/repost/` | Giriş zorunlu | Repost'u geri al; yoksa 404 |

**`FeedView` detaylı mantığı:**
```
following_ids = request.user'ın takip ettiği kullanıcıların ID listesi

posts_qs = Post nesneleri
    .filter(author_id__in=following_ids, is_active=True)
    .select_related('author')
    → her biri: type="post", timestamp=created_at

reposts_qs = Repost nesneleri
    .filter(user_id__in=following_ids, post__is_active=True)
    .select_related('user', 'post__author')
    → her biri: type="repost", timestamp=repost.created_at, reposted_by=user.username

İki listeyi birleştir → timestamp'e göre azalan sırayla sırala → sayfalama uygula
```

> ℹ️ Python'da iki farklı queryset'i birleştirip sıralamak için ikisini de listeye çevirip `sorted()` kullanılabilir.  
> Performans için `?page=1` ile küçük sayfalar al; büyük kullanıcı tabanında cursor-based pagination önerilebilir.

**Önemli kurallar:**
- `PostUpdateView`: `author != request.user` ise `403` — repost edilmiş gönderi de sadece orijinal yazar tarafından düzenlenebilir
- `RepostView` POST: aynı `(user, post)` çifti için `unique_together` zaten DB'de korur, ama 400 ile anlamlı hata dön
- N+1 sorgusundan kaçın: `select_related('author')` + `prefetch_related('reposts')` kullan
- DRF sayfalama (PAGE_SIZE=20) tüm liste endpoint'lerinde otomatik devreye girer

---

**`urls.py`**

```
GET    /api/posts/feed/
POST   /api/posts/
PATCH  /api/posts/<id>/
DELETE /api/posts/<id>/
POST   /api/posts/<id>/repost/
DELETE /api/posts/<id>/repost/
GET    /api/posts/user/<username>/
GET    /api/posts/user/<username>/reposts/
```

---

### Frontend

Tüm metin Türkçe (OR-6), tüm ekranlar mobil uyumlu (QA-13).

**`components/PostCard.jsx`**

Props: `{ item, currentUser, onDelete, onUpdate, onReport, onRepost }`

> `item` artık `FeedItemSerializer` çıktısı: `{ type, timestamp, reposted_by, reposted_at, post }`

- **Repost başlığı** — `type === "repost"` ise kartın üstünde:  
  `"🔁 <reposted_by> yeniden paylaştı"` (tıklanınca `/profile/<reposted_by>`)
- Yazar adı → `/profile/<post.author_username>`
- İçerik, tarih, `updated_at !== created_at` ise "(düzenlendi)" etiketi
- **Alt action bar:**
  - `post.author_username === currentUser.username` ise:
    - **Düzenle** → inline textarea → `PATCH /api/posts/<post.id>/`
    - **Sil** → onay → `DELETE /api/posts/<post.id>/`
  - `post.author_username !== currentUser.username` ise:
    - **Yeniden Paylaş** butonu — `post.is_reposted` ise aktif/dolu ikon; değilse pasif ikon  
      → tıklayınca: `is_reposted ? DELETE : POST` `/api/posts/<post.id>/repost/`  
      → repost sayacını anlık güncelle (`post.repost_count ± 1`)
    - **Rapor** → küçük modal açılır: gerekçe seçimi (Spam / Uygunsuz İçerik / Taciz / Yanlış Bilgi / Diğer) → "Gönder" → `POST /api/reports/ { post_id, reason }`; daha önce raporlandıysa buton devre dışı

**`pages/Home.jsx`**
- `GET /api/posts/feed/?page=1` — `FeedItemSerializer` listesi gelir
- Üstte: textarea (280 karakter sayacı) + "Paylaş" butonu → `POST /api/posts/`
- Gönderi listesi: her öğe için `PostCard` bileşeni (`item` prop'uyla)
- Kimseyi takip etmiyorsa: "Henüz kimseyi takip etmiyorsunuz."
- "Daha fazla yükle" butonu veya sonsuz scroll ile sonraki sayfa: `?page=2`

**`pages/Profile.jsx`** — Görkem + Kaan birlikte dikkat:
- "Gönderiler" sekmesi → `GET /api/posts/user/<username>/`
- **"Repost'lar" sekmesi** → `GET /api/posts/user/<username>/reposts/` — `PostCard` ile göster, başlıkta "🔁 Yeniden paylaşıldı"

---

## Modül 4 — Takip Sistemi & Profil · Kaan Soruş

**Bağımlılık:** Auth modülü (Kadircan) migration'ları hazır olmalı.

### Backend — `apps/follows/`

**`models.py`**

`Follow`:
| Alan | Tip | Kural |
|---|---|---|
| `follower` | FK → User | related_name `'following_set'` — "benim takip ettiklerim" |
| `following` | FK → User | related_name `'follower_set'` — "beni takip edenler" |
| `created_at` | DateTimeField | auto_now_add |
| Meta | `unique_together` | `('follower', 'following')` |
| Meta | indexes | `[models.Index(fields=['follower']), models.Index(fields=['following'])]` — feed sorgusu (OR-3, PR-3) |
| `clean()` | metod | `follower == following` ise `ValidationError` (BR-14) |

---

**`serializers.py`**

`UserMiniSerializer`: `id`, `username` — takipçi/takip listelerinde kullanılır (salt okunur)

> `is_following` alanı `UserSerializer`'dadır (Kadircan modülü). Kaan bunu kullanır ama tanımlamaz — koordinasyon notuna bak.

---

**`views.py`**

| View | Endpoint | Yetki | İş Mantığı |
|---|---|---|---|
| `FollowView` | `POST /api/follows/<username>/follow/` | Giriş + doğrulanmış | `get_or_create`; kendisini takip etmeye çalışırsa 400 (BR-14); `is_email_verified=False` ise 403 (BR-4) |
| `FollowView` | `DELETE /api/follows/<username>/follow/` | Giriş zorunlu | Kayıt varsa sil, yoksa 200 dön (hata verme) |
| `FollowersView` | `GET /api/follows/<username>/followers/` | Herkese açık | `follower_set` — `UserMiniSerializer` ile sayfalı liste |
| `FollowingView` | `GET /api/follows/<username>/following/` | Herkese açık | `following_set` — `UserMiniSerializer` ile sayfalı liste |

**Önemli kurallar:**
- BR-15: Takip tek yönlüdür; A→B takibi B→A anlamına gelmez
- Olmayan kullanıcı → 404
- DRF sayfalama otomatik devreye girer

---

**`urls.py`**

```
POST   /api/follows/<username>/follow/
DELETE /api/follows/<username>/follow/
GET    /api/follows/<username>/followers/
GET    /api/follows/<username>/following/
```

**Test senaryoları (zorunlu — SRS riskleri):**

| Senaryo | Beklenen Sonuç |
|---|---|
| Aynı kişiyi iki kez takip | 2. çağrıda 200, tekrar kayıt oluşmaz |
| Kendini takip | 400 |
| Takipten çık → tekrar çık | 200 (zaten yok, hata verme) |
| Doğrulanmamış kullanıcı takip eder | 403 |
| Takip sonrası feed kontrol | Takip edilenin gönderileri feed'de görünür |
| Takipten çıkış sonrası feed | Çıkılan kişinin gönderileri feed'den düşer |

---

### Frontend

Tüm metin Türkçe (OR-6), mobil uyumlu (QA-13).

**`pages/Profile.jsx`**

Route: `/profile/:username`

- `GET /api/users/<username>/` → kullanıcı bilgisi (`is_following` dahil; sayfa render öncesi yükle)
- `GET /api/posts/user/<username>/` → gönderileri (sayfalı)
- **Kullanıcı bilgi kartı:** kullanıcı adı, takipçi sayısı, takip edilen sayısı
- **Kendi profiliyse:**
  - "Hesabı Pasife Al" butonu → onay penceresi → `DELETE /api/users/me/` → logout (PV-10)
- **Başkasının profiliyse:**
  - `is_following = true` → "Takipten Çık" → `DELETE .../follow/`
  - `is_following = false` → "Takip Et" → `POST .../follow/`
  - Tıklamada sayfa yenilemeden buton durumunu ve takipçi sayısını güncelle
- **İki sekme:**
  - "Gönderiler" → `GET /api/posts/user/<username>/` — orijinal gönderiler, `PostCard` ile
  - "Repost'lar" → `GET /api/posts/user/<username>/reposts/` — yeniden paylaşımlar, `PostCard` ile (başlıkta "🔁 Yeniden paylaşıldı" banner'ı)
- Gönderi ve repost kartlarında düzenle/sil/repost-geri-al butonları kendi profilinde aktif
- Kullanıcı bulunamazsa: 404 mesajı
- Kullanıcı banlıysa: "Bu hesap askıya alınmıştır." mesajı

---

## Modül 5 — Raporlama & Admin · Mert Kaan Candemir

**Bağımlılık:** Auth (Kadircan) + Post (Görkem) migration'ları hazır olmalı.

### Backend — `apps/reports/`

**`models.py`**

`Report`:
| Alan | Tip | Kural |
|---|---|---|
| `reporter` | FK → User | on_delete=CASCADE |
| `post` | FK → Post | on_delete=CASCADE |
| `reason` | CharField | seçenekler: `'spam'`, `'inappropriate'`, `'harassment'`, `'misinformation'`, `'other'`; PDF: "hangi gerekçelerle raporlandığını inceleyebilmelidir" |
| `created_at` | DateTimeField | auto_now_add |
| Meta | `unique_together` | `('reporter', 'post')` — aynı gönderi iki kez raporlanamaz (BR-7) |

`AuditLog` — kritik admin işlemleri için (SR-11, BR-17):
| Alan | Tip | Kural |
|---|---|---|
| `admin` | FK → User | İşlemi yapan admin; on_delete=SET_NULL, null=True |
| `action` | CharField | seçenekler: `'ban'`, `'unban'`, `'deactivate'`, `'activate'` |
| `target_user` | FK → User | nullable — hedef kullanıcı; on_delete=SET_NULL |
| `target_post` | FK → Post | nullable — hedef gönderi; on_delete=SET_NULL |
| `detail` | TextField | blank=True — ek açıklama |
| `created_at` | DateTimeField | auto_now_add |

> ⚠️ `AuditLog`'da `admin` alanına şifre, token veya e-posta yazılmamalı (PV-11). Sadece `admin.id` referansı yeterli (FK zaten tutar).

---

**`serializers.py`**

`ReportSerializer`:
| Alan | Yön | Kural |
|---|---|---|
| `post_id` | write-only | Input |
| `reason` | write + read | Zorunlu input; seçeneklerden biri olmalı (`spam`, `inappropriate`, `harassment`, `misinformation`, `other`) |
| `id`, `reporter_username`, `post_id`, `post_content`, `post_author`, `reason`, `created_at` | read-only | Output |

**Validasyonlar:**
- `post_id`: gerçek ve `is_active=True` olan gönderi mi? → değilse 400
- `reason`: geçerli seçeneklerden biri mi? → DRF `choices` otomatik kontrol eder
- `reporter = request.user` aynı gönderiyi daha önce raporladı mı? → 400 (BR-7)
- `reporter = request.user` olarak kaydet (kullanıcı kendisi seçemez)

`ReportedPostSerializer` — admin özet görünümü için:
| Alan | Açıklama |
|---|---|
| `post_id` | Gönderi ID |
| `post_content` | Gönderi içeriği |
| `post_author` | Yazar kullanıcı adı |
| `report_count` | Bu gönderi kaç kez raporlandı |
| `reasons` | Verilen gerekçelerin listesi: `["spam", "spam", "harassment"]` |
| `reports` | Her raporun detayı: `[{reporter, reason, created_at}]` |

`AuditLogSerializer`: `id`, `admin_username`, `action`, `target_user_username`, `target_post_id`, `detail`, `created_at`

---

**`views.py`**

**`IsAdmin` permission class** — `apps/reports/permissions.py` veya `views.py` içinde:
- `IsAuthenticated` + `request.user.role == 'admin'`

*Kullanıcı endpoint'leri:*

| View | Endpoint | Yetki | İş Mantığı |
|---|---|---|---|
| `ReportCreateView` | `POST /api/reports/` | Giriş + doğrulanmış | Rapor oluştur |

*Admin endpoint'leri — hepsinde `IsAdmin` zorunlu:*

| View | Endpoint | İş Mantığı |
|---|---|---|
| `AdminReportedPostsView` | `GET /api/admin/reports/` | Raporlanan gönderileri **post bazında grupla**: her gönderi için `report_count` ve tüm `reasons` + `reports` listesi döner; PDF: "kaç kez ve hangi gerekçelerle raporlandığını inceleyebilmelidir" |
| `AdminPostListView` | `GET /api/admin/posts/?is_active=false` | Pasif dahil tüm gönderiler — admin'in pasif gönderileri bulabilmesi için zorunlu |
| `AdminPostDeactivateView` | `POST /api/admin/posts/<id>/deactivate/` | `is_active = False`; `AuditLog` yaz; **veriyi silme** (BR-18) |
| `AdminPostActivateView` | `POST /api/admin/posts/<id>/activate/` | `is_active = True`; `AuditLog` yaz |
| `AdminUserListView` | `GET /api/admin/users/?search=<q>` | Tüm kullanıcıları listele (e-posta + ban durumu dahil) |
| `AdminBanView` | `POST /api/admin/users/<username>/ban/` | `is_banned = True`; `AuditLog` yaz; **BR-16 kontrolü** |
| `AdminUnbanView` | `POST /api/admin/users/<username>/unban/` | `is_banned = False`; `AuditLog` yaz; **BR-16 kontrolü** |
| `AdminStatsView` | `GET /api/admin/stats/` | Genel istatistikler + coğrafi dağılım (PR-7: ≤5 sn); PDF Madde 3 |
| `AdminPostStatsView` | `GET /api/admin/stats/posts/?start=<YYYY-MM-DD>&end=<YYYY-MM-DD>` | Tarih aralığına göre günlük gönderi sayıları; PDF: "belirli tarih aralıklarında oluşturulan gönderi istatistikleri" |
| `AdminAuditLogView` | `GET /api/admin/audit-log/` | Sayfalı AuditLog listesi |

**`AdminStatsView`** dönecek veriler:
```json
{
  "total_users": 0,
  "verified_users": 0,
  "banned_users": 0,
  "active_users": 0,
  "total_posts": 0,
  "active_posts": 0,
  "passive_posts": 0,
  "total_reports": 0,
  "posts_today": 0,
  "users_by_country": [
    { "country": "Türkiye", "count": 42 },
    { "country": "KKTC", "count": 15 },
    { "country": "", "count": 7 }
  ]
}
```
> `users_by_country`: `User.objects.values('country').annotate(count=Count('id')).order_by('-count')` ile üretilir.  
> Boş string = ülke belirtmemiş kullanıcılar.

**`AdminPostStatsView`** dönecek veriler (PDF: tarih aralığı istatistiği):
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
> `Post.objects.filter(created_at__date__range=[start, end]).values('created_at__date').annotate(count=Count('id'))` ile üretilir.

**`AdminBanView` ve `AdminUnbanView` için zorunlu kontrol (BR-16):**
```
target.username == request.user.username → 400 "Kendi hesabınıza işlem yapamazsınız."
```

**`AdminBanView` — geçici vs kalıcı ban (PDF Madde 2):**
- Request body: `{ "duration_days": 7 }` → geçici ban (`banned_until = now() + 7 gün`)
- Request body: `{}` veya `"duration_days": null` → kalıcı ban (`banned_until = None`)
- Her iki durumda da `is_banned = True` ve `AuditLog` yaz (`detail`'e süreyi ekle)

---

**`urls.py`**

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
GET   /api/admin/stats/posts/?start=<date>&end=<date>
GET   /api/admin/audit-log/
```

---

### Frontend

Tüm metin Türkçe (OR-6), mobil uyumlu (QA-13).

**`pages/Admin.jsx`**

Erişim: `user.role === 'admin'` (AdminRoute)

**İstatistik kartları** — `GET /api/admin/stats/`:
- Toplam kullanıcı, doğrulanmış, banlı, aktif kullanıcı
- Toplam gönderi, aktif, pasif
- Toplam rapor, bugünkü gönderi
- **Coğrafi dağılım tablosu:** ülke adı | kullanıcı sayısı (PDF Madde 3: "kullanıcıların coğrafi dağılımı")

**Tarih aralığı gönderi istatistiği** — `GET /api/admin/stats/posts/?start=...&end=...`:
- İki tarih seçici (başlangıç / bitiş)
- "Listele" butonu → her güne ait gönderi sayısını tablo veya çubuk grafik olarak göster (PDF Madde 3)

**Raporlar tablosu** — `GET /api/admin/reports/`:
- Sütunlar: Gönderi İçeriği | Yazar | Rapor Sayısı | Gerekçeler | İşlemler
- Her satır genişletilebilir → altında raporlayanlar ve nedenleri listelenir (PDF: "kaç kez ve hangi gerekçelerle")
- "Pasife Al" → `POST /api/admin/posts/<id>/deactivate/`
- "Aktif Et" → `POST /api/admin/posts/<id>/activate/`
- Tıklama sonrası satır güncellenmeli

**Kullanıcı yönetimi** — `GET /api/admin/users/?search=<q>`:
- Arama alanı
- Tablo: kullanıcı adı | e-posta | ülke | doğrulanmış | banlı | ban bitiş tarihi | kayıt tarihi | işlem
- "Banla" butonu → form açılır: "Geçici (gün sayısı)" veya "Kalıcı" seç → `POST .../ban/` (PDF Madde 2: geçici/kalıcı)
- "Ban Kaldır" butonu → `POST .../unban/`
- Kendi hesabı için bu butonlar devre dışı (BR-16)

**Audit log** — `GET /api/admin/audit-log/`:
- Admin | İşlem | Hedef | Detay (ban süresi dahil) | Tarih listesi

---

## Çapraz Kesim Gereksinimleri (Hepsi Uymak Zorunda)

### Güvenlik (SRS Bölüm 5.4)

| Kural | Kime Düşer | Nasıl |
|---|---|---|
| SR-1: Şifre hash | Kadircan | Django `AbstractUser.create_user()` bcrypt kullanır — düz metin saklama |
| SR-2: Login throttle | Kadircan | `LoginAttempt` modeli; 5 hata / 15 dk → 429 |
| SR-3: Sadece doğrulanmış kullanıcı erişir | Kadircan | Login view'da `is_email_verified` kontrolü |
| SR-4: Admin paneli yetkisiz erişime kapalı | Mert | `IsAdmin` permission class |
| SR-5: Sadece kendi gönderisini sil/düzenle | Görkem | `author == request.user` kontrolü |
| SR-6: JWT ile oturum | Yusuf | SimpleJWT (settings.py'de ayarlı) |
| SR-7: Oturum timeout → otomatik çıkış | Yusuf | 60 dk access token; axios interceptor'da refresh → logout zinciri |
| SR-8: XSS / CSRF / SQL injection | Tüm backend | ORM kullan (raw query yok); DRF serializer escaping; CORS kısıtlı |
| SR-9: Backend input doğrulama | Hepsi | Tüm veriler serializer'dan geçmeli; frontend doğrulaması UI amaçlı, güvenlik değil |
| SR-10: Banlı kullanıcı login olamaz | Kadircan | Login view'da `is_banned` kontrolü |
| SR-11: Kritik işlem logu | Mert | `AuditLog` modeli — ban, unban, deactivate, activate |
| SR-12: Yedekleme + geri yükleme | Yusuf (docker) | Docker named volume + `pg_dump` ile günlük yedekleme scripti (OR-4, OR-5, TBD-09) |
| SR-13: HTTPS | Yusuf | Production: nginx + SSL; geliştirmede HTTP kabul edilir |
| SR-14: Admin yetkisi manuel atanır | Kadircan | Shell: `User.objects.filter(...).update(role='admin')` (SR-14) |
| SR-15: KVKK/GDPR | Kadircan + Mert | E-posta gizle; veri silmek yerine pasife al; log'larda hassas veri yok |

### Veri Gizliliği (SRS Bölüm 5.5)

| Kural | Kime Düşer | Nasıl |
|---|---|---|
| PV-1: E-posta başkalarına gösterilmez | Kadircan | `UserSerializer` email içermez |
| PV-10: Kullanıcı hesabını pasife alabilir | Kadircan | `DELETE /api/users/me/` → `is_active=False` |
| PV-11: Log'larda hassas veri olmamalı | Yusuf + Mert | Log'a şifre, token veya tam e-posta yazılmasın; username/ID yeterli |
| PV-15: Kayıt formunda açık rıza | Kadircan | T&C + Gizlilik Politikası onay kutusu zorunlu |
| BR-18: Veriler hiç silinmez | Hepsi | `is_active=False`, `is_banned=True` flag'leri kullan; DB'den `delete()` çağrılmaz |

### Performans Hedefleri (SRS Bölüm 5.3)

| Hedef | Kime Düşer | Yöntem |
|---|---|---|
| PR-1: Login ≤ 2 sn | Kadircan | `LoginAttempt` sorgusunu indexle |
| PR-2: Gönderi oluşturma ≤ 3 sn | Görkem | — |
| PR-3: Feed yükleme ≤ 2 sn | Görkem | `select_related('author')` + Follow tablosunda index |
| PR-4: ≥ 100 eşzamanlı kullanıcı | Yusuf | Docker + gunicorn workers |
| PR-5: DB sorguları optimize | Hepsi | N+1 sorgudan kaçın; `select_related` / `prefetch_related` kullan |
| PR-6: Yoğun trafik için önbellekleme | Yusuf | `settings.py`'de cache backend; `AdminStatsView`'da `cache.get/set` kullanılabilir |
| PR-7: Admin istatistik ≤ 5 sn | Mert | Stats sorgularını tek seferde çek; `annotate` kullan |
| PR-8: Hata durumunda kontrollü mesaj | Hepsi | 500 yerine anlamlı JSON hata mesajı dön |

### İş Kuralları Özeti (SRS Bölüm 5.7)

| Kural | İlgili Modül |
|---|---|
| BR-1/BR-2: Tekil kullanıcı adı ve e-posta | Auth — model unique constraint |
| BR-3/BR-4: Doğrulanmamış hesap kısıtlı | Auth (login) + Post/Follow (doğrulama kontrolü) |
| BR-5/BR-6: Sadece kendi gönderisini yönet | Post — `author == request.user` |
| BR-7: Aynı gönderi iki kez raporlanamaz | Report — `unique_together` + serializer validasyon |
| BR-8/BR-9: Raporlar ve pasife alma sadece admin | Report — `IsAdmin` permission |
| BR-10/BR-11: Ban sadece admin; banlı giriş yapamaz | Auth (login) + Report (ban view) |
| BR-12: Pasif gönderi normal kullanıcıya görünmez | Post — `is_active=True` filtresi |
| BR-13: Feed sadece takip edilenler | Post — `author_id__in` filtresi |
| BR-14/BR-15: Kendini takip edemez; tek yönlü | Follow — `clean()` metodu |
| BR-16: Admin kendi yetkisini kaldıramaz | Report — ban/unban view'larında `target == request.user` kontrolü |
| BR-17: Kritik işlemler loglanır | Report — `AuditLog` her admin işleminde yazılır |
| BR-18: Veriler silinmez | Hepsi — soft delete; `delete()` çağrılmaz |

### Kalite Gereksinimleri (SRS Bölüm 5.6)

| Kural | Kime Düşer |
|---|---|
| QA-3: Chrome, Firefox, Edge, Safari uyumlu | Görkem + Kaan + Yusuf — tarayıcılarda test et |
| QA-12: Birim ve entegrasyon testleri yapılabilir yapı | Hepsi — view'lar Django `TestCase` ile test edilebilir olmalı |
| QA-13: Mobil uyumlu (responsive) tasarım | Görkem + Kaan + Kadircan — tüm sayfalar mobil ekranda çalışmalı |

### Operasyonel Gereksinimler (SRS Bölüm 6.5)

| Kural | Kime Düşer |
|---|---|
| OR-4/SR-12: Günlük otomatik yedekleme | Yusuf — `pg_dump` scripti + docker cron veya compose schedule |
| OR-5: Geri yükleme mekanizması | Yusuf — `pg_restore` adımları dokümante edilmeli |
| OR-6: Türkçe arayüz | Tüm frontend — tüm label, button, mesaj Türkçe |
| OR-17: Git ile versiyon kontrolü | Hepsi — Git workflow bölümüne bak |
| OR-18: Docker ile containerize | Yusuf — `docker-compose.yml` |
| OR-19: Sunucu tarafı hata logu | Yusuf — `settings.py` LOGGING konfigürasyonu |
| OR-20: Test / production ortam ayrımı | Yusuf — `.env` ile `DEBUG` kontrolü; production'da `gunicorn` |

---

## Git Workflow

```bash
git checkout -b feature/<isim>-<modul>
# Örnek: git checkout -b feature/kadircan-auth

git add .
git commit -m "feat(<modül>): kısa açıklama"
# Örnekler:
#   feat(auth): kullanıcı kaydı ve e-posta doğrulama
#   feat(posts): gönderi oluşturma ve feed endpoint'i
#   fix(auth): verify-email throttle eklendi

git pull origin main --rebase
git push origin feature/<isim>-<modul>
# GitHub'da Pull Request aç → Yusuf merge eder
```

---

## Tamamlanma Kontrol Listesi

| Modül | Model | Serializer | View | URL | Frontend | Migration | Test |
|---|---|---|---|---|---|---|---|
| Altyapı (Yusuf) | — | — | ☐ | ☐ | ☐ | — | — |
| Auth (Kadircan) | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Post (Görkem) | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Follow (Kaan) | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Report/Admin (Mert) | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Entegrasyon | — | — | — | — | — | — | ☐ |
