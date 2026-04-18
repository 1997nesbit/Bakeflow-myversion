from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FinancialTransactionViewSet

router = DefaultRouter()
router.register(r'transactions', FinancialTransactionViewSet, basename='transactions')

urlpatterns = [
    path('', include(router.urls)),
]
