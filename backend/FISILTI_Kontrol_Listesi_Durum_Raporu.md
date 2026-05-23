# FISILTI Kontrol Listesi Durum Raporu
> Oluşturulma: 2026-05-23  
> Kaynak: Son Kontrol Listesi × Gerçek Codebase Karşılaştırması

---

## ✅ MEVCUT / UYGULANMIŞ

### 5.1 Kullanıcı Kayıt
- [x] Kullanıcı kayıt formu vardır (Register sayfası)
- [x] Kullanıcı adı alınır
- [x] E-posta alınır
- [x] Şifre alınır
- [x] Ülke bilgisi alınır (`country` alanı, opsiyonel)
- [x] Kullanıcı adı boş olamaz (backend validation)
- [x] E-posta boş olamaz
- [x] Şifre boş olamaz
- [x] E-posta formatı kontrol edilir
- [x] Aynı kullanıcı adıyla hesap açılamaz (unique constraint)
- [x] Aynı e-postayla hesap açılamaz (unique constraint)
- [x] Benzersizlik backend'de kontrol edilir
- [x] Benzersizlik veritabanı unique constraint ile korunur
- [x] E-posta normalize edilir (Django AbstractUser)
- [x] Şifre düz metin saklanmaz
- [x] Şifre güçlü algoritmayla hashlenir (PBKDF2)
- [x] Kullanıcı kayıt sonrası doğrulanmamış durumda oluşturulur (`is_email_verified=False`)
- [x] Kayıt sonrası e-posta doğrulama kodu gönderilir

### 5.2 E-Posta Doğrulama
- [x] Doğrulama kodu üretilir (6 haneli)
- [x] Kod kullanıcıya e-posta ile gönderilir (SMTP)
- [x] Kod her kullanıcı için benzersizdir
- [x] Kod rastgeledir
- [x] Kod süreye bağlıdır (10 dakika)
- [x] Süresi dolmuş kod reddedilir
- [x] Doğru kod kullanıcıyı aktif hale getirir
- [x] Yanlış kod kullanıcıyı aktif hale getirmez
- [x] Kullanılmış kod tekrar kullanılamaz (`is_used=True`)
- [x] Başarısız doğrulama girişimleri sayılır (cache ile 5/10 dakika)
- [x] Çok fazla başarısız girişimde güvenlik önlemi uygulanır (429)
- [x] Doğrulanmamış kullanıcı ana özellikleri kullanamaz (`REQUIRE_EMAIL_VERIFICATION`)
- [x] Doğrulanmamış kullanıcı gönderi oluşturamaz
- [x] Doğrulanmamış kullanıcı takip yapamaz (`IsEmailVerified` permission)
- [x] Doğrulanmamış kullanıcı rapor gönderemez

### 5.3 Login / Logout / Oturum
- [x] Kullanıcı giriş yapabilir
- [x] Hatalı bilgilerle giriş reddedilir
- [x] Şifre hash üzerinden doğrulanır
- [x] Doğrulanmamış kullanıcı erişemez
- [x] Banlı kullanıcı erişemez
- [x] Pasif kullanıcı erişemez (`is_active=False`)
- [x] Yanlış şifre denemeleri sınırlandırılır (5 deneme / 15 dakika)
- [x] Belirli sayıda yanlış denemeden sonra geçici hesap kilidi (429 Too Many Requests)
- [x] Başarılı login sonrası güvenli token oluşturulur (JWT access + refresh)
- [x] Kullanıcı logout yapabilir (refresh token blacklist)
- [x] Logout sonrası oturum sonlandırılır
- [x] Oturum bilgileri güvenli saklanır (JWT)

