from django.contrib import admin
from django.utils.html import format_html
from .models import AffiliatePartner


@admin.register(AffiliatePartner)
class AffiliatePartnerAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "sort_order",
        "is_active",
        "image_preview",
        "updated_at",
    )
    list_filter = ("is_active",)
    search_fields = ("name", "description", "perks")
    list_editable = ("sort_order", "is_active")
    readonly_fields = ("slug", "image_preview_large", "created_at", "updated_at")

    fieldsets = (
        ("Partner Details", {
            "fields": ("name", "slug", "image", "image_preview_large", "description")
        }),
        ("Content", {
            "fields": ("perks",)
        }),
        ("CTA", {
            "fields": ("cta_label", "cta_url")
        }),
        ("Publishing", {
            "fields": ("sort_order", "is_active")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at")
        }),
    )

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width:48px;height:48px;object-fit:cover;border-radius:12px;border:1px solid rgba(110,123,133,.25);" />',
                obj.image.url
            )
        return "—"
    image_preview.short_description = "Preview"

    def image_preview_large(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-width:280px;width:100%;height:auto;object-fit:cover;border-radius:18px;border:1px solid rgba(110,123,133,.25);" />',
                obj.image.url
            )
        return "Upload an image to preview it here."
    image_preview_large.short_description = "Image Preview"