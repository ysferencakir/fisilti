# Fısıltı — Kaan Soruş

**Rol:** Ağ Tasarımcısı / Test Uzmanı / Web Geliştirici  
**Modül:** Takip Sistemi & Profil Sayfası  
**Branch adı:** `feature/kaan-follow`

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
git checkout -b feature/kaan-follow

git add .
git commit -m "feat(follow): kısa açıklama"
# Örnekler:
#   feat(follow): Follow modeli ve takip endpoint'leri
#   feat(follow): profil sayfası ve takip/bırak butonu

git pull origin main --rebase
git push origin feature/kaan-follow
# GitHub'da Pull Request aç → Yusuf merge eder
```

---

## Bağımlılık Durumu

- **Senden önce gelmesi gereken:** Yusuf (altyapı) + Kadircan'ın `User` migration'ları
- **Sana bağımlı olan:** Feed endpoint'i Follow tablosunu kullanıyor — Görkem ile sync'te kal.
- **Koordinasyon notu:** `is_following` alanı `UserSerializer`'da (Kadircan modülü) tanımlanır ama profil sayfasında sen kullanırsın. Kadircan `context={'request': request}` geçmeyi unutursa takip butonu her zaman "Takip Et" gösterir — bunu test et.

---

## Modülün: `apps/follows/`

### `models.py`

```
Follow
├── follower        FK → User, related_name='following_set', on_delete=CASCADE
│                   → "Benim takip ettiklerim"
├── following       FK → User, related_name='follower_set', on_delete=CASCADE
│                   → "Beni takip edenler"
├── created_at      DateTimeField, auto_now_add
└── Meta
    ├── unique_together = ('follower', 'following')
    └── indexes = [Index(fields=['follower']), Index(fields=['following'])]
