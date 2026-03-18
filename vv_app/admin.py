from django.contrib import admin
from django.utils.html import format_html
from .models import AffiliatePartner, AffiliatePartnerGalleryImage


class AffiliatePartnerGalleryInline(admin.TabularInline):
    model = AffiliatePartnerGalleryImage
    extra = 1
    fields = ("image", "gallery_preview", "description", "sort_order", "is_active")
    readonly_fields = ("gallery_preview",)

    def gallery_preview(self, obj):
        if obj and obj.image:
            return format_html(
                '<img src="{}" style="width:72px;height:72px;object-fit:cover;border-radius:12px;border:1px solid rgba(110,123,133,.25);" />',
                obj.image.url
            )
        return "—"
    gallery_preview.short_description = "Preview"


@admin.register(AffiliatePartner)
class AffiliatePartnerAdmin(admin.ModelAdmin):
    list_display = ("name", "sort_order", "is_active", "image_preview", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("name", "main_description", "short_description", "long_description", "website_url", "landing_page_url")
    list_editable = ("sort_order", "is_active")
    readonly_fields = ("slug", "image_preview_large", "created_at", "updated_at")
    inlines = [AffiliatePartnerGalleryInline]

    fieldsets = (
        ("Partner Details", {
            "fields": ("name", "slug", "logo", "full_logo", "image_preview_large")
        }),
        ("Content", {
            "fields": ("main_description", "short_description", "long_description")
        }),
        ("Links", {
            "fields": ("website_url", "landing_page_url", "cta_label")
        }),
        ("Publishing", {
            "fields": ("sort_order", "is_active")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at")
        }),
    )

    def image_preview(self, obj):
        if obj and obj.image:
            return format_html(
                '<img src="{}" style="width:48px;height:48px;object-fit:cover;border-radius:12px;border:1px solid rgba(110,123,133,.25);" />',
                obj.image.url
            )
        return "—"
    image_preview.short_description = "Preview"

    def image_preview_large(self, obj):
        if obj and obj.image:
            return format_html(
                '<img src="{}" style="max-width:280px;width:100%;height:auto;object-fit:cover;border-radius:18px;border:1px solid rgba(110,123,133,.25);" />',
                obj.image.url
            )
        return "Upload an image to preview it here."
    image_preview_large.short_description = "Image Preview"