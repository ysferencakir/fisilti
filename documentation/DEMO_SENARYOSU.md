# FISILTI - Demo Senaryosu

**Son Güncelleme**: 23 Mayıs 2026

---

## İçindekiler

1. [Demo Ortamı Kurulumu](#demo-ortamı-kurulumu)
2. [Senaryo 1: Kullanıcı Kayıt ve Giriş](#senaryo-1-kullanıcı-kayıt-ve-giriş)
3. [Senaryo 2: Gönderi Oluşturma ve Düzenleme](#senaryo-2-gönderi-oluşturma-ve-düzenleme)
4. [Senaryo 3: Takip Sistemi](#senaryo-3-takip-sistemi)
5. [Senaryo 4: Feed ve İçerik Keşfi](#senaryo-4-feed-ve-içerik-keşfi)
6. [Senaryo 5: Raporlama Sistemi](#senaryo-5-raporlama-sistemi)
7. [Senaryo 6: Admin Panel İşlemleri](#senaryo-6-admin-panel-işlemleri)
8. [Senaryo 7: Güvenlik Özellikleri](#senaryo-7-güvenlik-özellikleri)
9. [Senaryo 8: Hata Işleme](#senaryo-8-hata-işleme)

---

## Demo Ortamı Kurulumu

### Gerekli Araçlar

```bash
# Terminal
- curl veya Postman
- Git
- Docker (opsiyonel)

# Tarayıcı
- Chrome, Firefox, Safari veya Edge (güncel sürüm)

# Sunucular
- Backend: http://localhost:8000/api
- Frontend: http://localhost:5173
```

### Demo Hesapları

```yaml
# Admin Hesabı
Email: admin@fisilti.com
Şifre: AdminPassword123!
Rol: admin

# Test Kullanıcısı 1
Email: user1@fisilti.com
Şifre: TestUser@123
Kullanıcı Adı: testuser1

# Test Kullanıcısı 2
Email: user2@fisilti.com
Şifre: TestUser@123
Kullanıcı Adı: testuser2

# Test Kullanıcısı 3
Email: user3@fisilti.com
Şifre: TestUser@123
Kullanıcı Adı: testuser3
```

### Başlangıç Verileri

```bash
# Database'i sıfırla
python manage.py reset_db

# Fixture'ları yükle
python manage.py loaddata demo_data.json

# Veya manuel oluştur
python manage.py shell
>>> from apps.users.models import User
>>> User.objects.create_user(
...     email='user1@fisilti.com',
...     username='testuser1',
...     password='TestUser@123',
...     is_email_verified=True,
...     data_processing_consent=True
... )
```

---

## Senaryo 1: Kullanıcı Kayıt ve Giriş

### 1.1 Kayıt (Registration)

**Amaç**: Yeni kullanıcı kaydının tüm adımlarını göster

**Adımlar**:

1. **Register Sayfasını Aç**
   ```
   URL: http://localhost:5173/register
   ```

2. **Form Alanlarını Doldur**
   - **Ad Soyad**: Ahmet Yılmaz
   - **Kullanıcı Adı**: ahmetyilmaz
   - **E-posta**: ahmet@example.com
   - **Şifre**: SecurePass@123
   - **Ülke**: Türkiye (opsiyonel)
   - **Kullanım Şartları**: ✓ Kabul et
   - **KVKK Rızası**: ✓ Veri işlemeyi onaylıyorum

3. **Şifre Validasyonunu Gözlemle**
   - ✓ En az 8 karakter
   - ✓ Büyük harf (S, P)
   - ✓ Küçük harf (ecure, ass)
   - ✓ Rakam (123)

4. **"Kayıt Ol" Butonuna Tıkla**

5. **Beklenen Sonuç**
   ```
   Redirect: /verify-email?email=ahmet@example.com
   Message: "Kayıt başarılı. Doğrulama kodu e-postanıza gönderildi."
   ```

---

### 1.2 E-posta Doğrulama (Email Verification)

**Amaç**: E-posta doğrulama akışını göster

**Adımlar**:

1. **Verify Email Sayfası**
   ```
   URL: http://localhost:5173/verify-email?email=ahmet@example.com
   ```

2. **E-posta Doğrulama Kodunu Gir**
   - Kod 6 haneli rakamlardan oluşur
   - Test ortamında console'da gösterilir veya:
   ```bash
   # Backend console'dan kod al
   python manage.py shell
   >>> from apps.users.models import EmailVerification
   >>> EmailVerification.objects.latest('created_at').code
   ```

3. **Kodu Gir ve "Doğrula" Butonuna Tıkla**

4. **Beklenen Sonuç**
   ```
   Message: "E-posta doğrulandı."
   Redirect: /login
   User.is_email_verified = True
   ```

---

### 1.3 Giriş (Login)

**Amaç**: Giriş sürecini göster

**Adımlar**:

1. **Login Sayfasını Aç**
   ```
   URL: http://localhost:5173/login
   ```

2. **Kimlik Bilgilerini Gir**
   - **E-posta**: ahmet@example.com
   - **Şifre**: SecurePass@123

3. **"Giriş Yap" Butonuna Tıkla**

4. **Beklenen Sonuç**
   ```
   JWT Token'lar atanır:
   - access_token (15 dakika)
   - refresh_token (7 gün)
   
   Redirect: /feed
   LocalStorage'da token'lar saklanır
   ```

**Başarısız Giriş Testi**:
- Yanlış e-posta → "E-posta veya şifre hatalı"
- Yanlış şifre → "E-posta veya şifre hatalı"
- 5 hatalı deneme → Throttle: "Çok fazla hatalı deneme. 15 dakika bekleyin."

---

### 1.4 Şifre Sıfırlama (Password Reset)

**Amaç**: Şifremi unuttum akışını göster

**Adımlar**:

1. **Login Sayfasında "Şifremi Unuttum" Linkine Tıkla**

2. **E-posta Adresi Gir**
   - **E-posta**: ahmet@example.com

3. **"Gönder" Butonuna Tıkla**

4. **Beklenen Sonuç**
   ```
   Message: "Şifre sıfırlama linki gönderildi."
   
   E-postada alınan bağlantı:
   http://localhost:5173/reset-password?token=UUID-TOKEN
   ```

5. **Yeni Şifre Belirle**
   - **Yeni Şifre**: NewSecure@456
   - **Şifre Tekrar**: NewSecure@456

6. **Beklenen Sonuç**
   ```
   Message: "Şifre başarıyla güncellendi."
   Redirect: /login
   Yeni şifre ile giriş yapılabilir
   ```

---

## Senaryo 2: Gönderi Oluşturma ve Düzenleme

### 2.1 Gönderi Oluşturma (Post Creation)

**Amaç**: Gönderi oluşturma işlevini göster

**Adımlar**:

1. **Feed Sayfasına Git**
   ```
   URL: http://localhost:5173/feed
   ```

2. **Gönderi Input Alanını Gözlemle**
   ```
   "Ne düşünüyorsun?" input'u
   Karakter Sayıcı: 0/280
   ```

3. **Gönderi Yaz**
   ```
   "FISILTI platformu çok harika! Tüm arkadaşlarımı davet ettim. 🎉"
   ```

4. **Karakter Sayıcısını Gözlemle**
   ```
   Karakter Sayıcı: 74/280
   "Gönder" Butonu: Aktif
   ```

5. **"Gönder" Butonuna Tıkla**

6. **Beklenen Sonuç**
   ```
   POST /api/posts/
   Status: 201 Created
   
   Gönderi Feed'in üstünde görünür:
   - Yazarın adı ve avatar
   - Gönderi metni
   - Gönderme tarihi
   - Edit, Delete, Repost butonları
   ```

**Hata Testi**:
- **Boş gönderi**: "Gönderi boş olamaz"
- **280+ karakter**: "En fazla 280 karakter"
- **Doğrulanmamış e-posta**: "E-postanızı doğrulayın"

---

### 2.2 Gönderiyi Düzenleme (Post Update)

**Amaç**: Gönderi düzenleme işlevini göster

**Adımlar**:

1. **Kendi Gönderisinin "Edit" Butonuna Tıkla**

2. **Metin Düzenle**
   ```
   Eski: "FISILTI platformu çok harika!"
   Yeni: "FISILTI platformu gerçekten harika! Tüm arkadaşlarım severdi! ✨"
   ```

3. **"Güncelle" Butonuna Tıkla**

4. **Beklenen Sonuç**
   ```
   PUT /api/posts/{id}/
   Status: 200 OK
   
   Gönderi güncellenir:
   - "Düzenlenmiş" etiketi gösterilir
   - Yeni metin görünür
   - Güncelleme tarihi değişir
   ```

---

### 2.3 Gönderiyi Silme (Post Deletion)

**Amaç**: Gönderi silme işlevini göster

**Adımlar**:

1. **Gönderinin "Sil" Butonuna Tıkla**

2. **Onay İletişim Kutusu**
   ```
   "Bu gönderiyi silmek istediğinizden emin misiniz? 
    Bu işlem geri alınamaz."
   
   Butonlar: [Evet, Sil] [İptal]
   ```

3. **"Evet, Sil" Butonuna Tıkla**

4. **Beklenen Sonuç**
   ```
   DELETE /api/posts/{id}/
   Status: 204 No Content
   
   Gönderi Feed'den kaybolur
   (Soft delete: is_active=False)
   ```

---

## Senaryo 3: Takip Sistemi

### 3.1 Kullanıcıyı Takip Etme (Follow User)

**Amaç**: Takip sistemi işlevini göster

**Adımlar**:

1. **Başka Bir Kullanıcının Profiline Git**
   ```
   URL: http://localhost:5173/user/testuser2
   ```

2. **Profil Sayfasını Gözlemle**
   ```
   - Avatar ve kullanıcı adı
   - Gönderilerin sayısı
   - Takipçi/takip edilen sayısı
   - "Takip Et" Butonu
   ```

3. **"Takip Et" Butonuna Tıkla**

4. **Beklenen Sonuç**
   ```
   POST /api/users/{username}/follow/
   Status: 200 OK
   Message: "Takip edildi."
   
   - Buton "Takıp Bırak" olur
   - Takip edilen sayısı artar
   - Renkli/aktif görünüm
   ```

**Doğrulanmamış E-posta Testi**:
- E-postası doğrulanmayan kullanıcı takip edemez
- Hata: "E-postanızı doğrulayın"

---

### 3.2 Kendini Takip Etmeye Çalış

**Amaç**: Kendini takip etme koruması göster

**Adımlar**:

1. **Kendi Profiline Git**
   ```
   URL: http://localhost:5173/profile
   ```

2. **"Takip Et" Butonu Gözlemle**
   ```
   Buton görüntülenmez veya disabled'dir
   ```

3. **API Testi (curl)**
   ```bash
   curl -X POST http://localhost:8000/api/users/ahmetyilmaz/follow/ \
   -H "Authorization: Bearer $TOKEN"
   
   Response:
   {
     "detail": "Kendini takip edemezsin."
   }
   ```

---

### 3.3 Takip Edilen Listesini Görüntüle

**Amaç**: Takip edilen kullanıcıları göster

**Adımlar**:

1. **Profilde "Takip Edilen" Sekmesine Tıkla**

2. **Beklenen Sonuç**
   ```
   Takip edilen tüm kullanıcılar listelenir:
   - Avatar ve kullanıcı adı
   - "Takıp Bırak" Butonu
   ```

3. **Bir Kullanıcıyı "Takıp Bırak" Butonuna Tıkla**

4. **Beklenen Sonuç**
   ```
   DELETE /api/users/{username}/follow/
   Status: 200 OK
   Message: "Takip bırakıldı."
   
   Kullanıcı listeden kaldırılır
   Takip edilen sayısı azalır
   ```

---

## Senaryo 4: Feed ve İçerik Keşfi

### 4.1 Feed Sayfası

**Amaç**: Takip edilen kullanıcıların gönderilerini göster

**Adımlar**:

1. **Feed Sayfasına Git**
   ```
   URL: http://localhost:5173/feed
   ```

2. **Beklenen Görüntü**
   ```
   Gönderiler çok yeni olanlar üstte (DESC by created_at)
   
   Her gönderi:
   - Yazarın avatar'ı ve username'i
   - Gönderilme tarihi ("2 dakika önce", "1 saat önce")
   - Gönderi metni (max 280 char)
   - Edit, Delete, Repost butonları (sadece kendi gönderileri)
   - Repost, Rapor butonları
   ```

3. **Feed Mantığını Test Et**
   ```
   Kendi gönderileriniz görünür
   Takip ettiğiniz kullanıcıların gönderileri görünür
   Takip etmediğiniz kullanıcıların gönderileri görünmez
   ```

4. **Infinite Scroll Test**
   ```
   Sayfayı aşağı scroll et
   Otomatik olarak daha fazla gönderi yüklenir
   ```

---

### 4.2 Repost (Gönderileri Yeniden Paylaş)

**Amaç**: Repost işlevini göster

**Adımlar**:

1. **Bir Gönderiyi Repost Et**
   - Başka bir kullanıcının gönderisi
   - "Repost" Butonuna Tıkla

2. **Beklenen Sonuç**
   ```
   POST /api/posts/{id}/repost/
   Status: 201 Created
   
   - "Repost yaptın" mesajı
   - Buton "Repost'u Kaldır" olur
   ```

3. **Profil Sayfasında Repostlar**
   - Kendi profilde "Repostlar" sekmesi
   - Repostladığın gönderiler listeler

4. **Repost Kaldırma**
   - "Repost'u Kaldır" Butonuna Tıkla
   - Repost'tan çıkarılır

---

### 4.3 Kullanıcı Profili

**Amaç**: Profil sayfası işlevlerini göster

**Adımler**:

1. **Profil Sayfasını Aç**
   ```
   URL: http://localhost:5173/profile
   ```

2. **Beklenen Görüntü**
   ```
   - Avatar ve Kullanıcı Bilgileri
   - Gönderilerin sayısı
   - Takipçi/takip edilen sayısı
   
   Sekmeler:
   - Gönderiler (tüm gönderilerim)
   - Repostlar (repostladığım gönderiler)
   - Takipçiler (kim takip ediyor)
   - Takip Edilen (kim takip ediyorum)
   ```

3. **Profil Düzenleme**
   - "Profili Düzenle" Butonuna Tıkla
   - Avatar değiştir (fox, owl, rabbit, cat)
   - "Kaydet" Butonuna Tıkla

4. **Hesabı Pasifleştir**
   - "Ayarlar" → "Hesabı Pasifleştir"
   - Onay: "Emin misiniz?"
   - Hesap pasife alınır (login yapılamaz)

5. **Hesabı Yeniden Aktifleştir**
   ```
   URL: /reactivate
   E-posta: user@example.com
   Şifre: password
   
   Hesap aktif hale gelir
   ```

---

## Senaryo 5: Raporlama Sistemi

### 5.1 Gönderiyi Raporla

**Amaç**: Uygunsuz içeriği raporlama göster

**Adımlar**:

1. **Bir Gönderiyi Rapor Et**
   - Gönderi altında "Rapor Et" Butonuna Tıkla

2. **Rapor Modal'ını Gözlemle**
   ```
   Rapor Nedeni (zorunlu):
   - Spam
   - Uygunsuz İçerik
   - Taciz
   - Yanlış Bilgi
   - Diğer
   
   Açıklama (isteğe bağlı):
   [textarea: Neden raporluyorsunuz?]
   
   Butonlar: [Rapor Et] [İptal]
   ```

3. **"Uygunsuz İçerik" Seçip "Rapor Et" Butonuna Tıkla**

4. **Beklenen Sonuç**
   ```
   POST /api/reports/
   {
     "post_id": 123,
     "reason": "inappropriate",
     "description": "..."
   }
   
   Status: 201 Created
   Message: "Raporunuz gönderildi. Teşekkürler!"
   
   Report.status = "pending"
   ```

**Koruma Mekanizmaları**:
- Doğrulanmamış kullanıcı rapor edemez
- Aynı gönderi iki kez raporlanamaz
- Rapor sayıları takip edilir

---

### 5.2 Yanlış Raporlama Testi

**Amaç**: Raporlama koruması göster

**Adımlar**:

1. **Aynı Gönderiyi Tekrar Raporla**

2. **Beklenen Sonuç**
   ```
   Error 400: "Bu gönderiyi zaten raporladınız."
   ```

---

## Senaryo 6: Admin Panel İşlemleri

### 6.1 Admin Paneline Giriş

**Amaç**: Admin paneli erişimini göster

**Adımlar**:

1. **Admin Hesabı ile Giriş**
   ```
   Email: admin@fisilti.com
   Şifre: AdminPassword123!
   ```

2. **Profil Simgesine Tıkla**
   - Sağ üst köşedeki profil menüsü
   - "Admin Paneli" Seçeneği

3. **Admin Dashboard Açılır**
   ```
   URL: http://localhost:5173/admin
   
   Sekmeler:
   - Dashboard (İstatistikler)
   - Raporlanmış Gönderiler
   - Gönderiler
   - Kullanıcılar
   - Audit Log
   ```

---

### 6.2 Raporlanan Gönderileri Yönet

**Amaç**: Admin raporlama işlevlerini göster

**Adımlar**:

1. **"Raporlanmış Gönderiler" Sekmesine Git**

2. **Raporlanan Gönderi Listesi**
   ```
   Filtreleme:
   - Tüm (default)
   - Beklemede (pending)
   - Çözülmüş (resolved)
   - Reddedildi (dismissed)
   
   Her gönderi:
   - Gönderi metin başı
   - Yazar bilgisi
   - Rapor sayısı
   - En son rapor tarihi
   ```

3. **Bir Gönderiyi Seç**
   - Tüm raporları gözlemle:
     - Raporlayan kullanıcı
     - Rapor nedeni
     - Rapor tarihi
     - Açıklama

4. **"Gönderiyi Pasifleştir" Butonuna Tıkla**

5. **Beklenen Sonuç**
   ```
   POST /api/admin/posts/{id}/deactivate/
   Status: 200 OK
   
   - Gönderi is_active=False
   - Tüm pending raporlar automatically "resolved" olur
   - AuditLog kaydı oluşturur
   - Listeden kaybolur
   ```

---

### 6.3 Rapor İçin Manuel İşlem

**Amaç**: Manuel rapor çözümleme göster

**Adımlar**:

1. **Pending Raporları Filtrele**

2. **Bir Rapor İçin "Çözümle" Butonuna Tıkla**
   ```
   POST /api/admin/reports/{id}/resolve/
   Status: 200 OK
   
   - Report.status = "resolved"
   - Report.resolved_at = now()
   ```

3. **Başka Bir Rapor İçin "Reddet" Butonuna Tıkla**
   ```
   POST /api/admin/reports/{id}/dismiss/
   Status: 200 OK
   
   - Report.status = "dismissed"
   - Report.resolved_at = now()
   ```

---

### 6.4 Kullanıcı Yönetimi

**Amaç**: Admin kullanıcı işlemlerini göster

**Adımlar**:

1. **"Kullanıcılar" Sekmesine Git**

2. **Kullanıcı Listesi**
   ```
   Arama: Kullanıcı adı ile ara
   
   Her kullanıcı:
   - Profil fotoğrafı
   - Kullanıcı adı
   - E-posta
   - Gönderilerin sayısı
   - Takipçi sayısı
   - Durum (aktif/banlı)
   - İşlemler (Ban, Detay)
   ```

3. **Bir Kullanıcıyı Banla**
   - "Ban At" Butonuna Tıkla
   - Ban türü seç:
     ```
     [ ] Geçici Ban
         Gün sayısı: [7]
     [x] Kalıcı Ban
     ```
   - Ban sebebi yazısını gir
   - "Onayla" Butonuna Tıkla

4. **Beklenen Sonuç**
   ```
   POST /api/admin/users/{username}/ban/
   {
     "duration_days": 7
   }
   Status: 200 OK
   
   - User.is_banned = True
   - User.banned_until = now() + 7 days
   - AuditLog kaydı
   - Kullanıcı giriş yapamaz
   ```

5. **Banı Kaldır**
   - "Banlı Kullanıcılar" filtresini seç
   - "Banı Kaldır" Butonuna Tıkla

6. **Beklenen Sonuç**
   ```
   POST /api/admin/users/{username}/unban/
   Status: 200 OK
   
   - User.is_banned = False
   - User.banned_until = None
   - Kullanıcı giriş yapabilir
   ```

---

### 6.5 İstatistikler

**Amaç**: Admin istatistikleri göster

**Adımlar**:

1. **"Dashboard" Sekmesine Git**

2. **İstatistik Kartları**
   ```
   Kullanıcı İstatistikleri:
   - Toplam Kullanıcı: 42
   - Doğrulanmış: 38
   - Aktif: 35
   - Banlı: 2
   
   Gönderi İstatistikleri:
   - Toplam: 156
   - Aktif: 150
   - Pasif: 6
   - Bugün: 8
   
   Coğrafi Dağılım:
   - Türkiye: 28
   - Amerika: 8
   - Almanya: 3
   - Diğer: 3
   ```

3. **Tarih Aralığı Filtresi**
   - Başlangıç tarihi: 2026-05-01
   - Bitiş tarihi: 2026-05-23
   - "Filtrele" Butonuna Tıkla

4. **Günlük Gönderi Grafiği**
   ```
   X: Tarihi
   Y: Gönderi sayısı
   
   Trend analizi yapılabilir
   ```

---

### 6.6 Audit Log

**Amaç**: Admin işlemlerinin kaydını göster

**Adımlar**:

1. **"Audit Log" Sekmesine Git**

2. **Tüm Admin İşlemlerini Gözlemle**
   ```
   Her kayıt:
   - Admin adı
   - İşlem (ban, unban, deactivate, activate)
   - Hedef kullanıcı/gönderi
   - Detay
   - Tarih
   ```

3. **Filtreleme**
   - İşlem türüne göre filtrele
   - Tarih aralığına göre filtrele

---

## Senaryo 7: Güvenlik Özellikleri

### 7.1 Login Throttling

**Amaç**: Brute force saldırısından koruması göster

**Adımlar**:

1. **Login Sayfasında Yanlış Şifre Gir**
   ```
   Deneme 1: Hata
   Deneme 2: Hata
   Deneme 3: Hata
   Deneme 4: Hata
   Deneme 5: Hata → "Çok fazla hatalı deneme. 15 dakika bekleyin."
   ```

2. **Beklenen Sonuç**
   ```
   6. deneme başarısız
   Response 429: Too Many Requests
   "Çok fazla hatalı deneme. Lütfen 15 dakika sonra tekrar deneyin."
   ```

3. **15 Dakika Sonra**
   - Throttle sıfırlanır
   - Yeniden giriş yapılabilir

---

### 7.2 Email Verification Throttling

**Amaç**: Doğrulama kodu brute force koruması

**Adımlar**:

1. **Verify Email Sayfasında Yanlış Kod Gir (5 kez)**
   ```
   Deneme 1: "Kod hatalı. 4 deneme kaldı."
   Deneme 2: "Kod hatalı. 3 deneme kaldı."
   Deneme 3: "Kod hatalı. 2 deneme kaldı."
   Deneme 4: "Kod hatalı. 1 deneme kaldı."
   Deneme 5: "Kod hatalı. 0 deneme kaldı."
   ```

2. **6. Deneme**
   ```
   Response 429
   "Çok fazla deneme. Lütfen daha sonra tekrar deneyin."
   ```

---

### 7.3 JWT Token Yönetimi

**Amaç**: JWT token lifecycle'ı göster

**Adımlar**:

1. **Giriş Yap**
   ```
   POST /api/auth/login/
   Response:
   {
     "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
     "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
   }
   ```

2. **Kurallı İsteğin Token'ı**
   ```
   Authorization: Bearer {access_token}
   
   API isteğinde token kontrol edilir:
   - İmza doğrulanır
   - Süre kontrol edilir (15 dakika)
   - Token blacklist kontrol edilir
   ```

3. **Token Süresi Dolduktan Sonra**
   ```
   401 Unauthorized
   "Token süresi dolmuş."
   
   refresh_token kullanılarak yeni access_token alınır:
   POST /api/auth/token/refresh/
   {
     "refresh": "{refresh_token}"
   }
   ```

4. **Logout (Token Blacklist)**
   ```
   POST /api/auth/logout/
   
   Token blacklist'e eklenir
   Artık bu token kullanılamaz
   ```

---

### 7.4 Ban Mekanizması Gerçek Zamanlı

**Amaç**: Banlı kullanıcının giriş yapamamasını göster

**Adımlar**:

1. **Admin olarak Bir Kullanıcıyı Banla**

2. **O Kullanıcı ile Ayrı Bir Sekme Açın**
   - Zaten giris yaptıysa logout olmuş hâle gelir
   - Tekrar giriş denerse: "Hesabınız askıya alınmıştır."

3. **Her Request'te Ban Kontrol**
   ```
   BanAwareJWTAuthentication:
   - Token doğrulanır
   - User.is_banned kontrol edilir
   - User.banned_until kontrol edilir
   - Süresi dolduysa otomatik unban
   ```

---

### 7.5 Data Processing Consent (KVKK)

**Amaç**: KVKK uyumlu onay mekanizması

**Adımlar**:

1. **Register Sayfasında KVKK Checkbox'ını Gözlemle**
   ```
   "KVKK kapsamında kişisel verilerimin işlenmesine rıza veriyorum"
   ```

2. **Onay Vermeden Kayıt Etmeye Çalış**
   ```
   Error: "Veri işleme rızası zorunludur"
   ```

3. **Onay Verip Kayıt Et**
   ```
   User.data_processing_consent = True
   User.data_processing_consent_date = now()
   ```

---

## Senaryo 8: Hata Işleme

### 8.1 Ağ Hataları

**Amaç**: Ağ sorunlarında UX göster

**Adımlar**:

1. **İnternet Bağlantısını Kes**

2. **Feed'i Yenile**
   ```
   Error UI: "Bağlantı hatası. Lütfen interneti kontrol edin."
   Retry Butonu gösterilir
   ```

3. **Bağlantıyı Tekrar Aç**
   - "Retry" Butonuna Tıkla
   - İçerik yüklenr

---

### 8.2 Validasyon Hataları

**Amaç**: Form validasyonu göster

**Adımlar**:

1. **Register Formunda Tüm Hataları Tetikle**
   ```
   Ad Soyad: "" → "Ad soyad gereklidir"
   Kullanıcı Adı: "ab" → "3-50 karakter olmalıdır"
   E-posta: "invalid" → "Geçerli e-posta girin"
   Şifre: "weak" → "En az 8 karakter, 1 büyük, 1 küçük, 1 rakam"
   KVKK: unchecked → "Rıza zorunludur"
   ```

---

### 8.3 Yetkilendirme Hataları

**Amaç**: Yetkilendirme koruması göster

**Adımlar**:

1. **Başkasının Gönderisini Düzenle (API)**
   ```bash
   curl -X PATCH http://localhost:8000/api/posts/999/
   -H "Authorization: Bearer $TOKEN"
   -d '{"content": "Hacked"}'
   
   Response 403 Forbidden
   {
     "detail": "Bu gönderiyi düzenlemek için izniniz yok."
   }
   ```

2. **Admin Olmayan Kullanıcı Admin Endpoint'ine Erişmeye Çalış**
   ```bash
   curl http://localhost:8000/api/admin/users/
   -H "Authorization: Bearer $USER_TOKEN"
   
   Response 403 Forbidden
   {
     "detail": "Bu işlem için yetkiniz yok."
   }
   ```

---

## Demo Kontrol Listesi

- [ ] Senaryo 1 tamamlandı
- [ ] Senaryo 2 tamamlandı
- [ ] Senaryo 3 tamamlandı
- [ ] Senaryo 4 tamamlandı
- [ ] Senaryo 5 tamamlandı
- [ ] Senaryo 6 tamamlandı
- [ ] Senaryo 7 tamamlandı
- [ ] Senaryo 8 tamamlandı

---

## Demo Feedback Formu

```
Demo Tarihi: _______________
Demonstratör: _______________

Genel İzlenim: ☐ Harika ☐ İyi ☐ Orta ☐ Kötü

Özellikle Beğenilen Özellikler:
_________________________________________________________________

Işleyişi Sorun Yaşanan Alanlar:
_________________________________________________________________

Eklenebilecek Özellikler:
_________________________________________________________________

Notlar:
_________________________________________________________________
```

---

**Son Güncelleme**: 23 Mayıs 2026

**Durum**: ✅ DEMO HAZIR
