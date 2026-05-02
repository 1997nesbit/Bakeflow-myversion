from decimal import Decimal
from rest_framework import serializers
from apps.customers.models import Customer
from apps.accounts.models import User
from .models import Order, OrderItem, OrderStatusHistory, MenuItem, DailyBatchItem, BatchIngredient, Sale, SaleItem


# ---------------------------------------------------------------------------
# Nested / shared serializers
# ---------------------------------------------------------------------------

class CustomerInlineSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Customer
        fields = ['id', 'name', 'phone', 'email', 'is_gold']


class AssignedUserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ['id', 'name', 'role']


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model  = OrderItem
        fields = [
            'id', 'name', 'quantity', 'price', 'customization', 'is_custom',
            'cake_flavour', 'icing_type', 'weight_kg', 'cake_description',
        ]


class OrderItemWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model  = OrderItem
        fields = [
            'name', 'quantity', 'price', 'customization', 'is_custom',
            'cake_flavour', 'icing_type', 'weight_kg', 'cake_description',
        ]


class StatusHistorySerializer(serializers.ModelSerializer):
    changed_by = AssignedUserSerializer(read_only=True)

    class Meta:
        model  = OrderStatusHistory
        fields = ['from_status', 'to_status', 'changed_by', 'changed_at', 'note']


# ---------------------------------------------------------------------------
# List serializer — lightweight, no nested items or history
# ---------------------------------------------------------------------------

class OrderListSerializer(serializers.ModelSerializer):
    customer    = CustomerInlineSerializer(read_only=True)
    assigned_to = AssignedUserSerializer(read_only=True)
    driver      = AssignedUserSerializer(read_only=True)
    items       = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model  = Order
        fields = [
            'id', 'tracking_id', 'customer', 'order_type', 'status',
            'special_notes', 'note_for_customer',
            'pickup_date', 'pickup_time', 'delivery_type', 'delivery_address',
            'total_price', 'amount_paid', 'payment_status', 'payment_terms',
            'is_advance_order', 'estimated_minutes',
            'assigned_to', 'driver', 'driver_accepted', 'driver_delivered',
            'posted_to_baker_at', 'dispatched_at',
            'created_at', 'updated_at', 'items',
        ]


# ---------------------------------------------------------------------------
# Detail serializer — full payload including items and history
# ---------------------------------------------------------------------------

class OrderDetailSerializer(serializers.ModelSerializer):
    customer       = CustomerInlineSerializer(read_only=True)
    assigned_to    = AssignedUserSerializer(read_only=True)
    driver         = AssignedUserSerializer(read_only=True)
    items          = OrderItemSerializer(many=True, read_only=True)
    status_history = StatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model  = Order
        fields = [
            'id', 'tracking_id', 'customer', 'order_type', 'status',
            'special_notes', 'note_for_customer',
            'pickup_date', 'pickup_time', 'delivery_type', 'delivery_address',
            'total_price', 'amount_paid', 'payment_status', 'payment_method', 'payment_terms',
            'is_advance_order', 'estimated_minutes',
            'assigned_to', 'posted_to_baker_at', 'dispatched_at',
            'driver', 'driver_accepted', 'driver_delivered',
            'items', 'status_history',
            'created_at', 'updated_at',
        ]


# ---------------------------------------------------------------------------
# Create serializer — write fields only; customer data sent inline
# ---------------------------------------------------------------------------

