# Fısıltı — Kadircan Alaca

**Rol:** Veritabanı Geliştirici / Web Geliştirici  
**Modül:** Auth & Kullanıcı Yönetimi  
**Branch adı:** `feature/kadircan-auth`

---

## Genel Bilgiler

**Stack:** Django + DRF · React + Vite · PostgreSQL · JWT  
**Backend:** http://localhost:8000  
**Frontend:** http://localhost:5173

### Kurulum

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
# Terminal 1
cd backend && python manage.py runserver

# Terminal 2
cd frontend && npm run dev
```

### Git Workflow

```bash
git checkout -b feature/kadircan-auth

git add .
git commit -m "feat(auth): kısa açıklama"
# Örnekler:
#   feat(auth): User ve EmailVerification modelleri eklendi
#   feat(auth): kayıt ve e-posta doğrulama endpoint'leri

git pull origin main --rebase
git push origin feature/kadircan-auth
# GitHub'da Pull Request aç → Yusuf merge eder
```

---

## Bağımlılık Durumu

- **Senden önce gelmesi gereken:** Yusuf'un altyapısı (AppConfig'ler, urls.py iskelet, settings.py)
- **Sana bağımlı olanlar:** Görkem, Kaan, Mert — hepsi `User` modeline FK bağımlı. **Migration'larını tamamlar tamamlamaz main'e merge et.**
- **Koordinasyon:** `is_following` alanı için Kaan ile iletişimde kal — aşağıda açıklandı.

---

## Modülün: `apps/users/`

### `models.py`

```
User (AbstractUser'dan türet)
├── email           EmailField, unique — USERNAME_FIELD = 'email'
├── username        CharField, unique — görüntüleme adı
├── role            CharField — 'user' / 'admin', default 'user'
├── is_email_verified  BooleanField, default False
├── is_banned       BooleanField, default False
├── banned_until    DateTimeField, null=True, blank=True
│                   → null = kalıcı ban
│                   → gelecek tarih = geçici ban
│                   → geçmiş tarih = süre dolmuş (login'de auto-unban)
├── country         CharField(100), blank=True — coğrafi istatistik için
└── created_at      DateTimeField, auto_now_add

EmailVerification
├── user            FK → User, on_delete=CASCADE
├── code            CharField(6) — 6 rastgele rakam
├── expires_at      DateTimeField — oluşturulma + 10 dakika
├── is_used         BooleanField, default False
├── create_for_user(cls, user)  classmethod:
│       Önceki aktif kodları iptal et → yeni 6 haneli kod üret → kaydet
└── is_expired      property: timezone.now() > expires_at

PasswordResetToken
├── user            FK → User, on_delete=CASCADE
├── token           UUIDField, default=uuid.uuid4, unique
├── expires_at      DateTimeField — oluşturulma + 1 saat
└── is_used         BooleanField, default False

LoginAttempt  (brute-force koruması)
├── email           EmailField
├── attempted_at    DateTimeField, auto_now_add
└── is_successful   BooleanField, default False
```

**`banned_until` login mantığı:**
- `is_banned=True` + `banned_until=None` → kalıcı ban → giriş engelle
- `is_banned=True` + `banned_until <= now()` → süre dolmuş → `is_banned=False` yap, giriş ver
- `is_banned=True` + `banned_until > now()` → aktif geçici ban → giriş engelle

---

### `serializers.py`

| Serializer | Alanlar | Kural |
|---|---|---|
| `RegisterSerializer` | `username`, `email`, `password`, `country` | password write-only, min 8 karakter; country opsiyonel |
| `VerifyEmailSerializer` | `email`, `code` | — |
| `PasswordResetRequestSerializer` | `email` | — |
| `PasswordResetConfirmSerializer` | `token`, `new_password` | token UUID formatında, new_password min 8 karakter |
| `UserSerializer` | `id`, `username`, `role`, `is_email_verified`, `is_banned`, `created_at`, `followers_count`, `following_count`, `is_following` | **email YOK** (PV-1); `followers_count` ve `following_count` için aşağıya bak; `is_following` için sonraki nota bak |
| `MeSerializer` | `UserSerializer` alanları + `email` | Sadece `/users/me/` endpoint'inde kullan |

**`followers_count` ve `following_count` implementasyonu:**

```python
def get_followers_count(self, obj):
    return obj.follower_set.count()   # Follow.following = obj olanlar

def get_following_count(self, obj):
    return obj.following_set.count()  # Follow.follower = obj olanlar
```

> Bu `related_name` değerleri Kaan'ın `Follow` modelindeki `follower_set` ve `following_set` isimlerine bağımlı. Eğer Kaan farklı `related_name` kullanırsa burayı güncelle.

> ⚠️ `UserSerializer` asla email içermez. `MeSerializer` içerir. Kendi profilinin dışında `MeSerializer` kullanma.

**`is_following` için koordinasyon notu:**

`UserSerializer`'a `is_following` SerializerMethodField ekle. `Follow` modeli Kaan'ın `apps/follows/` modülünde ama döngüsel import olmadan şöyle kullanabilirsin:

```python
def get_is_following(self, obj):
    request = self.context.get('request')
    if not request or not request.user.is_authenticated:
        return False
    from apps.follows.models import Follow   # lazy import — döngüsel import yok
    return Follow.objects.filter(follower=request.user, following=obj).exists()
```

`UserDetailView`'da serializer'ı şöyle çağır:
```python
return Response(UserSerializer(user, context={'request': request}).data)
```

---

### `views.py`

| View | Endpoint | Yetki | İş Mantığı |
|---|---|---|---|
| `RegisterView` | `POST /api/auth/register/` | Herkese açık | Kullanıcı oluştur → `EmailVerification.create_for_user()` → `send_mail()` |
| `VerifyEmailView` | `POST /api/auth/verify-email/` | Herkese açık | Kod + süre kontrolü → `is_email_verified = True`; 5 başarısız / 10 dk → 429 |
| `ResendVerificationView` | `POST /api/auth/resend-verification/` | Herkese açık | Yeni kod üret ve gönder — kayıt endpoint'inden FARKLI olmalı |
| `LoginView` | `POST /api/auth/login/` | Herkese açık | SimpleJWT override — aşağıdaki sırayı takip et |
| `LogoutView` | `POST /api/auth/logout/` | Giriş zorunlu | SimpleJWT `TokenBlacklistView` |
| `TokenRefreshView` | `POST /api/auth/token/refresh/` | — | SimpleJWT hazır view |
| `PasswordResetRequestView` | `POST /api/auth/password-reset/` | Herkese açık | `PasswordResetToken` oluştur → link e-postayla gönder |
| `PasswordResetConfirmView` | `POST /api/auth/password-reset/confirm/` | Herkese açık | Token doğrula + süre + is_used kontrolü → şifreyi güncelle |
| `UserListView` | `GET /api/users/?search=<q>` | Giriş zorunlu | `UserSerializer` kullan (**MeSerializer değil** — email sızmasın); `username__icontains=q` filtresi |
| `MeView` | `GET /api/users/me/` | Giriş zorunlu | `MeSerializer(request.user)` |
| `UserDetailView` | `GET /api/users/<username>/` | Herkese açık | `UserSerializer(user, context={'request': request})` |
| `AccountDeactivateView` | `DELETE /api/users/me/` | Giriş zorunlu | `is_active = False`; **delete() çağırma** |

**`IsEmailVerified` — paylaşılan yardımcı permission (Görkem, Kaan, Mert de kullanır):**

Görkem (PostCreateView), Kaan (FollowView) ve Mert (ReportCreateView) `is_email_verified` kontrolü yapması gerekiyor. Bu kontrolü **standart bir permission class** olarak tanımla; herkes import edip kullansın:

```python
# apps/users/permissions.py (yeni dosya — sen oluştur)
from rest_framework.permissions import IsAuthenticated

class IsEmailVerified(IsAuthenticated):
    def has_permission(self, request, view):
        return (
            super().has_permission(request, view)
            and request.user.is_email_verified
        )
```

Görkem, Kaan ve Mert'e söyle: `from apps.users.permissions import IsEmailVerified` ile import edip view'larında `permission_classes = [IsEmailVerified]` olarak kullanacaklar.

---

**`LoginView` kontrol sırası (sıra önemli!):**
1. Son 15 dk içinde bu e-posta için 5+ başarısız deneme → `429 Too Many Requests`
2. Kimlik bilgileri doğru mu? → `LoginAttempt` kaydı oluştur
3. `is_active = False` → `403` + "Hesabınız pasife alınmıştır." (Django AbstractUser'ın `is_active` alanı — `AccountDeactivateView` bunu `False` yapar; Django auth sistemi zaten inactive kullanıcıları reddeder ama açık kontrol ekle)
4. `is_banned = True` VE `banned_until` geçmemiş → `403` + "Hesabınız askıya alınmıştır."
5. `is_banned = True` VE `banned_until` geçmiş → auto-unban (`is_banned=False`), devam et
6. `is_email_verified = False` → `403` + "E-postanızı doğrulayın."
7. Hepsi geçildi → JWT access + refresh token üret

**`VerifyEmailView` throttle (GEREKLILIK-4):**
- 5 başarısız deneme / 10 dk → `429` (LoginAttempt'ten bağımsız sayaç)

---

### `urls.py`

```
POST   /api/auth/register/
POST   /api/auth/verify-email/
POST   /api/auth/resend-verification/
POST   /api/auth/login/
POST   /api/auth/logout/
POST   /api/auth/token/refresh/
POST   /api/auth/password-reset/
POST   /api/auth/password-reset/confirm/
GET    /api/users/?search=<q>
GET    /api/users/me/
DELETE /api/users/me/
GET    /api/users/<username>/
```

---

### Migration ve Admin Kullanıcısı

```bash
python manage.py makemigrations users
python manage.py migrate
python manage.py createsuperuser

# Oluşturulan kullanıcının role'ünü admin yap:
python manage.py shell
>>> from apps.users.models import User
>>> User.objects.filter(email='admin@example.com').update(role='admin', is_email_verified=True)
```

---

### Frontend — Auth Sayfaları

Tüm metinler Türkçe (OR-6). Tüm sayfalar mobil uyumlu (QA-13).

**`pages/Register.jsx`**
- Form alanları: kullanıcı adı + email + şifre (min 8 karakter sayacı) + **ülke seçimi (opsiyonel dropdown)**
- **Kullanım Şartları + Gizlilik Politikası onay kutusu** — işaretlenmeden kayıt yapılamaz
- Submit → `api.post('/auth/register/', { username, email, password, country })`
- Başarılı → `/verify-email` sayfasına yönlendir (email'i state veya query param ile taşı)

**`pages/VerifyEmail.jsx`**
- Form: email + 6 haneli kod girişi
- Submit → `api.post('/auth/verify-email/', { email, code })`
- **"Kodu Tekrar Gönder"** butonu → `api.post('/auth/resend-verification/', { email })` (register endpoint'i DEĞİL)
- 429 → "Çok fazla deneme. Lütfen bekleyin."
- Başarılı → `/login` sayfasına yönlendir

**`pages/Login.jsx`**
- Form: email + şifre
- Submit → `AuthContext.login()` çağır; `try/catch` ile hata ayır:
  ```js
  try {
    await login(email, password);
    navigate('/');
  } catch (err) {
    const status = err.response?.status;
    const detail = err.response?.data?.detail || '';
    if (status === 429) setError('Çok fazla hatalı deneme. Lütfen bekleyin.');
    else if (status === 403 && detail.includes('askıya')) setError('Hesabınız askıya alınmıştır.');
    else if (status === 403 && detail.includes('doğrulayın')) setError('E-postanızı doğrulayın.');
    else if (status === 403 && detail.includes('pasife')) setError('Bu hesap pasife alınmıştır.');
    else setError('E-posta veya şifre hatalı.');
  }
  ```
- "E-postanızı doğrulayın." mesajı altında `/verify-email` linki göster
- "Şifremi Unuttum" linki → `/password-reset` (bu sayfayı da sen geliştireceksin — aşağıya bak)
- Başarılı → `/` sayfasına yönlendir

**`pages/PasswordReset.jsx`** ← Yusuf'un App.jsx'ine eklendi
- E-posta giriş formu → `api.post('/auth/password-reset/', { email })` → "Şifre sıfırlama linki gönderildi." mesajı
- `?token=<UUID>` query param varsa (kullanıcı e-postadaki linke tıkladı) → yeni şifre formu göster → `api.post('/auth/password-reset/confirm/', { token, new_password })`
- Başarılı → `/login`'e yönlendir

---

## Sana Ait Çapraz Kesim Gereksinimleri

| Gereksinim | Ne Yapacaksın |
|---|---|
| BR-1/BR-2 | `username` ve `email` model düzeyinde `unique=True` |
| BR-3/BR-4 | Login'de `is_email_verified` kontrolü |
| BR-10/BR-11 | Login'de `is_banned` + `banned_until` kontrolü |
| SR-1: Şifre hash | `create_user()` Django'nun bcrypt'ini kullanır — düz metin saklama |
| SR-2: Login throttle | `LoginAttempt` modeli; 5 hata / 15 dk → 429 |
| SR-3: Sadece doğrulanmış | Login'de `is_email_verified` kontrolü |
| SR-10: Banlı giremiyor | Login'de `is_banned` + `banned_until` kontrolü |
| SR-14: Admin manuel atanır | Shell üzerinden `role='admin'` yapılır; UI ile değil |
| SR-15: KVKK/GDPR | E-postayı public endpoint'lerde gösterme |
| PV-1: E-posta gizliliği | `UserSerializer` email içermez; sadece `MeSerializer` |
| PV-10: Hesap silme | `DELETE /api/users/me/` → `is_active=False`; `delete()` çağırma |
| PV-15: Açık rıza | Register formunda T&C onay kutusu zorunlu |
| PR-1: Login ≤ 2 sn | `LoginAttempt` sorgusunu indexle |
| QA-13: Responsive | Login, Register, VerifyEmail sayfaları mobil uyumlu |

---

## Tamamlanma Kontrol Listesi

**Backend:**
- [ ] `models.py` — User, EmailVerification, PasswordResetToken, LoginAttempt
- [ ] `serializers.py` — RegisterSerializer, VerifyEmailSerializer, PasswordReset*Serializer, UserSerializer (is_following dahil), MeSerializer
- [ ] `permissions.py` — `IsEmailVerified` class (Görkem, Kaan, Mert import edecek)
- [ ] `views.py` — 11 view + PasswordReset view'ları (yukarıdaki tabloya göre)
- [ ] `urls.py` — 12 endpoint
- [ ] Migration: `makemigrations users` + `migrate`
- [ ] Superuser oluştur ve role='admin' yap

**Frontend:**
- [ ] `pages/Register.jsx` — ülke dropdown + T&C onay kutusu
- [ ] `pages/VerifyEmail.jsx` — resend-verification endpoint'i ile
- [ ] `pages/Login.jsx` — try/catch ile 429/403-ban/403-unverified/403-pasif hata ayırımı
- [ ] `pages/PasswordReset.jsx` — e-posta formu + token ile şifre sıfırlama formu

**Test (temel):**
- [ ] Kayıt → e-posta kodu konsola yazılıyor mu? (dev'de console backend)
- [ ] Kod gir → hesap aktif mi?
- [ ] Giriş → JWT token geliyor mu?
- [ ] Banlı kullanıcı giriş yapamıyor mu?
- [ ] 5'ten fazla hatalı login → 6. denemede 429 dönüyor mu?
- [ ] Pasife alınmış hesap (`is_active=False`) giriş yapamıyor mu?
- [ ] 5'ten fazla hatalı doğrulama kodu → 429 dönüyor mu? (login throttle'dan bağımsız)
