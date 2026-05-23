# FISILTI - Infrastructure & DevOps Rehberi

**Son Güncelleme**: 23 Mayıs 2026

---

## İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [HTTPS/TLS Setup](#httpstls-setup)
3. [Environment Variables](#environment-variables)
4. [Backup & Restore](#backup--restore)
5. [Log Management](#log-management)
6. [Monitoring & Alerting](#monitoring--alerting)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Production Checklist](#production-checklist)

---

## Genel Bakış

FISILTI production ortamı aşağıdaki komponetlerden oluşur:

```
┌─────────────────┐
│   CDN (Cloudflare)
└────────┬────────┘
         │
┌─────────▼────────────────┐
│  HTTPS/TLS (Let's Encrypt)
│  + Nginx (Reverse Proxy)
└─────────┬────────────────┘
         │
    ┌────┴────┐
    │          │
┌──▼──┐   ┌──▼──┐
│Back-│   │Front│
│ end │   │ end │
│8000 │   │5173 │
└──┬──┘   └──┬──┘
   │         │
   └────┬────┘
        │
    ┌───▼────┐
    │Database│
    │ Postgres
    │  5432  │
    └────────┘

Logging → ELK Stack (Elasticsearch, Logstash, Kibana)
Monitoring → Prometheus + Grafana
Backups → AWS S3
```

---

## HTTPS/TLS Setup

### 1. Let's Encrypt Sertifikası Alma

#### Option 1: Certbot (Standalone)

```bash
# Certbot kurulumuş olduğunu varsay
sudo certbot certonly --standalone \
  -d your-domain.com \
  -d www.your-domain.com \
  --email your-email@example.com \
  --agree-tos \
  --non-interactive
```

**Sertifika Konumu:**
```
Cert:   /etc/letsencrypt/live/your-domain.com/fullchain.pem
Key:    /etc/letsencrypt/live/your-domain.com/privkey.pem
Chain:  /etc/letsencrypt/live/your-domain.com/chain.pem
```

#### Option 2: Cloudflare DNS Challenge

```bash
# Daha güvenli, wildcard sertifikaları destekler
sudo certbot certonly --dns-cloudflare \
  -d your-domain.com \
  -d "*.your-domain.com" \
  --dns-cloudflare-credentials /home/user/cloudflare.ini \
  --email your-email@example.com \
  --agree-tos
```

**Cloudflare Credentials** (`~/.cloudflare/cloudflare.ini`):
```ini
dns_cloudflare_api_token = YOUR_CLOUDFLARE_API_TOKEN
```

### 2. Sertifika Otomasyonu

#### Certbot Renewal Timer (systemd)

```bash
# Durum kontrolü
sudo systemctl status certbot.timer

# Renewal test
sudo certbot renew --dry-run
```

**Timer Dosyası** (`/etc/systemd/system/certbot.timer`):
```ini
[Unit]
Description=Certbot renewal
After=network-online.target
Wants=network-online.target

[Timer]
OnCalendar=*-*-* 03:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

**Service** (`/etc/systemd/system/certbot.service`):
```ini
[Unit]
Description=Certbot renewal service
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/bin/certbot renew --quiet
ExecStart=/usr/sbin/nginx -s reload

[Install]
WantedBy=multi-user.target
```

Kurulum:
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### 3. Nginx HTTPS Konfigürasyonu

**Dosya**: `/etc/nginx/sites-available/fisilti`

```nginx
# HTTPS (port 443)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Sertifikaları
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/your-domain.com/chain.pem;

    # SSL Konfigürasyonu
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 30s;
    }

    # Health Check
    location /health/ {
        proxy_pass http://localhost:8000/health/;
        access_log off;
    }

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
    gzip_min_length 1000;
}

# HTTP → HTTPS Redirect
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

**Nginx Test ve Reload:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 4. SSL Labs Test

```bash
# Online test
https://www.ssllabs.com/ssltest/analyze.html?d=your-domain.com

# Expected Grade: A+ (İdeal)
# - Certificate: Valid
# - Protocol Support: TLS 1.2 ve 1.3
# - Cipher Strength: 4096 bit
- OCSP Stapling: Enabled
```

---

## Environment Variables

### 1. Production Environment Variables

**Dosya**: `backend/.env.production`

```bash
# Django
DEBUG=False
SECRET_KEY=generate-very-long-random-secret-key-here-at-least-50-chars
ALLOWED_HOSTS=your-domain.com,www.your-domain.com,api.your-domain.com

# Database
DATABASE_URL=postgresql://fisilti_user:STRONG_PASSWORD@db.host:5432/fisilti
DATABASE_POOL_SIZE=10
DATABASE_POOL_TIMEOUT=30

# Security
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
CSRF_COOKIE_HTTPONLY=True
SESSION_COOKIE_HTTPONLY=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True

# CORS
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Email (Resend)
EMAIL_BACKEND=smtp
SMTP_SERVER=smtp.resend.com
SMTP_PORT=465
SMTP_USER=onboarding@resend.dev
SMTP_PASSWORD=re_XXXXXXXXXXXXXXXXXXXXXXXXXXXX
EMAIL_FROM=noreply@your-domain.com
REQUIRE_EMAIL_VERIFICATION=True

# API Settings
API_RATE_LIMIT=100/hour
API_TIMEOUT=30

# Logging
LOG_LEVEL=INFO
SENTRY_DSN=https://your-sentry-key@sentry.io/project-id

# Password Reset
PASSWORD_RESET_FRONTEND_URL=https://your-domain.com/reset-password

# Frontend
FRONTEND_URL=https://your-domain.com
```

**Dosya**: `frontend/.env.production`

```bash
VITE_API_URL=https://api.your-domain.com/api
VITE_APP_NAME=FISILTI
VITE_APP_VERSION=1.0.0

# Analytics (isteğe bağlı)
VITE_GOOGLE_ANALYTICS_ID=UA-XXXXXXXXX-X
VITE_SENTRY_DSN=https://your-sentry-key@sentry.io/project-id
```

### 2. Secret Management

#### Using systemd Environment

```bash
# /etc/systemd/system/fisilti-backend.service
[Service]
EnvironmentFile=/etc/fisilti/backend.env
```

#### Using Docker Secrets

```bash
# Secrets oluştur
echo "STRONG_PASSWORD" | docker secret create db_password -
echo "SECRET_KEY_VALUE" | docker secret create django_secret_key -

# Compose dosyasında kullan
services:
  backend:
    secrets:
      - db_password
      - django_secret_key
```

#### Using Vault (Hashicorp)

```bash
# Secret saklama
vault kv put secret/fisilti \
  database_password="STRONG_PASSWORD" \
  secret_key="SECRET_KEY" \
  smtp_password="SMTP_PASSWORD"

# Secret okuma (startup script'te)
export $(vault kv get -format=json secret/fisilti | jq -r '.data.data | to_entries | .[] | "\(.key)=\(.value)"')
```

---

## Backup & Restore

### 1. Database Yedekleme (pg_dump)

#### Manual Yedekleme

```bash
# Full database backup
pg_dump -U fisilti_user -h localhost fisilti > fisilti_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup (önerilir)
pg_dump -U fisilti_user -h localhost -Fc fisilti > fisilti_$(date +%Y%m%d_%H%M%S).dump

# Sadece data (schema hariç)
pg_dump -U fisilti_user -h localhost -a fisilti > fisilti_data_$(date +%Y%m%d_%H%M%S).sql

# Şifreli yedekleme (GPG)
pg_dump -U fisilti_user -h localhost fisilti | \
  gpg --symmetric --cipher-algo AES256 > fisilti_$(date +%Y%m%d).sql.gpg
```

#### Otomatik Yedekleme (Cron)

**Script**: `/usr/local/bin/backup-fisilti-db.sh`

```bash
#!/bin/bash

BACKUP_DIR="/backups/fisilti"
DB_NAME="fisilti"
DB_USER="fisilti_user"
DB_HOST="localhost"
RETENTION_DAYS=30

# Backup dizini oluştur
mkdir -p $BACKUP_DIR

# Backup dosyası
BACKUP_FILE="$BACKUP_DIR/fisilti_$(date +\%Y\%m\%d_\%H\%M\%S).dump"

# Database'i yedekle
pg_dump -U $DB_USER -h $DB_HOST -Fc $DB_NAME > $BACKUP_FILE

if [ $? -eq 0 ]; then
  echo "[$(date)] Backup başarılı: $BACKUP_FILE"
  
  # AWS S3'e yükle (isteğe bağlı)
  aws s3 cp $BACKUP_FILE s3://your-bucket/fisilti-backups/
  
  # Eski yedekleri sil
  find $BACKUP_DIR -name "fisilti_*.dump" -type f -mtime +$RETENTION_DAYS -delete
else
  echo "[$(date)] Backup başarısız!" >&2
  exit 1
fi
```

**Crontab Kurulumu:**

```bash
# Root olarak
sudo crontab -e

# Günde 2:30'da otomatik backup
30 2 * * * /usr/local/bin/backup-fisilti-db.sh >> /var/log/fisilti-backup.log 2>&1

# Her 6 saatte bir
0 */6 * * * /usr/local/bin/backup-fisilti-db.sh >> /var/log/fisilti-backup.log 2>&1
```

### 2. Database Restore

#### Restore Dosyaları

```bash
# SQL dosyasından restore
psql -U fisilti_user -h localhost fisilti < fisilti_20260523.sql

# Compressed dump dosyasından restore
pg_restore -U fisilti_user -h localhost -d fisilti fisilti_20260523.dump

# Şifrelenmiş dosyadan restore
gpg -d fisilti_20260523.sql.gpg | psql -U fisilti_user -h localhost fisilti
```

#### Restore Script

**Script**: `/usr/local/bin/restore-fisilti-db.sh`

```bash
#!/bin/bash

BACKUP_FILE=$1
DB_NAME="fisilti"
DB_USER="fisilti_user"
DB_HOST="localhost"

if [ -z "$BACKUP_FILE" ]; then
  echo "Kullanım: $0 <backup_file>"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Hata: Dosya bulunamadı: $BACKUP_FILE"
  exit 1
fi

echo "Restore başlanıyor: $BACKUP_FILE"
echo "⚠️  Uyarı: Mevcut veritabanı silinecek!"
read -p "Devam etmek için 'yes' yazın: " confirm

if [ "$confirm" != "yes" ]; then
  echo "İptal edildi."
  exit 0
fi

# Database'i sil ve yeniden oluştur
dropdb -U $DB_USER -h $DB_HOST -f $DB_NAME
createdb -U $DB_USER -h $DB_HOST $DB_NAME

# Restore et
if [[ $BACKUP_FILE == *.dump ]]; then
  pg_restore -U $DB_USER -h $DB_HOST -d $DB_NAME $BACKUP_FILE
elif [[ $BACKUP_FILE == *.sql ]]; then
  psql -U $DB_USER -h $DB_HOST -d $DB_NAME < $BACKUP_FILE
fi

if [ $? -eq 0 ]; then
  echo "✅ Restore başarılı!"
else
  echo "❌ Restore başarısız!"
  exit 1
fi
```

### 3. AWS S3 ile Remote Backup

**Script**: `/usr/local/bin/backup-to-s3.sh`

```bash
#!/bin/bash

BACKUP_FILE=$1
BUCKET="your-backup-bucket"
AWS_REGION="eu-west-1"

if [ -z "$BACKUP_FILE" ]; then
  echo "Hata: Backup dosyası belirtilmedi"
  exit 1
fi

# S3'e yükle
aws s3 cp $BACKUP_FILE s3://$BUCKET/fisilti-backups/ \
  --region $AWS_REGION \
  --sse AES256 \
  --storage-class GLACIER_IR

if [ $? -eq 0 ]; then
  echo "✅ S3 yükleme başarılı"
  
  # Lifecycle: 90 gün sonra Glacier'a taşı, 1 yıl sonra sil
  # Politika: S3 bucket lifecycle policies'de yapılandır
else
  echo "❌ S3 yükleme başarısız"
  exit 1
fi
```

---

## Log Management

### 1. Application Logging (Django)

**Dosya**: `backend/fisilti/settings.py`

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'json': {
            '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
            'format': '%(asctime)s %(name)s %(levelname)s %(message)s'
        }
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/var/log/fisilti/app.log',
            'maxBytes': 1024 * 1024 * 10,  # 10MB
            'backupCount': 5,
            'formatter': 'json',
        },
        'error_file': {
            'level': 'ERROR',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/var/log/fisilti/error.log',
            'maxBytes': 1024 * 1024 * 10,
            'backupCount': 10,
            'formatter': 'verbose',
        },
        'security_file': {
            'level': 'WARNING',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/var/log/fisilti/security.log',
            'maxBytes': 1024 * 1024 * 10,
            'backupCount': 20,
            'formatter': 'json',
        },
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.security': {
            'handlers': ['security_file'],
            'level': 'WARNING',
            'propagate': False,
        },
        'fisilti': {
            'handlers': ['file', 'error_file'],
            'level': 'DEBUG' if DEBUG else 'INFO',
            'propagate': False,
        },
    },
}
```

### 2. Nginx Logging

**Dosya**: `/etc/nginx/sites-available/fisilti`

```nginx
# Access Log
access_log /var/log/nginx/fisilti-access.log combined buffer=32k;

