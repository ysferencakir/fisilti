from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        "id",
        "email",
        "username",
        "role",
        "is_email_verified",
        "is_banned",
        "banned_until",
        "is_active",
        "is_staff",
        "is_superuser",
    )

    list_filter = (
        "role",
        "is_email_verified",
        "is_banned",
        "is_active",
        "is_staff",
        "is_superuser",
    )

    search_fields = (
        "email",
        "username",
        "ad_soyad",
    )

    ordering = ("id",)

    fieldsets = BaseUserAdmin.fieldsets + (
        (
            "Fısıltı kullanıcı alanları",
            {
                "fields": (
                    "role",
                    "is_email_verified",
                    "is_banned",
                    "banned_until",
                    "country",
                    "ad_soyad",
                )
            },
        ),
    )
