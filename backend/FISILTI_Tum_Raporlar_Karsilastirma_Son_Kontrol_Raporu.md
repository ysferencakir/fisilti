# FISILTI Tüm Raporlar Karşılaştırması ve Eksiksiz Son Kontrol Raporu

Bu rapor, FISILTI projesi için hazırlanmış tüm belgeler karşılaştırılarak oluşturulmuştur:

1. **İlk Proje Gereksinim Dokümanı**
2. **PPM / Proje Planlaması ve Yönetimi Raporu**
3. **SRS / Yazılım Gereksinimleri Spesifikasyonu Raporu**
4. **Önceki kontrol listeleri ve eksik analizleri**

Amaç:  
Son kontrol listesinde hiçbir gereksinimin, kalite niteliğinin, dokümantasyon maddesinin, SRS koşulunun veya PPM’de belirtilen teslim/planlama beklentisinin eksik kalmamasını sağlamaktır.

---

# 1. Sonuç Özeti

Bütün raporlar karşılaştırıldığında FISILTI projesinin son kontrolünde yalnızca temel mikro-blog işlevleri değil, aşağıdaki alanların tamamı kapsanmalıdır:

- Kullanıcı kayıt sistemi
- E-posta doğrulama
- Login / logout / oturum yönetimi
- Rol tabanlı yetkilendirme
- Standart kullanıcı özellikleri
- Admin özellikleri
- Gönderi oluşturma
- Gönderi düzenleme
- Gönderi silme
- Kullanıcının kendi gönderilerini görüntülemesi
- Başka kullanıcı profillerinin görüntülenmesi
- Takip sistemi
- Takipçi ve takip edilen listeleri
- Ana sayfa akışı
- Raporlama sistemi
- Admin rapor inceleme sistemi
- Gönderi pasifleştirme / gizleme
- Kullanıcı banlama
- Admin istatistik paneli
- Ekstra kullanıcı özelliği
- Frontend-backend-veritabanı ayrımı
- Backend doğrulama ve yetkilendirme kontrolleri
- Veritabanı modeli ve veri bütünlüğü
- Performans gereksinimleri
- Güvenlik gereksinimleri
- Gizlilik gereksinimleri
- KVKK/GDPR ve yasal gereksinimler
- Kullanım şartları ve gizlilik politikası
- Kullanıcı belgeleri
- Admin rehberi
- Yardım / SSS bölümü
- Test planı
- Performans testleri
- Loglama
- Yedekleme ve geri yükleme
- Git / versiyon kontrolü
- Docker / container desteği
- Test ve üretim ortamı ayrımı
- SRS TBD maddelerinin netleştirilmesi
- PPM tutarlılık düzeltmeleri
- Demo akışı

---

# 2. Raporlar Arası Ana Farklar

## 2.1 İlk Proje Gereksinim Dokümanı

İlk proje gereksinim dokümanı, projenin temel zorunlu kapsamını belirler. Bu rapora göre mutlaka bulunması gereken çekirdek özellikler şunlardır:

- Mikro-blog uygulaması
- Metin tabanlı gönderi oluşturma
- Ana sayfada yalnızca takip edilen kullanıcıların gönderilerini görme
- Kullanıcı kayıt ve doğrulama
- E-posta doğrulama
- Login / logout
- Takip sistemi
- Takipçi ve takip edilen listeleri
- Profil veya “Gönderilerim” sayfası
- Kullanıcının yalnızca kendi gönderisini silebilmesi
- Başka kullanıcıların gönderi düzenleme/silme yetkisinin olmaması
- Raporlama sistemi
- Aynı kullanıcının aynı gönderiyi tekrar raporlayamaması
- Admin paneli
- Adminin raporlanan gönderileri incelemesi
- Adminin gönderiyi silmeden pasif/gizli hale getirmesi
- Adminin kullanıcı banlayabilmesi
- Admin istatistik paneli
- Toplam kullanıcı, aktif/pasif kullanıcı, günlük gönderi, tarih aralıklı gönderi ve ülke bazlı dağılım
- Standart kullanıcı ve admin rol ayrımı
- Frontend’in veritabanına doğrudan erişmemesi
- Tüm veri işlemlerinin backend üzerinden yapılması
- En az bir ekstra kullanıcı özelliği

## 2.2 PPM Raporu

PPM raporu proje planlama ve yönetim tarafını güçlendirir. Bu raporda özellikle şu alanlar son kontrole eklenmelidir:

- Proje planı ve tarihleri
- İş paketleri
- Gantt/CPM/PERT planı
- Riskler
- Ara çıktılar
- Ekip ve görev dağılımı
- Kullanılacak araçlar
- Bütçe/maliyet tabloları
- Test ve revizyon çalışmaları
- Proje kapanışı
- Fizibilite, analiz, tasarım, geliştirme, test süreçleri
- GitHub / versiyon kontrolü
- Docker / deployment
- Cloud sunucu / hosting / domain
- Test raporları
- Proje sonuç raporu

PPM raporu doğrudan yazılım özelliği kadar, projenin teslimde nasıl savunulacağını da belirler.

## 2.3 SRS Raporu

SRS raporu en detaylı teknik gereksinimleri verir. Önceki listelere ek olarak şu alanlar mutlaka son kontrol raporunda bulunmalıdır:

- Kullanıcının kendi gönderisini düzenleyebilmesi
- Python backend
- PostgreSQL veya eşdeğer ilişkisel veritabanı
- REST API
- SMTP ile e-posta doğrulama
- bcrypt veya Argon2 ile şifre hashleme
- Yanlış şifre denemesi limiti
- Geçici hesap kilidi
- Oturum süresi dolunca otomatik çıkış
- SQL Injection, XSS, CSRF koruması
- HTTPS/TLS
- Kritik admin işlemlerinin loglanması
- Günlük otomatik yedekleme
- Geri yükleme mekanizması
- KVKK/GDPR uyumu
- Kullanım şartları
- Gizlilik politikası
- E-posta adresinin diğer kullanıcılardan gizlenmesi
- Adminin yalnızca görev kapsamındaki verilere erişmesi
- Responsive tasarım
- Chrome, Firefox, Edge, Safari uyumluluğu
- Login en fazla 2 saniye
- Gönderi paylaşma en fazla 3 saniye
- Ana sayfa akışı en fazla 2 saniye
- 100 eşzamanlı kullanıcı desteği
- Admin istatistik ekranı en fazla 5 saniye
- %95 erişilebilirlik hedefi
- Kullanıcı kılavuzu
- Admin rehberi
- Yardım bölümü
- SSS
- Test ve üretim ortamı ayrımı
- Container / Docker desteği
- TBD maddelerinin kapatılması

