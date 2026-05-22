# Fısıltı — Görkem Yümsel

**Rol:** Kullanıcı Arayüzü Tasarımcısı / Web Geliştirici  
**Modül:** Gönderi (Post) & Feed + Repost  
**Branch adı:** `feature/gorkem-posts`

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
git checkout -b feature/gorkem-posts

git add .
git commit -m "feat(posts): kısa açıklama"
# Örnekler:
#   feat(posts): Post ve Repost modelleri
#   feat(posts): feed endpoint ve PostCard bileşeni

git pull origin main --rebase
git push origin feature/gorkem-posts
# GitHub'da Pull Request aç → Yusuf merge eder
```

---

## Bağımlılık Durumu

- **Senden önce gelmesi gereken:** Yusuf (altyapı) + Kadircan'ın `User` migration'ları
- **Sana bağımlı olanlar:** Mert — `Report` modeli için `Post` modeline ihtiyaç duyuyor. Migration'larını bitir, Mert'e haber ver.
- **Koordinasyon:** Profile sayfasındaki "Repost'lar" sekmesi Kaan'ın `Profile.jsx`'iyle ilgili — Kaan ile konuşun.

---

## Modülün: `apps/posts/`

### `models.py`

```
Post
├── author          FK → settings.AUTH_USER_MODEL, related_name='posts', on_delete=CASCADE
├── content         TextField, max_length=280
├── is_active       BooleanField, default=True
│                   → admin pasife alır; delete() çağrılmaz
├── created_at      DateTimeField, auto_now_add
├── updated_at      DateTimeField, auto_now
└── Meta
    ├── ordering = ['-created_at']
    └── indexes = [Index(fields=['author', 'is_active'])]   ← feed sorgusu için

Repost  (yeniden paylaşım — ekstra özellik)
├── user            FK → User, related_name='reposts', on_delete=CASCADE
│                   → Yeniden paylaşan kullanıcı
├── post            FK → Post, related_name='reposts', on_delete=CASCADE
│                   → Orijinal gönderi
├── created_at      DateTimeField, auto_now_add
└── Meta
    ├── unique_together = ('user', 'post')
    └── indexes = [Index(fields=['user']), Index(fields=['post'])]
```

**Repost iş kuralları:**
- Kendi gönderisini repost edemez → 400
- `is_active=False` olan gönderi repost edilemez → 400
- Aynı gönderiyi iki kez repost edemez → DB unique_together zaten engeller, 400 mesajı ver
- E-posta doğrulanmamış kullanıcı repost edemez → 403

---

### `serializers.py`

**`PostSerializer`** — tüm post endpoint'lerinde kullanılır:
| Alan | Kural |
|---|---|
| `id` | read-only |
| `author_username` | `source='author.username'`, read-only |
| `content` | max_length 280, yazılabilir |
| `is_active` | read-only — sadece admin değiştirir |
| `created_at`, `updated_at` | read-only |
| `repost_count` | SerializerMethodField → `obj.reposts.count()` |
| `is_reposted` | SerializerMethodField → `Repost.objects.filter(user=request.user, post=obj).exists()` (`context['request']` gerekir) |

**`FeedItemSerializer`** — feed endpoint'inde her öğe bu yapıda döner:
| Alan | Tip | Açıklama |
|---|---|---|
| `type` | `"post"` / `"repost"` | Öğe türü |
| `timestamp` | datetime | Sıralama için: post'un `created_at`'i ya da repost'un `created_at`'i |
| `reposted_by` | string / null | `"repost"` ise repost eden kullanıcının username'i |
| `reposted_at` | datetime / null | `"repost"` ise repost tarihi |
| `post` | PostSerializer | Orijinal gönderinin tüm verisi |

---

### `views.py`

| View | Endpoint | Yetki | İş Mantığı |
|---|---|---|---|
| `FeedView` | `GET /api/posts/feed/` | Giriş zorunlu | Takip edilenlerden post + repost birleştirilir, timestamp sıralı, sayfalı |
| `PostCreateView` | `POST /api/posts/` | Giriş + doğrulanmış | `permission_classes = [IsEmailVerified]` — Kadircan'ın `apps.users.permissions`'ından import et; `author=request.user` |
| `PostUpdateView` | `PATCH /api/posts/<id>/` | Sadece gönderi sahibi | Sadece `content` güncellenir; `author != request.user` → 403 |
| `UserPostsView` | `GET /api/posts/user/<username>/` | Herkese açık | `is_active=True` + `author__is_banned=False` + `author__is_active=True` — pasife alınmış kullanıcının gönderileri de görünmemeli |
| `UserRepostsView` | `GET /api/posts/user/<username>/reposts/` | Herkese açık | Kullanıcının repost'larını döner |
| `PostDeleteView` | `DELETE /api/posts/<id>/` | Sadece gönderi sahibi | `author != request.user` → 403; **delete() çağır — repost değil orijinal gönderi** |
| `RepostView` | `POST /api/posts/<id>/repost/` | Giriş + doğrulanmış | Repost oluştur; kendi gönderisiyse 400; pasif gönderi ise 400 |
| `RepostView` | `DELETE /api/posts/<id>/repost/` | Giriş zorunlu | Repost'u geri al; yoksa 404 |

**`FeedView` detaylı mantığı:**

> `FeedView`'ın başına şu import'u ekle — `Follow` modeli Kaan'ın modülünde ama cross-app import güvenli (döngüsel değil):
> ```python
> from apps.follows.models import Follow
> from apps.users.permissions import IsEmailVerified  # PostCreateView için de lazım
> ```

```python
following_ids = Follow.objects.filter(
    follower=request.user
).values_list('following_id', flat=True)

