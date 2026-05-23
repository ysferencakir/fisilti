# Fısıltı Deployment Rehberi

## Teknoloji Stack
- **Frontend**: React + Vite → Vercel
- **Backend**: Django + DRF → Railway
- **Database**: PostgreSQL → Neon

---

## Adım 1: Backend (Railway)

### 1.1 Railway Hesabı Oluştur
- https://railway.app adresine git
- GitHub ile giriş yap
- Yeni project oluştur

### 1.2 Env Değişkenlerini Kopyala
Railway dashboard'da bu env değişkenlerini gir:

```env
# Güvenlik
SECRET_KEY=<django-secret-key-oluştur: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())">
DEBUG=False

# Sunucu
ALLOWED_HOSTS=<railway-url>.up.railway.app
PORT=8000

# Veritabanı (Neon)
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<database>?sslmode=require

# CORS (Vercel URL'i eklenecek)
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5175

# Email (Gmail SMTP)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=ysferencakir@gmail.com
EMAIL_HOST_PASSWORD=<gmail-app-password>
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=Fisilti <ysferencakir@gmail.com>
REQUIRE_EMAIL_VERIFICATION=True

# Frontend URL
PASSWORD_RESET_FRONTEND_URL=http://localhost:5173/password-reset
```

### 1.3 Deploy
```bash
# Local test
SECRET_KEY=$(python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")
DEBUG=False DATABASE_URL="<neon-url>" python manage.py migrate
DEBUG=False DATABASE_URL="<neon-url>" python manage.py runserver

# Railway'e push (git push)
git push railway main
```

### 1.4 Migration Çalıştır
Railway dashboard → Shell tab:
```bash
python manage.py migrate
```

---

## Adım 2: Frontend (Vercel)

### 2.1 Vercel Hesabı Oluştur
- https://vercel.com adresine git
- GitHub ile giriş yap

### 2.2 Deploy
```bash
# Local test
VITE_API_BASE_URL=http://localhost:8000/api npm run build
npm run preview
```

Vercel dashboard → New Project → GitHub repo seç → `frontend/` root olarak ayarla

### 2.3 Env Değişkeni
Vercel dashboard → Settings → Environment Variables:
```
VITE_API_BASE_URL = https://<railway-url>.up.railway.app/api
```

---

## Adım 3: CORS Güncelle

Railway production deploy edildikten sonra (URL'i öğrendikten sonra):

Railway dashboard → Variables:
```
CORS_ALLOWED_ORIGINS=https://<vercel-url>.vercel.app,https://<custom-domain>
```

---

## Adım 4: Custom Domain (İsteğe Bağlı)

### ysferencakir.info.tr Domain
- Railway + Vercel çiftinde custom domain bağla:
  - **API**: `api.ysferencakir.info.tr` → Railway
  - **Frontend**: `ysferencakir.info.tr` → Vercel

1. DNS Provider'a giderek A records ekle
2. Railway/Vercel'de domain bağla
3. SSL/HTTPS otomatik (Let's Encrypt)

---

## Test Checklist

- [ ] Railway `/health/` endpoint çalışıyor: `https://<railway-url>/health/`
- [ ] Frontend kayıt sayfası açılıyor
- [ ] Kayıt yapılıyor ve email gidiyor
- [ ] Login çalışıyor
- [ ] Gönderiler oluşturuluyor ve görüntüleniyor
- [ ] Search çalışıyor
- [ ] Admin paneli açılıyor (admin hesabı ile)
- [ ] CORS hataları yok (browser console)

---

## Prod vs Dev Farklılıkları

| Ayar | Dev | Prod |
|------|-----|------|
| `DEBUG` | `True` | `False` |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1` | Railway URL |
| `CORS_ORIGINS` | `localhost:5173,...` | Vercel URL |
| `HTTPS` | Yok | Zorunlu |
| `SECURE_SSL_REDIRECT` | `False` | `True` |
| Email | Console | Gmail SMTP |
