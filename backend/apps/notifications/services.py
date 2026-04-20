"""
NotificationService
===================
Handles variable substitution and dispatching of messages.

Currently dispatching routes to Briq.tz when BRIQ_API_KEY is set, otherwise
falls back to a console stub for development.

Bulk campaign sends run in a background thread to avoid blocking the
request/response cycle (pragmatic fix while Celery is not in scope).
"""
import logging
import re
import threading
from django.conf import settings

logger = logging.getLogger(__name__)


class NotificationService:

    # ------------------------------------------------------------------
    # Context builder
    # ------------------------------------------------------------------
    @staticmethod
    def _build_context(order, extra_context: dict | None = None) -> dict:
        """
        Build a variable context dict from an Order instance.

        `extra_context` overrides specific keys — used by payment events to
        inject the exact amount just recorded rather than the cumulative total.
        """
        frontend_base = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        tracking_link = f'{frontend_base}/track?id={order.tracking_id}'

        # C-2 / m-2: guard against negative balance (overpayment edge case)
        raw_balance = float(order.total_price) - float(order.amount_paid)
        balance = max(0.0, raw_balance)

        driver_name  = ''
        driver_phone = ''
        if order.driver:
            driver_name  = order.driver.name or order.driver.email
            driver_phone = order.driver.phone or ''

        # Format pickup date/time nicely
        pickup_date = ''
        pickup_time = ''
        if order.pickup_date:
            pickup_date = order.pickup_date.strftime('%A, %d %B %Y')
        if order.pickup_time:
            pickup_time = order.pickup_time.strftime('%I:%M %p')

        delivery_address = getattr(order, 'delivery_address', '') or ''

        # m-3: use the actual estimated_minutes from the order instead of a hardcoded '30'
        eta_mins = str(getattr(order, 'estimated_minutes', 30) or 30)

        context = {
            'order_no':         order.tracking_id,
            'customer_name':    order.customer.name,
            'link':             tracking_link,
            'address':          getattr(settings, 'BAKERY_ADDRESS', 'our bakery'),
            'closing_time':     getattr(settings, 'BAKERY_CLOSING_TIME', '7:00 PM'),
            'driver_name':      driver_name,
            'driver_phone':     driver_phone,
            'eta_mins':         eta_mins,
            'amount':           f'{float(order.amount_paid):,.0f}',
            'balance':          f'{balance:,.0f}',
            'total_price':      f'{float(order.total_price):,.0f}',
            'pickup_date':      pickup_date,
            'pickup_time':      pickup_time,
            'delivery_type':    order.delivery_type,
            'delivery_address': delivery_address,
        }
        if extra_context:
            context.update(extra_context)
        return context

    @staticmethod
    def _render(template_content: str, context: dict) -> str:
        """
        Replace {{variable}} placeholders with resolved values.

        M-6: After substitution, scan for any remaining {{...}} tokens and
        log a warning — this catches typos and missing context keys early.
        The unresolved tokens are stripped from the final output so the
        customer never receives raw template syntax.
        """
        message = template_content
        for key, value in context.items():
            message = message.replace('{{' + key + '}}', str(value))

        # Find any placeholders that weren't resolved
        unresolved = re.findall(r'\{\{[^}]+\}\}', message)
        if unresolved:
            logger.warning(
                '[NOTIFY] Unresolved template variables: %s — stripping from output.',
                unresolved,
            )
            # Strip them rather than forwarding raw syntax to the customer
            message = re.sub(r'\{\{[^}]+\}\}', '', message)

        return message

    @staticmethod
    def _send_via_gateway(recipient: str, message: str):
        """
        Send the message to the recipient via Briq.tz if BRIQ_API_KEY is configured,
        otherwise fall back to printing to the console (safe for development).

        To go live:
          1. Set BRIQ_API_KEY=<your key> in backend/.env
          2. Set BRIQ_SENDER_ID=<your sender name> in backend/.env  (default: BakeflowTZ)
          3. Restart the Django server — no code changes needed.
        """
        api_key   = getattr(settings, 'BRIQ_API_KEY',   '')
        sender_id = getattr(settings, 'BRIQ_SENDER_ID', 'BakeflowTZ')

        if api_key:
            import requests  # lazy import — only needed when gateway is active

            # Briq.tz requires phone numbers without the leading '+' (e.g. 255712345678)
            clean_recipient = recipient.lstrip('+')

            response = requests.post(
                'https://karibu.briq.tz/v1/message/send-instant',
                headers={
                    'X-API-Key':    api_key,
                    'Content-Type': 'application/json',
                },
                json={
                    'sender_id':  sender_id,
                    'recipients': [clean_recipient],
                    'content':    message,
                },
                timeout=10,
            )
            response.raise_for_status()
            logger.info('[NOTIFY] Briq.tz %s → %s', response.status_code, clean_recipient)
        else:
            # Dev stub — prints to Django terminal
            logger.info('[NOTIFY] (stub) → %s: %s', recipient, message)
            print(f'[NOTIFY] → {recipient}: {message}')

    # ------------------------------------------------------------------
    # Trigger-event helpers
    # ------------------------------------------------------------------
    @staticmethod
    def get_order_created_event(order) -> str:
        """Return the correct TriggerEvent value for a freshly created order."""
        from apps.notifications.models import TriggerEvent

        delivery = getattr(order, 'delivery_type', 'pickup') or 'pickup'
        payment  = getattr(order, 'payment_status', 'unpaid') or 'unpaid'

        mapping = {
            ('pickup',   'paid'):    TriggerEvent.ORDER_CREATED_PICKUP_PAID,
            ('pickup',   'deposit'): TriggerEvent.ORDER_CREATED_PICKUP_DEPOSIT,
            ('pickup',   'unpaid'):  TriggerEvent.ORDER_CREATED_PICKUP_UNPAID,
            ('delivery', 'paid'):    TriggerEvent.ORDER_CREATED_DELIVERY_PAID,
            ('delivery', 'deposit'): TriggerEvent.ORDER_CREATED_DELIVERY_DEPOSIT,
            ('delivery', 'unpaid'):  TriggerEvent.ORDER_CREATED_DELIVERY_UNPAID,
        }
        return mapping.get((delivery, payment), TriggerEvent.ORDER_CREATED_PICKUP_UNPAID)

    # ------------------------------------------------------------------
    # Dispatch methods
    # ------------------------------------------------------------------
    @classmethod
    def dispatch_for_order(cls, order, trigger_event: str, extra_context: dict | None = None):
        """
        Find the active automated template for `trigger_event`, render it, and send.
        Creates a NotificationLog entry regardless of success/failure.
        Never raises — gateway failures are logged but do not propagate.

        C-1: Skips silently (with a warning) if the customer has no phone number.
        extra_context: optional key overrides merged into the template context
                       (e.g. pass {'amount': '5,000'} for PAYMENT_RECEIVED so that
                       {{amount}} shows the actual payment, not the cumulative total).
        """
        from apps.notifications.models import MessageTemplate, NotificationLog

        # C-1: guard against blank phone — never attempt to send to nobody
        recipient = (order.customer.phone or '').strip()
        if not recipient:
            logger.warning(
                '[NOTIFY] Skipping event %s for order %s — customer has no phone number.',
                trigger_event, order.tracking_id,
            )
            return

        template = MessageTemplate.objects.filter(
            is_automated=True,
            trigger_event=trigger_event,
            is_active=True,
        ).first()

        if not template:
            logger.debug('[NOTIFY] No active template for event: %s', trigger_event)
            return

        context = cls._build_context(order, extra_context)
        message = cls._render(template.content, context)

        error = ''
        sent  = False
        try:
            cls._send_via_gateway(recipient, message)
            sent = True
        except Exception as exc:
            error = str(exc)
            logger.error('[NOTIFY] Failed to send for event %s: %s', trigger_event, exc)

        NotificationLog.objects.create(
            template=template,
            recipient=recipient,
            message=message,
            sent=sent,
            error=error,
        )

    @classmethod
    def dispatch_campaign(cls, campaign, recipients: list[str], message: str):
        """
        Send a manual campaign message to a list of phone numbers.

        C-1: Skips blank/empty phone entries.
        C-2: Bulk sends run in a background daemon thread so the HTTP
             request that triggered the campaign is not blocked.
        """
        def _run():
            from apps.notifications.models import NotificationLog

            for recipient in recipients:
                # C-1: skip blank phone numbers
                clean = (recipient or '').strip()
                if not clean:
                    logger.warning('[NOTIFY] Campaign %s — skipping blank recipient.', campaign.id)
                    continue

                error = ''
                sent  = False
                try:
                    cls._send_via_gateway(clean, message)
                    sent = True
                except Exception as exc:
                    error = str(exc)
                    logger.error(
                        '[NOTIFY] Campaign %s failed for %s: %s', campaign.id, clean, exc
                    )

                NotificationLog.objects.create(
                    campaign=campaign,
                    recipient=clean,
                    message=message,
                    sent=sent,
                    error=error,
                )

        t = threading.Thread(target=_run, daemon=True)
        t.start()
