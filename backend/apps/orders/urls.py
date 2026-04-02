from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MenuViewSet, OrderViewSet, ProductionViewSet

router = DefaultRouter()
router.register(r'orders',               OrderViewSet,     basename='order')
router.register(r'menu',                 MenuViewSet,      basename='menu')
router.register(r'production/batches',   ProductionViewSet, basename='production-batch')

urlpatterns = [
    path('', include(router.urls)),
]
