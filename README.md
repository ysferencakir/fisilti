# Fısıltı — Kullanıcı Kılavuzu ve Admin Rehberi

Fısıltı, metin tabanlı bir mikro-blog platformudur. Gönderiler paylaşabilir, diğer kullanıcıları takip edebilir ve uygunsuz içerikleri raporlayabilirsiniz.

---

## İçindekiler

1. [Kurulum](#kurulum)
2. [Kullanıcı Kılavuzu](#kullanici-kilavuzu)
3. [Admin Rehberi](#admin-rehberi)
4. [Yardım / SSS](#yardim--sss)
5. [Teknik Bilgiler](#teknik-bilgiler)

---

## Kurulum

### Docker ile (Önerilen)

```bash
# Ortam değişkenlerini hazırlayın
cp backend/.env.example backend/.env
# .env dosyasını düzenleyip SECRET_KEY, DATABASE_URL ve e-posta bilgilerini girin

# Tüm servisleri başlatın
docker-compose up --build
```

- Backend: http://localhost:8000
- Frontend: http://localhost:5173

### Manuel

**Backend:**
```bash
cd backend
python -m venv venv && venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## Kullanıcı Kılavuzu

### Kayıt Olma

1. Ana sayfada **Kayıt Ol** butonuna tıklayın.
2. Ad soyad, kullanıcı adı (3–50 karakter, harf/rakam/_), e-posta ve şifrenizi girin.
3. Ülke seçimi isteğe bağlıdır.
4. Kullanım Şartları ve Gizlilik Politikası'nı kabul edin.
5. **Kayıt Ol** butonuna tıklayın.
6. E-postanıza gelen 6 haneli kodu doğrulama sayfasına girin. Kod 10 dakika geçerlidir.

> Şifre gereksinimleri: en az 8 karakter, büyük harf, küçük harf ve rakam içermelidir.

### Giriş Yapma

1. **Giriş Yap** sayfasına gidin.
2. E-posta ve şifrenizi girin.
3. Ard arda 5 hatalı girişte hesabınız geçici olarak kilitlenir (15 dakika bekleyin).

### Şifre Sıfırlama

1. Giriş sayfasında **Şifremi Unuttum** bağlantısına tıklayın.
2. E-posta adresinizi girin.
3. E-postanıza gelen bağlantıya tıklayın ve yeni şifrenizi belirleyin. Bağlantı 1 saat geçerlidir.

### Gönderi Paylaşma

1. Ana sayfada üst kısımdaki metin kutusuna yazınızı girin (en fazla 280 karakter).
2. Karakter sayacı kalan hakkı gösterir.
3. **Paylaş** butonuna tıklayın.

### Gönderi Düzenleme ve Silme

- Kendi gönderilerinizin üzerindeki **Düzenle** simgesine tıklayarak içeriği değiştirebilirsiniz.
- **Sil** simgesiyle gönderiyi silebilirsiniz. Silinen gönderiler diğer kullanıcılara görünmez.

### Profil Sayfası

- Sol menüden veya bir kullanıcı adına tıklayarak profil sayfasına ulaşabilirsiniz.
- Profilinizde tüm gönderileriniz ve repostlarınız listelenir.
- Avatar değiştirmek için profil sayfanızdaki avatar seçiciyi kullanın (tilki, baykuş, tavşan, kedi).

### Kullanıcı Takip Etme

1. Bir kullanıcının profil sayfasına gidin.
2. **Takip Et** butonuna tıklayın.
3. Ana sayfanızda artık o kullanıcının gönderileri görünecektir.
4. Takipten çıkmak için **Takipten Çık** butonunu kullanın.

### İçerik Raporlama

1. Uygunsuz bulduğunuz bir gönderinin altındaki **Raporla** butonuna tıklayın.
2. Rapor nedenini seçin: Spam, Uygunsuz İçerik, Taciz, Yanlış Bilgi veya Diğer.
3. Aynı gönderiyi birden fazla kez raporlayamazsınız.

### Hesabı Pasife Alma

- Ayarlar veya profil sayfasından hesabınızı pasife alabilirsiniz.
- Pasif hesap yeniden aktif etmek için giriş sayfasından e-posta ve şifrenizle **Hesabı Aktif Et** seçeneğini kullanın.

---

## Admin Rehberi

Admin paneline `/admin` adresinden veya sol menüden ulaşabilirsiniz. Yalnızca `admin` rolündeki hesaplar bu panele erişebilir.

### Kontrol Paneli (İstatistikler)

| Alan | Açıklama |
|------|----------|
| Toplam Kullanıcı | Tüm kayıtlı kullanıcı sayısı |
| Aktif Kullanıcı | Banlı veya pasif olmayan kullanıcılar |
| Banlı Kullanıcı | Geçici veya kalıcı askıya alınan hesaplar |
| Günlük Gönderi | Bugün paylaşılan gönderi sayısı |
| Ülke Dağılımı | Kullanıcıların ülkeye göre dağılımı |

Tarih aralığı seçerek günlük gönderi istatistiklerini görüntüleyebilirsiniz.

### Raporları İnceleme

1. **Raporlar** sekmesine gidin.
2. Raporlanan gönderiler, rapor sayısına göre sıralı listelenir.
3. Gönderi içeriğini, rapor nedenlerini ve raporlayan kullanıcıları görebilirsiniz.
4. **Pasife Al** butonu ile gönderiyi gizleyebilirsiniz. Gönderi veritabanından silinmez, denetim izi korunur.
5. İhtiyaç halinde **Aktife Al** ile gönderiyi tekrar görünür yapabilirsiniz.

> Gönderi pasife alındığında normal kullanıcılar göremez; admin panelinde görüntülenmeye devam eder.

### Kullanıcı Yönetimi

1. **Kullanıcılar** sekmesine gidin.
2. Kullanıcı adına göre arama yapabilirsiniz.
3. **Geçici Ban**: Kullanıcının yanındaki **Ban** butonuna tıklayıp gün sayısı girin.
4. **Kalıcı Ban**: Gün sayısı girmeden **Ban** butonuna tıklayın.
5. **Ban Kaldır**: Banlı kullanıcı satırındaki **Banı Kaldır** butonuna tıklayın.

> Kendi hesabınıza ve son kalan admin hesabına işlem yapamazsınız.

### Denetim Kayıtları (Audit Log)

- **Denetim Kaydı** sekmesinde tüm admin işlemlerini görebilirsiniz.
- Her kayıtta: işlemi yapan admin, işlem türü, hedef kullanıcı/gönderi ve zaman bilgisi yer alır.

---

## Yardım / SSS

**S: E-posta doğrulama kodunu almadım.**  
C: Spam klasörünüzü kontrol edin. Doğrulama sayfasında "Kodu tekrar gönder" butonunu kullanın (60 saniye beklemeniz gerekir).

**S: Şifremi unuttum.**  
C: Giriş sayfasındaki "Şifremi Unuttum" bağlantısını kullanarak e-postanıza sıfırlama linki gönderebilirsiniz.

**S: Başkasının gönderisini düzenleyemiyorum.**  
C: Yalnızca kendi gönderilerinizi düzenleyebilirsiniz. Bu bir güvenlik özelliğidir.

**S: Gönderi neden görünmüyor?**  
C: Gönderi admin tarafından gizlenmiş olabilir. Gizlenen gönderiler normal kullanıcılara gösterilmez.

**S: Hesabım askıya alındı, ne yapabilirim?**  
C: Geçici askıya alma için belirlenen süre dolduğunda otomatik olarak hesabınız açılır. Kalıcı askıya alma durumunda platform yönetimiyle iletişime geçin.

**S: Aynı gönderiyi iki kez raporlayamıyorum.**  
C: Her kullanıcı aynı gönderiyi yalnızca bir kez raporlayabilir. Bu, spam raporlamayı önlemek için geçerli bir kısıtlamadır.

**S: Ana sayfamda hiç gönderi yok.**  
C: Henüz kimseyi takip etmiyorsunuz. Başka kullanıcıların profillerine giderek takip edebilirsiniz.

**S: Hesabımı nasıl silebilirim?**  
C: Profil ayarlarından hesabınızı pasife alabilirsiniz. Tamamen silmek için platform destek kanalına başvurun.

---

## Teknik Bilgiler

| Özellik | Teknoloji |
|---------|-----------|
| Backend | Python / Django / Django REST Framework |
| Kimlik Doğrulama | JWT (SimpleJWT) — Access: 60 dk, Refresh: 7 gün |
| Veritabanı | PostgreSQL |
| Frontend | React + Vite |
| Container | Docker + docker-compose |
| E-posta | SMTP (Gmail veya benzeri) |
| Şifre Hashleme | PBKDF2 (Django varsayılan — güvenli) |

### Güvenlik Özellikleri

- E-posta doğrulama zorunluluğu
- Giriş denemesi sınırlaması (5 hatalı / 15 dakika)
- Ban durumu her request'te kontrol edilir (token geçerli olsa bile)
- Admin işlemleri denetim kaydıyla izlenir
- Production'da HTTPS/HSTS aktif
- SQL Injection: Django ORM koruması
- XSS: React DOM escaping koruması
- CSRF: Django CSRF middleware

### Yedekleme

Production ortamında PostgreSQL günlük yedeklemesi yapılandırılmalıdır:
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### Tasarım Kararları

**Cinsiyet Alanı:** SRS'de cinsiyet istatistiği belirtilmiş olsa da, gizlilik prensiplerine uyarak cinsiyet alanı **opsiyonel alınmamıştır**. Kullanıcıdan yalnızca gerekli bilgiler (ad soyad, e-posta, ülke) toplanmaktadır. Admin istatistiklerinde ülke/coğrafi dağılım yeterli demografik veriye sunmaktadır.

### Testleri Çalıştırma

```bash
cd backend
python manage.py test apps.users apps.posts apps.follows apps.reports
```