---

# 3. Raporlar Arası Çelişki ve Tutarsızlık Analizi

Bu bölüm son raporda eksik veya çelişkili kalmaması için özellikle önemlidir.

## 3.1 Veritabanı Teknolojisi Çelişkisi

### Durum

- İlk proje gereksinim dokümanı teknoloji bağımsızdır.
- PPM araç tablosunda **MySQL** geçmektedir.
- SRS raporunda **PostgreSQL** tercih edildiği yazmaktadır.

### Risk

Kod MySQL ise SRS ile çelişir. Kod PostgreSQL ise PPM araç tablosu güncellenmelidir.

### Son Raporda Olması Gereken Kontrol

- [ ] Kullanılan gerçek veritabanı teknolojisi kesinleştirilmiştir.
- [ ] Kodda kullanılan veritabanı ile SRS aynı şeyi söylüyor.
- [ ] Kodda kullanılan veritabanı ile PPM araç tablosu aynı şeyi söylüyor.
- [ ] Eğer PostgreSQL kullanılıyorsa PPM’deki MySQL ifadesi PostgreSQL olarak güncellenmiştir.
- [ ] Eğer MySQL kullanılıyorsa SRS’deki PostgreSQL ifadesi “MySQL veya eşdeğer ilişkisel veritabanı” şeklinde düzeltilmiştir.
- [ ] Veritabanı ER diyagramı seçilen teknolojiye göre hazırlanmıştır.

---

## 3.2 Backend Teknolojisi Çelişkisi

### Durum

- İlk gereksinim dokümanı teknoloji bağımsızdır.
- SRS Python backend kullanılacağını söyler.
- PPM genel olarak web geliştirmeden bahseder, araç tablosunda Visual Studio gibi geliştirme araçları vardır.

### Son Raporda Olması Gereken Kontrol

- [ ] Backend teknolojisi kesin olarak yazılmıştır.
- [ ] SRS’deki Python tercihi gerçek kodla uyumludur.
- [ ] Python kullanılmıyorsa SRS güncellenmiştir.
- [ ] Kullanılan framework yazılmıştır: Flask, Django, FastAPI veya başka bir framework.
- [ ] Kurulum dokümanı kullanılan backend teknolojisine göre hazırlanmıştır.

---

## 3.3 Şelale Modeli / Agile / TDD Tutarsızlığı

### Durum

- PPM’de yazılım süreci olarak Şelale Modeli seçilmiştir.
- PPM geliştirme iş paketinde Agile ve TDD ifadeleri geçmektedir.

### Risk

Teslimde süreç modeli tutarsız görünebilir.

### Son Raporda Olması Gereken Kontrol

- [ ] Projenin ana süreç modeli net yazılmıştır.
- [ ] Şelale modeli kullanılacaksa Agile/TDD ifadeleri destekleyici teknik olarak açıklanmıştır.
- [ ] Agile/TDD gerçekten kullanılmadıysa PPM’den çıkarılmıştır.
- [ ] “Genel planlama Şelale, modül içi geliştirme iteratif/test odaklı” açıklaması eklenmiştir.
- [ ] Test planı süreç modeliyle uyumludur.

---

## 3.4 Proje Süresi / CPM / PERT Tutarsızlığı

### Durum

- PPM’de proje süresi 76 gün olarak geçer.
- CPM/PERT hesaplarında toplam süre 78 gün görünür.

### Risk

Planlama raporunda tarih ve süre uyuşmazlığı oluşur.

### Son Raporda Olması Gereken Kontrol

- [ ] Proje süresinin takvim günü mü iş günü mü olduğu yazılmıştır.
- [ ] 76 gün ve 78 gün farkı açıklanmıştır.
- [ ] CPM toplam süresi proje süresi ile uyumlu hale getirilmiştir.
- [ ] PERT hedef süresi ve beklenen süresi açıkça ayrılmıştır.
- [ ] Teslim tarihi ile planlanan bitiş tarihi uyumludur.

---

## 3.5 İstatistik Panelinde Cinsiyet Dağılımı Meselesi

### Durum

- İlk proje gereksiniminde ülke bazlı coğrafi dağılım zorunludur.
- SRS’de admin istatistikleri için “coğrafi dağılım, cinsiyet, kullanıcı sayısı vb.” ifadesi vardır.
- Kullanıcı kayıt formunda cinsiyet alanı zorunlu gereksinim olarak ilk dokümanda yer almaz.

### Risk

Cinsiyet istatistiği SRS’de kalır ama uygulamada veri yoksa eksik gibi görünebilir.

### Son Raporda Olması Gereken Kontrol

- [ ] Cinsiyet dağılımı gerçekten uygulanacak mı karar verilmiştir.
- [ ] Uygulanacaksa kayıt formunda cinsiyet alanı vardır.
- [ ] Uygulanacaksa cinsiyet verisi gizlilik politikasıyla uyumlu alınır.
- [ ] Uygulanmayacaksa SRS’de “cinsiyet” ifadesi kaldırılmış veya kapsam dışı/TBD yapılmıştır.
- [ ] Ülke/coğrafi dağılım mutlaka korunmuştur.
- [ ] Ülke bilgisi yoksa “Bilinmeyen” kategorisi vardır.

---

## 3.6 Gönderi Düzenleme Gereksinimi

### Durum

- İlk gereksinim dokümanında kullanıcının kendi gönderisini silmesi vurgulanır.
- SRS’de kullanıcının kendi gönderilerini görüntüleyebilmesi, düzenleyebilmesi veya silebilmesi yer alır.
- Bu nedenle son kontrol listesine gönderi düzenleme açıkça eklenmelidir.

### Son Raporda Olması Gereken Kontrol

- [ ] Kullanıcı kendi gönderisini düzenleyebilir.
- [ ] Kullanıcı yalnızca kendi gönderisini düzenleyebilir.
- [ ] Başka kullanıcı gönderi düzenleyemez.
- [ ] Düzenleme sahiplik kontrolü backend’de yapılır.
- [ ] Düzenleme sonrası `updated_at` veya eşdeğer alan güncellenir.
- [ ] Boş veya karakter limitini aşan düzenleme reddedilir.
- [ ] Admin tarafından gizlenen gönderi kullanıcı tarafından tekrar görünür yapılamaz.

