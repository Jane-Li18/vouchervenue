from django.db import models
from django.utils.text import slugify


class AffiliatePartner(models.Model):
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, unique=True, blank=True)
    image = models.ImageField(upload_to="affiliate_partners/")
    description = models.CharField(max_length=220)
    perks = models.TextField(help_text="One perk per line")
    cta_label = models.CharField(max_length=40, default="View Partner")
    cta_url = models.URLField(blank=True)
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

    @property
    def perk_list(self):
        return [line.strip() for line in self.perks.splitlines() if line.strip()]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)[:120]
            slug = base_slug
            counter = 2

            while AffiliatePartner.objects.exclude(pk=self.pk).filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = slug

        super().save(*args, **kwargs)