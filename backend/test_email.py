#!/usr/bin/env python
"""Test email configuration"""
import os
import sys
import django
from pathlib import Path

# Setup Django
sys.path.insert(0, str(Path(__file__).parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fisilti.settings')
django.setup()

from django.conf import settings
from django.core.mail import EmailMultiAlternatives

print("=" * 60)
print("EMAIL CONFIGURATION TEST")
print("=" * 60)
print(f"EMAIL_BACKEND:        {settings.EMAIL_BACKEND}")
print(f"EMAIL_HOST:           {settings.EMAIL_HOST}")
print(f"EMAIL_PORT:           {settings.EMAIL_PORT}")
print(f"EMAIL_USE_TLS:        {settings.EMAIL_USE_TLS}")
print(f"EMAIL_HOST_USER:      {settings.EMAIL_HOST_USER}")
print(f"DEFAULT_FROM_EMAIL:   {settings.DEFAULT_FROM_EMAIL}")
print("=" * 60)

# Validate DEFAULT_FROM_EMAIL
if "your-email" in settings.DEFAULT_FROM_EMAIL.lower():
    print("❌ ERROR: DEFAULT_FROM_EMAIL is still a placeholder!")
    print(f"   Current: {settings.DEFAULT_FROM_EMAIL}")
    print(f"   Should be: Fisilti <ysferencakir@gmail.com>")
    sys.exit(1)

# Try sending a test email
print("\nAttempting to send test email...")
try:
    msg = EmailMultiAlternatives(
        subject="Fisilti — Email Test",
        body="This is a test email.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=["ysferencakir@gmail.com"],
    )
    msg.send()
    print("✅ Email sent successfully!")
except Exception as e:
    print(f"❌ Email sending failed: {e}")
    print("\nPossible issues:")
    print("1. EMAIL_HOST_PASSWORD is not a valid Gmail app password")
    print("2. EMAIL_HOST_USER is not correct")
    print("3. Gmail account has 2FA but no app password generated")
    sys.exit(1)
