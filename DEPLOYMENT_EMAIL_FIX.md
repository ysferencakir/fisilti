# Email Gönderme Düzeltmesi - Railway Deployment

## ✅ Yapılacaklar

### 1. Gmail App Password Oluştur
1. https://myaccount.google.com adresine git
2. **Security** (Sol menü) → **App passwords** 
3. Email gönderecek Gmail hesabının şifresi iste
4. **Mail** + **Windows** seç
5. 16 karakterlik şifreyi kopyala (boşluksuz)

### 2. Railway Ortam Değişkenlerini Ayarla
Railway dashboard → Your Project → Variables sekmesi:

```
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=senin-email@gmail.com
EMAIL_HOST_PASSWORD=xxxx-xxxx-xxxx-xxxx
EMAIL_USE_TLS=True
REQUIRE_EMAIL_VERIFICATION=True
```

⚠️ **Önemli:** EMAIL_HOST_PASSWORD boşluk içermemelidir!

### 3. Railway Değişkenleri Kontrol Ekle
`EMAIL_BACKEND`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` boş bırakılmamış olsa kontrol et.

### 4. Deployment
```bash
git add backend/fisilti/settings.py backend/apps/users/emails.py backend/.env.example
git commit -m "feat: fix email delivery with async sending and Gmail SMTP configuration"
git push origin main
```

Railway otomatik deploy edecek.

---

## 🧪 Yerel Test

### Geliştirme Ortamında:

1. `.env` dosyasını güncelle (Gmail App Password ile):
```
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=xxxx-xxxx-xxxx-xxxx
EMAIL_USE_TLS=True
REQUIRE_EMAIL_VERIFICATION=True
```

2. Email test et:
```bash
cd backend
python manage.py test_email your-test@gmail.com --type verification
```

Başarı durumunda: `✅ Email başarıyla gönderildi!`

### Debug Etme

Eğer email gelmezse:
- Django logs'a bak: `tail backend/logs/django.log`
- Gmail'in "Less secure app access" ayarını kontrol et (Gmail 2-step verification varsa)
- Gmail'de "App passwords" kesin oluşturulmuş mu kontrol et
- `EMAIL_HOST_PASSWORD` boşluk içermiyor mu kontrol et

---

## 📊 Email Akışı Nasıl Çalışıyor?

```
1. User → Register endpoint
    ↓
2. EmailVerification object oluştur
    ↓
3. send_verification_email() → Background thread'de çalıştır
    ↓
4. Gmail SMTP'ye bağlan
    ↓
5. Email gönder
    ↓
6. Response dön (email gönderilmediyse bile hata vermez - user friendly)
```

**Avantajı:** Request timeout olmaz, user sayfayı kapatırsa bile email gönderilmeye devam eder.

---

## 🔧 Gmail SMTP Sorunları

### "Invalid credentials" hatası
- Gmail App Password doğru mu?
- Boşluk var mı?
- 16 karakter mi?

### "SMTP connection refused"
- Firewall engel mi (Railway çoğu durumda sorun değil)
- EMAIL_PORT 587 mi?
- EMAIL_USE_TLS=True mi?

### "Authentication failed"
- 2-step verification var mı?
- App Password'ü Google'dan aldın mı (sıradan şifre değil)?

---

## 📧 Production Logs Kontrol

Railway dashboard'ta:
- Deployments → Logs
- Son deployment'ın logs'unu aç
- `[MAIL_SENT]` veya `[MAIL_ERROR]` log entry'lerini ara
