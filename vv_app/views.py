from django.shortcuts import render
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