---

## 3.7 Ekstra Kullanıcı Özelliği

### Durum

- İlk proje gereksiniminde ekstra kullanıcı özelliği zorunludur.
- PPM/SRS’de ekstra özellik net bir ana başlık gibi görünmeyebilir.

### Son Raporda Olması Gereken Kontrol

- [ ] Ekstra kullanıcı özelliği adı net yazılmıştır.
- [ ] Ekstra özellik kullanıcı tarafından kullanılabilir.
- [ ] Frontend’de görünür.
- [ ] Backend’de işlenir.
- [ ] Gerekiyorsa veritabanı karşılığı vardır.
- [ ] Yetki/güvenlik kontrolleri vardır.
- [ ] Test senaryosu vardır.
- [ ] Demo sırasında gösterilir.
- [ ] SRS veya README içinde açıklanır.

---

## 3.8 PPM Maliyet ve Araç Tablosu Eksikleri

### Durum

PPM’de bazı araçların maliyet alanları boş veya net değildir. Örneğin Postman, MySQL, Docker gibi araçların ücretsiz mi, ücretli mi olduğu açık yazılmalıdır.

### Son Raporda Olması Gereken Kontrol

- [ ] Tüm araçların birim fiyatı yazılmıştır.
- [ ] Ücretsiz araçlar için 0 TL yazılmıştır.
- [ ] Toplam TL satırı doldurulmuştur.
- [ ] Dönemsel gider tablosu ile araç tablosu uyumludur.
- [ ] MySQL/PostgreSQL tutarlılığı sağlanmıştır.
- [ ] Docker kullanılıyorsa operasyonel gereksinimlerle uyumludur.
- [ ] Cloud sunucu, domain ve hosting durumları netleştirilmiştir.

---

## 3.9 Risk Tablosundaki Yazılım Dışı İfade

### Durum

PPM risk tablosunda “arızalı parçaları daha güvenilir satın alınan bileşenlerle değiştirin” gibi yazılım projesine tam uymayan bir ifade vardır.

### Son Raporda Olması Gereken Kontrol

- [ ] Risk stratejileri yazılım projesine uygun hale getirilmiştir.
- [ ] Hata düzeltme süresi için issue tracking, test, kod inceleme gibi stratejiler yazılmıştır.
- [ ] Kullanıcı doğrulama riski için yeniden kod gönderme mekanizması yazılmıştır.
- [ ] Yetkilendirme riski için backend rol kontrolü ve güvenlik testleri yazılmıştır.
- [ ] Performans riski için cache, index, sorgu optimizasyonu yazılmıştır.
- [ ] Spam/uygunsuz içerik riski için raporlama ve admin moderasyonu yazılmıştır.

---

## 3.10 SRS Format ve Numaralandırma Sorunları

### Durum

SRS içindekilerde “5. Diğer İşlevsel Olmayan Gereksinimler” altında “4.2 Veri Yönetimi ve Moderasyon Politikası” şeklinde numara tekrar/tutarsızlık vardır.

### Son Raporda Olması Gereken Kontrol

- [ ] SRS bölüm numaraları tutarlıdır.
- [ ] 4.2 tekrar eden başlık düzeltilmiştir.
- [ ] Gereksinim ID’leri benzersizdir.
- [ ] PR, SR, PV, QA, BR, OR kodları tutarlıdır.
- [ ] Yazım hataları düzeltilmiştir.
- [ ] Türkçe karakter sorunları düzeltilmiştir.
- [ ] Revizyon geçmişi güncellenmiştir.

---

# 4. Tüm Raporlardan Birleştirilmiş Gereksinim Matrisi

Aşağıdaki matris, son kontrol raporunda bulunması gereken ana başlıkları gösterir.

| No | Gereksinim Alanı | İlk Gereksinim | PPM | SRS | Son Raporda Olmalı |
|---:|---|:---:|:---:|:---:|:---:|
| 1 | Mikro-blog metin gönderisi | Var | Var | Var | Evet |
| 2 | Kullanıcı kayıt | Var | Var | Var | Evet |
| 3 | E-posta doğrulama | Var | Var | Var | Evet |
| 4 | Login | Var | Var | Var | Evet |
| 5 | Logout | Var | Var | Var | Evet |
| 6 | Şifre hashleme | Dolaylı | Dolaylı | Açık | Evet |
| 7 | Yanlış giriş limiti | Kısmi | Riskte dolaylı | Açık | Evet |
| 8 | Oturum süresi | Kısmi | Yok | Açık | Evet |
| 9 | Takip sistemi | Var | Var | Var | Evet |
| 10 | Takipçi listesi | Var | Var | Var | Evet |
| 11 | Takip edilen listesi | Var | Var | Var | Evet |
| 12 | Ana sayfada sadece takip edilen gönderiler | Var | Var | Var | Evet |
| 13 | Kimse takip edilmiyorsa boş akış | Var | Kısmi | Var | Evet |
| 14 | Profil/Gönderilerim | Var | Var | Var | Evet |
| 15 | Kendi gönderisini silme | Var | Var | Var | Evet |
| 16 | Kendi gönderisini düzenleme | Kısmi/Dolaylı | Kısmi | Açık | Evet |
| 17 | Başkasının gönderisini silememe | Var | Var | Var | Evet |
| 18 | Başkasının gönderisini düzenleyememe | Var | Kısmi | Var | Evet |
| 19 | Raporlama | Var | Var | Var | Evet |
| 20 | Duplicate rapor engeli | Var | Var | Var | Evet |
| 21 | Admin rapor inceleme | Var | Var | Var | Evet |
| 22 | Admin gönderi pasifleştirme | Var | Var | Var | Evet |
| 23 | Fiziksel silmeden denetim izi | Var | Kısmi | Açık | Evet |
| 24 | Kullanıcı banlama | Var | Var | Var | Evet |
| 25 | Geçici/kalıcı ban | Var | Var | Var | Evet |
| 26 | Ban logu | Var | Kısmi | Açık | Evet |
| 27 | Admin istatistikleri | Var | Var | Var | Evet |
| 28 | Ülke/coğrafi dağılım | Var | Var | Var | Evet |
| 29 | Cinsiyet istatistiği | Yok | Yok | Kısmi | Karar verilmeli |
| 30 | Rol tabanlı yetkilendirme | Var | Var | Var | Evet |
| 31 | Frontend DB’ye erişmez | Var | Var | Var | Evet |
| 32 | Backend merkezi kontrol | Var | Var | Var | Evet |
| 33 | PostgreSQL | Teknoloji bağımsız | MySQL geçiyor | PostgreSQL | Tutarlılık gerekir |
| 34 | Python backend | Teknoloji bağımsız | Genel | Python | Tutarlılık gerekir |
| 35 | REST API | Dolaylı | Var | Var | Evet |
| 36 | HTTPS/TLS | Dolaylı | Kısmi | Açık | Evet |
| 37 | SQL Injection/XSS/CSRF | Yok | Güvenlikte genel | Açık | Evet |
| 38 | KVKK/GDPR | Yok | Kısmi | Açık | Evet |
| 39 | Gizlilik politikası | Yok | Kısmi | Açık | Evet |
| 40 | Kullanım şartları | Yok | Yok | Açık | Evet |
| 41 | Kullanıcı kılavuzu | Yok | Rapor/doküman | Açık | Evet |
| 42 | Admin rehberi | Yok | Kısmi | Açık | Evet |
| 43 | Yardım/SSS | Yok | Yok | Açık | Evet |
| 44 | Performans hedefleri | Yok | Performans genel | Açık | Evet |
| 45 | 100 eşzamanlı kullanıcı | Yok | Riskte dolaylı | Açık | Evet |
| 46 | Loglama | Kısmi | Riskte var | Açık | Evet |
| 47 | Yedekleme/geri yükleme | Yok | Kısmi | Açık | Evet |
| 48 | Git | Yok | Var | Açık | Evet |
| 49 | Docker/container | PPM araçta var | Var | Açık | Evet |
| 50 | Test/üretim ortamı ayrımı | Yok | Kısmi | Açık | Evet |
| 51 | Ekstra kullanıcı özelliği | Var | Belirsiz | Belirsiz | Evet |
| 52 | TBD maddeleri | Yok | Yok | Var | Kapatılmalı |