```

> **`clean()` metodu:** `self.follower == self.following` ise `ValidationError` fırlat — kullanıcı kendini takip edemez (BR-14)

**`related_name` mantığı:**
```python
user.following_set.all()   # Bu kullanıcının takip ettiği Follow kayıtları
user.follower_set.all()    # Bu kullanıcıyı takip eden Follow kayıtları
```

---

### `serializers.py`

**`UserMiniSerializer`** — takipçi/takip edilen listelerinde kullanılır:
- Alanlar: `id`, `username`

> `is_following` alanı `UserSerializer`'dadır (Kadircan modülü). Sen sadece `UserMiniSerializer` tanımlarsın.

---

### `views.py`

| View | Endpoint | Yetki | İş Mantığı |
|---|---|---|---|
| `FollowView` | `POST /api/follows/<username>/follow/` | Giriş + doğrulanmış | Takip et — **kontrol sırası önemli**: (1) `IsEmailVerified` permission (2) `target == request.user` → 400 (3) `get_or_create` |
| `FollowView` | `DELETE /api/follows/<username>/follow/` | Giriş zorunlu | Takibi bırak: kayıt varsa sil, yoksa 200 dön (hata verme) |
| `FollowersView` | `GET /api/follows/<username>/followers/` | Herkese açık | Takipçi listesi — `UserMiniSerializer` ile sayfalı |
| `FollowingView` | `GET /api/follows/<username>/following/` | Herkese açık | Takip edilenler listesi — `UserMiniSerializer` ile sayfalı |

**Önemli kurallar:**
- `FollowView POST` — kontrol sırası (**sıra kritik, yanlış sıra bug yaratır**):
  1. `permission_classes = [IsEmailVerified]` — doğrulanmamış kullanıcı buraya giremez
  2. `if target.username == request.user.username: return Response(..., status=400)` — kendini takip edemez
  3. `Follow.objects.get_or_create(follower=request.user, following=target)` — takip kaydı
  > `get_or_create` sıralama SONUNA alınmalı. Önce kontroller yapılmadan `get_or_create` çağırılırsa, self-follow bile olsa kayıt oluşabilir (clean() metodu `full_clean()` çağrılmadan tetiklenmez).
- `FollowView DELETE`: `Filter(...).delete()` kullan — `get()` yapıp `delete()` çağırma; yoksa hata verme, 200 dön
- `IsEmailVerified`: `from apps.users.permissions import IsEmailVerified` — Kadircan tanımlıyor
- Olmayan username → 404
- BR-15: Takip tek yönlü — A → B takibi B'nin de A'yı takip ettiği anlamına gelmez

---

### `urls.py`

```
POST   /api/follows/<username>/follow/
DELETE /api/follows/<username>/follow/
GET    /api/follows/<username>/followers/
GET    /api/follows/<username>/following/
```

---

## Frontend

Tüm metinler Türkçe (OR-6). Mobil uyumlu (QA-13).

### `pages/Profile.jsx`

Route: `/profile/:username`

**Veri yükleme:**
1. `GET /api/users/<username>/` → `{ id, username, followers_count, following_count, is_following, ... }`
2. Paralel olarak (sayfa hazır olduktan sonra): `GET /api/posts/user/<username>/` → gönderiler

**Kullanıcı bilgi kartı:**
- Kullanıcı adı
- Takipçi sayısı (`followers_count`) | Takip edilen sayısı (`following_count`)

**Kendi profiliyse (`username === currentUser.username`):**
- "Hesabı Pasife Al" butonu → onay penceresi → `DELETE /api/users/me/` → logout yap ve `/login`'e yönlendir

**Başkasının profiliyse:**
- `is_following = true` → **"Takipten Çık"** butonu → `DELETE /api/follows/<username>/follow/`
- `is_following = false` → **"Takip Et"** butonu → `POST /api/follows/<username>/follow/`
- Butona tıklamada sayfa yenilemeden:
  - `is_following` state'i toggle et
  - `followers_count` ± 1 anlık güncelle

**Kullanıcı bulunamazsa:** "Kullanıcı bulunamadı." mesajı göster  
**Kullanıcı banlıysa:** "Bu hesap askıya alınmıştır." mesajı göster (profil verisi dönmeyebilir)

**İki sekme:**

| Sekme | Endpoint | Gösterim |
|---|---|---|
| "Gönderiler" | `GET /api/posts/user/<username>/` | `PostCard` ile, kendi profilinde düzenle/sil aktif |
| "Repost'lar" | `GET /api/posts/user/<username>/reposts/` | `PostCard` ile, başlıkta "🔁 Yeniden paylaşıldı" |

> Repost sekmesi için Görkem ile koordineli ol — endpoint Görkem modülünde, UI senin.

---

## Test Senaryoları (Zorunlu)

Test uzmanı rolün gereği bu senaryoları **hepsini** manuel veya otomatik test et:

| Senaryo | Beklenen Sonuç |
|---|---|
| A kullanıcısı B'yi takip eder | Follow kaydı oluşur, `followers_count` artar |
| Aynı kişiyi iki kez takip et | İkinci çağrıda 200, yeni kayıt oluşmaz |
| Kendini takip et | 400 |
| Doğrulanmamış kullanıcı takip eder | 403 |
| Takipten çık | Kayıt silinir, `followers_count` azalır |
| Takip etmediğini takipten çıkar | 200 (hata verme) |
| B'yi takip ettikten sonra feed kontrolü | B'nin gönderileri A'nın feed'inde görünür |
| B'yi takipten çıkınca feed kontrolü | B'nin gönderileri A'nın feed'inden düşer |
| Olmayan kullanıcıyı takip et | 404 |
| Profil sayfasında `is_following` | Takip edildiyse buton "Takipten Çık" göstermeli |

---

## Sana Ait Çapraz Kesim Gereksinimleri

| Gereksinim | Ne Yapacaksın |
|---|---|
| BR-4: Doğrulanmamış kullanıcı takip edemez | `FollowView POST`'da `is_email_verified` kontrolü |
| BR-14: Kendini takip edemez | `Follow.clean()` metodu + view'da `target == request.user` kontrolü |
| BR-15: Tek yönlü takip | Model düzeyinde zaten — A→B, B→A bağımsız kayıtlar |
| PR-5: DB sorguları optimize | `UserMiniSerializer` listelerinde `select_related` kullan |
| QA-3: Tarayıcı uyumu | Profile.jsx'i Chrome, Firefox, Edge'de test et |
| QA-13: Responsive | Profile.jsx mobil ekranda çalışmalı |

---

## Tamamlanma Kontrol Listesi

**Backend:**
- [ ] `models.py` — Follow (clean() metodu + indexes dahil)
- [ ] `serializers.py` — UserMiniSerializer
- [ ] `views.py` — FollowView (POST + DELETE), FollowersView, FollowingView
- [ ] `urls.py` — 4 endpoint
- [ ] Migration: `makemigrations follows` + `migrate`

**Frontend:**
- [ ] `pages/Profile.jsx` — kullanıcı kartı + takip/bırak butonu + iki sekme

**Test:**
- [ ] Yukarıdaki 9 test senaryosunun tamamı
- [ ] `is_following` alanı doğru çalışıyor mu? (Kadircan ile koordineli)
- [ ] `FollowView POST` kontrol sırası: IsEmailVerified → self-check → get_or_create
- [ ] Feed'deki takip etkisi Görkem ile birlikte test et
