from io import BytesIO
from pathlib import Path
import uuid

from PIL import Image, ImageOps
from django.core.files.base import ContentFile
from django.db import models
from django.urls import reverse
from django.utils.text import slugify


def generate_unique_slug(model_class, value, pk=None, max_length=140):
    base_slug = slugify(value)[:max_length] or "partner"
    slug = base_slug
    counter = 2

    while model_class.objects.exclude(pk=pk).filter(slug=slug).exists():
        suffix = f"-{counter}"
        slug = f"{base_slug[:max_length - len(suffix)]}{suffix}"
        counter += 1

    return slug


def build_partner_upload_path(partner_name_or_slug, folder, filename):
    partner_key = slugify(partner_name_or_slug) or "partner"
    file_stem = slugify(Path(filename).stem) or "image"
    unique_name = f"{file_stem}-{uuid.uuid4().hex[:8]}.webp"
    return f"partner/{partner_key}/{folder}/{unique_name}"


def partner_logo_upload_to(instance, filename):
    partner_key = instance.slug or instance.name
    return build_partner_upload_path(partner_key, "image", filename)


def partner_full_logo_upload_to(instance, filename):
    partner_key = instance.slug or instance.name
    return build_partner_upload_path(partner_key, "full-logo", filename)


def partner_gallery_upload_to(instance, filename):
    partner_key = instance.partner.slug or instance.partner.name
    return build_partner_upload_path(partner_key, "gallery", filename)


def convert_uploaded_image_to_webp(uploaded_file):
    uploaded_file.open()
    image = Image.open(uploaded_file)
    image = ImageOps.exif_transpose(image)

    has_alpha = image.mode in ("RGBA", "LA") or (
        image.mode == "P" and "transparency" in image.info
    )

    image = image.convert("RGBA" if has_alpha else "RGB")

    output = BytesIO()
    save_kwargs = {
        "format": "WEBP",
        "quality": 88,
        "method": 6,
    }

    if has_alpha:
        save_kwargs["lossless"] = True

    image.save(output, **save_kwargs)
    output.seek(0)

    file_stem = slugify(Path(uploaded_file.name).stem) or "image"
    return ContentFile(output.read(), name=f"{file_stem}.webp")


class AffiliatePartner(models.Model):
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, unique=True, blank=True)

    logo = models.ImageField(
        upload_to=partner_logo_upload_to,
        help_text="Required. Main partner image/logo.",
    )
    full_logo = models.ImageField(
        upload_to=partner_full_logo_upload_to,
        blank=True,
        null=True,
        help_text="Optional but recommended. Wider version.",
    )

    main_description = models.TextField()
    short_description = models.CharField(max_length=220, blank=True)
    long_description = models.TextField(blank=True)

    website_url = models.URLField(
        help_text="Required external website URL for the homepage CTA."
    )
    landing_page_url = models.URLField(
        blank=True,
        help_text="Optional landing page URL shown on the partner detail page."
    )

    cta_label = models.CharField(max_length=40, default="View Partner")
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "name"]
        verbose_name = "Affiliate Partner"
        verbose_name_plural = "Affiliate Partners"

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("partner_detail", kwargs={"slug": self.slug})

    @property
    def image(self):
        return self.full_logo or self.logo

    @property
    def description(self):
        return self.short_description or self.main_description

    @property
    def perk_list(self):
        return []

    @property
    def cta_url(self):
        """
        Backward compatibility for your unchanged homepage partners.html
        """
        return self.website_url

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(AffiliatePartner, self.name, self.pk)

        if self.logo and not self.logo._committed:
            self.logo = convert_uploaded_image_to_webp(self.logo)

        if self.full_logo and not self.full_logo._committed:
            self.full_logo = convert_uploaded_image_to_webp(self.full_logo)

        super().save(*args, **kwargs)


class AffiliatePartnerGalleryImage(models.Model):
    partner = models.ForeignKey(
        AffiliatePartner,
        on_delete=models.CASCADE,
        related_name="gallery_images",
    )
    image = models.ImageField(upload_to=partner_gallery_upload_to)
    description = models.CharField(max_length=255, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return f"{self.partner.name} - Gallery Image {self.pk or ''}".strip()

    def save(self, *args, **kwargs):
        if self.image and not self.image._committed:
            self.image = convert_uploaded_image_to_webp(self.image)
        super().save(*args, **kwargs)