class OrderCreateSerializer(serializers.Serializer):
    # Customer (resolved / created server-side by OrderService)
    customer_name  = serializers.CharField(max_length=150)
    customer_phone = serializers.CharField(max_length=20)
    customer_email = serializers.EmailField(required=False, allow_blank=True)

    # Order fields
    order_type        = serializers.ChoiceField(choices=Order.order_type.field.choices if hasattr(Order, 'order_type') else [('menu', 'menu'), ('custom', 'custom')])
    special_notes     = serializers.CharField(required=False, allow_blank=True, default='')
    note_for_customer = serializers.CharField(required=False, allow_blank=True, default='')
    pickup_date       = serializers.DateField()
    pickup_time       = serializers.TimeField()
    delivery_type     = serializers.ChoiceField(choices=[('pickup', 'pickup'), ('delivery', 'delivery')])
    delivery_address  = serializers.CharField(required=False, allow_blank=True, default='')
    total_price       = serializers.DecimalField(max_digits=12, decimal_places=2)
    amount_paid       = serializers.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_status    = serializers.ChoiceField(choices=[('unpaid', 'unpaid'), ('deposit', 'deposit'), ('paid', 'paid')])
    payment_method    = serializers.ChoiceField(choices=[('cash', 'cash'), ('bank_transfer', 'bank_transfer'), ('mobile_money', 'mobile_money'), ('card', 'card')], required=False, allow_null=True)
    payment_terms     = serializers.ChoiceField(choices=[('upfront', 'upfront'), ('on_delivery', 'on_delivery')])
    is_advance_order  = serializers.BooleanField(default=False)
    estimated_minutes = serializers.IntegerField(default=60)

    items = OrderItemWriteSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError('An order must have at least one item.')
        return value


# ---------------------------------------------------------------------------
# Action serializers
# ---------------------------------------------------------------------------

class RecordPaymentSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    method = serializers.ChoiceField(choices=['cash', 'bank_transfer', 'mobile_money', 'card'])


class DispatchSerializer(serializers.Serializer):
    driver_id = serializers.UUIDField()


class AdvanceStatusSerializer(serializers.Serializer):
    note = serializers.CharField(required=False, allow_blank=True, default='')


# ---------------------------------------------------------------------------
# Menu serializers
# ---------------------------------------------------------------------------

class MenuItemSerializer(serializers.ModelSerializer):
    # Populated by annotation in MenuViewSet.list(); 0 for non-list actions.
    stock_today = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model  = MenuItem
        fields = ['id', 'name', 'category', 'price', 'estimated_minutes', 'description', 'is_active', 'stock_today']


# ---------------------------------------------------------------------------
# Production (daily batch) serializers
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Sale serializers
# ---------------------------------------------------------------------------

class SaleItemSerializer(serializers.ModelSerializer):
    class Meta:
        model  = SaleItem
        fields = ['name', 'quantity', 'unit_price']


class SaleSerializer(serializers.ModelSerializer):
    items     = SaleItemSerializer(many=True, read_only=True)
    served_by = serializers.CharField(source='served_by.name', read_only=True)

    class Meta:
        model  = Sale
        fields = ['id', 'items', 'total_price', 'payment_method', 'customer_name', 'served_by', 'created_at']


class SaleCreateSerializer(serializers.Serializer):
    items          = SaleItemSerializer(many=True)
    total_price    = serializers.DecimalField(max_digits=12, decimal_places=2)
    payment_method = serializers.ChoiceField(choices=['cash', 'bank_transfer', 'mobile_money', 'card'])
    customer_name  = serializers.CharField(max_length=150, required=False, allow_blank=True, default='')

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError('A sale must have at least one item.')
        return value


class BatchIngredientSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='rollout.inventory_item.name', read_only=True)
    item_unit = serializers.CharField(source='rollout.inventory_item.unit', read_only=True)

    class Meta:
        model  = BatchIngredient
        fields = ['id', 'rollout', 'item_name', 'item_unit', 'quantity_used']


class BatchIngredientWriteSerializer(serializers.Serializer):
    rollout_id    = serializers.UUIDField()
    quantity_used = serializers.DecimalField(max_digits=10, decimal_places=3, min_value=Decimal('0.001'))


class DailyBatchItemSerializer(serializers.ModelSerializer):
    baked_by_name = serializers.CharField(source='baked_by.name', read_only=True)
    ingredients   = BatchIngredientSerializer(many=True, read_only=True)

    class Meta:
        model  = DailyBatchItem
        fields = [
            'id', 'product_name',
            'quantity_baked', 'quantity_remaining',
            'baked_by_name', 'baked_at', 'notes', 'ingredients',
        ]


class DailyBatchItemWriteSerializer(serializers.Serializer):
    """Baker-supplied fields."""
    product_name   = serializers.CharField(max_length=200)
    quantity_baked = serializers.IntegerField(min_value=1)
    notes          = serializers.CharField(required=False, allow_blank=True, default='')
    ingredients    = BatchIngredientWriteSerializer(many=True, required=False, default=list)
