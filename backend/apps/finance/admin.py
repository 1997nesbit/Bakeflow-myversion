from django.contrib import admin
from .models import FinancialTransaction


@admin.register(FinancialTransaction)
class FinancialTransactionAdmin(admin.ModelAdmin):
    list_display = ['date', 'direction', 'type', 'amount', 'description', 'recorded_by']
    list_filter  = ['direction', 'type', 'date']
    search_fields = ['description', 'paid_to', 'receipt_ref']
    readonly_fields = ['id', 'created_at', 'updated_at']
