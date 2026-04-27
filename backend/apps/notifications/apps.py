import os
from django.apps import AppConfig


class NotificationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.notifications'
    verbose_name = 'Notifications'

    def ready(self):
        """
        Start the in-process campaign scheduler as a daemon thread.

        The RUN_MAIN guard prevents the thread from launching in the
        Django reloader's parent process — without this, runserver would
        start two threads (one per process) and each campaign would be
        dispatched twice.
        """
        # Only start in the actual Django worker process, not the reloader watcher.
        if os.environ.get('RUN_MAIN') != 'true':
            return

        from django.conf import settings
        from apps.notifications.campaign_scheduler import start, DEFAULT_POLL_INTERVAL

        poll_interval = getattr(settings, 'CAMPAIGN_SCHEDULER_POLL_SECONDS', DEFAULT_POLL_INTERVAL)
        start(poll_interval=poll_interval)