# Error Log
error_log /var/log/nginx/fisilti-error.log warn;

# Custom Log Format
log_format fisilti_json escape=json
  '{'
    '"time_local":"$time_local",'
    '"remote_addr":"$remote_addr",'
    '"remote_user":"$remote_user",'
    '"request":"$request",'
    '"status":$status,'
    '"body_bytes_sent":$body_bytes_sent,'
    '"http_referrer":"$http_referrer",'
    '"http_user_agent":"$http_user_agent",'
    '"request_time":$request_time,'
    '"upstream_response_time":"$upstream_response_time"'
  '}';

access_log /var/log/nginx/fisilti-access.json.log fisilti_json;
```

### 3. Log Rotation (logrotate)

**Dosya**: `/etc/logrotate.d/fisilti`

```
/var/log/fisilti/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 www-data www-data
    sharedscripts
    postrotate
        systemctl reload fisilti-backend > /dev/null 2>&1 || true
    endscript
}

/var/log/nginx/fisilti-*.log {
    daily
    rotate 14
    missingok
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    prerotate
        if [ -d /etc/logrotate.d/httpd-prerotate.d ]; then \
            run-parts /etc/logrotate.d/httpd-prerotate.d; \
        fi
    endscript
    postrotate
        systemctl reload nginx > /dev/null 2>&1 || true
    endscript
}
```

### 4. Centralized Logging (ELK Stack)

**Docker Compose** (`docker-compose.logging.yml`):

```yaml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data
    networks:
      - logging

  logstash:
    image: docker.elastic.co/logstash/logstash:8.0.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5000:5000"
    networks:
      - logging
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.0.0
    ports:
      - "5601:5601"
    networks:
      - logging
    depends_on:
      - elasticsearch

