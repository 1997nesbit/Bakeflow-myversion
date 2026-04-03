from rest_framework import serializers
from .models import DailyRollout, InventoryItem, StockEntry, Supplier, SupplierProduct


# ---------------------------------------------------------------------------
# Supplier
# ---------------------------------------------------------------------------

class SupplierProductSerializer(serializers.ModelSerializer):
    class Meta:
        model  = SupplierProduct
        fields = ['id', 'name']


class SupplierSerializer(serializers.ModelSerializer):
    products = SupplierProductSerializer(many=True, read_only=True)

    class Meta:
        model  = Supplier
        fields = ['id', 'name', 'phone', 'email', 'products']


class SupplierWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Supplier
        fields = ['name', 'phone', 'email']


# ---------------------------------------------------------------------------
# Inventory item
# ---------------------------------------------------------------------------

class SupplierInlineSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Supplier
        fields = ['id', 'name', 'phone']


class InventoryItemSerializer(serializers.ModelSerializer):
    supplier    = SupplierInlineSerializer(read_only=True)
    supplier_id = serializers.PrimaryKeyRelatedField(
        queryset=Supplier.objects.all(),
        source='supplier',
        write_only=True,
        allow_null=True,
        required=False,
    )
    stock_health = serializers.FloatField(read_only=True)

    class Meta:
        model  = InventoryItem
        fields = [
            'id', 'name', 'category', 'quantity', 'unit',
            'min_stock', 'cost_per_unit', 'supplier', 'supplier_id',
            'last_restocked', 'stock_health',
        ]


# ---------------------------------------------------------------------------
# Stock entry
# ---------------------------------------------------------------------------

class StockEntrySerializer(serializers.ModelSerializer):
    item_name      = serializers.CharField(source='inventory_item.name', read_only=True)
    item_unit      = serializers.CharField(source='inventory_item.unit', read_only=True)
    added_by_name  = serializers.CharField(source='added_by.name', read_only=True)

    class Meta:
        model  = StockEntry
        fields = [
            'id', 'inventory_item', 'item_name', 'item_unit',
            'quantity', 'cost_per_unit', 'total_cost',
            'supplier_name', 'invoice_ref', 'date',
            'added_by_name', 'created_at',
        ]
        read_only_fields = ['total_cost', 'added_by_name', 'created_at']


class StockEntryWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model  = StockEntry
        fields = ['inventory_item', 'quantity', 'cost_per_unit', 'supplier_name', 'invoice_ref', 'date']

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0.")
        return value

    def validate_cost_per_unit(self, value):
        if value <= 0:
            raise serializers.ValidationError("Cost per unit must be greater than 0.")
        return value


# ---------------------------------------------------------------------------
# Daily rollout
# ---------------------------------------------------------------------------

class DailyRolloutSerializer(serializers.ModelSerializer):
    item_name       = serializers.CharField(source='inventory_item.name', read_only=True)
    item_unit       = serializers.CharField(source='inventory_item.unit', read_only=True)
    rolled_out_by_name = serializers.CharField(source='rolled_out_by.name', read_only=True)

    class Meta:
        model  = DailyRollout
        fields = [
            'id', 'inventory_item', 'item_name', 'item_unit',
            'quantity', 'purpose', 'rolled_out_by_name', 'date', 'time',
        ]


class DailyRolloutWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model  = DailyRollout
        fields = ['inventory_item', 'quantity', 'purpose', 'date', 'time']

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0.")
        return value


