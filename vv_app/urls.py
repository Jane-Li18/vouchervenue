from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("partners/<slug:slug>/", views.partner_detail, name="partner_detail"),
]