volumes:
  elasticsearch-data:

networks:
  logging:
```

**Logstash Config** (`logstash.conf`):

```
input {
  file {
    path => "/var/log/fisilti/app.log"
    start_position => "beginning"
    codec => "json"
  }
  file {
    path => "/var/log/nginx/fisilti-access.json.log"
    start_position => "beginning"
    codec => "json"
  }
}

filter {
  if [type] == "nginx" {
    mutate {
      add_field => { "[@metadata][index_name]" => "nginx-%{+YYYY.MM.dd}" }
    }
  } else {
    mutate {
      add_field => { "[@metadata][index_name]" => "app-%{+YYYY.MM.dd}" }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "%{[@metadata][index_name]}"
  }
}
```

---

## Monitoring & Alerting

### 1. Health Check Endpoint

**Dosya**: `backend/fisilti/urls.py`

```python
from django.http import JsonResponse
from django.db import connection

def health(request):
    try:
        # Database bağlantısı kontrol
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        return JsonResponse({
            "status": "healthy",
            "timestamp": timezone.now().isoformat(),
            "version": "1.0.0",
            "database": "ok",
        })
    except Exception as e:
        return JsonResponse({
            "status": "unhealthy",
            "error": str(e),
        }, status=503)
```

### 2. Prometheus Metrics

**Dosya**: `backend/requirements.txt`

```
prometheus-client==0.16.0
django-prometheus==3.0.1
```

**Dosya**: `backend/fisilti/settings.py`

```python
INSTALLED_APPS = [
    ...
    'django_prometheus',
]

MIDDLEWARE = [
    'django_prometheus.middleware.PrometheusBeforeMiddleware',
    ...
    'django_prometheus.middleware.PrometheusAfterMiddleware',
]
```

**Dosya**: `backend/fisilti/urls.py`

```python
urlpatterns = [
    ...
    path('metrics/', django_prometheus.views.metrics),
]
```

### 3. Grafana Monitoring

**Docker Compose**:

```yaml
services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana-dashboards:/etc/grafana/provisioning/dashboards
    depends_on:
      - prometheus
```

**Prometheus Config** (`prometheus.yml`):

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'django'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/metrics/'

  - job_name: 'nginx'
    static_configs:
      - targets: ['localhost:9113']

  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:9187']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - localhost:9093

rule_files:
  - '/etc/prometheus/rules.yml'
```

**Alert Rules** (`/etc/prometheus/rules.yml`):

```yaml
groups:
  - name: fisilti_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(django_http_requests_total_by_view_transport{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected"

      - alert: DatabaseDown
        expr: up{job="postgres"} == 0
        for: 1m
        annotations:
          summary: "Database is down"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, django_http_requests_latency_seconds_by_view_transport) > 1
        for: 5m
        annotations:
          summary: "High response time detected"

      - alert: DiskSpaceRunningOut
        expr: node_filesystem_avail_bytes{fstype="ext4"} / node_filesystem_size_bytes < 0.1
        for: 5m
        annotations:
          summary: "Disk space running out"
```

### 4. Uptime Monitoring (Healthchecks.io)

```bash
# Deployment sırasında çalıştır
curl -X POST https://hc-ping.com/YOUR_UUID

# Cronjob'da
0 * * * * curl -X POST https://hc-ping.com/YOUR_UUID || true
```

---

## CI/CD Pipeline

### 1. GitHub Actions (`.github/workflows/deploy.yml`)

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_DB: fisilti_test
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt

      - name: Run tests
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/fisilti_test
          DEBUG: 'False'
        run: |
          cd backend
          python manage.py test

      - name: Build frontend
        run: |
          cd frontend
          npm install
          npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_KEY }}
          script: |
            cd /home/deploy/fisilti
            git pull origin main
            
            # Backend deployment
            cd backend
            pip install -r requirements.txt
            python manage.py migrate
            python manage.py collectstatic --noinput
            systemctl restart fisilti-backend
            
            # Frontend deployment
            cd ../frontend
            npm install
            npm run build
            systemctl restart fisilti-frontend

      - name: Health check
        run: |
          curl -f https://your-domain.com/health/ || exit 1
