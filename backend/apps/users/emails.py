"""
E-posta gönderim yardımcısı — Gmail SMTP + HTML şablon
"""
import logging
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from threading import Thread

logger = logging.getLogger(__name__)


def _base_html(title: str, body: str) -> str:
    return f"""
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
</head>
<body style="margin:0;padding:0;background:#FFF7ED;font-family:'Segoe UI',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF7ED;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:16px;border:1px solid #FDE8D0;overflow:hidden;">
          <tr>
            <td style="background:#F97316;padding:24px 32px;">
              <span style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                🦊 Fısıltı
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              {body}
              <hr style="border:none;border-top:1px solid #FDE8D0;margin:28px 0;" />
              <p style="margin:0;font-size:12px;color:#9CA3AF;line-height:1.6;">
                Bu e-posta otomatik olarak gönderilmiştir, lütfen yanıtlamayın.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


def _send_sync(to: str, subject: str, text: str, html: str) -> bool:
    """Send email synchronously (called in background thread)"""
    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[to],
        )
        msg.attach_alternative(html, "text/html")
        msg.send(fail_silently=False)
        logger.info(f"[MAIL_SENT] to={to} subject={subject!r}")
        return True
    except Exception as e:
        logger.error(f"[MAIL_ERROR] to={to} subject={subject!r}: {e}")
        return False


def _send(to: str, subject: str, text: str, html: str) -> bool:
    """Send email in background thread to avoid blocking request"""
    try:
        # Try to send in background to avoid timeout
        thread = Thread(
            target=_send_sync,
            args=(to, subject, text, html),
            daemon=True
        )
        thread.start()
        return True
    except Exception as e:
        logger.error(f"[MAIL_THREAD_ERROR] to={to}: {e}")
        # Fallback: send synchronously
        return _send_sync(to, subject, text, html)


def send_verification_email(email: str, code: str) -> bool:
    body = f"""
      <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#1C1917;">
        E-posta adresinizi doğrulayın
      </h2>
      <p style="margin:0 0 24px;color:#78716C;font-size:15px;line-height:1.6;">
        Fısıltı'ya hoş geldiniz! Hesabınızı aktifleştirmek için aşağıdaki kodu girin.
      </p>
      <div style="background:#FFF7ED;border:2px solid #F97316;border-radius:12px;
                  padding:20px;text-align:center;margin-bottom:24px;">
        <span style="font-size:36px;font-weight:800;color:#F97316;letter-spacing:8px;">
          {code}
        </span>
      </div>
      <p style="margin:0;color:#9CA3AF;font-size:13px;">
        ⏱ Bu kod <strong>10 dakika</strong> geçerlidir.
      </p>
    """
    text = f"Fısıltı doğrulama kodunuz: {code}\n\n(Bu kod 10 dakika geçerlidir.)"
    html = _base_html("E-posta Doğrulama", body)
    return _send(email, "Fısıltı — E-posta Doğrulama Kodunuz", text, html)


def send_password_reset_email(email: str, reset_url: str) -> bool:
    body = f"""
      <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#1C1917;">
        Şifrenizi sıfırlayın
      </h2>
      <p style="margin:0 0 24px;color:#78716C;font-size:15px;line-height:1.6;">
        Şifre sıfırlama isteği aldık. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyin.
      </p>
      <div style="text-align:center;margin-bottom:24px;">
        <a href="{reset_url}"
           style="display:inline-block;background:#F97316;color:#ffffff;font-weight:700;
                  font-size:15px;padding:14px 32px;border-radius:9999px;text-decoration:none;">
          Şifremi Sıfırla
        </a>
      </div>
      <p style="margin:0 0 8px;color:#9CA3AF;font-size:13px;">
        Buton çalışmıyorsa bu bağlantıyı tarayıcınıza yapıştırın:
      </p>
      <p style="margin:0;word-break:break-all;">
        <a href="{reset_url}" style="color:#F97316;font-size:13px;">{reset_url}</a>
      </p>
      <p style="margin:16px 0 0;color:#9CA3AF;font-size:13px;">
        ⏱ Bu bağlantı <strong>1 saat</strong> geçerlidir.
        Eğer bu isteği siz yapmadıysanız görmezden gelin.
      </p>
    """
    text = f"Şifre sıfırlama bağlantınız: {reset_url}\n\n(1 saat geçerlidir.)"
    html = _base_html("Şifre Sıfırlama", body)
    return _send(email, "Fısıltı — Şifre Sıfırlama", text, html)