# Takip edilenlerin orijinal gönderileri
posts = Post.objects.filter(
    author_id__in=following_ids,
    is_active=True
).select_related('author')

# Takip edilenlerin yaptığı repost'lar
reposts = Repost.objects.filter(
    user_id__in=following_ids,
    post__is_active=True
).select_related('user', 'post__author')

# İki listeyi birleştir, timestamp'e göre sırala
items = []
for p in posts:
    items.append({'type': 'post', 'timestamp': p.created_at, 'post': p})
for r in reposts:
    items.append({'type': 'repost', 'timestamp': r.created_at,
                  'reposted_by': r.user.username, 'reposted_at': r.created_at, 'post': r.post})

items.sort(key=lambda x: x['timestamp'], reverse=True)

# Manuel sayfalama — DRF pagination queryset bekler, Python list'e uygulanamaz
page = int(request.query_params.get('page', 1))
page_size = 20
start = (page - 1) * page_size
end = start + page_size
page_items = items[start:end]

return Response({
    'count': len(items),
    'next': f'?page={page + 1}' if end < len(items) else None,
    'previous': f'?page={page - 1}' if page > 1 else None,
    'results': FeedItemSerializer(page_items, many=True, context={'request': request}).data
})
```

> ⚠️ **DRF sayfalama bu view'da çalışmaz** çünkü iki farklı queryset'i birleştirip Python list haline getiriyoruz. `PAGE_SIZE` ayarı burada otomatik devreye girmez — yukarıdaki manuel sayfalamayı kullan.

---

**Kritik not — `PostSerializer` context:**

`PostSerializer` içindeki `is_reposted` alanı `context['request']`'e bağımlı. Her view'da **mutlaka** şu şekilde çağır:

```python
# Tek nesne
PostSerializer(post, context={'request': request}).data

