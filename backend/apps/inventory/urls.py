from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InventoryViewSet, SupplierViewSet

router = DefaultRouter()
router.register(r'inventory', InventoryViewSet, basename='inventory')
router.register(r'suppliers', SupplierViewSet,  basename='supplier')

urlpatterns = [
    path('', include(router.urls)),
]
