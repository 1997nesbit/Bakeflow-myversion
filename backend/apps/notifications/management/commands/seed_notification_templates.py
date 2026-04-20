"""
Management command: seed_notification_templates
================================================
Creates the default automated message templates.
Safe to run multiple times (idempotent via get_or_create).

Usage:
    py manage.py seed_notification_templates
"""
from django.core.management.base import BaseCommand

from apps.notifications.models import MessageTemplate, TriggerEvent

# ---------------------------------------------------------------------------
# Template definitions
# Each tuple: (name, trigger_event, content)
# ---------------------------------------------------------------------------
TEMPLATES = [
    # -- Order created: pickup --------------------------------------------------
    (
        'Order Confirmed (Pickup · Paid)',
        TriggerEvent.ORDER_CREATED_PICKUP_PAID,
        (
            'Hi {{customer_name}}! 🎂 Your order #{{order_no}} is confirmed and fully paid '
            '(TZS {{total_price}}). Please pick it up on {{pickup_date}} at {{pickup_time}} '
            'from {{address}}. Track your order: {{link}}'
        ),
    ),
    (
        'Order Confirmed (Pickup · Deposit)',
        TriggerEvent.ORDER_CREATED_PICKUP_DEPOSIT,
        (
            'Hi {{customer_name}}! 🎂 Your order #{{order_no}} is confirmed. Deposit received: '
            'TZS {{amount}}. Balance due: TZS {{balance}} — payable before pickup. '
            'Pick up on {{pickup_date}} at {{pickup_time}} from {{address}}. Track: {{link}}'
        ),
    ),
    (
        'Order Confirmed (Pickup · Unpaid)',
        TriggerEvent.ORDER_CREATED_PICKUP_UNPAID,
        (
            'Hi {{customer_name}}! 🎂 Your order #{{order_no}} has been booked. '
            'Total: TZS {{total_price}}. Full payment is due before pickup on '
            '{{pickup_date}} at {{pickup_time}} from {{address}}. Track: {{link}}'
        ),
    ),
    # -- Order created: delivery ------------------------------------------------
    (
        'Order Confirmed (Delivery · Paid)',
        TriggerEvent.ORDER_CREATED_DELIVERY_PAID,
        (
            'Hi {{customer_name}}! 🎂 Your order #{{order_no}} is confirmed and fully paid '
            '(TZS {{total_price}}). We will deliver it to: {{delivery_address}}. '
            'Track your order: {{link}}'
        ),
    ),
    (
        'Order Confirmed (Delivery · Deposit)',
        TriggerEvent.ORDER_CREATED_DELIVERY_DEPOSIT,
        (
            'Hi {{customer_name}}! 🎂 Your order #{{order_no}} is confirmed. Deposit received: '
            'TZS {{amount}}. Balance due: TZS {{balance}} — payable before dispatch. '
            'Delivery to: {{delivery_address}}. Track: {{link}}'
        ),
    ),
    (
        'Order Confirmed (Delivery · Unpaid)',
        TriggerEvent.ORDER_CREATED_DELIVERY_UNPAID,
        (
            'Hi {{customer_name}}! 🎂 Your order #{{order_no}} has been booked for delivery to '
            '{{delivery_address}}. Total: TZS {{total_price}}. Payment is due before dispatch. '
            'Track: {{link}}'
        ),
    ),
    # -- Payment ---------------------------------------------------------------
    (
        'Payment Received',
        TriggerEvent.PAYMENT_RECEIVED,
        (
            'Hi {{customer_name}}, we have received TZS {{amount}} for order #{{order_no}}. '
            'Balance remaining: TZS {{balance}}. Thank you! Track: {{link}}'
        ),
    ),
    (
        'Payment Reminder',
        TriggerEvent.PAYMENT_REMINDER,
        (
            'Hi {{customer_name}}, friendly reminder: your order #{{order_no}} has an '
            'outstanding balance of TZS {{balance}}. Please complete payment before your '
            'pickup/delivery date. Track: {{link}}'
        ),
    ),
    (
        'Payment Overdue',
        TriggerEvent.PAYMENT_OVERDUE,
        (
            'Hi {{customer_name}}, your order #{{order_no}} is overdue for payment '
            '(TZS {{balance}} remaining). Please contact us urgently to avoid cancellation. '
            'Track: {{link}}'
        ),
    ),
    # -- Fulfillment (existing events — kept in sync) --------------------------
    (
        'Order Ready for Pickup',
        TriggerEvent.ORDER_READY_PICKUP,
        (
            'Hi {{customer_name}}! 🎉 Your order #{{order_no}} is ready and waiting for you at '
            '{{address}}. We close at {{closing_time}}. Track: {{link}}'
        ),
    ),
    (
        'Order Ready for Delivery',
        TriggerEvent.ORDER_READY_DELIVERY,
        (
            'Hi {{customer_name}}! 🎉 Your order #{{order_no}} is packed and ready — '
            'a driver will be assigned shortly. Track: {{link}}'
        ),
    ),
    (
        'Order Dispatched',
        TriggerEvent.ORDER_DISPATCHED,
        (
            'Good news! Your order #{{order_no}} is ready and is being prepped for dispatch. '
            'Our driver will head out shortly. '
            'Driver: {{driver_name}} ({{driver_phone}}). '
            'Track the delivery here: {{link}}'
        ),
    ),
    (
        'Order Delivered',
        TriggerEvent.ORDER_DELIVERED,
        (
            'Hi {{customer_name}}, your order #{{order_no}} has been delivered! 🎂 '
            'Thank you for choosing us — we hope you love it!'
        ),
    ),
]


class Command(BaseCommand):
    help = 'Seed default automated notification templates (idempotent).'

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for name, event, content in TEMPLATES:
            obj, created = MessageTemplate.objects.get_or_create(
                name=name,
                defaults={
                    'content':       content,
                    'trigger_event': event,
                    'is_automated':  True,
                    'is_active':     True,
                },
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'  [CREATE] {name}'))
            else:
                # Update content and event if they changed (but don't overwrite is_active
                # in case the user intentionally disabled a template)
                changed = False
                if obj.content != content:
                    obj.content = content
                    changed = True
                if obj.trigger_event != event:
                    obj.trigger_event = event
                    changed = True
                if changed:
                    obj.save(update_fields=['content', 'trigger_event', 'updated_at'])
                    updated_count += 1
                    self.stdout.write(self.style.WARNING(f'  [UPDATE] {name}'))
                else:
                    self.stdout.write(f'  [  OK  ] {name}')

        self.stdout.write(
            self.style.SUCCESS(
                f'\nDone. {created_count} created, {updated_count} updated, '
                f'{len(TEMPLATES) - created_count - updated_count} unchanged.'
            )
        )