---

# 5. Eksiksiz Son Kontrol Listesi

Bu bölüm, tüm raporlar karşılaştırıldıktan sonra son raporda kesinlikle bulunması gereken nihai kontrol listesidir.

---

## 5.1 Kullanıcı Kayıt

- [ ] Kullanıcı kayıt formu vardır.
- [ ] Kullanıcı adı alınır.
- [ ] E-posta alınır.
- [ ] Şifre alınır.
- [ ] Ülke bilgisi alınır veya coğrafi dağılım için veri sağlanır.
- [ ] Gerekliyse cinsiyet alanı alınır veya SRS’den cinsiyet istatistiği çıkarılır.
- [ ] Kullanıcı adı boş olamaz.
- [ ] E-posta boş olamaz.
- [ ] Şifre boş olamaz.
- [ ] E-posta formatı kontrol edilir.
- [ ] Aynı kullanıcı adıyla hesap açılamaz.
- [ ] Aynı e-postayla hesap açılamaz.
- [ ] Benzersizlik backend’de kontrol edilir.
- [ ] Benzersizlik veritabanı unique constraint ile korunur.
- [ ] E-posta normalize edilir.
- [ ] Kullanıcı adı normalize edilir.
- [ ] Şifre düz metin saklanmaz.
- [ ] Şifre bcrypt, Argon2 veya güçlü eşdeğer algoritmayla hashlenir.
- [ ] Kullanıcı kayıt sonrası doğrulanmamış durumda oluşturulur.
- [ ] Kayıt sonrası e-posta doğrulama kodu gönderilir.

---

## 5.2 E-Posta Doğrulama

- [ ] Doğrulama kodu üretilir.
- [ ] Kod kullanıcıya e-posta ile gönderilir.
- [ ] Kod her kullanıcı için benzersizdir.
- [ ] Kod rastgeledir.
- [ ] Kod tahmin edilemez yapıdadır.
- [ ] Kod süreye bağlıdır.
- [ ] Kod süresi net belirlenmiştir.
- [ ] SRS’deki 5-10 dakika örneğiyle uyumlu karar verilmiştir.
- [ ] Süresi dolmuş kod reddedilir.
- [ ] Doğru kod kullanıcıyı aktif hale getirir.
- [ ] Yanlış kod kullanıcıyı aktif hale getirmez.
- [ ] Kullanılmış kod tekrar kullanılamaz.
- [ ] Başarısız doğrulama girişimleri sayılır.
- [ ] Çok fazla başarısız girişimde güvenlik önlemi uygulanır.
- [ ] Doğrulanmamış kullanıcı ana özellikleri kullanamaz.
- [ ] Doğrulanmamış kullanıcı gönderi oluşturamaz.
- [ ] Doğrulanmamış kullanıcı takip yapamaz.
- [ ] Doğrulanmamış kullanıcı rapor gönderemez.

---

## 5.3 Login / Logout / Oturum

- [ ] Kullanıcı giriş yapabilir.
- [ ] Hatalı bilgilerle giriş reddedilir.
- [ ] Şifre hash üzerinden doğrulanır.
- [ ] Doğrulanmamış kullanıcı erişemez.
- [ ] Banlı kullanıcı erişemez.
- [ ] Pasif kullanıcı erişemez.
- [ ] Login en fazla 2 saniye içinde yanıt verir.
- [ ] Yanlış şifre denemeleri sınırlandırılır.
- [ ] Belirli sayıda yanlış denemeden sonra geçici hesap kilidi uygulanır.
- [ ] Başarılı login sonrası güvenli session/token oluşturulur.
- [ ] Kullanıcı logout yapabilir.
- [ ] Logout sonrası oturum sonlandırılır.
- [ ] Logout sonrası korumalı endpoint erişimi reddedilir.
- [ ] Oturum süresi dolunca kullanıcı otomatik çıkarılır.
- [ ] Oturum bilgileri güvenli saklanır.

---

## 5.4 Gönderi Sistemi

