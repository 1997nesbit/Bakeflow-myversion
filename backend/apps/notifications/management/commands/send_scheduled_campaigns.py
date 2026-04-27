"""
Management command: send_scheduled_campaigns
=============================================
Finds any Campaign with status='scheduled' whose scheduled_for timestamp
is now in the past, and dispatches it to all customers who have a phone number.

Usage:
    py manage.py send_scheduled_campaigns

Scheduling (run this repeatedly to check for due campaigns):
  - Windows Task Scheduler: point at this command, run every 5–15 minutes.
  - Linux cron:  */10 * * * * /path/to/venv/bin/python manage.py send_scheduled_campaigns

Design note:
    The Campaign model only stores a recipients_count, not the actual phone
    list. So this command sends to all Customer records that have a phone
    number at execution time — consistent with how the front-desk UI behaves
    when it selects 'all customers'.

    Unlike NotificationService.dispatch_campaign (which uses a daemon background
    thread designed for web-request context), this command sends SYNCHRONOUSLY
    so messages are fully delivered before the process exits.
"""
import logging
from django.core.management.base import BaseCommand
from django.utils import timezone

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Dispatch campaigns whose scheduled_for time has passed.'

    def handle(self, *args, **options):
        from apps.notifications.models import Campaign, CampaignStatus, NotificationLog
        from apps.notifications.services import NotificationService
        from apps.customers.models import Customer

        now = timezone.now()

        due_campaigns = Campaign.objects.filter(
            status=CampaignStatus.SCHEDULED,
            scheduled_for__lte=now,
        )

        if not due_campaigns.exists():
            self.stdout.write('No scheduled campaigns are due.')
            return

        # Fetch all customers that currently have a phone number
        recipients = list(
            Customer.objects.filter(phone__isnull=False)
            .exclude(phone='')
            .values_list('phone', flat=True)
        )

        if not recipients:
            self.stdout.write(self.style.WARNING(
                'No customers with phone numbers found — nothing to send.'
            ))
            return

        for campaign in due_campaigns:
            self.stdout.write(
                f'Dispatching "{campaign.name}" to {len(recipients)} recipients...'
            )
            sent_count = 0
            fail_count = 0

            # ── Send SYNCHRONOUSLY (daemon threads exit before completion) ──
            for phone in recipients:
                clean = (phone or '').strip()
                if not clean:
                    continue

                error = ''
                sent  = False
                try:
                    NotificationService._send_via_gateway(clean, campaign.message_content)
                    sent = True
                    sent_count += 1
                except Exception as exc:
                    error = str(exc)
                    fail_count += 1
                    logger.error(
                        '[SCHEDULED] Campaign "%s" failed for %s: %s',
                        campaign.name, clean, exc,
                    )

                NotificationLog.objects.create(
                    campaign=campaign,
                    recipient=clean,
                    message=campaign.message_content,
                    sent=sent,
                    error=error,
                )

            # Only mark SENT after the loop fully completes
            campaign.status = CampaignStatus.SENT
            campaign.sent_at = now
            campaign.recipients_count = sent_count
            campaign.save(update_fields=['status', 'sent_at', 'recipients_count'])

            self.stdout.write(self.style.SUCCESS(
                f'  ✓ "{campaign.name}": {sent_count} sent, {fail_count} failed.'
            ))
            logger.info(
                '[SCHEDULED] Campaign "%s" complete — %d sent, %d failed.',
                campaign.name, sent_count, fail_count,
            )

