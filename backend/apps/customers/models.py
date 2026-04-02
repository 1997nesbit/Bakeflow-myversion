import uuid
from django.db import models
from core.models import TimestampedModel


class Customer(TimestampedModel):
    id             = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name           = models.CharField(max_length=150)
    phone          = models.CharField(max_length=20, unique=True)
    email          = models.EmailField(null=True, blank=True)
    is_gold        = models.BooleanField(default=False)
    notes          = models.TextField(blank=True)
    total_orders   = models.PositiveIntegerField(default=0)
    total_spent    = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    last_order_date = models.DateField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['phone']),
            models.Index(fields=['is_gold']),
        ]

    def __str__(self):
        return f'{self.name} ({self.phone})'
