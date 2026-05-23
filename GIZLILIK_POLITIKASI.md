# FISILTI - Gizlilik Politikası

**Son Güncelleme**: 23 Mayıs 2026

**Geçerli Bölgeler**: Türkiye (KVKK), AB (GDPR), Diğer Ülkeler

---

## İçindekiler

1. [Giriş](#giriş)
2. [Toplanan Veriler](#toplanan-veriler)
3. [Verilerin Kullanımı](#verilerin-kullanımı)
4. [Verilerin Saklanması ve Korunması](#verilerin-saklanması-ve-korunması)
5. [Veri Saklama Süresi](#veri-saklama-süresi)
6. [Üçüncü Taraflarla Veri Paylaşımı](#üçüncü-taraflarla-veri-paylaşımı)
7. [Kullanıcı Hakları](#kullanıcı-hakları)
8. [KVKK Hakları](#kvkk-hakları)
9. [GDPR Hakları](#gdpr-hakları)
10. [Çerezler](#çerezler)
11. [Güvenlik](#güvenlik)
12. [İletişim](#iletişim)

---

## Giriş

FISILTI ("Şirket", "biz", "bizim") sizin gizliliğinize saygı duymaktadır. Bu Gizlilik Politikası, FISILTI web uygulaması ("Platform") kullanırken hangi bilgileri topladığımızı, bunları nasıl kullandığımızı ve haklarınız hakkında bilgi vermektedir.

**Bu politika KVKK (Kişisel Verilerin Korunması Kanunu) ve GDPR (Avrupa Birliği Genel Veri Koruma Tüzüğü) ile uyumludur.**

---

## Toplanan Veriler

### Doğrudan Toplanan Veriler

Platform kullanırken aşağıdaki bilgileri siz sağlarsınız:

#### Hesap Oluşturma
- **Kullanıcı Adı**: Platform'da kimlik tanımlama için
- **E-posta Adresi**: Hesap doğrulama ve iletişim için
- **Şifre**: Hesap güvenliği için (hashlenerek saklanır)
- **Ülke**: Coğrafi analitik için
- **Ad-Soyad (opsiyonel)**: Profil bilgisi için
- **Hayvan Avatar Seçimi**: Profil kişiselleştirmesi için

#### Platform Kullanımı
- **Gönderiler**: Paylaştığınız metin içeriği
- **Takip İlişkileri**: Takip ettiğiniz/sizi takip eden kullanıcılar
- **Raporlar**: İçerik ihlali raporları ve açıklamaları

### Otomatik Toplanan Veriler

Platform'u kullanırken sistem otomatik olarak aşağıdaki bilgileri kaydeder:

- **IP Adresi**: Ağ tanımlama ve güvenlik için
- **Tarayıcı Bilgisi**: Chrome, Firefox, Safari, Edge vb.
- **Cihaz Bilgisi**: Masaüstü, mobil, tablet vb.
- **Sayfayı Ziyaret Zamanı**: İstatistik ve analitik için
- **Sayfada Harcanan Süre**: Kullanıcı davranışı analizi için
- **Tıklanan Bağlantılar**: Kullanıcı etkileşim analizi için

---

## Verilerin Kullanımı

Toplanan verileri aşağıdaki amaçlar için kullanırız:

### Zorunlu Amaçlar
1. **Hesap Yönetimi**
   - Hesap oluşturma ve doğrulama
   - Giriş/çıkış işlemleri
   - Şifre sıfırlama
   - Profil güncellemeleri

2. **Platform İşlevleri**
   - Gönderilerin gösterilmesi
   - Takip sistemi
   - İçerik raporlama
   - Moderasyon işlemleri

3. **Yasal Yükümlülükler**
   - Vergi raporlaması
   - Yasal talepler
   - Dolandırıcılık önleme

### İyileştirme Amaçları (Rıza Gerekir)
- Platform iyileştirmeleri için analitik
- Kullanıcı davranışı analizi
- Hata ayıklama
- Performans ölçümü

### Pazarlama (Rıza Gerekir)
- E-posta bildirimler (opsiyonel)
- Öne çıkan özellikler hakkında bildir
- Platform güncellemeleri hakkında bildir

**Not**: Açık rıza olmadan pazarlama amaçlı e-posta göndermeyiz.

---

## Verilerin Saklanması ve Korunması

### Veri Şifreleme

- **Şifreler**: PBKDF2 algoritması ile hashlenir (düz metin hiçbir zaman saklanmaz)
- **İletişim**: HTTPS/TLS ile şifrelenmiş (tüm bağlantılar 256-bit)
- **Ağ**: Güvenli VPN ve firewall'lar korunmaktadır

### Erişim Kontrolleri

- **Kimlik Doğrulama**: JWT (JSON Web Token) ile
- **Yetkilendirme**: Role-Based Access Control (RBAC)
- **Admin Erişimi**: Yalnızca yetkili admin'ler erişebilir
- **Denetim Kaydı**: Tüm admin işlemleri loglanır

### Depolama Güvenliği

- **Veritabanı**: PostgreSQL, şifrelenmiş bağlantı
- **Sunucu**: Güvenli veri merkezi, ISO 27001 sertifikalı
- **Yedekleme**: Günlük otomatik yedekleme, coğrafi dağılım
- **Fiziksel Güvenlik**: Veri merkezinde 24/7 güvenlik

---

## Veri Saklama Süresi

### Aktif Hesaplar
- **Hesap Bilgileri**: Hesap silinene kadar
- **Gönderiler**: Silinene kadar
- **Takip İlişkileri**: İlişki bitene kadar

### Silinen Hesaplar
- **Kişisel Veriler**: 30 gün içinde kalıcı silinir
- **Gönderiler**: Tahmin edilemez (mod kararı)
- **Raporlar**: Yasal arşiv için 1 yıl saklanabilir

### Log Verileri
- **Güvenlik Logları**: 90 gün
- **Erişim Logları**: 30 gün
- **Admin İşlemleri**: 1 yıl

### Yedeklemeler
- **Otomatik Yedeklemeler**: 30 gün saklanır
- **Archival Yedeklemeler**: 1 yıl saklanır

---

## Üçüncü Taraflarla Veri Paylaşımı

### Paylaşılan Veriler

Verileri yalnızca aşağıdaki durumlarda üçüncü taraflarla paylaşırız:

1. **E-posta Hizmet Sağlayıcıları**
   - Hizmet: Resend, SendGrid vb.
   - Amaç: E-posta doğrulama ve bildirimler
   - Veri: E-posta adresi, ad-soyad

2. **Barındırma Sağlayıcıları**
   - Hizmet: AWS, Azure, Digital Ocean vb.
   - Amaç: Veri depolama ve işleme
   - Veri: Tüm platform verileri

3. **Analitik Sağlayıcıları** (opsiyonel)
   - Hizmet: Google Analytics, Mixpanel vb.
   - Amaç: Kullanıcı davranışı analizi
   - Veri: Anonim veriler (IP maskelenir)

### Paylaşılmayan Veriler

Aşağıdaki veriler kesinlikle üçüncü taraflarla **paylaşılmaz**:
- ✗ Şifreler
- ✗ Tamamen açık e-posta adresleri
- ✗ Özel gönderiler (sadece başlıkları anonim)
- ✗ İçerik moderasyon raporları

### Yasal Talepler

Yasal talepte bulunulması durumunda:
- Mahkeme kararı gereken verileri hukuki zorunluluk altında paylaşabiliriz
- Size uygun olduğu sürece önceden bildirmeye çalışırız
- Talep ayrıntılarını yapabiliriz

---

## Kullanıcı Hakları

Tüm kullanıcılar aşağıdaki haklara sahiptir:

### Erişim Hakkı
- Sahip olduğunuz verilere erişim talebinde bulunabilirsiniz
- İstek: support@fisilti.com adresine yazın
- Yanıt Süresi: 15 gün içinde

### Düzeltme Hakkı
- Hatalı verileri düzeltebilirsiniz
- Profil ayarlarından kendiniz güncelleyebilirsiniz
- Yardım gerekirse support@fisilti.com yazın

### Silme Hakkı ("Unutulma Hakkı")
- Hesabınız ve tüm verileriniz silinebilir
- Süreç: 30 gün içinde kalıcı silinir
- İstek: support@fisilti.com adresine yazın

### Veri Taşınabilirlik Hakkı
- Verilerinizi CSV formatında indirebilirsiniz
- İstek: support@fisilti.com adresine yazın
- Yanıt Süresi: 10 gün içinde

### İtiraz Hakkı
- İşleme karşı itiraz edebilirsiniz
- Özellikle: Pazarlama e-postaları için
- İstek: Bildirim linkindeki "Abonelikten Çık" bağlantısını kullanın

### Rıza Geri Çekme
- Verdiğiniz rızayı dilediğiniz zaman geri çekebilirsiniz
- Tercihler: Hesap ayarlarında "Gizlilik" sekmesi
- E-posta: support@fisilti.com adresine yazın

---

## KVKK Hakları

**Kişisel Verilerin Korunması Kanunu (KVKK)** kapsamında, aşağıdaki haklara sahipsiniz:

### Bilgi Alma Hakkı (KVKK Md. 11)
- Kişisel verileriniz işlenmektedir
- Veri sorumlusu: FISILTI (info@fisilti.com)
- İşleme amaçları: Yukarıda listelenen amaçlar

### Düzeltme Hakkı (KVKK Md. 16)
- Yanlış verileri düzeltebilirsiniz
- İstek: support@fisilti.com adresine yazın

### Silme Hakkı (KVKK Md. 17)
- Verilerinizin silinmesini isteyebilirsiniz
- İstisna: Yasal zorunluluklar
- İstek: support@fisilti.com adresine yazın

### İşlemeyi Sınırlandırma Hakkı (KVKK Md. 18)
- İşlemeyi durdurmasını isteyebilirsiniz
- Veri saklanmaya devam edilecek, işlenmeyecektir
- İstek: support@fisilti.com adresine yazın

### İtiraz Hakkı (KVKK Md. 21)
- Meşru menfaat temelinde işleme karşı itiraz
- İstek: support@fisilti.com adresine yazın

### Veri Taşınabilirliği Hakkı (KVKK Md. 20)
- Verilerinizi CSV formatında alabilirsiniz
- İstek: support@fisilti.com adresine yazın

---

## GDPR Hakları

**Avrupa Birliği Genel Veri Koruma Tüzüğü (GDPR)** kapsamında, aşağıdaki haklara sahipsiniz:

### Erişim Hakkı (GDPR Art. 15)
- Hangi verilerinizin işlendiğini öğrenebilirsiniz
- İstek: support@fisilti.com adresine yazın
- Yanıt: 30 gün içinde

### Düzeltme Hakkı (GDPR Art. 16)
- Yanlış verileri düzeltebilirsiniz
- Platform'da: Profil ayarlarından
- İstek: support@fisilti.com adresine yazın

### Silinme Hakkı (GDPR Art. 17)
- "Unutulma Hakkı"
- Verilerinizin silinmesini isteyebilirsiniz
- İstisna: Yasal zorunluluklar
- İstek: support@fisilti.com adresine yazın

### İşlemeyi Sınırlandırma Hakkı (GDPR Art. 18)
- İşlemeyi durdurmasını isteyebilirsiniz
- İstek: support@fisilti.com adresine yazın

### Veri Taşınabilirliği Hakkı (GDPR Art. 20)
- Verilerinizi yapılandırılmış formatta alabilirsiniz
- CSV, JSON vb. formatlar
- İstek: support@fisilti.com adresine yazın

### İtiraz Hakkı (GDPR Art. 21)
- İşlemeye karşı itiraz edebilirsiniz
- Pazarlama, profiling vb.
- İstek: support@fisilti.com adresine yazın

### Otomatik Karar Alma Hakkı (GDPR Art. 22)
- Tamamen otomatik karar alma yok
- Riskli gönderiler moderatör tarafından incelenir

---

## Çerezler

### Çerez Politikası

FISILTI aşağıdaki çerezleri kullanmaktadır:

#### Zorunlu Çerezler
- **Oturum Çerezi**: JWT token, giriş durumunuz için
- **CSRF Token**: Güvenlik saldırılarına karşı koruma
- **Tercih Çerezi**: Dil, tema seçiminiz

#### Analitik Çerezleri (Rıza Gerekir)
- **Google Analytics**: Ziyaretçi analizi
- **Heatmap**: Sayfa etkileşim analizi

#### Pazarlama Çerezleri (Rıza Gerekir)
- Şu anda kullanılmamaktadır

### Çerez Ayarları

Tarayıcı ayarlarından çerezleri kontrol edebilirsiniz:
- **Chrome**: Settings > Privacy > Cookies
- **Firefox**: Preferences > Privacy > Cookies
- **Safari**: Preferences > Privacy > Cookies

---

## Güvenlik

### Güvenlik Önlemleri

- **Şifreleme**: AES-256 şifreleme, HTTPS/TLS
- **Hashlay**: PBKDF2, bcrypt algoritmalar
- **Firewall**: DDoS koruması, WAF
- **Penetration Test**: Yıllık güvenlik denetimi
- **Sertifikalar**: ISO 27001, SOC 2 uyumluluk

### Güvenlik İhbarı

Bir güvenlik açığı bulursanız:
1. security@fisilti.com adresine yazın
2. Ayrıntı ve kanıtları açık şekilde paylaşın
3. Halka açıklamadan önce çözümün bulunmasını bekleyin
4. Sorumlu açıklamaya katılabilirsiniz

### Veri İhlali

Kişisel verilerin sızmması durumunda:
- 72 saat içinde GDPR yetkili makamlara bildirelim
- Size bildirelim (mümkünse)
- Alınan önlemleri açıklayalım

---

## İletişim

### Veri Sorumlusu (Data Controller)

**FISILTI**
- **E-posta**: privacy@fisilti.com
- **Adres**: Türkiye
- **Veri Koruma Sorumlusu**: dpo@fisilti.com

### Şikayet ve Haklarınız

- **Gizlilik Şikayetleri**: privacy@fisilti.com
- **KVKK İhlalleri**: https://www.kvk.gov.tr (Kişisel Verileri Koruma Kurumu)
- **GDPR Şikayetleri**: Avrupa Birliği veri koruma otoriteleri

### Hak Talebi Süreci

1. **E-posta Gönderin**: support@fisilti.com adresine yazın
2. **Talep Açıklayın**: Hangi hakkı istediğinizi belirtin
3. **Kimlik Doğrulayın**: Kimliğinizi kanıtlayın
4. **Yanıt Alın**: 30 gün içinde yanıt veririz
5. **Sonuç**: Talep sonucunu yazılı alın

---

## Değişiklikler

Bu Gizlilik Politikası zaman zaman güncellenebilir. Önemli değişiklikler hakkında e-posta ile bilgilendirileceksiniz.

**Son Güncelleme**: 23 Mayıs 2026

---

**Sorularınız varsa, privacy@fisilti.com adresine yazın.**