# Liste
PostSerializer(queryset, many=True, context={'request': request}).data
```

Bunu unutursan `is_reposted` her zaman `False` döner — kullanıcının kendi repost'larını göremez.

---

### `urls.py`

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

## Frontend Bileşenleri

Tüm metinler Türkçe (OR-6). Tüm ekranlar mobil uyumlu (QA-13).

### `components/PostCard.jsx`

Props: `{ item, currentUser, onDelete, onUpdate, onRepost, onReport }`

> `item` artık `FeedItemSerializer` çıktısı: `{ type, timestamp, reposted_by, reposted_at, post }`

**Repost başlığı** (`type === "repost"` ise):
```
🔁 <reposted_by> yeniden paylaştı
```
Tıklanınca `/profile/<reposted_by>` sayfasına git.

**İçerik alanı:**
- Yazar adı → `/profile/<post.author_username>`
- Gönderi içeriği
- Tarih; `updated_at !== created_at` ise "(düzenlendi)" etiketi

**Action bar (alt kısım):**

`post.author_username === currentUser.username` ise:
- **Düzenle** → içeriği inline textarea'ya dönüştür → karakter sayacı (maks 280) → `PATCH /api/posts/<post.id>/`
- **Sil** → onay penceresi → `DELETE /api/posts/<post.id>/`

`post.author_username !== currentUser.username` ise:
- **🔁 Yeniden Paylaş** → `post.is_reposted` ise dolu ikon (turuncu/yeşil), değilse boş ikon
  - Tıklayınca: `is_reposted ? DELETE : POST` → `/api/posts/<post.id>/repost/`
  - Anlık sayaç güncelle: `post.repost_count ± 1`
- **Rapor** → küçük modal aç:
  - Gerekçe seçenekleri: Spam / Uygunsuz İçerik / Taciz / Yanlış Bilgi / Diğer
  - "Gönder" → `POST /api/reports/ { post_id: post.id, reason: seçilen }`
  - Daha önce raporlandıysa buton devre dışı

---

### `pages/Home.jsx`

- Sayfa yüklenince `GET /api/posts/feed/?page=1` → `FeedItemSerializer` listesi
- **Üst bölüm:** textarea (280 karakter sayacı) + "Paylaş" butonu → `POST /api/posts/ { content }`
- **Gönderi listesi:** Her `item` için `<PostCard item={item} currentUser={user} ... />`
- **Boş durum:** "Henüz kimseyi takip etmiyorsunuz. Kullanıcı arayın veya profil ziyaret edin."
- **Sonraki sayfa:** "Daha fazla yükle" butonu veya sonsuz scroll → `?page=2, 3...`
- Yeni gönderi paylaşılınca veya silinince listeyi güncelle

---

### `pages/Profile.jsx` — Görkem + Kaan birlikte

Profil sayfasında iki sekme:
- **"Gönderiler"** sekmesi → `GET /api/posts/user/<username>/` → `PostCard` ile göster
- **"Repost'lar"** sekmesi → `GET /api/posts/user/<username>/reposts/` → başlıkta "🔁 Yeniden paylaşıldı" banner'ı ile göster

Bu sekmeleri Kaan ile koordineli geliştir — Profile.jsx Kaan'ın modülünde ama repost sekmesi için endpoint senin.

---

## Sana Ait Çapraz Kesim Gereksinimleri

| Gereksinim | Ne Yapacaksın |
|---|---|
| BR-4: Doğrulanmamış kullanıcı paylaşamaz | `PostCreateView`'da `is_email_verified` kontrolü |
| BR-5/BR-6: Sadece kendi gönderisini sil/düzenle | `PostUpdateView` ve `PostDeleteView`'da `author == request.user` |
| BR-12: Pasif gönderi görünmez | `UserPostsView`'da `is_active=True` filtresi |
| BR-13: Feed sadece takip edilenler | `FeedView`'da `author_id__in` filtresi |
| BR-18: Veri silinmez | `PostUpdateView` ve `PostDeleteView`'da `is_active` flag kullan; `delete()` yok |
| SR-5: Sahiplik kontrolü | Her write işleminde `author == request.user` |
| SR-9: Backend validasyon | Tüm input serializer'dan geçmeli |
| PR-2: Gönderi oluşturma ≤ 3 sn | — |
| PR-3: Feed ≤ 2 sn | `select_related('author')` + `prefetch_related('reposts')` kullan |
| PR-5: N+1 sorgu yok | Feed sorgusunda `select_related` / `prefetch_related` |
| QA-13: Responsive | Home.jsx ve PostCard mobil uyumlu |

---

## Tamamlanma Kontrol Listesi

**Backend:**
- [x] `models.py` — Post (indexes dahil), Repost
- [x] `serializers.py` — PostSerializer (repost_count, is_reposted), FeedItemSerializer
- [x] `views.py` — 8 view (FeedView, PostCreate, PostUpdate, UserPosts, UserReposts, PostDelete, RepostView×2)
- [x] `urls.py` — 8 endpoint
- [x] Migration: `makemigrations posts` + `migrate`

**Frontend:**
- [x] `components/PostCard.jsx` — repost header, düzenle/sil/rapor/repost butonları
- [x] `pages/Home.jsx` — feed + gönderi oluşturma + sayfalama

**Test (temel):**
- [x] Gönderi oluştur → feed'de görünüyor mu?
- [x] Kendi gönderisini düzenle → "(düzenlendi)" etiketi çıkıyor mu?
- [x] Başkasının gönderisini silmeye çalış → 403 geliyor mu?
- [x] Repost et → sayaç artıyor mu?
- [x] Repost geri al → sayaç azalıyor mu?
- [x] Pasif gönderiye repost denemesi → 400 geliyor mu?
- [x] Rapor modal açılıyor mu, gerekçe seçilebiliyor mu?