- [ ] Kullanıcı metin tabanlı gönderi oluşturabilir.
- [ ] Boş gönderi oluşturulamaz.
- [ ] Gönderi karakter limiti belirlenmiştir.
- [ ] Karakter limiti frontend’de gösterilir.
- [ ] Karakter limiti backend’de uygulanır.
- [ ] Gönderi kullanıcı ID’si ile ilişkilidir.
- [ ] Gönderi oluşturulma tarihi tutulur.
- [ ] Gönderi güncellenme tarihi tutulur.
- [ ] Gönderi aktif/pasif/gizli durumuna sahiptir.
- [ ] Gönderi paylaşma işlemi en fazla 3 saniyede tamamlanır.
- [ ] Kullanıcı kendi gönderisini görüntüleyebilir.
- [ ] Kullanıcı kendi gönderisini düzenleyebilir.
- [ ] Kullanıcı yalnızca kendi gönderisini düzenleyebilir.
- [ ] Kullanıcı kendi gönderisini silebilir.
- [ ] Kullanıcı yalnızca kendi gönderisini silebilir.
- [ ] Başka kullanıcı gönderi düzenleyemez.
- [ ] Başka kullanıcı gönderi silemez.
- [ ] Sahiplik kontrolü backend’de yapılır.
- [ ] XSS riskine karşı içerik güvenli gösterilir.

---

## 5.5 Profil / Gönderilerim

- [ ] Kullanıcının profil/Gönderilerim sayfası vardır.
- [ ] Kullanıcının gönderileri listelenir.
- [ ] Gönderiler oluşturulma tarihine göre sıralanır.
- [ ] Başka kullanıcı profili görüntülenebilir.
- [ ] Başka kullanıcı düzenleme yapamaz.
- [ ] Başka kullanıcı silme yapamaz.
- [ ] Pasif/gizli gönderiler normal kullanıcıya gösterilmez.
- [ ] Gönderisi olmayan kullanıcı için boş durum mesajı vardır.
- [ ] Profil ekranı mobil uyumludur.
- [ ] Profil ekranı modern tarayıcılarda çalışır.

---

## 5.6 Takip Sistemi

- [ ] Kullanıcı başka kullanıcıyı takip edebilir.
- [ ] Kullanıcı takipten çıkabilir.
- [ ] Takip ilişkisi tek yönlüdür.
- [ ] Karşılıklı takip zorunlu değildir.
- [ ] Kullanıcı kendisini takip edemez.
- [ ] Aynı kullanıcı aynı kişiyi iki kez takip edemez.
- [ ] Takip eden kullanıcı bilgisi tutulur.
- [ ] Takip edilen kullanıcı bilgisi tutulur.
- [ ] Takip tarihi tutulur.
- [ ] Takipçiler listesi görüntülenir.
- [ ] Takip edilenler listesi görüntülenir.
- [ ] Duplicate takip backend’de engellenir.
- [ ] Duplicate takip veritabanında engellenir.
- [ ] Banlı kullanıcı takip yapamaz.
- [ ] Doğrulanmamış kullanıcı takip yapamaz.

---

## 5.7 Ana Sayfa Akışı

- [ ] Ana sayfa vardır.
- [ ] Ana sayfa yalnızca takip edilen kullanıcıların aktif gönderilerini gösterir.
- [ ] Takip edilmeyen kullanıcı gönderileri görünmez.
- [ ] Kullanıcı kimseyi takip etmiyorsa boş akış döner.
- [ ] Boş akış mesajı gösterilir.
- [ ] Gönderiler kronolojik sıralanır.
- [ ] Pasif/gizli gönderiler görünmez.
- [ ] Silinmiş gönderiler görünmez.
- [ ] Akış filtrelemesi backend’de yapılır.
- [ ] Ana sayfa en fazla 2 saniyede yüklenir.

---

## 5.8 Raporlama

- [ ] Her gönderide rapor etme mekanizması vardır.
- [ ] Kullanıcı gönderiyi raporlayabilir.
- [ ] Rapor gerekçesi alınır.
- [ ] Rapor gerekçesi boş olamaz.
- [ ] Raporlayan kullanıcı tutulur.
- [ ] Raporlanan gönderi tutulur.
- [ ] Rapor tarihi tutulur.
- [ ] Rapor durumu tutulur.
- [ ] Aynı kullanıcı aynı gönderiyi tekrar raporlayamaz.
- [ ] Duplicate rapor backend’de engellenir.
- [ ] Duplicate rapor veritabanında engellenir.
- [ ] Farklı kullanıcılar aynı gönderiyi raporlayabilir.
- [ ] Raporlar admin panelinde görünür.
- [ ] Raporlar standart kullanıcıya görünmez.
- [ ] Banlı kullanıcı rapor gönderemez.
- [ ] Doğrulanmamış kullanıcı rapor gönderemez.

---

## 5.9 Admin Paneli

- [ ] Admin paneli vardır.
- [ ] Sadece admin erişebilir.
- [ ] Standart kullanıcı admin paneline erişemez.
- [ ] Standart kullanıcı admin API endpoint’lerine erişemez.
- [ ] Admin raporlanan gönderileri listeler.
- [ ] Admin gönderi içeriğini görür.
- [ ] Admin rapor sayısını görür.
- [ ] Admin rapor gerekçelerini görür.
- [ ] Admin gönderiyi pasif/gizli yapabilir.
- [ ] Admin kullanıcı banlayabilir.
- [ ] Admin sistem istatistiklerini görüntüler.
- [ ] Admin işlemleri backend rol kontrolünden geçer.
- [ ] Admin paneli istatistik ekranı en fazla 5 saniyede yüklenir.

---

## 5.10 Gönderi Pasifleştirme / Moderasyon

- [ ] Admin raporlanan gönderiyi pasif/gizli yapabilir.
- [ ] Pasifleştirme fiziksel silme değildir.
- [ ] Gönderi veritabanında kalır.
- [ ] Normal kullanıcı pasif/gizli gönderiyi göremez.
- [ ] Pasif/gizli gönderi ana sayfada görünmez.
- [ ] Pasif/gizli gönderi normal profilde görünmez.
- [ ] Admin denetim için pasif/gizli gönderiyi görebilir.
- [ ] Pasifleştiren admin bilgisi tutulur.
- [ ] Pasifleştirme zamanı tutulur.
- [ ] Pasifleştirme nedeni tutulur.
- [ ] İşlem loglanır.
- [ ] Rapor kayıtları bozulmaz.

---

## 5.11 Banlama

