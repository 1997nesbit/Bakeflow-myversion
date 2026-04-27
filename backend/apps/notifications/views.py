from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from core.permissions import IsManagerOrFrontDesk

from .models import MessageTemplate, Campaign, CampaignStatus, NotificationLog
from .serializers import (
    MessageTemplateSerializer,
    CampaignSerializer,
    CampaignCreateSerializer,
    NotificationLogSerializer,
)
from .services import NotificationService


class MessageTemplateViewSet(viewsets.ModelViewSet):
    """
    CRUD for message templates.
    Accessible to Managers and Front Desk.
    """
    queryset         = MessageTemplate.objects.all()
    serializer_class = MessageTemplateSerializer
    permission_classes = [IsManagerOrFrontDesk]

    def get_queryset(self):
        qs = super().get_queryset()
        trigger = self.request.query_params.get('trigger_event')
        if trigger:
            qs = qs.filter(trigger_event=trigger)
        is_automated = self.request.query_params.get('is_automated')
        if is_automated is not None:
            qs = qs.filter(is_automated=is_automated.lower() in ('true', '1'))
        return qs


class CampaignViewSet(viewsets.ReadOnlyModelViewSet):
    """
    List and create campaigns.
    Creating triggers an immediate bulk send.
    """
    queryset         = Campaign.objects.all()
    serializer_class = CampaignSerializer
    permission_classes = [IsManagerOrFrontDesk]

    @action(detail=False, methods=['post'], url_path='send')
    def send(self, request):
        serializer = CampaignCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        scheduled_for = data.get('scheduled_for')
        now = timezone.now()

        # C-4: if scheduled_for is a future timestamp, save as 'scheduled' and
        # do NOT dispatch immediately.  Actual deferred execution requires a
        # task queue (Celery) — out of scope; a future TODO.
        is_future_schedule = scheduled_for and scheduled_for > now

        campaign = Campaign.objects.create(
            name=data['name'],
            message_content=data['message_content'],
            recipient_phones=data['recipients'],
            recipients_count=len(data['recipients']),
            status=CampaignStatus.SCHEDULED if is_future_schedule else CampaignStatus.SENT,
            sent_at=None if is_future_schedule else now,
            scheduled_for=scheduled_for,
        )

        if not is_future_schedule:
            NotificationService.dispatch_campaign(
                campaign=campaign,
                recipients=data['recipients'],
                message=data['message_content'],
            )

        return Response(CampaignSerializer(campaign).data, status=status.HTTP_201_CREATED)


class NotificationLogViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only access to dispatch logs (Manager-only)."""
    queryset         = NotificationLog.objects.select_related('template', 'campaign').all()
    serializer_class = NotificationLogSerializer
    permission_classes = [IsManagerOrFrontDesk]
    filterset_fields = ['sent', 'recipient']
    search_fields    = ['recipient', 'message']
