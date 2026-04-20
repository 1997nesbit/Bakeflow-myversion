from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import MessageTemplateViewSet, CampaignViewSet, NotificationLogViewSet

router = DefaultRouter()
router.register(r'notifications/templates', MessageTemplateViewSet, basename='notification-template')
router.register(r'notifications/campaigns', CampaignViewSet,        basename='notification-campaign')
router.register(r'notifications/logs',      NotificationLogViewSet, basename='notification-log')

urlpatterns = [
    path('', include(router.urls)),
]