- [ ] Admin kullanıcıyı geçici banlayabilir.
- [ ] Admin kullanıcıyı kalıcı banlayabilir.
- [ ] Geçici ban bitiş tarihi tutulur.
- [ ] Kalıcı ban süresiz olarak tutulur.
- [ ] Ban sebebi tutulur.
- [ ] Banı atan admin tutulur.
- [ ] Ban tarihi tutulur.
- [ ] Ban işlemi loglanır.
- [ ] Banlanan kullanıcının verileri silinmez.
- [ ] Banlı kullanıcı login yapamaz.
- [ ] Banlı kullanıcı mevcut token ile işlem yapamaz.
- [ ] Banlı kullanıcı gönderi oluşturamaz.
- [ ] Banlı kullanıcı gönderi düzenleyemez.
- [ ] Banlı kullanıcı takip yapamaz.
- [ ] Banlı kullanıcı rapor gönderemez.
- [ ] Ban kaldırma varsa loglanır.
- [ ] Admin kendi admin yetkisini kaldıramaz.
- [ ] Son admin hesabı korunur.

---

## 5.12 Admin İstatistikleri

- [ ] Toplam kullanıcı sayısı gösterilir.
- [ ] Aktif kullanıcı sayısı gösterilir.
- [ ] Pasif kullanıcı sayısı gösterilir.
- [ ] Günlük gönderi sayısı gösterilir.
- [ ] Tarih aralıklı gönderi istatistiği gösterilir.
- [ ] Ülke/coğrafi dağılım gösterilir.
- [ ] Cinsiyet istatistiği varsa veri alanı ve gizlilik açıklaması vardır.
- [ ] Cinsiyet istatistiği yoksa SRS’deki ifade düzeltilmiştir.
- [ ] Tarih aralığı backend’de doğrulanır.
- [ ] Başlangıç tarihi bitiş tarihinden sonra olamaz.
- [ ] Ülke bilgisi standart formatta tutulur.
- [ ] Ülke bilgisi olmayanlar “Bilinmeyen” kategorisine girer.
- [ ] İstatistikler gerçek veritabanı verisine dayanır.
- [ ] Standart kullanıcı istatistiklere erişemez.
- [ ] İstatistik ekranı en fazla 5 saniyede yüklenir.

---

## 5.13 Ekstra Kullanıcı Özelliği

- [ ] Ekstra özellik vardır.
- [ ] Ekstra özellik kullanıcıya yöneliktir.
- [ ] Frontend’de görünür.
- [ ] Backend’de işlenir.
- [ ] Veritabanı gerekiyorsa veri modeli vardır.
- [ ] API endpoint’i veya işlem akışı vardır.
- [ ] Yetki kontrolleri vardır.
- [ ] Güvenlik kontrolleri vardır.
- [ ] Test senaryosu vardır.
- [ ] Demo sırasında gösterilebilir.
- [ ] README/SRS içinde açıklanmıştır.

---

## 5.14 Mimari

- [ ] Sistem client-server mimariye uygundur.
- [ ] Frontend yalnızca arayüzdür.
- [ ] Frontend veritabanına doğrudan erişmez.
- [ ] Frontend DB bağlantı bilgisi içermez.
- [ ] Frontend SQL/NoSQL sorgusu içermez.
- [ ] Backend merkezi kontrol katmanıdır.
- [ ] Backend iş kurallarını uygular.
- [ ] Backend doğrulama yapar.
- [ ] Backend yetkilendirme yapar.
- [ ] Backend veritabanına erişen tek uygulama katmanıdır.
- [ ] Tüm kritik kontroller backend’de yapılır.
- [ ] REST API kullanılır.
- [ ] API farklı istemcilere uygun yapıdadır.
- [ ] İleride mobil entegrasyona uygundur.

---

## 5.15 Veritabanı

- [ ] Kullanılan veritabanı teknolojisi tüm raporlarda tutarlıdır.
- [ ] PostgreSQL veya güncellenmiş eşdeğer ilişkisel veritabanı kullanılır.
- [ ] Kullanıcılar tablosu vardır.
- [ ] Gönderiler tablosu vardır.
- [ ] Takip ilişkileri tablosu vardır.
- [ ] Raporlar tablosu vardır.
- [ ] Roller tablosu veya rol alanı vardır.
- [ ] E-posta doğrulama tablosu vardır.
- [ ] Ban kayıtları tablosu vardır.
- [ ] Log kayıt sistemi vardır.
- [ ] Primary key yapıları vardır.
- [ ] Foreign key yapıları vardır.
- [ ] İndeksler vardır.
- [ ] Unique constraint’ler vardır.
- [ ] Günlük otomatik yedekleme vardır.
- [ ] Geri yükleme mekanizması vardır.

---

## 5.16 Güvenlik

- [ ] Şifreler bcrypt/Argon2 veya güçlü algoritmayla hashlenir.
- [ ] Yanlış giriş denemeleri sınırlandırılır.
- [ ] Geçici hesap kilidi vardır.
- [ ] E-posta doğrulanmadan ana özellikler kullanılamaz.
- [ ] Admin paneli yetkisiz erişime kapalıdır.
- [ ] Session/token güvenlidir.
- [ ] Oturum süresi vardır.
- [ ] SQL Injection koruması vardır.
- [ ] XSS koruması vardır.
- [ ] CSRF koruması vardır veya gerekçesi açıklanmıştır.
- [ ] Backend input validation yapar.
- [ ] Banlı kullanıcı sisteme giremez.
- [ ] Kritik işlemler loglanır.
- [ ] HTTPS/TLS kullanılır veya geliştirme ortamı için açıklanır.
- [ ] Admin yetkileri manuel/kontrollü atanır.
- [ ] KVKK/GDPR uyumu açıklanır.

---

## 5.17 Gizlilik

- [ ] E-posta adresleri diğer kullanıcılara gösterilmez.
- [ ] Kullanıcıdan yalnızca gerekli bilgiler alınır.
- [ ] Kişisel veriler izinsiz paylaşılmaz.
- [ ] Oturum bilgileri güvenli saklanır.
- [ ] Admin yalnızca görev kapsamında gerekli verilere erişir.
- [ ] Ülke/IP/konum verisi yalnızca istatistik/güvenlik için kullanılır.
- [ ] Kullanıcı hesabını pasif hale getirme veya silme hakkına sahiptir.
- [ ] Loglarda şifre tutulmaz.
- [ ] Loglarda token tutulmaz.
- [ ] Loglarda tam e-posta açık tutulmaz veya maskelenir.
- [ ] Gizlilik politikası vardır.
- [ ] Kullanım şartları vardır.
- [ ] Açık rıza gereken işlemler için onay mekanizması vardır.

---

## 5.18 Performans

