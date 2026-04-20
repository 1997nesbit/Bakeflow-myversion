from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from apps.accounts.views import StaffViewSet

router = DefaultRouter()
router.register(r'staff', StaffViewSet, basename='staff')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/', include('apps.orders.urls')),           # orders, menu, production
    path('api/customers/', include('apps.customers.urls')),
    path('api/', include(router.urls)),                   # staff
    path('api/', include('apps.inventory.urls')),         # Phase 4: inventory, suppliers
    path('api/', include('apps.finance.urls')),           # Phase 5: financial transactions
    path('api/', include('apps.notifications.urls')),     # Phase 6: templates, campaigns, logs
]

# Serve uploaded media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
