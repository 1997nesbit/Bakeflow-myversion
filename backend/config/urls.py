from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/', include('apps.orders.urls')),   # Phase 2: orders, menu, production
    # Phases 3-9: add app URL includes here
]
