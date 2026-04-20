import uuid
from django.db import models
from core.models import TimestampedModel


class TriggerEvent(models.TextChoices):
    """Events that can automatically trigger a templated notification."""
    # Order confirmation — 6 variants (delivery_type × payment_status)
    ORDER_CREATED_PICKUP_PAID       = 'order_created_pickup_paid',    'Order Created (Pickup · Paid)'
    ORDER_CREATED_PICKUP_DEPOSIT    = 'order_created_pickup_deposit', 'Order Created (Pickup · Deposit)'
    ORDER_CREATED_PICKUP_UNPAID     = 'order_created_pickup_unpaid',  'Order Created (Pickup · Unpaid)'
    ORDER_CREATED_DELIVERY_PAID     = 'order_created_delivery_paid',    'Order Created (Delivery · Paid)'
    ORDER_CREATED_DELIVERY_DEPOSIT  = 'order_created_delivery_deposit', 'Order Created (Delivery · Deposit)'
    ORDER_CREATED_DELIVERY_UNPAID   = 'order_created_delivery_unpaid',  'Order Created (Delivery · Unpaid)'
    # Fulfillment
    ORDER_READY_PICKUP   = 'order_ready_pickup',   'Order Ready (Pickup)'
    ORDER_READY_DELIVERY = 'order_ready_delivery', 'Order Ready (Delivery)'
    ORDER_DISPATCHED     = 'order_dispatched',     'Order Dispatched'
    ORDER_DELIVERED      = 'order_delivered',      'Order Delivered'
    # Payment
    PAYMENT_RECEIVED     = 'payment_received',     'Payment Received'
    PAYMENT_REMINDER     = 'payment_reminder',     'Payment Reminder'
    PAYMENT_OVERDUE      = 'payment_overdue',      'Payment Overdue'


class MessageTemplate(TimestampedModel):
    """
    A reusable message template that supports variable placeholders.

    Supported variables:
        {{order_no}}       — Order tracking ID
        {{customer_name}}  — Customer full name
        {{link}}           — Public tracking URL for the order
        {{address}}        — Bakery / pickup address
        {{closing_time}}   — Bakery closing time (static string)
        {{driver_name}}    — Driver's name (if dispatched)
        {{eta_mins}}       — Estimated arrival minutes
        {{amount}}         — Payment amount recorded
        {{balance}}        — Remaining balance on the order
    """
    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name         = models.CharField(max_length=120, unique=True)
    content      = models.TextField(help_text='Use {{variable}} placeholders.')
    is_active    = models.BooleanField(default=True)

    # If is_automated=True this template fires automatically on trigger_event.
    is_automated  = models.BooleanField(default=False)
    trigger_event = models.CharField(
        max_length=40,
        choices=TriggerEvent.choices,
        blank=True,
    )

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class CampaignStatus(models.TextChoices):
    DRAFT     = 'draft',     'Draft'
    SENT      = 'sent',      'Sent'
    SCHEDULED = 'scheduled', 'Scheduled'


class Campaign(TimestampedModel):
    """
    A bulk messaging campaign — manual, one-off sends to a group of customers.
    """
    id              = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name            = models.CharField(max_length=200)
    message_content = models.TextField()
    recipients_count = models.PositiveIntegerField(default=0)
    status          = models.CharField(max_length=15, choices=CampaignStatus.choices, default=CampaignStatus.DRAFT)
    sent_at         = models.DateTimeField(null=True, blank=True)
    scheduled_for   = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} ({self.status})'


class NotificationLog(TimestampedModel):
    """
    Immutable log of every notification dispatched (automated or manual).

    Integrity rule: at least one of `template` or `campaign` must be set so
    that every log entry has a traceable audit source.
    """
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    template   = models.ForeignKey(
        MessageTemplate, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='logs',
    )
    campaign   = models.ForeignKey(
        Campaign, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='logs',
    )
    recipient  = models.CharField(max_length=30, help_text='Phone number or email')
    message    = models.TextField(help_text='Final rendered message (with variables substituted)')
    sent       = models.BooleanField(default=False)
    error      = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']

    def clean(self):
        from django.core.exceptions import ValidationError
        if not self.template_id and not self.campaign_id:
            raise ValidationError(
                'A NotificationLog must be linked to either a MessageTemplate or a Campaign.'
            )

    def __str__(self):
        return f'Log → {self.recipient} ({self.created_at.date()})'
