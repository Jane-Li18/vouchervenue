from django.shortcuts import get_object_or_404, render
from .models import AffiliatePartner


def home(request):
    partners = list(
        AffiliatePartner.objects.filter(is_active=True).order_by("sort_order", "name")
    )

    context = {
        "featured_partner": partners[0] if partners else None,
        "other_partners": partners[1:] if len(partners) > 1 else [],
    }

    return render(request, "home.html", context)


def partner_detail(request, slug):
    partner = get_object_or_404(
        AffiliatePartner.objects.prefetch_related("gallery_images"),
        slug=slug,
        is_active=True,
    )

    gallery_images = partner.gallery_images.filter(is_active=True).order_by("sort_order", "id")

    context = {
        "partner": partner,
        "gallery_images": gallery_images,
    }

    return render(request, "partners/partner_detail.html", context)