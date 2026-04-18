from rest_framework import serializers
from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            'id', 'name', 'phone', 'email',
            'is_gold', 'notes',
            'total_orders', 'total_spent', 'last_order_date',
        ]
        read_only_fields = ['id', 'total_orders', 'total_spent', 'last_order_date']
