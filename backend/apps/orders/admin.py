from django.contrib import admin
from .models import DailyBatchItem, MenuItem, Order, OrderItem, OrderStatusHistory


class OrderItemInline(admin.TabularInline):
    model  = OrderItem
    extra  = 0
    fields = ['name', 'quantity', 'price', 'is_custom']


class StatusHistoryInline(admin.TabularInline):
    model         = OrderStatusHistory
    extra         = 0
    readonly_fields = ['from_status', 'to_status', 'changed_by', 'changed_at', 'note']
    can_delete    = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display   = ['tracking_id', 'customer', 'status', 'payment_status', 'pickup_date', 'created_at']
    list_filter    = ['status', 'payment_status', 'delivery_type', 'order_type']
    search_fields  = ['tracking_id', 'customer__name', 'customer__phone']
    ordering       = ['-created_at']
    inlines        = [OrderItemInline, StatusHistoryInline]
    readonly_fields = ['tracking_id', 'created_at', 'updated_at']


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display  = ['name', 'category', 'price', 'estimated_minutes', 'is_active']
    list_filter   = ['category', 'is_active']
    search_fields = ['name']


@admin.register(DailyBatchItem)
class DailyBatchItemAdmin(admin.ModelAdmin):
    list_display  = ['product_name', 'quantity_baked', 'quantity_remaining', 'baked_by', 'baked_at']
    list_filter   = []
    ordering      = ['-baked_at']