```

### 2. Deployment Script

**Dosya**: `/usr/local/bin/deploy-fisilti.sh`

```bash
#!/bin/bash

set -e

REPO_DIR="/home/deploy/fisilti"
BRANCH="main"
LOG_FILE="/var/log/fisilti-deploy.log"

echo "[$(date)] Deployment başlanıyor..." >> $LOG_FILE

cd $REPO_DIR

# Latest kodu çek
git fetch origin
git checkout origin/$BRANCH

# Backend deployment
echo "[$(date)] Backend deploy ediliyor..." >> $LOG_FILE
cd backend
pip install -q -r requirements.txt
python manage.py migrate --noinput
python manage.py collectstatic --noinput
systemctl restart fisilti-backend

# Frontend deployment
echo "[$(date)] Frontend deploy ediliyor..." >> $LOG_FILE
cd ../frontend
npm install -q
npm run build
systemctl restart fisilti-frontend

# Health check
echo "[$(date)] Health check yapılıyor..." >> $LOG_FILE
sleep 2
if curl -f https://your-domain.com/health/ > /dev/null; then
  echo "[$(date)] ✅ Deployment başarılı!" >> $LOG_FILE
  # Slack notification
  curl -X POST $SLACK_WEBHOOK -d '{"text":"Deployment başarılı!"}'