- [ ] Login en fazla 2 saniyede yanıt verir.
- [ ] Gönderi paylaşma en fazla 3 saniyede tamamlanır.
- [ ] Ana sayfa akışı en fazla 2 saniyede yüklenir.
- [ ] Sistem en az 100 eşzamanlı kullanıcı destekler.
- [ ] Veritabanı sorguları optimize edilmiştir.
- [ ] Gereksiz tekrar eden sorgular engellenmiştir.
- [ ] Cache mekanizması kullanılabilir.
- [ ] Admin istatistik ekranları en fazla 5 saniyede yüklenir.
- [ ] Sunucu hata durumunda kontrollü hata mesajı döndürür.
- [ ] Performans test sonuçları kaydedilmiştir.

---

## 5.19 Kalite

- [ ] Arayüz kullanıcı dostudur.
- [ ] Yeni kullanıcı temel işlemleri 10 dakika içinde öğrenebilir.
- [ ] Chrome uyumluluğu vardır.
- [ ] Firefox uyumluluğu vardır.
- [ ] Edge uyumluluğu vardır.
- [ ] Safari uyumluluğu vardır.
- [ ] Responsive tasarım vardır.
- [ ] Kod modülerdir.
- [ ] Kod okunabilirdir.
- [ ] Kod bakım yapılabilir yapıdadır.
- [ ] Kritik hatalarda sistem tamamen çökmez.
- [ ] Kontrollü hata mesajları vardır.
- [ ] %95 erişilebilirlik hedefi belirtilmiştir.
- [ ] Birim testlerine uygundur.
- [ ] Entegrasyon testlerine uygundur.
- [ ] Kullanıcı kabul testlerine uygundur.
- [ ] Güncellemelerde veri kaybı oluşmaz.

---

## 5.20 Operasyon

- [ ] Git kullanılır.
- [ ] Repository düzenlidir.
- [ ] Docker/container desteği vardır veya kapsam dışıysa açıklanmıştır.
- [ ] Dockerfile veya docker-compose vardır.
- [ ] Hata loglama vardır.
- [ ] İzleme/monitoring vardır veya temel log takibi açıklanmıştır.
- [ ] Test ve üretim ortamı ayrıdır.
- [ ] Ortam değişkenleri güvenli yönetilir.
- [ ] DB bilgileri kod içine yazılmaz.
- [ ] Deployment adımları dokümante edilmiştir.
- [ ] Yedekleme periyodu belirlenmiştir.
- [ ] Log saklama süresi belirlenmiştir.

---

## 5.21 Kullanıcı Belgeleri

- [ ] Kullanım kılavuzu vardır.
- [ ] Kayıt olma anlatılmıştır.
- [ ] Giriş yapma anlatılmıştır.
- [ ] Gönderi paylaşma anlatılmıştır.
- [ ] Kullanıcı takip etme anlatılmıştır.
- [ ] İçerik raporlama anlatılmıştır.
- [ ] Admin paneli rehberi vardır.
- [ ] Rapor inceleme anlatılmıştır.
- [ ] Kullanıcı yönetimi anlatılmıştır.
- [ ] Gönderi pasifleştirme anlatılmıştır.
- [ ] Ban işlemi anlatılmıştır.
- [ ] Yardım bölümü vardır.
- [ ] SSS bölümü vardır.
- [ ] Belgeler PDF veya web sayfası olarak sunulur.
- [ ] Belgeler uygulama içinden veya teslim dosyasından erişilebilir.

---

## 5.22 Yasal Gereksinimler

- [ ] KVKK uyumu açıklanmıştır.
- [ ] GDPR uyumu açıklanmıştır.
- [ ] Kullanıcıdan gerekli durumlarda açık rıza alınır.
- [ ] Telif hakkı ihlali içeren içerikler pasif yapılabilir.
- [ ] Yasa dışı içerikler pasif yapılabilir.
- [ ] Kullanım şartları kullanıcıya sunulur.
- [ ] Gizlilik politikası kullanıcıya sunulur.
- [ ] Kullanıcı verilerinin hangi amaçla kullanıldığı açıklanır.

---

## 5.23 SRS TBD Kapanış Kontrolü

- [ ] Hosting sağlayıcısı belirlenmiştir.
- [ ] Domain adı belirlenmiştir veya kapsam dışı açıklanmıştır.
- [ ] Gönderi karakter limiti belirlenmiştir.
- [ ] Şifre politikası belirlenmiştir.
- [ ] E-posta kod süresi belirlenmiştir.
- [ ] Şifre sıfırlama süreci kapsamı belirlenmiştir.
- [ ] Mobil uygulama desteği kapsamı belirlenmiştir.
- [ ] Bildirim sistemi kapsamı belirlenmiştir.
- [ ] Yedekleme periyodu belirlenmiştir.
- [ ] Log saklama süresi belirlenmiştir.
- [ ] Arayüz tema tasarımı belirlenmiştir.
- [ ] Performans üst sınırı belirlenmiştir.
- [ ] İçerik moderasyon kuralları belirlenmiştir.
- [ ] Kesinleşen TBD maddeleri SRS’ye aktarılmıştır.
- [ ] Geçersiz kalan TBD maddeleri kaldırılmış veya açıklanmıştır.

---

## 5.24 PPM Kapanış Kontrolü

- [ ] Gantt çizelgesi günceldir.
- [ ] İş paketleri proje durumuyla uyumludur.
- [ ] Ara çıktılar tamamlanmıştır.
- [ ] CPM süreleri tutarlıdır.
- [ ] PERT süreleri tutarlıdır.
- [ ] 76/78 gün farkı açıklanmıştır.
- [ ] Risk tablosu yazılıma uygundur.
- [ ] Araç tablosundaki tüm maliyetler tamamlanmıştır.
- [ ] PPM’deki MySQL/PostgreSQL tutarlılığı sağlanmıştır.
- [ ] Test raporları hazırlanmıştır.
- [ ] Proje sonuç raporu hazırlanmıştır.
- [ ] Demo akışı hazırlanmıştır.
- [ ] Ekip görev dağılımı günceldir.

---

# 6. Nihai Demo Senaryosu

Aşağıdaki demo yapılabiliyorsa tüm raporların ana gereksinimleri büyük oranda kanıtlanmış olur.

## 6.1 Kullanıcı Akışı

