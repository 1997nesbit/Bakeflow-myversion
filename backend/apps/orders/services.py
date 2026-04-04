import random
import string
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.customers.models import Customer
from decimal import Decimal
from .models import Order, OrderStatus, OrderStatusHistory, DailyBatchItem, BatchIngredient


class OrderStateValidator:
    """
    OCP: new statuses extend ALLOWED_TRANSITIONS without touching OrderService.
    """
    ALLOWED_TRANSITIONS: dict[str, list[str]] = {
        OrderStatus.PENDING:    [OrderStatus.PAID],
        OrderStatus.PAID:       [OrderStatus.BAKER],
        OrderStatus.BAKER:      [OrderStatus.QUALITY],
        OrderStatus.QUALITY:    [OrderStatus.DECORATOR, OrderStatus.READY],
        OrderStatus.DECORATOR:  [OrderStatus.READY],
        OrderStatus.READY:      [OrderStatus.DISPATCHED, OrderStatus.DELIVERED],
        OrderStatus.DISPATCHED: [OrderStatus.DELIVERED],
    }

    def validate(self, from_status: str, to_status: str) -> None:
        allowed = self.ALLOWED_TRANSITIONS.get(from_status, [])
        if to_status not in allowed:
            raise ValidationError(
                f"Cannot transition from '{from_status}' to '{to_status}'. "
                f"Allowed next statuses: {allowed or 'none (terminal state)'}."
            )


class OrderService:
    def __init__(self):
        self._validator = OrderStateValidator()

    # ------------------------------------------------------------------
    # Tracking ID
    # ------------------------------------------------------------------
    def generate_tracking_id(self) -> str:
        chars = string.ascii_uppercase + string.digits
        while True:
            candidate = 'TRK-' + ''.join(random.choices(chars, k=6))
            if not Order.objects.filter(tracking_id=candidate).exists():
                return candidate

    # ------------------------------------------------------------------
    # Order creation
    # ------------------------------------------------------------------
    @transaction.atomic
    def create_order(self, validated_data: dict, created_by) -> Order:
        # Extract customer fields sent inline by the frontend
        customer_name  = validated_data.pop('customer_name')
        customer_phone = validated_data.pop('customer_phone')
        customer_email = validated_data.pop('customer_email', None)

        customer, _ = Customer.objects.get_or_create(
            phone=customer_phone,
            defaults={'name': customer_name, 'email': customer_email},
        )
        # Keep name / email up to date if the customer already exists
        updated = False
        if customer.name != customer_name:
            customer.name = customer_name
            updated = True
        if customer_email and customer.email != customer_email:
            customer.email = customer_email
            updated = True
        if updated:
            customer.save(update_fields=['name', 'email'] if customer_email else ['name'])

        items_data = validated_data.pop('items')
        order = Order.objects.create(
            **validated_data,
            customer=customer,
            tracking_id=self.generate_tracking_id(),
            created_by=created_by,
        )

        from .models import OrderItem
        OrderItem.objects.bulk_create([
            OrderItem(order=order, **item) for item in items_data
        ])

        OrderStatusHistory.objects.create(
            order=order,
            from_status='',
            to_status=order.status,
            changed_by=created_by,
            note='Order created',
        )
        return order

    # ------------------------------------------------------------------
    # Status transitions
    # ------------------------------------------------------------------
    @transaction.atomic
    def advance_status(self, order: Order, to_status: str, by) -> Order:
        self._validator.validate(order.status, to_status)
        from_status = order.status
        order.status = to_status
        order.save(update_fields=['status', 'updated_at'])
        OrderStatusHistory.objects.create(
            order=order,
            from_status=from_status,
            to_status=to_status,
            changed_by=by,
        )
        return order

    @transaction.atomic
    def post_to_baker(self, order: Order, by) -> Order:
        self._validator.validate(order.status, OrderStatus.BAKER)
        from_status = order.status
        order.status = OrderStatus.BAKER
        order.posted_to_baker_at = timezone.now()
        order.save(update_fields=['status', 'posted_to_baker_at', 'updated_at'])
        OrderStatusHistory.objects.create(
            order=order,
            from_status=from_status,
            to_status=OrderStatus.BAKER,
            changed_by=by,
            note='Posted to baker queue',
        )
        return order

    @transaction.atomic
    def dispatch_order(self, order: Order, driver, by) -> Order:
        self._validator.validate(order.status, OrderStatus.DISPATCHED)
        from_status = order.status
        order.status = OrderStatus.DISPATCHED
        order.driver = driver
        order.dispatched_at = timezone.now()
        order.save(update_fields=['status', 'driver', 'dispatched_at', 'updated_at'])
        OrderStatusHistory.objects.create(
            order=order,
            from_status=from_status,
            to_status=OrderStatus.DISPATCHED,
            changed_by=by,
            note=f'Dispatched with driver {driver.name}',
        )
        return order

    @transaction.atomic
    def record_payment(self, order: Order, amount: float, method: str, by) -> Order:
        from apps.finance.services import FinanceService
        order.amount_paid = float(order.amount_paid) + amount
        if order.amount_paid >= float(order.total_price):
            order.payment_status = 'paid'
        elif order.amount_paid > 0:
            order.payment_status = 'deposit'
        order.payment_method = method
        order.save(update_fields=['amount_paid', 'payment_status', 'payment_method', 'updated_at'])
        FinanceService.record_order_payment(order=order, amount=amount, method=method, recorded_by=by)
        # Advance to PAID status if currently PENDING
        if order.status == OrderStatus.PENDING and order.payment_status == 'paid':
            order = self.advance_status(order, OrderStatus.PAID, by)
        return order


class ProductionService:
    def get_today_batches(self):
        from django.utils import timezone
        return (
            DailyBatchItem.objects
            .select_related('baked_by')
            .prefetch_related('ingredients__rollout__inventory_item')
            .filter(baked_at__date=timezone.now().date())
        )

    @transaction.atomic
    def create_batch(self, validated_data: dict, baked_by) -> DailyBatchItem:
        from django.db.models import Sum
        from rest_framework.exceptions import ValidationError
        from apps.inventory.models import DailyRollout

        ingredients_data = validated_data.get('ingredients', [])

        # Validate each rollout has enough remaining capacity.
        # select_for_update locks the rows so concurrent batch submissions
        # cannot both pass validation for the same rollout.
        for ing in ingredients_data:
            rollout = (
                DailyRollout.objects
                .select_for_update()
                .select_related('inventory_item')
                .get(pk=ing['rollout_id'])
            )
            already_used = (
                BatchIngredient.objects
                .filter(rollout=rollout)
                .aggregate(total=Sum('quantity_used'))['total']
            ) or Decimal('0')
            available = rollout.quantity - already_used
            if ing['quantity_used'] > available:
                raise ValidationError(
                    f"'{rollout.inventory_item.name}': only {available} {rollout.inventory_item.unit} "
                    f"available from this rollout, but {ing['quantity_used']} was requested."
                )

        qty = validated_data['quantity_baked']
        batch = DailyBatchItem.objects.create(
            product_name=validated_data['product_name'],
            quantity_baked=qty,
            quantity_remaining=qty,
            unit='pcs',
            baked_by=baked_by,
            baked_at=timezone.now(),
            notes=validated_data.get('notes', ''),
        )

        for ing in ingredients_data:
            BatchIngredient.objects.create(
                batch=batch,
                rollout_id=ing['rollout_id'],
                quantity_used=ing['quantity_used'],
            )

        return batch
