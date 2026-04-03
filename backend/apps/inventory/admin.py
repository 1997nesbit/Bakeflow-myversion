from django.contrib import admin
from .models import DailyRollout, InventoryItem, StockEntry, Supplier, SupplierProduct

admin.site.register(Supplier)
admin.site.register(SupplierProduct)
admin.site.register(InventoryItem)
admin.site.register(StockEntry)
admin.site.register(DailyRollout)