- [ ] Yeni kullanıcı oluştur.
- [ ] Aynı kullanıcı adıyla tekrar kayıt dene.
- [ ] Aynı e-postayla tekrar kayıt dene.
- [ ] E-posta doğrulama kodunu üret/gönder.
- [ ] Yanlış kod dene.
- [ ] Doğru kodla hesabı aktif et.
- [ ] Kullanıcıyla login yap.
- [ ] Logout yap.
- [ ] Tekrar login yap.
- [ ] Gönderi oluştur.
- [ ] Gönderiyi düzenle.
- [ ] Gönderiyi profil sayfasında göster.
- [ ] Başka kullanıcıyla login yap.
- [ ] İlk kullanıcıyı takip et.
- [ ] Ana sayfada takip edilen kullanıcının gönderisini göster.
- [ ] Takipten çık.
- [ ] Ana sayfanın boşaldığını veya gönderinin kalktığını göster.
- [ ] Gönderiyi raporla.
- [ ] Aynı gönderiyi tekrar raporlamayı dene ve reddedildiğini göster.

## 6.2 Admin Akışı

- [ ] Admin hesabıyla login yap.
- [ ] Admin panelini aç.
- [ ] Raporlanan gönderiyi listele.
- [ ] Raporlanan gönderi içeriğini göster.
- [ ] Rapor sayısını göster.
- [ ] Rapor gerekçelerini göster.
- [ ] Gönderiyi pasifleştir.
- [ ] Normal kullanıcıyla gönderinin görünmediğini göster.
- [ ] Kullanıcıyı geçici veya kalıcı banla.
- [ ] Banlı kullanıcının login yapamadığını göster.
- [ ] Admin istatistik panelini aç.
- [ ] Toplam kullanıcı sayısını göster.
- [ ] Aktif/pasif kullanıcı sayısını göster.
- [ ] Günlük gönderi sayısını göster.
- [ ] Tarih aralıklı gönderi istatistiğini göster.
- [ ] Ülke/coğrafi dağılımı göster.
- [ ] Ekstra kullanıcı özelliğini göster.

## 6.3 Teknik Akış

- [ ] Frontend’de DB bağlantısı olmadığını göster.
- [ ] Backend API endpoint’lerini göster.
- [ ] Veritabanı tablolarını göster.
- [ ] Unique constraint’leri göster.
- [ ] Şifre hashlerini göster.
- [ ] Log kayıtlarını göster.
- [ ] Performans test sonucunu göster.
- [ ] Git repository göster.
- [ ] Docker/container çalıştırma göster.
- [ ] Kullanım kılavuzu ve admin rehberini göster.

---

# 7. Son Kırmızı Liste

Aşağıdaki maddelerden biri eksikse son raporda veya projede risk vardır.

- [ ] E-posta doğrulama yoksa.
- [ ] Doğrulama olmadan kullanıcı aktif oluyorsa.
- [ ] Aynı kullanıcı adı/e-posta engellenmiyorsa.
- [ ] Şifre düz metin tutuluyorsa.
- [ ] Login/logout güvenli değilse.
- [ ] Yanlış giriş denemeleri sınırlanmıyorsa.
- [ ] Oturum süresi yoksa.
- [ ] Kullanıcı kendi gönderisini düzenleyemiyorsa ve SRS düzeltilmemişse.
- [ ] Kullanıcı başkasının gönderisini düzenleyebiliyorsa.
- [ ] Kullanıcı başkasının gönderisini silebiliyorsa.
- [ ] Ana sayfa tüm gönderileri gösteriyorsa.
- [ ] Takipçi/takip edilen listeleri yoksa.
- [ ] Raporlama yoksa.
- [ ] Duplicate rapor engeli yoksa.
- [ ] Admin rapor gerekçelerini göremiyorsa.
- [ ] Admin gönderiyi pasifleştiremiyorsa.
- [ ] Admin gönderiyi fiziksel silip denetim izini yok ediyorsa.
- [ ] Banlama yoksa.
- [ ] Banlı kullanıcı login yapabiliyorsa.
- [ ] Admin istatistikleri eksikse.
- [ ] Ülke dağılımı yoksa.
- [ ] Frontend veritabanına erişiyorsa.
- [ ] Backend yetkilendirme yapmıyorsa.
- [ ] REST API yoksa.
- [ ] DB teknolojisi raporlar arasında çelişiyorsa.
- [ ] Python/PostgreSQL ifadeleri kodla uyumsuzsa.
- [ ] HTTPS/TLS hiç ele alınmamışsa.
- [ ] SQL Injection/XSS/CSRF korumaları yoksa.
- [ ] KVKK/GDPR/gizlilik politikası yoksa.
- [ ] Kullanım şartları yoksa.
- [ ] Loglama yoksa.
- [ ] Yedekleme/geri yükleme yoksa.
- [ ] Performans testleri yapılmamışsa.
- [ ] Kullanıcı kılavuzu yoksa.
- [ ] Admin rehberi yoksa.
- [ ] SRS TBD maddeleri kapatılmamışsa.
- [ ] PPM süre/maliyet/tutarlılık sorunları düzeltilmemişse.
- [ ] Ekstra kullanıcı özelliği yoksa.

---

# 8. Final Karar

Tüm raporlar karşılaştırıldığında son kontrol listesinin mevcut hali güçlüdür; ancak son raporda kesinlikle şu ek/çelişki kapatma maddeleri bulunmalıdır:

1. **MySQL/PostgreSQL tutarlılığı**
2. **Python backend gerçekliği**
3. **Şelale/Agile/TDD açıklaması**
4. **76 gün / 78 gün süre farkı açıklaması**
5. **Cinsiyet istatistiği uygulanacak mı, çıkarılacak mı kararı**
6. **Gönderi düzenleme özelliği**
7. **Yanlış giriş denemesi limiti ve hesap kilidi**
8. **Oturum süresi dolunca otomatik çıkış**
9. **HTTPS/TLS**
10. **SQL Injection / XSS / CSRF koruması**
11. **KVKK/GDPR, kullanım şartları, gizlilik politikası**
12. **Loglama ve kritik yönetici işlemleri denetim izi**
13. **Günlük yedekleme ve geri yükleme**
14. **Docker/container ve test/production ortam ayrımı**
15. **Kullanıcı kılavuzu, admin rehberi, yardım ve SSS**
16. **SRS TBD maddelerinin kapatılması**
17. **PPM maliyet/araç tablosu eksiklerinin kapatılması**
18. **Ekstra kullanıcı özelliğinin son raporda açık gösterilmesi**

Bu maddeler kapatılırsa FISILTI projesinin son raporu, ilk gereksinim dokümanı, PPM ve SRS arasında izlenebilir, tutarlı ve eksiksiz hale gelir.