### 5.4 Gönderi Sistemi
- [x] Kullanıcı metin tabanlı gönderi oluşturabilir
- [x] Boş gönderi oluşturulamaz
- [x] Gönderi karakter limiti belirlenmiştir (280 karakter)
- [x] Karakter limiti frontend'de gösterilir (karakter sayacı)
- [x] Karakter limiti backend'de uygulanır
- [x] Gönderi kullanıcı ID'si ile ilişkilidir (ForeignKey)
- [x] Gönderi oluşturulma tarihi tutulur (`created_at`)
- [x] Gönderi güncellenme tarihi tutulur (`updated_at`, auto_now=True)
- [x] Gönderi aktif/pasif durumuna sahiptir (`is_active`)
- [x] Kullanıcı kendi gönderisini görüntüleyebilir
- [x] Kullanıcı kendi gönderisini düzenleyebilir (`PATCH /posts/<id>/`)
- [x] Kullanıcı yalnızca kendi gönderisini düzenleyebilir (sahiplik backend'de kontrol edilir)
- [x] Kullanıcı kendi gönderisini silebilir (soft delete)
- [x] Kullanıcı yalnızca kendi gönderisini silebilir
- [x] Başka kullanıcı gönderi düzenleyemez
- [x] Başka kullanıcı gönderi silemez
- [x] Sahiplik kontrolü backend'de yapılır

### 5.5 Profil / Gönderilerim
- [x] Kullanıcının profil/Gönderilerim sayfası vardır
- [x] Kullanıcının gönderileri listelenir
- [x] Gönderiler oluşturulma tarihine göre sıralanır
- [x] Başka kullanıcı profili görüntülenebilir (`/profile/:username`)
- [x] Pasif/gizli gönderiler normal kullanıcıya gösterilmez
- [x] Profil ekranı modern tarayıcılarda çalışır (Vite/React)

### 5.6 Takip Sistemi
- [x] Kullanıcı başka kullanıcıyı takip edebilir
- [x] Kullanıcı takipten çıkabilir
- [x] Takip ilişkisi tek yönlüdür
- [x] Karşılıklı takip zorunlu değildir
- [x] Kullanıcı kendisini takip edemez (model validation)
- [x] Aynı kullanıcı aynı kişiyi iki kez takip edemez (`unique_together`)
- [x] Takip eden kullanıcı bilgisi tutulur
- [x] Takip edilen kullanıcı bilgisi tutulur
- [x] Takip tarihi tutulur (`created_at`)
- [x] Takipçiler listesi görüntülenir
- [x] Takip edilenler listesi görüntülenir
- [x] Duplicate takip backend'de engellenir
- [x] Duplicate takip veritabanında engellenir
- [x] Banlı kullanıcı takip yapamaz
- [x] Doğrulanmamış kullanıcı takip yapamaz

### 5.7 Ana Sayfa Akışı
- [x] Ana sayfa vardır
- [x] Ana sayfa yalnızca takip edilen kullanıcıların aktif gönderilerini gösterir
- [x] Takip edilmeyen kullanıcı gönderileri görünmez
- [x] Pasif/gizli gönderiler görünmez
- [x] Silinmiş gönderiler görünmez
- [x] Akış filtrelemesi backend'de yapılır
- [x] Gönderiler kronolojik sıralanır

### 5.8 Raporlama
- [x] Her gönderide rapor etme mekanizması vardır
- [x] Kullanıcı gönderiyi raporlayabilir
- [x] Rapor gerekçesi alınır (choices: spam/inappropriate/harassment/misinformation/other)
- [x] Rapor gerekçesi boş olamaz
- [x] Raporlayan kullanıcı tutulur
- [x] Raporlanan gönderi tutulur
- [x] Rapor tarihi tutulur
- [x] Aynı kullanıcı aynı gönderiyi tekrar raporlayamaz (`unique_together`)
- [x] Duplicate rapor backend'de engellenir
- [x] Duplicate rapor veritabanında engellenir
- [x] Farklı kullanıcılar aynı gönderiyi raporlayabilir
- [x] Raporlar admin panelinde görünür
- [x] Raporlar standart kullanıcıya görünmez
- [x] Banlı kullanıcı rapor gönderemez
- [x] Doğrulanmamış kullanıcı rapor gönderemez

### 5.9 Admin Paneli
- [x] Admin paneli vardır (`/admin`)
- [x] Sadece admin erişebilir (`IsAdmin` permission + `AdminRoute`)
- [x] Standart kullanıcı admin paneline erişemez
- [x] Standart kullanıcı admin API endpoint'lerine erişemez
- [x] Admin raporlanan gönderileri listeler
- [x] Admin gönderi içeriğini görür
- [x] Admin rapor sayısını görür
- [x] Admin rapor gerekçelerini görür
- [x] Admin gönderiyi pasif/gizli yapabilir (`POST /admin/posts/<id>/deactivate/`)
- [x] Admin kullanıcı banlayabilir (`POST /admin/users/<username>/ban/`)
- [x] Admin sistem istatistiklerini görüntüler
- [x] Admin işlemleri backend rol kontrolünden geçer

### 5.10 Gönderi Pasifleştirme / Moderasyon
- [x] Admin raporlanan gönderiyi pasif/gizli yapabilir
- [x] Pasifleştirme fiziksel silme değildir (soft delete)
- [x] Gönderi veritabanında kalır
- [x] Normal kullanıcı pasif/gizli gönderiyi göremez
- [x] Pasif/gizli gönderi ana sayfada görünmez
- [x] Pasif/gizli gönderi normal profilde görünmez
- [x] Admin denetim için pasif/gizli gönderiyi görebilir
- [x] Pasifleştiren admin bilgisi tutulur (AuditLog)
- [x] Pasifleştirme zamanı tutulur (AuditLog.created_at)
- [x] Pasifleştirme nedeni tutulur (AuditLog.detail)
- [x] İşlem loglanır (AuditLog tablosu)
- [x] Rapor kayıtları bozulmaz (SET_NULL değil, raporlar ayrı tabloda)

### 5.11 Banlama
- [x] Admin kullanıcıyı geçici banlayabilir (`duration_days` parametresi)
- [x] Admin kullanıcıyı kalıcı banlayabilir (duration_days olmadan)
- [x] Geçici ban bitiş tarihi tutulur (`banned_until`)
- [x] Kalıcı ban süresiz olarak tutulur (`banned_until=None`)
- [x] Ban sebebi tutulur (AuditLog.detail)
- [x] Banı atan admin tutulur (AuditLog.admin)
- [x] Ban tarihi tutulur (AuditLog.created_at)
- [x] Ban işlemi loglanır (AuditLog)
- [x] Banlanan kullanıcının verileri silinmez
- [x] Banlı kullanıcı login yapamaz
- [x] Banlı kullanıcı gönderi oluşturamaz
- [x] Admin kendi admin yetkisini kaldıramaz (self-ban kontrolü)

### 5.12 Admin İstatistikleri
- [x] Toplam kullanıcı sayısı gösterilir
- [x] Aktif kullanıcı sayısı gösterilir
- [x] Pasif kullanıcı sayısı gösterilir
- [x] Günlük gönderi sayısı gösterilir
- [x] Tarih aralıklı gönderi istatistiği gösterilir
- [x] Ülke/coğrafi dağılım gösterilir (users_by_country)
- [x] Tarih aralığı backend'de doğrulanır
- [x] İstatistikler gerçek veritabanı verisine dayanır
- [x] Standart kullanıcı istatistiklere erişemez

### 5.13 Ekstra Kullanıcı Özelliği
- [x] Ekstra özellik vardır (**Hayvan Avatar Sistemi** - fox/owl/rabbit/cat)
- [x] Ekstra özellik kullanıcıya yöneliktir
- [x] Frontend'de görünür (profil sayfasında avatar seçici)
- [x] Backend'de işlenir (`PATCH /users/me/` → `animal_avatar`)
- [x] Veritabanı veri modeli vardır (`animal_avatar` alanı)
- [x] API endpoint'i vardır
- [x] Yetki kontrolleri vardır (sadece kendi avatarını değiştirebilir)

### 5.14 Mimari
- [x] Sistem client-server mimariye uygundur
- [x] Frontend yalnızca arayüzdür (React)
- [x] Frontend veritabanına doğrudan erişmez
- [x] Frontend DB bağlantı bilgisi içermez
- [x] Backend merkezi kontrol katmanıdır (Django)
- [x] Backend iş kurallarını uygular
- [x] Backend doğrulama yapar
- [x] Backend yetkilendirme yapar
- [x] Backend veritabanına erişen tek uygulama katmanıdır
- [x] REST API kullanılır (DRF)

### 5.15 Veritabanı
- [x] PostgreSQL kullanılır (`dj_database_url`, `DATABASE_URL` env var)
- [x] Kullanıcılar tablosu vardır (`kullanicilar`)
- [x] Gönderiler tablosu vardır (`posts_post`)
- [x] Takip ilişkileri tablosu vardır (`follows_follow`)
- [x] Raporlar tablosu vardır (`reports_report`)
- [x] Rol alanı vardır (`role` CharField)
- [x] E-posta doğrulama tablosu vardır (`eposta_dogrulamalari`)
- [x] Ban kayıtları: `is_banned` + `banned_until` alanları + AuditLog
- [x] Log kayıt sistemi vardır (AuditLog tablosu)
- [x] Primary key yapıları vardır
- [x] Foreign key yapıları vardır
- [x] İndeksler vardır (LoginAttempt, EmailVerification, Follow, Post)
- [x] Unique constraint'ler vardır (email, username, follow, report)

### 5.16 Güvenlik
- [x] Şifreler PBKDF2 ile hashlenir (Django default, güvenli)
- [x] Yanlış giriş denemeleri sınırlandırılır (5/15 dakika)
- [x] Geçici hesap kilidi vardır (429 Too Many Requests)
- [x] E-posta doğrulanmadan ana özellikler kullanılamaz
- [x] Admin paneli yetkisiz erişime kapalıdır (`IsAdmin`)
- [x] Session/token güvenlidir (JWT + blacklist)
- [x] Oturum süresi vardır (access: 60 dakika, refresh: 7 gün)
- [x] Backend input validation yapar
- [x] Banlı kullanıcı sisteme giremez
- [x] Kritik işlemler loglanır (AuditLog)
- [x] CSRF koruması vardır (Django middleware)
- [x] Admin yetkileri manuel/kontrollü atanır (`role='admin'`)

### 5.17 Gizlilik
- [x] E-posta adresleri diğer kullanıcılara gösterilmez (UserSerializer e-posta içermiyor)
- [x] Oturum bilgileri güvenli saklanır (JWT)
- [x] Admin yalnızca görev kapsamında gerekli verilere erişir

### 5.20 Operasyon
- [x] Git kullanılır
- [x] Repository düzenlidir
- [x] Ortam değişkenleri güvenli yönetilir (`.env`, `python-decouple`)
- [x] DB bilgileri kod içine yazılmaz (`DATABASE_URL` env var)

---

## ❌ EKSİK / UYGULANMAMIS

### 5.1 Kullanıcı Kayıt — Eksikler
- [ ] **Cinsiyet alanı kararı:** `gender` alanı modelde yok, SRS'de cinsiyet istatistiği geçiyor — ya alana eklenip istatistiklere dahil edilmeli ya da SRS'den çıkarılmalı.
- [ ] Kullanıcı adı normalize edilir (küçük harf / boşluk normalizasyonu yok, şu an case-sensitive)

### 5.3 Login / Logout / Oturum — Eksikler
- [ ] **Login en fazla 2 saniye içinde yanıt verir** — performans testi yapılmamış, belgelenmemiş.
- [ ] **Oturum süresi dolunca kullanıcı otomatik çıkarılır** — access token 60 dakikada doluyor fakat UI otomatik yönlendirme/bildirim yok (frontend intercept sadece refresh başarısız olunca silent logout yapıyor, kullanıcıya bildirim gösterilmiyor).

### 5.4 Gönderi Sistemi — Eksikler
- [ ] **XSS riskine karşı içerik güvenli gösterilir** — React DOM escaping mevcut ama `dangerouslySetInnerHTML` kullanımı olmadığı teyit edilmeli; açık belgelenmemiş.
- [ ] **Admin tarafından gizlenen gönderi kullanıcı tarafından tekrar görünür yapılamaz** — backend'de bu kontrol yok (`PATCH /posts/<id>/` ile kullanıcı `is_active=True` set edebilir mi kontrol edilmeli).
- [ ] **Boş veya karakter limitini aşan düzenleme reddedilir** — create'te var ama `PATCH` serializer'da da aynı validasyonun olduğu teyit edilmeli.

### 5.5 Profil / Gönderilerim — Eksikler
- [ ] **Gönderisi olmayan kullanıcı için boş durum mesajı vardır** — frontend implementasyonu belirsiz.
- [ ] **Profil ekranı mobil uyumludur** — responsive tasarım test edilmemiş / belgelenmemiş.

### 5.7 Ana Sayfa Akışı — Eksikler
- [ ] **Kullanıcı kimseyi takip etmiyorsa boş akış döner** — backend muhtemelen boş liste döner ama frontend'de kullanıcıya yönlendirici boş durum mesajı olup olmadığı teyit edilmeli.
- [ ] **Boş akış mesajı gösterilir** — teyit edilmeli.
- [ ] **Ana sayfa en fazla 2 saniyede yüklenir** — performans testi yok.

### 5.9 Admin Paneli — Eksikler
- [ ] **Admin paneli istatistik ekranı en fazla 5 saniyede yüklenir** — performans testi yok.

### 5.11 Banlama — Eksikler
- [ ] **Banlı kullanıcının mevcut token ile işlem yapamaz** — token blacklist sadece logout'ta yapılıyor; ban işlemi aktif JWT token'ları geçersiz kılmıyor. Ban anında kullanıcının mevcut access token'ı (60 dakika) çalışmaya devam edebilir.
- [ ] **Banlı kullanıcı gönderi düzenleyemez** — middleware/permission seviyesinde her request'te ban kontrolü yok; token geçerliyse erişebilir.
- [ ] **Banlı kullanıcı takip yapamaz** — aynı sorun.
- [ ] **Banlı kullanıcı rapor gönderemez** — aynı sorun.
- [ ] **Ban kaldırma loglanır** — unban işlemi AuditLog'a kaydediliyor mu teyit edilmeli.
- [ ] **Son admin hesabı korunur** — son admin silinememeli/banlanamamalı; bu kontrol var mı?

### 5.12 Admin İstatistikleri — Eksikler
- [ ] **Cinsiyet istatistiği** — uygulanmayacaksa SRS'den çıkarılmalı.
- [ ] **Başlangıç tarihi bitiş tarihinden sonra olamaz** — tarih aralığı validasyonu backend'de var mı teyit edilmeli.
- [ ] **Ülke bilgisi olmayanlar "Bilinmeyen" kategorisine girer** — null/boş country için fallback var mı?
- [ ] **İstatistik ekranı en fazla 5 saniyede yüklenir** — performans testi yok.

### 5.13 Ekstra Kullanıcı Özelliği — Eksikler
- [ ] **Test senaryosu vardır** — avatar özelliği için unit/entegrasyon testi yok.
- [ ] **Demo sırasında gösterilebilir** — demo akışına eklenmiş mi?
- [ ] **README/SRS içinde açıklanmıştır** — ekstra özellik olarak açıkça belgelenmiş mi?

### 5.14 Mimari — Eksikler
- [ ] **API farklı istemcilere uygun yapıdadır** — belgelenmemiş.
- [ ] **İleride mobil entegrasyona uygundur** — belgelenmemiş.

### 5.15 Veritabanı — Eksikler
- [ ] **Ayrı ban kayıtları tablosu** — ban bilgisi User modelinde (is_banned, banned_until) ve AuditLog'da; ancak ayrı bir `ban_kayitlari` tablosu yok. Geçmiş ban geçmişi tutulmuyor.
- [ ] **Günlük otomatik yedekleme vardır** — yapılandırılmamış.
- [ ] **Geri yükleme mekanizması vardır** — belgelenmemiş.

### 5.16 Güvenlik — Eksikler
- [ ] **bcrypt veya Argon2 ile şifre hashleme** — PBKDF2 kullanılıyor; SRS bcrypt/Argon2 diyor. PBKDF2 güvenli olsa da SRS ile tutarsız — ya SRS güncellenmeli ya da şifre hasher değiştirilmeli.
- [ ] **SQL Injection koruması belgelenmiştir** — Django ORM koruma sağlar ama bunu açıklayan bir belge yok.
- [ ] **XSS koruması belgelenmiştir** — React escaping sağlar ama belgelenmemiş.
- [ ] **HTTPS/TLS kullanılır veya geliştirme ortamı için açıklanır** — production'da HTTPS varsayılıyor ama kodda SECURE_SSL_REDIRECT, HSTS vb. ayarlar yok.
- [ ] **KVKK/GDPR uyumu açıklanır** — hiçbir belge/sayfa yok.

### 5.17 Gizlilik — Eksikler
- [ ] **Kullanıcıdan yalnızca gerekli bilgiler alınır** — belgelenmemiş.
- [ ] **Kişisel veriler izinsiz paylaşılmaz** — belgelenmemiş.
- [ ] **Ülke/IP/konum verisi yalnızca istatistik/güvenlik için kullanılır** — belgelenmemiş.
- [ ] **Kullanıcı hesabını pasif hale getirme veya silme hakkına sahiptir** — `DELETE /users/me/` var (deactivate), tam silme yok.
- [ ] **Loglarda şifre tutulmaz** — teyit edilmeli.
- [ ] **Loglarda token tutulmaz** — teyit edilmeli.
- [ ] **Loglarda tam e-posta açık tutulmaz veya maskelenir** — teyit edilmeli.
- [ ] **Gizlilik politikası vardır** — uygulama içinde veya dokümanda yok.
- [ ] **Kullanım şartları vardır** — yok.
- [ ] **Açık rıza gereken işlemler için onay mekanizması vardır** — kayıt formunda "şartları kabul ediyorum" yok.

### 5.18 Performans — Eksikler
- [ ] **Login en fazla 2 saniyede yanıt verir** — test edilmemiş.
- [ ] **Gönderi paylaşma en fazla 3 saniyede tamamlanır** — test edilmemiş.
- [ ] **Ana sayfa akışı en fazla 2 saniyede yüklenir** — test edilmemiş.
- [ ] **Sistem en az 100 eşzamanlı kullanıcı destekler** — test edilmemiş.
- [ ] **Veritabanı sorguları optimize edilmiştir** — `select_related`/`prefetch_related` kullanımı teyit edilmeli.
- [ ] **Cache mekanizması kullanılabilir** — `LocMemCache` var ama yeterince kullanılıyor mu?
- [ ] **Admin istatistik ekranları en fazla 5 saniyede yüklenir** — test edilmemiş.
- [ ] **Performans test sonuçları kaydedilmiştir** — hiç kaydedilmemiş.

### 5.19 Kalite — Eksikler
- [ ] **Yeni kullanıcı temel işlemleri 10 dakika içinde öğrenebilir** — kullanılabilirlik testi yok.
- [ ] **Chrome uyumluluğu test edilmiştir** — test edilmemiş.
- [ ] **Firefox uyumluluğu test edilmiştir** — test edilmemiş.
- [ ] **Edge uyumluluğu test edilmiştir** — test edilmemiş.
- [ ] **Safari uyumluluğu test edilmiştir** — test edilmemiş.
- [ ] **Responsive tasarım vardır** — uygulanmış görünüyor ama test belgelenmemiş.
- [ ] **%95 erişilebilirlik hedefi belirtilmiştir** — belgelenmemiş.
- [ ] **Birim testleri vardır** — test dosyası yok.
- [ ] **Entegrasyon testleri vardır** — test dosyası yok.
- [ ] **Kullanıcı kabul testleri vardır** — yok.
- [ ] **Güncellemelerde veri kaybı oluşmaz** — belgelenmemiş.

### 5.20 Operasyon — Eksikler
- [ ] **Docker/container desteği vardır** — Dockerfile repo geçmişinde var ama kaldırılmış (`a6e29ff` commit). Yeniden eklenmeli veya kapsam dışı olduğu belgelenmeli.
- [ ] **Dockerfile veya docker-compose vardır** — yok.
- [ ] **Hata loglama dosyaya yazılır** — sadece DB'ye yazılıyor (AuditLog + LoginAttempt); file-based logging yok.
- [ ] **İzleme/monitoring vardır veya temel log takibi açıklanmıştır** — belgelenmemiş.
- [ ] **Test ve üretim ortamı ayrıdır** — env var'larla ayrılmış ama ayrı `settings_test.py` yok.
- [ ] **Deployment adımları dokümante edilmiştir** — yok.
- [ ] **Yedekleme periyodu belirlenmiştir** — yok.
- [ ] **Log saklama süresi belirlenmiştir** — yok.

### 5.21 Kullanıcı Belgeleri — Eksikler
- [ ] **Kullanım kılavuzu vardır** — yok.
- [ ] **Kayıt olma anlatılmıştır** — yok.
- [ ] **Giriş yapma anlatılmıştır** — yok.
- [ ] **Gönderi paylaşma anlatılmıştır** — yok.
- [ ] **Kullanıcı takip etme anlatılmıştır** — yok.
- [ ] **İçerik raporlama anlatılmıştır** — yok.
- [ ] **Admin paneli rehberi vardır** — yok.
- [ ] **Rapor inceleme anlatılmıştır** — yok.
- [ ] **Kullanıcı yönetimi anlatılmıştır** — yok.
- [ ] **Gönderi pasifleştirme anlatılmıştır** — yok.
- [ ] **Ban işlemi anlatılmıştır** — yok.
- [ ] **Yardım bölümü vardır** — uygulama içinde yok.
- [ ] **SSS bölümü vardır** — yok.
- [ ] **Belgeler PDF veya web sayfası olarak sunulur** — yok.

### 5.22 Yasal Gereksinimler — Eksikler
- [ ] **KVKK uyumu açıklanmıştır** — hiçbir belge yok.
- [ ] **GDPR uyumu açıklanmıştır** — yok.
- [ ] **Kullanıcıdan gerekli durumlarda açık rıza alınır** — kayıt formunda onay kutusu yok.
- [ ] **Telif hakkı/yasa dışı içerikler pasif yapılabilir** — teknik olarak mümkün ama politika belgesi yok.
- [ ] **Kullanım şartları kullanıcıya sunulur** — yok.
- [ ] **Gizlilik politikası kullanıcıya sunulur** — yok.
- [ ] **Kullanıcı verilerinin hangi amaçla kullanıldığı açıklanır** — yok.

### 5.23 SRS TBD Kapanış — Eksikler
- [ ] **Hosting sağlayıcısı belirlenmiştir** — Railway ile denendi ama kaldırıldı; mevcut durum belirsiz.
- [ ] **Domain adı belirlenmiştir** — belirsiz.
- [ ] **Şifre politikası belgelenmiştir** — kod'da var (8+, büyük/küçük harf, rakam) ama SRS'ye aktarılmamış.
- [ ] **E-posta kod süresi belgelenmiştir** — kodda 10 dakika, SRS'de güncellenmeli.
- [ ] **Şifre sıfırlama süreci kapsamı** — uygulandı (UUID token, 1 saat), SRS'ye aktarılmalı.
- [ ] **Mobil uygulama desteği kapsamı** — belgelenmemiş (kapsam dışı mı?).
- [ ] **Bildirim sistemi kapsamı** — yok (kapsam dışı mı?).
- [ ] **Yedekleme periyodu belirlenmiştir** — yok.
- [ ] **Log saklama süresi belirlenmiştir** — yok.
- [ ] **Arayüz tema tasarımı belirlenmiştir** — light/dark tema var ama SRS'de yok.
- [ ] **İçerik moderasyon kuralları belirlenmiştir** — rapor nedenleri kodda var ama politika belgesi yok.
- [ ] **Kesinleşen TBD maddeleri SRS'ye aktarılmıştır** — güncellenmemiş.

### 5.24 PPM Kapanış — Eksikler
- [ ] **Gantt çizelgesi günceldir** — proje ilerlediğine göre güncellenmeli.
- [ ] **CPM/PERT 76/78 gün farkı açıklanmıştır** — belgelenmemiş.
- [ ] **Risk tablosu yazılıma uygundur** — yazılım dışı ifade düzeltilmemiş.
- [ ] **Araç tablosundaki maliyetler tamamlanmıştır** — eksik fiyat alanları.
- [ ] **PPM'deki MySQL/PostgreSQL tutarlılığı sağlanmıştır** — PPM'de MySQL geçiyor, kodda PostgreSQL.
- [ ] **Test raporları hazırlanmıştır** — hiç test yok.
- [ ] **Proje sonuç raporu hazırlanmıştır** — yok.
- [ ] **Demo akışı hazırlanmıştır** — planlanmamış.

---

## 🔴 KRİTİK RİSKLER (Acil Dikkat Gerektiren)

| # | Risk | Açıklama |
|---|------|----------|
| 1 | **Ban bypass** | Ban işlemi mevcut JWT access token'ı geçersiz kılmıyor. Ban sonraki 60 dakika boyunca active token çalışmaya devam edebilir. Her request'te `is_banned` kontrolü eklenmeli. |
| 2 | **Admin gönderi gizleme bypass** | Kullanıcı `PATCH /posts/<id>/` ile admin'in gizlediği gönderiyi `is_active=True` yapabilir mi? Backend'de bu kontrol yoksa kritik güvenlik açığı. |
| 3 | **Şifre hasher tutarsızlığı** | SRS bcrypt/Argon2 diyor, kod PBKDF2 kullanıyor. Tutarsızlık belgelenmeli. |
| 4 | **HTTPS/TLS** | Production Django settings'de `SECURE_SSL_REDIRECT`, `HSTS` ayarları yok. |
| 5 | **Test yok** | Hiç unit/integration test dosyası yok. |
| 6 | **Docker kaldırıldı** | SRS/PPM Docker bekliyor ama Dockerfile silinmiş. |
| 7 | **Kullanıcı belgesi yok** | Tüm dokümanlar (kılavuz, SSS, gizlilik politikası, kullanım şartları) yok. |

---

## 📊 Özet İstatistik

| Alan | Toplam Madde | Mevcut | Eksik |
|------|-------------|--------|-------|
| Kullanıcı Kayıt | 19 | 17 | 2 |
| E-Posta Doğrulama | 16 | 16 | 0 |
| Login/Logout | 15 | 13 | 2 |
| Gönderi Sistemi | 19 | 16 | 3 |
| Profil | 10 | 7 | 3 |
| Takip | 15 | 15 | 0 |
| Ana Sayfa | 10 | 7 | 3 |
| Raporlama | 16 | 16 | 0 |
| Admin Panel | 13 | 13 | 0 |
| Pasifleştirme | 12 | 12 | 0 |
| Banlama | 18 | 12 | 6 |
| Admin İstatistik | 15 | 10 | 5 |
| Ekstra Özellik | 11 | 7 | 4 |
| Mimari | 14 | 12 | 2 |
| Veritabanı | 16 | 13 | 3 |
| Güvenlik | 16 | 11 | 5 |
| Gizlilik | 13 | 3 | 10 |
| Performans | 10 | 0 | 10 |
| Kalite | 17 | 2 | 15 |
| Operasyon | 12 | 4 | 8 |
| Kullanıcı Belgeleri | 15 | 0 | 15 |
| Yasal | 8 | 0 | 8 |
| SRS TBD | 15 | 0 | 15 |
| PPM Kapanış | 13 | 0 | 13 |
| **TOPLAM** | **337** | **206** | **131** |

> **Tamamlanma oranı: ~%61**
