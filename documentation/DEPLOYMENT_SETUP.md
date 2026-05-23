# FISILTI - Deployment & Setup Rehberi

## İçindekiler
1. [Gereksinimler](#gereksinimler)
2. [Yerel Ortam Kurulumu](#yerel-ortam-kurulumu)
3. [Database Kurulumu](#database-kurulumu)
4. [Backend Kurulumu](#backend-kurulumu)
5. [Frontend Kurulumu](#frontend-kurulumu)
6. [Docker ile Deployment](#docker-ile-deployment)
7. [Production Deployment](#production-deployment)
8. [Ortam Değişkenleri](#ortam-değişkenleri)
9. [Yedekleme ve Restore](#yedekleme-ve-restore)
10. [Troubleshooting](#troubleshooting)

---

## Gereksinimler

### Sistem Gereksinimleri
- **OS**: Linux (Ubuntu 20.04+), macOS, veya Windows WSL2
- **RAM**: Minimum 4GB (8GB önerilir)
- **Disk**: Minimum 10GB (20GB önerilir)

### Yazılım Gereksinimleri
- **Python**: 3.10+
- **Node.js**: 16+
- **PostgreSQL**: 12+
- **Docker & Docker Compose**: (opsiyonel, ama önerilir)
- **Git**: En son sürüm

### Sağlayıcı Gereksinimleri
- **E-posta Hizmeti**: SMTP (örn: Resend, SendGrid)
- **Hosting**: Cloud sunucu (AWS, Azure, Digital Ocean, vb.)
- **Domain**: Kayıtlı domain adı

---

## Yerel Ortam Kurulumu

### 1. Repository'yi Clone Etme

```bash
git clone https://github.com/ysferencakir/fisilti.git
cd fisilti
```

### 2. Python Virtual Environment Oluşturma

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Backend Bağımlılıklarını Yükleme

```bash
cd backend
pip install -r requirements.txt
```

### 4. Frontend Bağımlılıklarını Yükleme

```bash
cd ../frontend
npm install
```

---

## Database Kurulumu

### PostgreSQL Yükleme

#### macOS (Homebrew)
```bash
brew install postgresql@12
brew services start postgresql@12
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Windows
- PostgreSQL Installer'ı indir: https://www.postgresql.org/download/windows/
- Kurulum sırasında password not et
- pgAdmin 4 kurulumunu işaretle

### Database Oluşturma

```bash
# Terminal/Command Prompt'ta
psql -U postgres

# PostgreSQL command line'da:
CREATE DATABASE fisilti;
CREATE USER fisilti_user WITH PASSWORD 'your_secure_password';
ALTER ROLE fisilti_user SET client_encoding TO 'utf8';
ALTER ROLE fisilti_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE fisilti_user SET default_transaction_deferrable TO on;
GRANT ALL PRIVILEGES ON DATABASE fisilti TO fisilti_user;
\q
```

### Migrations Çalıştırma

```bash
cd backend
python manage.py migrate
python manage.py createsuperuser
```

Superuser (admin) hesabı oluşturmak için bilgileri girin:
- Kullanıcı adı
- E-posta
- Şifre (2x)

---

## Backend Kurulumu

### 1. Environment Variables Ayarlama

```bash
# backend/.env dosyasını oluşturun
cat > .env << EOF
DEBUG=True
SECRET_KEY=your-very-secret-key-here
DATABASE_URL=postgresql://fisilti_user:password@localhost:5432/fisilti
ALLOWED_HOSTS=localhost,127.0.0.1
REQUIRE_EMAIL_VERIFICATION=True
EMAIL_BACKEND=console
SMTP_SERVER=smtp.resend.com
SMTP_PORT=465
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-smtp-password
EOF
```

### 2. Django Sunucusunu Başlatma

```bash
python manage.py runserver
```

Sunucu başarıyla başladı, çıktı şuna benzer:
```
Starting development server at http://127.0.0.1:8000/
```

### 3. Admin Panelini Kontrol Etme

```
http://localhost:8000/admin
```

Yukarıda oluşturduğunuz superuser bilgileriyle giriş yapın.

---

## Frontend Kurulumu

### 1. Environment Variables Ayarlama

```bash
# frontend/.env dosyasını oluşturun
cat > .env << EOF
VITE_API_URL=http://localhost:8000/api
EOF
```

### 2. Development Sunucusunu Başlatma

```bash
npm run dev
```

Frontend sunucu başladı:
```
  VITE v4.x.x build ready in 123ms

  ➜  Local:   http://localhost:5173/
```

### 3. Tarayıcıda Açma

```
http://localhost:5173
```

---

## Docker ile Deployment

### Docker Compose ile Başlatma

```bash
# Repository root dizininde:
docker-compose up -d
```

Bu komut:
- PostgreSQL container'ını başlatır
- Backend (Django) container'ını başlatır
- Frontend (Node.js) container'ını başlatır

### Container'ları Kontrol Etme

```bash
# Çalışan container'ları listele
docker ps

# Container log'larını görmek
docker logs fisilti-backend
docker logs fisilti-frontend

# Container'a bash shell açmak
docker exec -it fisilti-backend bash
```

### Migrations Çalıştırma (Docker'da)

```bash
docker exec fisilti-backend python manage.py migrate
docker exec fisilti-backend python manage.py createsuperuser
```

### Docker Container'larını Durdurma

```bash
docker-compose down
```

---

## Production Deployment

### 1. Server Hazırlama

```bash
# Ubuntu 20.04+ sunucuda
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-pip nodejs npm postgresql docker.io docker-compose git nginx

# Docker daemon başlatma
sudo systemctl start docker
sudo systemctl enable docker
```

### 2. SSL Sertifikası Sağlama (HTTPS)

```bash
# Certbot ile Let's Encrypt sertifikası alma
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d your-domain.com
```

### 3. Nginx Konfigürasyonu

```bash
# /etc/nginx/sites-available/fisilti dosyası oluşturun
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Backend
    location /api {
        proxy_pass http://localhost:8000/api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# HTTP'den HTTPS'ye redirect
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

Nginx'i etkinleştirme:
```bash
sudo ln -s /etc/nginx/sites-available/fisilti /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Environment Variables (Production)

```bash
# backend/.env (production)
DEBUG=False
SECRET_KEY=generate-random-key-with-django
DATABASE_URL=postgresql://user:password@db.host:5432/fisilti
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
REQUIRE_EMAIL_VERIFICATION=True
EMAIL_BACKEND=smtp
SMTP_SERVER=smtp.resend.com
SMTP_PORT=465
SMTP_USER=your-email@resend.com
SMTP_PASSWORD=your-resend-api-key
```

### 5. Static Files Hazırlama

```bash
cd backend
python manage.py collectstatic --noinput
```

### 6. Systemd Service Oluşturma

```bash
# /etc/systemd/system/fisilti-backend.service
[Unit]
Description=FISILTI Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/home/user/fisilti/backend
ExecStart=/home/user/fisilti/venv/bin/gunicorn -w 4 -b 0.0.0.0:8000 fisilti.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
```

Service'i başlatma:
```bash
sudo systemctl start fisilti-backend
sudo systemctl enable fisilti-backend
```

---

## Ortam Değişkenleri

### Backend (.env)

```
# Django
DEBUG=False
SECRET_KEY=django-insecure-your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/fisilti

# Email
EMAIL_BACKEND=smtp
SMTP_SERVER=smtp.resend.com
SMTP_PORT=465
SMTP_USER=your-email@resend.com
SMTP_PASSWORD=your-smtp-password
REQUIRE_EMAIL_VERIFICATION=True

# Security
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

### Frontend (.env)

```
VITE_API_URL=https://your-domain.com/api
VITE_APP_NAME=FISILTI
```

---

## Yedekleme ve Restore

### Database Yedeklemesi

```bash
# Otomatik yedekleme script'i
python manage.py backup_database

# Manuel yedekleme
pg_dump -U fisilti_user -h localhost fisilti > fisilti_backup_$(date +%Y%m%d).sql
```

### Database Geri Yükleme

```bash
# Backup dosyasından restore
psql -U fisilti_user -h localhost fisilti < fisilti_backup_20260523.sql
```

### Docker Volume'den Backup

```bash
# Database volume'sini backup etme
docker run --rm -v fisilti_db:/data -v $(pwd):/backup ubuntu tar cvf /backup/db.tar /data

# Database volume'sini restore etme
docker run --rm -v fisilti_db:/data -v $(pwd):/backup ubuntu tar xvf /backup/db.tar
```

---

## Troubleshooting

### Database Bağlantı Hatası

**Hata**: `psycopg2.OperationalError: could not connect to server`

**Çözüm**:
```bash
# PostgreSQL çalışıyor mu kontrol et
sudo systemctl status postgresql

# Password'u sıfırla
sudo -u postgres psql -c "ALTER USER fisilti_user PASSWORD 'new_password';"
```

### Port Zaten Kullanımda

**Hata**: `Address already in use`

**Çözüm**:
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <process_id> /F

# macOS/Linux
lsof -i :8000
kill -9 <process_id>

# Farklı port kullan
python manage.py runserver 8001
```

### Static Files Yüklenmiyyor

**Çözüm**:
```bash
python manage.py collectstatic --noinput --clear
```

### Frontend API Bağlantısı Hatası

**Hata**: `CORS error`

**Çözüm**:
```bash
# backend/fisilti/settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://your-domain.com",
]
```

### Email Gönderilemiyyor

**Hata**: `SMTPAuthenticationError`

**Çözüm**:
1. SMTP kimlik bilgilerini kontrol et
2. "Less secure apps" ayarını kontrol et
3. Email sağlayıcısının dokümantasyonunu oku

### Memory/CPU Yüksek

**Çözüm**:
```bash
# Database query'lerini optimize et
python manage.py shell_plus --print-sql

# Gunicorn workers sayısını azalt
gunicorn -w 2 -b 0.0.0.0:8000 fisilti.wsgi:application
```

---

## İletişim ve Destek

- **E-posta**: devops@fisilti.com
- **Dokümantasyon**: https://docs.fisilti.com
- **GitHub Issues**: https://github.com/ysferencakir/fisilti/issues

---

**Son Güncelleme**: 23 Mayıs 2026

Deployment sırasında sorun yaşarsanız, lütfen destek ekibine başvurun!