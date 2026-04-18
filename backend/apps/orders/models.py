import uuid
from django.db import models
from core.models import TimestampedModel
from apps.accounts.models import User
from apps.customers.models import Customer


class OrderStatus(models.TextChoices):
    PENDING    = 'pending',    'Pending'
    PAID       = 'paid',       'Paid'
    BAKER      = 'baker',      'With Baker'
    QUALITY    = 'quality',    'Quality Check'
    DECORATOR  = 'decorator',  'With Decorator'
    # PACKING    = 'packing',    'Packing'  # future enhancement — packing step removed from flow
    READY      = 'ready',      'Ready'
    DISPATCHED = 'dispatched', 'Dispatched'
    DELIVERED  = 'delivered',  'Delivered'


class PaymentStatus(models.TextChoices):
    UNPAID  = 'unpaid',  'Unpaid'
    DEPOSIT = 'deposit', 'Deposit'
    PAID    = 'paid',    'Paid'


class PaymentMethod(models.TextChoices):
    CASH          = 'cash',          'Cash'
    BANK_TRANSFER = 'bank_transfer', 'Bank Transfer'
    MOBILE_MONEY  = 'mobile_money',  'Mobile Money'
    CARD          = 'card',          'Card'


class PaymentTerms(models.TextChoices):
    UPFRONT     = 'upfront',     'Upfront'
    ON_DELIVERY = 'on_delivery', 'On Delivery'


class OrderType(models.TextChoices):
    MENU   = 'menu',   'Menu Item'
    CUSTOM = 'custom', 'Custom Order'


class DeliveryType(models.TextChoices):
    PICKUP   = 'pickup',   'Pickup'
    DELIVERY = 'delivery', 'Delivery'


class Order(TimestampedModel):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tracking_id = models.CharField(max_length=20, unique=True, db_index=True)

    customer    = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name='orders')

    order_type        = models.CharField(max_length=10, choices=OrderType.choices)
    status            = models.CharField(max_length=20, choices=OrderStatus.choices, default=OrderStatus.PENDING, db_index=True)
    special_notes     = models.TextField(blank=True)
    note_for_customer = models.TextField(blank=True)

    pickup_date       = models.DateField()
    pickup_time       = models.TimeField()
    is_advance_order  = models.BooleanField(default=False)
    estimated_minutes = models.PositiveIntegerField(default=60)

    delivery_type    = models.CharField(max_length=10, choices=DeliveryType.choices)
    delivery_address = models.TextField(blank=True)

    total_price    = models.DecimalField(max_digits=12, decimal_places=2)
    amount_paid    = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_status = models.CharField(max_length=10, choices=PaymentStatus.choices, default=PaymentStatus.UNPAID)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices, null=True, blank=True)
    payment_terms  = models.CharField(max_length=15, choices=PaymentTerms.choices)

    assigned_to        = models.ForeignKey(User, null=True, blank=True, related_name='assigned_orders', on_delete=models.SET_NULL)
    posted_to_baker_at = models.DateTimeField(null=True, blank=True)
    dispatched_at      = models.DateTimeField(null=True, blank=True)
    driver                = models.ForeignKey(User, null=True, blank=True, related_name='deliveries', on_delete=models.SET_NULL)
    driver_accepted       = models.BooleanField(null=True, blank=True)
    driver_delivered      = models.BooleanField(default=False)
    proof_of_delivery     = models.ImageField(
        upload_to='proof_of_delivery/',
        null=True,
        blank=True,
        help_text='Photo uploaded by the driver upon delivery.',
    )

    created_by = models.ForeignKey(User, related_name='created_orders', on_delete=models.PROTECT)

    class Meta:
        indexes = [
            models.Index(fields=['status', 'pickup_date']),
            models.Index(fields=['payment_status']),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.tracking_id} — {self.customer.name} ({self.status})'


class OrderItem(models.Model):
    order         = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    name          = models.CharField(max_length=200)
    quantity      = models.PositiveIntegerField()
    price         = models.DecimalField(max_digits=10, decimal_places=2)
    customization = models.TextField(blank=True)
    is_custom     = models.BooleanField(default=False)

    # Custom cake details (null when not a custom cake)
    cake_flavour     = models.CharField(max_length=100, blank=True)
    icing_type       = models.CharField(max_length=100, blank=True)
    weight_kg        = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    cake_description = models.TextField(blank=True)

    def __str__(self):
        return f'{self.name} x{self.quantity}'


class OrderStatusHistory(models.Model):
    """Audit trail — one row per status transition."""
    order       = models.ForeignKey(Order, related_name='status_history', on_delete=models.CASCADE)
    from_status = models.CharField(max_length=20)
    to_status   = models.CharField(max_length=20)
    changed_by  = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    changed_at  = models.DateTimeField(auto_now_add=True)
    note        = models.TextField(blank=True)

    class Meta:
        ordering = ['changed_at']

    def __str__(self):
        return f'{self.order.tracking_id}: {self.from_status} → {self.to_status}'


class MenuItem(models.Model):
    name               = models.CharField(max_length=200)
    category           = models.CharField(max_length=50)
    price              = models.DecimalField(max_digits=10, decimal_places=2)
    estimated_minutes  = models.PositiveIntegerField()
    description        = models.TextField(blank=True)
    is_active          = models.BooleanField(default=True)

    class Meta:
        ordering = ['category', 'name']

    def __str__(self):
        return f'{self.name} (TZS {self.price})'


class Sale(TimestampedModel):
    """
    Walk-in / point-of-sale transaction.
    No production pipeline, no customer record required.
    Created and immediately complete.
    """
    id             = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    total_price    = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices)
    customer_name  = models.CharField(max_length=150, blank=True)
    served_by      = models.ForeignKey(User, on_delete=models.PROTECT, related_name='sales')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Sale {self.id} — TZS {self.total_price} ({self.created_at.date()})'


class SaleItem(models.Model):
    sale       = models.ForeignKey(Sale, related_name='items', on_delete=models.CASCADE)
    name       = models.CharField(max_length=200)
    quantity   = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f'{self.name} x{self.quantity}'


class DailyBatchItem(TimestampedModel):
    """Baker's daily production log."""
    id                 = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    menu_item          = models.ForeignKey(MenuItem, on_delete=models.SET_NULL, null=True, blank=True, related_name='batch_items')
    product_name       = models.CharField(max_length=200)
    quantity_baked     = models.PositiveIntegerField()
    quantity_remaining = models.PositiveIntegerField()
    unit               = models.CharField(max_length=30, default='pcs')
    baked_by           = models.ForeignKey(User, on_delete=models.PROTECT, related_name='batches')
    baked_at           = models.DateTimeField()
    oven_temp          = models.CharField(max_length=20, blank=True)
    notes              = models.TextField(blank=True)

    class Meta:
        ordering = ['-baked_at']

    def __str__(self):
        return f'{self.product_name} x{self.quantity_baked} ({self.baked_at.date()})'


class BatchIngredient(models.Model):
    """Records how much of a rolled-out inventory item was consumed by a batch."""
    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    batch         = models.ForeignKey(DailyBatchItem, on_delete=models.CASCADE, related_name='ingredients')
    rollout       = models.ForeignKey('inventory.DailyRollout', on_delete=models.PROTECT, related_name='usages')
    quantity_used = models.DecimalField(max_digits=10, decimal_places=3)

    def __str__(self):
        return f'{self.batch.product_name} used {self.quantity_used} from rollout {self.rollout_id}'
