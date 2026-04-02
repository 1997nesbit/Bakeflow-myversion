from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.accounts.views import StaffViewSet

router = DefaultRouter()
router.register(r'staff', StaffViewSet, basename='staff')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/', include('apps.orders.urls')),          # orders, menu, production
    path('api/customers/', include('apps.customers.urls')),
    path('api/', include(router.urls)),                  # staff
    # Phases 4-9: add app URL includes here
]
