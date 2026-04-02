from django.contrib import admin
from .models import Customer


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display  = ['name', 'phone', 'email', 'is_gold', 'total_orders', 'total_spent']
    list_filter   = ['is_gold']
    search_fields = ['name', 'phone', 'email']
    ordering      = ['-created_at']
