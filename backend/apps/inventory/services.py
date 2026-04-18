from decimal import Decimal
from django.db import transaction
from django.db.models import F
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.accounts.models import User
from .models import DailyRollout, InventoryItem, StockEntry


class InventoryService:

    @transaction.atomic
    def record_stock_in(self, validated_data: dict, added_by: User) -> StockEntry:
        """
        Create a StockEntry and increase the item's quantity.
        total_cost is computed here so callers don't need to pass it.
        """
        item: InventoryItem = validated_data['inventory_item']
        qty: Decimal = validated_data['quantity']
        cost: Decimal = validated_data['cost_per_unit']

        entry = StockEntry.objects.create(
            inventory_item=item,
            quantity=qty,
            cost_per_unit=cost,
            total_cost=qty * cost,
            supplier_name=validated_data.get('supplier_name', ''),
            invoice_ref=validated_data.get('invoice_ref', ''),
            date=validated_data.get('date', timezone.localdate()),
            added_by=added_by,
        )
        self._update_quantity(item, delta=qty)
        item.last_restocked = entry.date
        item.cost_per_unit = cost
        item.save(update_fields=['quantity', 'last_restocked', 'cost_per_unit'])
        return entry

    @transaction.atomic
    def record_rollout(self, validated_data: dict, rolled_out_by: User) -> DailyRollout:
        """
        Create a DailyRollout and decrease the item's quantity.
        Raises ValidationError if there is insufficient stock.
        """
        item: InventoryItem = validated_data['inventory_item']
        qty: Decimal = validated_data['quantity']

        item.refresh_from_db(fields=['quantity'])
        if qty > item.quantity:
            raise ValidationError(
                f"Insufficient stock for '{item.name}'. "
                f"Available: {item.quantity} {item.unit}, requested: {qty} {item.unit}."
            )

        now = timezone.localtime()
        rollout = DailyRollout.objects.create(
            inventory_item=item,
            quantity=qty,
            purpose=validated_data['purpose'],
            rolled_out_by=rolled_out_by,
            date=validated_data.get('date', now.date()),
            time=validated_data.get('time', now.time()),
        )
        self._update_quantity(item, delta=-qty)
        return rollout

    def get_low_stock_items(self):
        """Return items where quantity <= min_stock."""
        from django.db.models import F as _F
        return InventoryItem.objects.filter(
            quantity__lte=_F('min_stock')
        ).select_related('supplier')

    def _update_quantity(self, item: InventoryItem, delta: Decimal) -> None:
        """Atomically add delta to item.quantity using F() to avoid race conditions."""
        from django.db.models import F
        InventoryItem.objects.filter(pk=item.pk).update(quantity=F('quantity') + delta)
        item.quantity += delta
