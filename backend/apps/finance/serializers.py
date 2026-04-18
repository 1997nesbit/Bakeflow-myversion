from rest_framework import serializers
from .models import FinancialTransaction, TransactionDirection


class FinancialTransactionSerializer(serializers.ModelSerializer):
    recorded_by = serializers.CharField(source='recorded_by.name', read_only=True)
    order_id    = serializers.UUIDField(read_only=True)
    sale_id     = serializers.UUIDField(read_only=True)

    class Meta:
        model = FinancialTransaction
        fields = [
            'id', 'date', 'amount', 'direction', 'type',
            'payment_method', 'description', 'recorded_by',
            'order_id', 'sale_id',
            'category', 'paid_to', 'receipt_ref', 'notes',
            'recurring', 'recurring_period',
            'created_at',
        ]
        read_only_fields = ['id', 'recorded_by', 'order_id', 'sale_id', 'created_at']


class ExpenseCreateSerializer(serializers.ModelSerializer):
    """Write-only. Accepts expense (direction='out') rows created via the API."""

    class Meta:
        model = FinancialTransaction
        fields = [
            'date', 'amount', 'type',
            'payment_method', 'description',
            'category', 'paid_to', 'receipt_ref', 'notes',
            'recurring', 'recurring_period',
        ]

    def validate_type(self, value):
        if value not in ('stock_expense', 'business_expense'):
            raise serializers.ValidationError('Only stock_expense or business_expense types can be created via this endpoint.')
        return value

    def validate(self, attrs):
        attrs['direction'] = TransactionDirection.OUT
        return attrs