else
  echo "[$(date)] ❌ Deployment başarısız!" >> $LOG_FILE
  # Rollback
  git revert HEAD --no-edit
  systemctl restart fisilti-backend fisilti-frontend
  exit 1
fi
```

---

## Production Checklist

### Dağıtımdan Önce

- [ ] Database migration'ları test edildi
- [ ] Environment variables ayarlandı
- [ ] SSL/TLS sertifikası kuruldu
- [ ] Backup plan hazır
- [ ] Monitoring setup tamamlandı
- [ ] Firewall kuralları yapılandırıldı
- [ ] Load balancer konfigürasyonu tamamlandı

### Dağıtım Sırasında

- [ ] Maintenance modunu aç
- [ ] Database backup'ı al
- [ ] Migration'ları çalıştır
- [ ] Static files'ları collect et
- [ ] Service'leri yeniden başlat
- [ ] Health check'i çalıştır
- [ ] Smoke test'leri yap
- [ ] Maintenance modunu kapat

### Dağıtım Sonrasında

- [ ] Monitoring dashboard'ı kontrol et
- [ ] Error logs'u kontrol et
- [ ] Performance metrics'i izle
- [ ] User feedback'i topla
- [ ] Incident response plan'ı test et

### Rutin İşlemler (Aylık)

- [ ] SSL sertifikası validity'sini kontrol et
- [ ] Backup dosyalarının varlığını doğrula
- [ ] Database optimize et (VACUUM, ANALYZE)
- [ ] Disk kullanımını kontrol et
- [ ] Dependencies'leri güncelle
- [ ] Security patches'i uygula
- [ ] Disaster recovery drill'i yap

---

## Troubleshooting

### SSL Sertifikası Sorunları

```bash
# Sertifikayı kontrol et
openssl x509 -in /etc/letsencrypt/live/your-domain.com/cert.pem -text -noout

# Sertifikaları listeleme
certbot certificates

# Manual renewal
certbot renew --force-renewal --dry-run
```

### Database Bağlantı Sorunları

```bash
# PostgreSQL durum
sudo systemctl status postgresql

# Veritabanına bağlan
psql -U fisilti_user -h localhost -d fisilti

# Bağlantıları kontrol et
psql -U fisilti_user -d fisilti -c "SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"
```

### Disk Alanı Sorunları

```bash
# Disk kullanımı
df -h

# Büyük dosyaları bul
du -sh /* | sort -rh

# Log dosyalarını temizle
journalctl --vacuum=30d
```

---

**Son Güncelleme**: 23 Mayıs 2026

**Durum**: ✅ PRODUCTION READY
