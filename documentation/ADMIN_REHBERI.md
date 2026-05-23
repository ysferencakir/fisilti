# FISILTI - Admin Rehberi

## İçindekiler
1. [Giriş](#giriş)
2. [Admin Paneline Erişim](#admin-paneline-erişim)
3. [Raporlanan Gönderileri Yönetme](#raporlanan-gönderileri-yönetme)
4. [Gönderileri Pasifleştirme](#gönderileri-pasifleştirme)
5. [Kullanıcı Yönetimi](#kullanıcı-yönetimi)
6. [Banlama İşlemleri](#banlama-işlemleri)
7. [Admin İstatistikleri](#admin-istatistikleri)
8. [En İyi Uygulamalar](#en-iyi-uygulamalar)

---

## Giriş

Bu rehber, FISILTI platformunun yönetimi için gerekli tüm işlemleri açıklamaktadır. Admin olarak sorumluluğunuz, platformun güvenliğini sağlamak, uygunsuz içeriği kontrol etmek ve kullanıcı deneyimini iyileştirmektir.

**Önemli**: Admin yetkisini sorumlu bir şekilde kullanın. Tüm admin işlemleri kaydedilmektedir.

---

## Admin Paneline Erişim

### Admin Panelini Açma

1. Uygulamaya admin hesabıyla giriş yapın
2. Sağ üst köşedeki **profil simgesine** tıklayın
3. **"Admin Paneli"** seçeneğini seçin
4. Admin kontrol paneli açılacaktır

### Admin Panelinin Yapısı

Admin paneli üç ana bölümden oluşur:
- **Raporlar**: Raporlanan gönderilerin listesi
- **Kullanıcılar**: Kullanıcı yönetimi ve banlama işlemleri
- **İstatistikler**: Platform istatistikleri ve analitiği

---

## Raporlanan Gönderileri Yönetme

### Raporlanan Gönderileri Listeleme

1. Admin panelinde **"Raporlar"** sekmesine tıklayın
2. Raporlanan gönderilerin listesi görüntülenir
3. Her gönderi yanında rapor sayısı gösterilmektedir
4. En çok raporlanan gönderiler başta listelenir

### Rapor Detaylarını İnceleme

1. Listedeki herhangi bir gönderiyi tıklayın
2. Gönderi içeriği ve tüm raporlar görüntülenir
3. Raporlarda gösterilecek bilgiler:
   - Raporlayan kullanıcı
   - Rapor tarihi
   - Rapor nedeni (Spam, Uygunsuz İçerik, Taciz, Yanlış Bilgi, Diğer)
   - Rapor açıklaması (varsa)

### Rapor Sonrası İşlemler

Bir raporu inceledikten sonra aşağıdakilerden birini yapabilirsiniz:

#### İşlem Yapma (Gönderiyi Pasifleştirme)
1. **"Gönderiyi Pasifleştir"** butonuna tıklayın
2. Gönderi kullanıcıların ana sayfasından gizlenir
3. Gönderi veri tabanında kalır (silinmez)
4. İşlem otomatik olarak AuditLog'a kaydedilir

#### Hiçbir İşlem Yapmama
1. **"Kapat"** veya **"Sonraki"** butonuna tıklayın
2. Rapor arşivlenir
3. Gönderi etkin kalır

---

## Gönderileri Pasifleştirme

### Gönderiyi Pasif Hale Getirme

1. **"Raporlar"** veya **"Gönderiler"** sekmesinde gönderiyi bulun
2. Gönderi üzerindeki **"Pasifleştir"** butonuna tıklayın
3. Pasifleştirme nedenini yazın
4. **"Onayla"** butonuna tıklayın

### Pasif Gönderiyi Tekrar Aktif Hale Getirme

1. **"Gönderiler"** sekmesinde **"Pasif Gönderiler"** filtresini seçin
2. Tekrar aktif hale getirmek istediğiniz gönderiyi bulun
3. **"Aktifleştir"** butonuna tıklayın
4. Gönderi tekrar aktif hale gelir ve kullanıcıların profilinde görünür

### Pasif Gönderi Özellikleri

Pasif hale getirilen gönderiler:
- ✗ Ana sayfa akışında görünmez
- ✗ Diğer kullanıcıların profillerinde görünmez
- ✓ Veri tabanında kalır
- ✓ Rapor kayıtları korunur
- ✓ Admin panelinde görülebilir

---

## Kullanıcı Yönetimi

### Kullanıcıları Listeleme

1. Admin panelinde **"Kullanıcılar"** sekmesine tıklayın
2. Tüm kullanıcıların listesi görüntülenir
3. Arama alanında kullanıcı adı yazarak filtreleyebilirsiniz

### Kullanıcı Detaylarını Görme

1. Listedeki herhangi bir kullanıcı adını tıklayın
2. Kullanıcının profili açılacaktır
3. Aşağıdaki bilgiler görüntülenir:
   - Kullanıcı adı
   - E-posta adresi
   - Ülke bilgisi
   - Gönderilerin sayısı
   - Takipçi/takip edilen sayısı
   - Hesap durumu (aktif/banlı)
   - Oluşturulma tarihi

---

## Banlama İşlemleri

### Kullanıcıyı Banlama

1. **"Kullanıcılar"** sekmesinde ban atmak istediğiniz kullanıcıyı bulun
2. **"Ban At"** butonuna tıklayın
3. Ban türünü seçin:

#### Geçici Ban
1. **"Geçici Ban"** seçeneğini seçin
2. Ban süresini gün cinsinden girin (örn: 7, 30, 365)
3. Ban sebebini yazın
4. **"Onayla"** butonuna tıklayın

#### Kalıcı Ban
1. **"Kalıcı Ban"** seçeneğini seçin
2. Ban sebebini yazın
3. **"Onayla"** butonuna tıklayın

### Ban Süresinin Bitimi

- **Geçici Ban**: Ban süresi otomatik olarak biter ve kullanıcı hesabı otomatik aktif hale gelir
- **Kalıcı Ban**: Admin tarafından manual olarak kaldırılması gerekir

### Banlı Kullanıcının Kısıtlamaları

Banlı bir kullanıcı aşağıdaki işlemleri yapamaz:
- ✗ Giriş yapamaz
- ✗ Gönderi oluşturamaz
- ✗ Gönderi düzenleyemez
- ✗ Kullanıcı takip edemez
- ✗ İçerik raporlayamaz

### Banı Kaldırma

1. **"Banlı Kullanıcılar"** filtresini seçin
2. Banı kaldırmak istediğiniz kullanıcıyı bulun
3. **"Banı Kaldır"** butonuna tıklayın
4. **"Onayla"** butonuna tıklayın
5. Kullanıcı hesabı tekrar aktif hale gelir

---

## Admin İstatistikleri

### İstatistik Panelini Açma

1. Admin panelinde **"İstatistikler"** sekmesine tıklayın
2. Platforma ait özet istatistikler görüntülenir

### Görüntülenen İstatistikler

#### Kullanıcı İstatistikleri
- **Toplam Kullanıcı**: Kayıtlı tüm kullanıcılar
- **Doğrulanmış Kullanıcı**: E-postası doğrulanmış kullanıcılar
- **Aktif Kullanıcı**: Geri kalan aktif (banlı olmayan) kullanıcılar
- **Banlı Kullanıcı**: Şu anda banlı kullanıcılar

#### Gönderi İstatistikleri
- **Toplam Gönderi**: Yayınlanmış tüm gönderiler
- **Aktif Gönderi**: Aktif/görünür gönderiler
- **Pasif Gönderi**: Pasifleştirilmiş gönderiler
- **Günlük Gönderi**: Bugün yayınlanan gönderiler

#### Coğrafi Dağılım
- **Ülke Bazlı Dağılım**: Kullanıcıların ülkelere göre dağılımı
- **Bilinmeyen**: Ülke bilgisi olmayan kullanıcılar

#### Raporlama İstatistikleri
- **Toplam Rapor**: Yapılan tüm raporlar
- **Beklemede**: Henüz işlenmemiş raporlar
- **Çözülmüş**: İşlem yapılan raporlar

### İstatistik Filtreleri

Bazı istatistiklerde tarih aralığı filtrelemesi yapabilirsiniz:
1. Başlangıç ve bitiş tarihini seçin
2. **"Filtrele"** butonuna tıklayın
3. Seçili tarih aralığına göre istatistikler güncellenir

---

## En İyi Uygulamalar

### Raporları İncelerken

1. **Sabırlı olun**: Her raporu dikkatle inceleyin
2. **Bağlam arızı**: Gönderiyi raporun tam bağlamında değerlendirin
3. **Politikaya uyun**: Platforma ait kuralları tutarlı şekilde uygulayın
4. **Adil olun**: Tüm kullanıcılara eşit davranın

### Ban Atarken

1. **Uyarı ver**: Mümkünse ilk olarak uyarı verin
2. **Neden yazın**: Her ban sebebini net şekilde yazın
3. **Kanıt alın**: Sözleştirme olmadan ban atmayın
4. **Kontrolü kur**: Ban kararlarınız gözden geçirilmelidir

### Veri Koruma

1. **Gizlilik**: Kullanıcı bilgilerini saklı tutun
2. **Loglama**: Tüm işlemleriniz kaydedilmektedir
3. **Sorumlu olmayan kullanım**: Admin yetkisini istismar etmeyin
4. **Yalnız kararlar vermeyin**: Zor kararları başkalarıyla paylaşın

### Destek

Admin yetkisine sahip olmamanıza rağmen:
- Kullanıcı şikayetlerini ciddi alın
- Geri bildirim kanallarını dinleyin
- Komunite önerilerini değerlendirin
- Düzenli olarak istatistikleri gözleyin

---

## Yaygın Sorunlar

### S: Yanlışlıkla bir gönderiyi pasifleştirdim
**C**: **"İstatistikler"** > **"Pasif Gönderiler"** sekmesine gidip **"Aktifleştir"** butonuna tıklayabilirsiniz.

### S: Geçici ban süresi bittikten sonra ne olur?
**C**: Geçici ban otomatik olarak kalkar ve kullanıcı tekrar giriş yapabilir.

### S: Bir admin diğer admin'i ban atabilir mi?
**C**: Hayır, sistem son admin'in korunmasını sağlar.

### S: Tüm admin işlemleri kaydedilir mi?
**C**: Evet, tüm admin işlemleri AuditLog'a kaydedilir ve gözden geçirilebilir.

### S: İstatistikler gerçek zamanlı mı?
**C**: İstatistikler yaklaşık 5 dakikalık gecikmeden sonra güncellenir.

---

## İletişim

Admin sorularınız veya yardımınız gerekiyorsa:

- **E-posta**: admin@fisilti.com
- **Acil Durumlar**: support@fisilti.com
- **Rapor**: Platform İçinde Rapor Et seçeneğini kullanın

---

**Son Güncelleme**: 23 Mayıs 2026

Admin ekibimize katıldığınız için teşekkür ederiz!