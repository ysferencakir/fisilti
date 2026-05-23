# 🎤 Fısıltı — Mikro-Blog Platformu

> Düşüncelerinizi paylaşın, insanları takip edin, topluluk oluşturun.

Fısıltı, gönderiler paylaşabileceğiniz, diğer kullanıcıları takip edebileceğiniz ve uygunsuz içerikleri raporlayabileceğiniz güvenli bir mikro-blog platformudur. 

**Temel Özellikler:**
- ✅ Kolay kayıt ve e-posta doğrulama
- ✅ 280 karakterli gönderiler
- ✅ Takip sistemi ve feed
- ✅ Gönderi düzenleme ve silme
- ✅ İçerik raporlama ve moderasyon
- ✅ Admin kontrol paneli
- ✅ Güvenli kimlik doğrulama (JWT)

---

## 📑 İçindekiler

1. [Hızlı Başlangıç](#hızlı-başlangıç)
2. [Kurulum](#kurulum)
3. [Kullanıcı Kılavuzu](#kullanıcı-kılavuzu)
4. [Admin Rehberi](#admin-rehberi)
5. [Teknik Bilgiler](#teknik-bilgiler)
6. [Sıkça Sorulan Sorular](#sıkça-sorulan-sorular)

---

## 🚀 Hızlı Başlangıç

```bash
# Projeyi klonlayın
git clone <repo-url>
cd fısıltı

# Docker ile başlatın (önerilen)
docker-compose up --build

# Veya manuel kurulum
# Backend: python manage.py runserver  (port 8000)
# Frontend: npm run dev  (port 5173)
```

- 🌐 Frontend: http://localhost:5173
- 🔌 Backend API: http://localhost:8000
- 📋 Admin Paneli: http://localhost:8000/admin

---

## 🛠️ Kurulum

### Docker ile (Önerilen)

Gereksiz: `docker`, `docker-compose`

```bash
# 1. Ortam değişkenlerini hazırlayın
cp backend/.env.example backend/.env

# 2. .env dosyasını düzenleyin
#    SECRET_KEY, DATABASE_URL, SMTP ayarları, vb.

# 3. Servisleri başlatın
docker-compose up --build

# 4. Veritabanı migration'ı otomatik çalışır
```

✅ Hepsi bir komutla hazır!

---

### Manuel Kurulum

**Gereksinimler:** Python 3.9+, Node.js 18+, PostgreSQL

**Backend (Django):**
```bash
cd backend

# Python sanal ortamı
python -m venv venv
source venv/bin/activate      # Linux/Mac
# veya
venv\Scripts\activate          # Windows

# Bağımlılıkları yükleyin
pip install -r requirements.txt

# Veritabanını başlatın
python manage.py migrate

# Sunucuyu başlatın
python manage.py runserver
```

**Frontend (React + Vite):**
```bash
cd frontend
npm install
npm run dev
```

---

## 👤 Kullanıcı Kılavuzu

### 📝 Kayıt Olma

1. Ana sayfada **Kayıt Ol** butonuna tıklayın.
2. Ad soyad, kullanıcı adı (3–50 karakter, harf/rakam/_), e-posta ve şifrenizi girin.
3. Ülke seçimi isteğe bağlıdır.
4. Kullanım Şartları ve Gizlilik Politikası'nı kabul edin.
5. **Kayıt Ol** butonuna tıklayın.
6. E-postanıza gelen 6 haneli kodu doğrulama sayfasına girin. Kod 10 dakika geçerlidir.

> Şifre gereksinimleri: en az 8 karakter, büyük harf, küçük harf ve rakam içermelidir.

### 🔐 Giriş Yapma

1. **Giriş Yap** sayfasına gidin
2. E-posta ve şifrenizi girin
3. ⚠️ 5 hatalı girişte hesab 15 dakika kilitlenir

### 🔑 Şifre Sıfırlama

1. Giriş sayfasında **Şifremi Unuttum** bağlantısına tıklayın
2. E-posta adresinizi girin
3. E-postanıza gelen bağlantıya tıklayarak yeni şifre belirleyin (bağlantı 1 saat geçerli)

### ✍️ Gönderi Paylaşma

1. Ana sayfada metin kutusuna yazınızı girin (max 280 karakter)
2. Karakter sayacı kalan hakkı gösterir
3. **Paylaş** butonuna tıklayın

### ✏️ Gönderi Düzenleme ve Silme

| İşlem | Açıklama |
|-------|----------|
| **Düzenle** | Kendi gönderilerinizi değiştirin |
| **Sil** | Gönderiyi kaldırın (diğer kullanıcılara görünmez) |

### 👥 Profil Yönetimi

- **Profil Sayfası:** Sol menüden veya kullanıcı adına tıklayarak erişin
- **Gönderiler:** Tüm gönderileriniz ve repostlarınız burada listelenir
- **Avatar:** Tilki, baykuş, tavşan, kedi arasından seçin
- **Pasife Alma:** Ayarlardan hesabınızı geçici kapatabilirsiniz

### 👤 Kullanıcı Takip Etme

| İşlem | Adımlar |
|-------|---------|
| **Takip Et** | 1. Profil sayfasına gidin<br>2. **Takip Et** butonuna tıklayın<br>3. Gönderileri feed'inizde görün |
| **Takipten Çık** | **Takipten Çık** butonunu kullanın |

### 🚩 İçerik Raporlama

1. Uygunsuz gönderin altındaki **Raporla** butonuna tıklayın
2. Neden seçin: Spam, Uygunsuz İçerik, Taciz, Yanlış Bilgi, Diğer
3. 📌 Her gönderiyi yalnızca bir kez raporlayabilirsiniz

---

## 🛡️ Admin Rehberi

**Erişim:** `/admin` adresine gidin (yalnızca admin hesaplar)

### 📊 Kontrol Paneli (İstatistikler)

| Alan | Açıklama |
|------|----------|
| Toplam Kullanıcı | Tüm kayıtlı kullanıcı sayısı |
| Aktif Kullanıcı | Banlı veya pasif olmayan kullanıcılar |
| Banlı Kullanıcı | Geçici veya kalıcı askıya alınan hesaplar |
| Günlük Gönderi | Bugün paylaşılan gönderi sayısı |
| Ülke Dağılımı | Kullanıcıların ülkeye göre dağılımı |

Tarih aralığı seçerek günlük gönderi istatistiklerini görüntüleyebilirsiniz.

### 📋 Raporları İnceleme

| Adım | Açıklama |
|------|----------|
| 1️⃣ | **Raporlar** sekmesine gidin |
| 2️⃣ | Raporlanan gönderileri rapor sayısına göre görün |
| 3️⃣ | İçerik, neden ve raporlayanları inceleyin |
| 4️⃣ | **Pasife Al** ile gönderiyi gizleyin (silinmez) |
| 5️⃣ | **Aktife Al** ile geri getirin |

> 💡 Pasif gönderiler normal kullanıcılara görünmez, yalnızca admin panelinde görüntülenir.

### 👥 Kullanıcı Yönetimi

| İşlem | Talimatlar |
|-------|-----------|
| **Arama** | Kullanıcı adına göre ara |
| **Geçici Ban** | Ban butonuna tıkla → gün sayısı gir |
| **Kalıcı Ban** | Ban butonuna tıkla (gün yok) |
| **Ban Kaldır** | Banlı kullanıcı satırında Banı Kaldır butonuna tıkla |

> ⚠️ Kendi hesabınıza ve son admin hesabına işlem yapamazsınız.

### 📖 Denetim Kayıtları (Audit Log)

**Denetim Kaydı** sekmesinde tüm admin işlemleri izlenebilir:
- ✓ İşlemi yapan admin
- ✓ İşlem türü
- ✓ Hedef (kullanıcı/gönderi)
- ✓ Tarih ve saat

---

## ❓ Sıkça Sorulan Sorular (SSS)

<details>
<summary><b>S: E-posta doğrulama kodunu almadım.</b></summary>

**C:** 
1. Spam/Junk klasörünü kontrol edin
2. Doğrulama sayfasında "Kodu tekrar gönder" butonunu kullanın (60 saniye beklemelisiniz)
3. Hala alamazsanız platform desteğine başvurun
</details>

<details>
<summary><b>S: Şifremi unuttum.</b></summary>

**C:** Giriş sayfasındaki **"Şifremi Unuttum"** bağlantısını tıklayın ve sıfırlama linkini e-postanıza alabilirsiniz (1 saat geçerli).
</details>

<details>
<summary><b>S: Başkasının gönderisini neden düzenleyemiyorum?</b></summary>

**C:** Yalnızca **kendi gönderilerinizi** düzenleyebilirsiniz. Bu bir güvenlik özelliğidir. 🔒
</details>

<details>
<summary><b>S: Bir gönderi neden görünmüyor?</b></summary>

**C:** Gönderi şu nedenlerle gizlenmiş olabilir:
- Admin tarafından "pasife alınmış"
- Uygunsuz içerik raporı
- Silinmiş

Normal kullanıcılara gösterilmez.
</details>

<details>
<summary><b>S: Hesabım askıya alındı, ne yapmalıyım?</b></summary>

**C:**
- **Geçici ban:** Belirlenen süre sonunda otomatik açılır
- **Kalıcı ban:** Platform yönetimiyle iletişime geçin
</details>

<details>
<summary><b>S: Aynı gönderiyi iki kez raporlayabilir miyim?</b></summary>

**C:** Hayır, her kullanıcı aynı gönderiyi yalnızca **bir kez** raporlayabilir. Bu spam raporlamayı önlemek içindir.
</details>

<details>
<summary><b>S: Ana sayfamda hiç gönderi yok.</b></summary>

**C:** Henüz kimseyi takip etmiyorsunuz. 👥
1. Başka kullanıcıları bul
2. **Takip Et** butonuna tıkla
3. Feed'inde gönderiler görünmeye başlayacak
</details>

<details>
<summary><b>S: Hesabımı tamamen silebilir miyim?</b></summary>

**C:** 
- **Pasife alma:** Profil ayarlarından hesabı kapatabilirsiniz
- **Tam silme:** Platform desteğine başvurmanız gerekiyor
</details>

---

## ⚙️ Teknik Bilgiler

### Stack

| Katman | Teknoloji | Versiyon |
|--------|-----------|----------|
| **Backend** | Django + Django REST Framework | 4.0+ |
| **Frontend** | React + Vite | 18+ |
| **Veritabanı** | PostgreSQL | 12+ |
| **Kimlik Doğrulama** | JWT (SimpleJWT) | - |
| **Container** | Docker + docker-compose | - |
| **E-posta** | SMTP | Gmail, vs. |

### 🔒 Güvenlik Özellikleri

| Başlık | Detay |
|--------|-------|
| **E-posta Doğrulama** | Zorunlu, 10 dakika geçerli |
| **Giriş Sınırlaması** | 5 hatalı / 15 dakika → kilit |
| **Ban Kontrolü** | Her API isteğinde kontrol (token değil) |
| **JWT Token** | Access: 60 dk, Refresh: 7 gün |
| **Denetim Kayıtları** | Tüm admin işlemleri izlenir |
| **HTTPS/HSTS** | Production'da zorunlu |
| **SQL Injection** | Django ORM koruması |
| **XSS** | React DOM escaping |
| **CSRF** | Django CSRF middleware |
| **Şifre** | PBKDF2 hashleme (Django varsayılan) |

### 📦 Yedekleme

Production ortamında günlük PostgreSQL yedeklemesi yapılandırılmalıdır:

```bash
# Manuel yedekleme
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Geri yükleme
psql $DATABASE_URL < backup_20260523.sql
```

### 🏗️ Tasarım Kararları

**Gizlilik Odaklı Tasarım:**
- ❌ Cinsiyet alanı toplanmamaktadır (gizlilik prensibi)
- ✅ Yalnızca gerekli bilgiler: ad, e-posta, ülke
- ✅ Admin istatistikleri: ülke/coğrafi dağılım

### 🧪 Testleri Çalıştırma

```bash
cd backend
python manage.py test apps.users apps.posts apps.follows apps.reports
```

---

## 📄 Belgeler

Ayrıntılı kılavuzlar `documentation/` klasöründe:

- 📖 **KULLANICI_KILAVUZU.md** — Kullanıcı özellikleri
- 👨‍💼 **ADMIN_REHBERI.md** — Admin kontrol paneli
- 🚀 **DEPLOYMENT_SETUP.md** — Production kurulumu
- 🏛️ **INFRASTRUCTURE_DEVOPS.md** — DevOps yapılandırması
- 📋 **TEST_RAPORLARI.md** — Test sonuçları
- 🔐 **GIZLILIK_POLITIKASI.md** — Gizlilik politikası
- 📜 **KULLANIM_SARTLARI.md** — Kullanım şartları

---

## 💬 İletişim & Destek

- 📧 **E-posta:** support@fisilti.dev
- 🐛 **Hata Bildir:** [Issues](../../issues)
- 💡 **Öneriler:** Pull request açın

---

## 📜 Lisans

Bu proje MIT Lisansı altında yayınlanmıştır.

---

**Fısıltı — Düşüncelerinizi Paylaşmak Kadar Kolay** 🎤
