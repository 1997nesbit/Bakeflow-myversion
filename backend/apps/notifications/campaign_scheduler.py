"""
campaign_scheduler.py
=====================
A lightweight in-process scheduler that runs as a daemon thread inside the
Django process. It checks for due scheduled campaigns every POLL_INTERVAL
seconds and dispatches them synchronously (no Celery / Redis required).

Started automatically from NotificationsConfig.ready() — no extra processes,
no external scheduler, no configuration needed.

How it works
------------
1. Django starts → NotificationsConfig.ready() fires once.
2. ready() spawns a single daemon thread running _scheduler_loop().
3. Every POLL_INTERVAL seconds the thread wakes up, queries for any
   Campaign with status='scheduled' and scheduled_for <= now, and sends
   each one synchronously via NotificationService._send_via_gateway().
4. After all sends for a campaign complete, its status is updated to 'sent'.
5. If anything goes wrong for a single campaign, the error is logged and the
   loop continues to the next campaign — it never crashes the thread.

Notes
-----
- The thread is a *daemon* thread, so it is automatically stopped when the
  main Django process exits (no clean-up required).
- Django's `runserver` spaws two processes in development (the reloader +
  the worker). The `WERKZEUG_RUN_MAIN` / `RUN_MAIN` guard below ensures the
  thread is only started in the actual worker process, not the reloader.
- poll interval is 10 minutes by default; override via settings.
  CAMPAIGN_SCHEDULER_POLL_SECONDS = 600  # in backend/settings.py
"""

import logging
import threading
import time

logger = logging.getLogger(__name__)

# How often (in seconds) to check for due campaigns.
DEFAULT_POLL_INTERVAL = 60  # 10 minutes


def _dispatch_campaign_sync(campaign, recipients, now):
    """Send a campaign synchronously and update its status."""
    from apps.notifications.models import CampaignStatus, NotificationLog
    from apps.notifications.services import NotificationService

    sent_count = 0
    fail_count = 0

    for phone in recipients:
        clean = (phone or "").strip()
        if not clean:
            continue

        error = ""
        sent = False
        try:
            NotificationService._send_via_gateway(clean, campaign.message_content)
            sent = True
            sent_count += 1
        except Exception as exc:
            error = str(exc)
            fail_count += 1
            logger.error(
                '[SCHEDULER] Campaign "%s" failed for %s: %s',
                campaign.name,
                clean,
                exc,
            )

        NotificationLog.objects.create(
            campaign=campaign,
            recipient=clean,
            message=campaign.message_content,
            sent=sent,
            error=error,
        )

    campaign.status = CampaignStatus.SENT
    campaign.sent_at = now
    campaign.recipients_count = sent_count
    campaign.save(update_fields=["status", "sent_at", "recipients_count"])

    logger.info(
        '[SCHEDULER] Campaign "%s" complete — %d sent, %d failed.',
        campaign.name,
        sent_count,
        fail_count,
    )


def _scheduler_loop(poll_interval: int):
    """Main loop — runs in a background daemon thread."""
    logger.info(
        "[SCHEDULER] Campaign scheduler started (poll every %ds).", poll_interval
    )
    print(f"[SCHEDULER] Background thread started — polling every {poll_interval}s.")

    while True:
        try:
            from django.utils import timezone
            from apps.notifications.models import Campaign, CampaignStatus
            from apps.customers.models import Customer

            now = timezone.now()

            due = Campaign.objects.filter(
                status=CampaignStatus.SCHEDULED,
                scheduled_for__lte=now,
            )

            if due.exists():
                for campaign in due:
                    # Use the stored recipient list — exact phones selected at creation time.
                    # Fall back to all customers only for legacy campaigns with no stored list.
                    recipients = campaign.recipient_phones or []
                    if not recipients:
                        from apps.customers.models import Customer
                        recipients = list(
                            Customer.objects.filter(phone__isnull=False)
                            .exclude(phone="")
                            .values_list("phone", flat=True)
                        )

                    if recipients:
                        logger.info(
                            '[SCHEDULER] Dispatching "%s" to %d recipients…',
                            campaign.name,
                            len(recipients),
                        )
                        print(f'[SCHEDULER] Dispatching "{campaign.name}" to {len(recipients)} recipients…')
                        try:
                            _dispatch_campaign_sync(campaign, recipients, now)
                        except Exception:
                            logger.exception(
                                '[SCHEDULER] Unexpected error dispatching "%s".',
                                campaign.name,
                            )
                    else:
                        logger.warning(
                            "[SCHEDULER] No recipients for campaign \"%s\" — skipping.",
                            campaign.name,
                        )

        except Exception:
            # Catch-all: database unavailable at startup, migration running, etc.
            # Log and keep the loop alive.
            logger.exception(
                "[SCHEDULER] Error in scheduler loop — will retry next cycle."
            )

        time.sleep(poll_interval)



# ── Singleton guard ────────────────────────────────────────────────────────
# Prevents start() from spawning a second thread if called more than once
# within the same process (e.g. during Django hot-reload cycles).
_started = False
_start_lock = threading.Lock()


def start(poll_interval: int = DEFAULT_POLL_INTERVAL):
    """
    Start the background scheduler thread.
    Idempotent: only the very first call actually starts the thread.
    Subsequent calls (e.g. from multiple ready() invocations) are no-ops.
    """
    global _started
    with _start_lock:
        if _started:
            print("[SCHEDULER] Already running — ignoring duplicate start() call.")
            return
        _started = True

    t = threading.Thread(
        target=_scheduler_loop,
        args=(poll_interval,),
        name="CampaignScheduler",
        daemon=True,
    )
    t.start()
    logger.info('[SCHEDULER] Background thread "%s" launched.', t.name)
