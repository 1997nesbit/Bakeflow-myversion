import uuid
from django.db import models
from core.models import TimestampedModel
from apps.accounts.models import User


class Supplier(TimestampedModel):
    id    = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name  = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)

    def __str__(self):
        return self.name


class SupplierProduct(models.Model):
    supplier = models.ForeignKey(Supplier, related_name='products', on_delete=models.CASCADE)
    name     = models.CharField(max_length=200)

    def __str__(self):
        return f"{self.supplier.name} — {self.name}"


class InventoryCategory(models.TextChoices):
    INGREDIENT = 'ingredient', 'Ingredient'
    PACKAGING  = 'packaging',  'Packaging'
    FINISHED   = 'finished',   'Finished Good'


class InventoryItem(TimestampedModel):
    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name          = models.CharField(max_length=200, db_index=True)
    category      = models.CharField(max_length=20, choices=InventoryCategory)
    quantity      = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    unit          = models.CharField(max_length=30)
    min_stock     = models.DecimalField(max_digits=10, decimal_places=3)
    cost_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    supplier      = models.ForeignKey(
        Supplier, null=True, blank=True, on_delete=models.SET_NULL, related_name='items'
    )
    last_restocked = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class StockEntry(TimestampedModel):
    id             = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.PROTECT, related_name='stock_entries')
    quantity       = models.DecimalField(max_digits=10, decimal_places=3)
    cost_per_unit  = models.DecimalField(max_digits=10, decimal_places=2)
    total_cost     = models.DecimalField(max_digits=12, decimal_places=2)
    supplier_name  = models.CharField(max_length=200)
    invoice_ref    = models.CharField(max_length=100, blank=True)
    date           = models.DateField()
    added_by       = models.ForeignKey(User, on_delete=models.PROTECT, related_name='stock_entries')

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"StockEntry {self.inventory_item.name} +{self.quantity} on {self.date}"


class DailyRollout(TimestampedModel):
    id             = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.PROTECT, related_name='rollouts')
    quantity       = models.DecimalField(max_digits=10, decimal_places=3)
    purpose        = models.CharField(max_length=300)
    rolled_out_by  = models.ForeignKey(User, on_delete=models.PROTECT, related_name='rollouts')
    date           = models.DateField(db_index=True)
    time           = models.TimeField()

    class Meta:
        ordering = ['-date', '-time']

    def __str__(self):
        return f"Rollout {self.inventory_item.name} -{self.quantity} on {self.date}"


