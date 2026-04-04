import uuid
from django.db import models
from core.models import TimestampedModel
from apps.accounts.models import User


class TransactionDirection(models.TextChoices):
    IN  = 'in',  'Revenue'
    OUT = 'out', 'Expense'


class TransactionType(models.TextChoices):
    ORDER_PAYMENT    = 'order_payment',    'Order Payment'
    SALE             = 'sale',             'Walk-in Sale'
    STOCK_EXPENSE    = 'stock_expense',    'Stock Expense'
    BUSINESS_EXPENSE = 'business_expense', 'Business Expense'


class PaymentMethod(models.TextChoices):
    CASH          = 'cash',          'Cash'
    BANK_TRANSFER = 'bank_transfer', 'Bank Transfer'
    MOBILE_MONEY  = 'mobile_money',  'Mobile Money'
    CARD          = 'card',          'Card'
    CHEQUE        = 'cheque',        'Cheque'


class FinancialTransaction(TimestampedModel):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date        = models.DateField(db_index=True)
    amount      = models.DecimalField(max_digits=14, decimal_places=2)
    direction   = models.CharField(max_length=3,  choices=TransactionDirection, db_index=True)
    type        = models.CharField(max_length=20, choices=TransactionType,      db_index=True)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod, blank=True)
    description = models.CharField(max_length=300)
    recorded_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='transactions')

    # Revenue source links — one set per revenue row, both null for expenses
    order = models.ForeignKey(
        'orders.Order', null=True, blank=True, on_delete=models.SET_NULL, related_name='transactions'
    )
    sale = models.ForeignKey(
        'orders.Sale', null=True, blank=True, on_delete=models.SET_NULL, related_name='transactions'
    )

    # Expense-only fields — blank for revenue rows
    category         = models.CharField(max_length=50, blank=True)
    paid_to          = models.CharField(max_length=200, blank=True)
    receipt_ref      = models.CharField(max_length=100, blank=True)
    notes            = models.TextField(blank=True)
    recurring        = models.BooleanField(default=False)
    recurring_period = models.CharField(
        max_length=10,
        choices=[('weekly', 'Weekly'), ('monthly', 'Monthly'), ('yearly', 'Yearly')],
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['direction', 'date']),
            models.Index(fields=['type', 'date']),
        ]

    def __str__(self):
        return f'{self.get_direction_display()} — {self.description} ({self.amount})'
