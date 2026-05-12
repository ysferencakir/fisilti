# Fısıltı — Yusuf Eren Çakır

**Rol:** Proje Yöneticisi / Web Geliştirici  
**Modül:** Proje Altyapısı + Routing + Frontend Çekirdeği  
**Branch adı:** `feature/yusuf-altyapi`

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
git checkout -b feature/yusuf-altyapi

git add .
git commit -m "feat(infra): kısa açıklama"

git pull origin main --rebase
git push origin feature/yusuf-altyapi
# GitHub'da Pull Request aç
```

---

## Bağımlılık Durumu

- **Senden önce gelmesi gereken:** Yok — **ilk tamamlanacak modül senin.**
- **Sana bağımlı olanlar:** Kadircan, Görkem, Kaan, Mert — hepsi senin kurduğun iskelet üzerine geliştiriyor.
- **Öncelik:** Altyapıyı bitir, main'e merge et, diğerleri başlasın.

---

## Modülün: Proje Altyapısı

### Backend

#### `apps/*/apps.py` — Dört app için AppConfig

Her app klasöründe bir `apps.py` oluştur. İçeriği şu şablona göre doldur:

```python
# apps/users/apps.py
from django.apps import AppConfig

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.users'
    label = 'users'
```

Aynı yapıyı `apps/posts/apps.py`, `apps/follows/apps.py`, `apps/reports/apps.py` için de oluştur (name ve label değerlerini uygun şekilde değiştir).

---

#### `fisilti/urls.py` — Merkezi URL Yönlendirici

Dört app'in URL'lerini `/api/` prefix'iyle buraya bağla:

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.users.urls')),
    path('api/', include('apps.posts.urls')),
    path('api/', include('apps.follows.urls')),
    path('api/', include('apps.reports.urls')),
]
```

---

#### `fisilti/settings.py` — Eklenecek Bloklar

`settings.py` büyük ölçüde hazır. Aşağıdaki blokları ekle:

**Loglama (OR-19, PV-11):**
```python
import os
LOGS_DIR = BASE_DIR / 'logs'
os.makedirs(LOGS_DIR, exist_ok=True)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'class': 'logging.FileHandler',
            'filename': LOGS_DIR / 'django.log',
        },
    },
    'loggers': {
        'django': {'handlers': ['file'], 'level': 'ERROR'},
    },
}
```
> ⚠️ Log dosyasına asla şifre, token veya tam e-posta yazma. Username ya da ID yeterli.

**Sayfalama (PR-5):**

`REST_FRAMEWORK` dict'ine ekle:
```python
'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
'PAGE_SIZE': 20,
```

**Önbellekleme — isteğe bağlı (PR-6):**
```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}
```

**Test / Production ayrımı (OR-20):**
- `.env`'deki `DEBUG=True/False` ile kontrol edilir — settings.py'de zaten `config('DEBUG')` var.
- `DEBUG=False` iken `ALLOWED_HOSTS` production domain'ini içermeli.
- Production'da `gunicorn` kullanılmalı (`runserver` sadece geliştirme içindir).

---

#### `docker-compose.yml`

```yaml
version: '3.9'

services:
  db:
    image: postgres:16
    env_file: ./backend/.env
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - ./backend:/app
    ports:
      - "8000:8000"
    env_file: ./backend/.env
    depends_on:
      - db

  frontend:
    build: ./frontend
    command: npm run dev -- --host
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  postgres_data:
```

---

#### Yedekleme Scripti (SR-12, OR-4, TBD-09)

`backup.sh` dosyası oluştur, root dizinine koy:
```bash
#!/bin/bash
mkdir -p backups
DATE=$(date +%Y%m%d_%H%M%S)
# docker exec yerine docker compose exec kullan — container adından bağımsız çalışır
docker compose exec -T db pg_dump -U fisilti_user fisilti > backups/backup_$DATE.sql
echo "Yedek alındı: backups/backup_$DATE.sql"
```

Geri yükleme:
```bash
docker compose exec -T db psql -U fisilti_user fisilti < backups/backup_TARIH.sql
```

Günlük cron için (sunucu üzerinde): `0 2 * * * cd /path/to/fisilti && bash backup.sh >> /var/log/fisilti_backup.log 2>&1`

> ⚠️ `docker exec <container-adı>` kullanma — container adı Docker Compose proje ayarına göre değişir. `docker compose exec <servis-adı>` her zaman çalışır.

---

### Frontend

#### `src/api/index.js`

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Her isteğe token ekle
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 gelince token yenile, yenilemezse logout
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('refreshToken');
        const { data } = await axios.post('http://localhost:8000/api/auth/token/refresh/', { refresh });
        localStorage.setItem('accessToken', data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

#### `src/context/AuthContext.jsx`

```jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      api.get('/users/me/')
        .then(({ data }) => setUser(data))
        .catch(() => localStorage.clear())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // login() hataları fırlatır — Login.jsx try/catch ile yakalar
  // error.response.status değerine göre: 429 = throttle, 403 = ban/unverified, 401 = yanlış şifre
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login/', { email, password });
    localStorage.setItem('accessToken', data.access);
    localStorage.setItem('refreshToken', data.refresh);
    const me = await api.get('/users/me/');
    setUser(me.data);
    // Hata durumunda bu fonksiyon throw eder — Login.jsx'in catch bloğu error.response.status'u okur
  };

  const logout = async () => {
    const refresh = localStorage.getItem('refreshToken');
    try { await api.post('/auth/logout/', { refresh }); } catch {}
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

---

#### `src/App.jsx`

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import PasswordReset from './pages/PasswordReset';  // Kadircan geliştirecek
import Profile from './pages/Profile';
import Admin from './pages/Admin';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Yükleniyor...</div>;
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Yükleniyor...</div>;
  if (!user) return <Navigate to="/login" />;
  return user.role === 'admin' ? children : <Navigate to="/" />;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Yükleniyor...</div>;
  return user ? <Navigate to="/" /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/password-reset" element={<GuestRoute><PasswordReset /></GuestRoute>} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

---

#### `src/components/Navbar.jsx`

```jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav style={{ padding: '10px', borderBottom: '1px solid #ccc', display: 'flex', gap: '16px' }}>
      <Link to="/"><strong>Fısıltı</strong></Link>
      {user ? (
        <>
          <Link to={`/profile/${user.username}`}>{user.username}</Link>
          {user.role === 'admin' && <Link to="/admin">Admin Panel</Link>}
          <button onClick={handleLogout}>Çıkış Yap</button>
        </>
      ) : (
        <>
          <Link to="/login">Giriş Yap</Link>
          <Link to="/register">Kayıt Ol</Link>
        </>
      )}
    </nav>
  );
}
```

---

## Sana Ait Çapraz Kesim Gereksinimleri

| Gereksinim | Ne Yapacaksın |
|---|---|
| SR-6: JWT oturum | SimpleJWT settings.py'de ayarlı — dokunmaya gerek yok |
| SR-7: Oturum timeout | axios interceptor'da 401 → refresh → logout zinciri |
| SR-8: Güvenlik | ORM kullan; `CORS_ALLOWED_ORIGINS` sadece frontend origin'i |
| SR-12: Yedekleme | `backup.sh` scripti + günlük cron |
| SR-13: HTTPS | Production'da nginx + SSL; geliştirmede HTTP |
| PR-4: 100 kullanıcı | Docker + gunicorn workers |
| PR-6: Önbellekleme | `CACHES` ayarı settings.py'ye ekle |
| OR-19: Hata logu | `LOGGING` konfigürasyonu |
| OR-20: Test/prod ayrımı | `.env`'deki `DEBUG` değişkeni ile |
| PV-11: Log'larda hassas veri yok | Log'a şifre/token/email yazmama kuralı |

---

## Tamamlanma Kontrol Listesi

- [ ] `apps/users/apps.py` — UsersConfig
- [ ] `apps/posts/apps.py` — PostsConfig
- [ ] `apps/follows/apps.py` — FollowsConfig
- [ ] `apps/reports/apps.py` — ReportsConfig
- [ ] `fisilti/urls.py` — tüm include'lar
- [ ] `fisilti/settings.py` — LOGGING, PAGINATION, CACHES eklendi
- [ ] `docker-compose.yml` — db + backend + frontend
- [ ] `src/api/index.js` — axios instance + interceptors
- [ ] `src/context/AuthContext.jsx`
- [ ] `src/App.jsx` — Router + korumalı route'lar
- [ ] `src/components/Navbar.jsx`
- [ ] Yedekleme scripti (`backup.sh`)
- [ ] `/password-reset` route'u App.jsx'e eklendi (Kadircan `PasswordReset.jsx`'i bitirdiğinde import et)
