from decimal import Decimal
from django.db.models import DecimalField, ExpressionWrapper, F, FloatField, OuterRef, Subquery, Sum, Value
from django.db.models.functions import Coalesce
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.permissions import IsInventoryClerk, IsManagerOrInventory
from .models import DailyRollout, InventoryItem, StockEntry, Supplier
from .serializers import (
    DailyRolloutSerializer,
    DailyRolloutWriteSerializer,
    InventoryItemSerializer,
    StockEntrySerializer,
    StockEntryWriteSerializer,
    SupplierSerializer,
    SupplierWriteSerializer,
)
from .services import InventoryService

_service = InventoryService()


class InventoryViewSet(viewsets.GenericViewSet):
    """
    Inventory item CRUD + stock-in, rollout, low-stock, and entry history actions.

    Permissions:
      - Reads: any authenticated user
      - Writes (create item, stock_in, rollout): inventory_clerk or manager
    """

    def _annotated_qs(self):
        return InventoryItem.objects.annotate(
            stock_health=ExpressionWrapper(
                F('quantity') / F('min_stock'),
                output_field=FloatField(),
            )
        ).select_related('supplier')

    def get_permissions(self):
        write_actions = {'create', 'partial_update', 'update', 'stock_in', 'rollout'}
        if self.action in write_actions:
            return [IsManagerOrInventory()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        return InventoryItemSerializer

    # ------------------------------------------------------------------
    # Standard CRUD
    # ------------------------------------------------------------------

    def list(self, request):
        qs = self._annotated_qs()
        page = self.paginate_queryset(qs)
        serializer = InventoryItemSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    def retrieve(self, request, pk=None):
        item = self._annotated_qs().get(pk=pk)
        return Response(InventoryItemSerializer(item).data)

    def create(self, request):
        serializer = InventoryItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk=None):
        item = self._annotated_qs().get(pk=pk)
        serializer = InventoryItemSerializer(item, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(InventoryItemSerializer(self._annotated_qs().get(pk=pk)).data)

    # ------------------------------------------------------------------
    # Low stock
    # ------------------------------------------------------------------

    @action(detail=False, methods=['get'], url_path='low_stock')
    def low_stock(self, request):
        qs = self._annotated_qs().filter(quantity__lte=F('min_stock'))
        serializer = InventoryItemSerializer(qs, many=True)
        return Response(serializer.data)

    # ------------------------------------------------------------------
    # Stock entries
    # ------------------------------------------------------------------

    @action(detail=False, methods=['get'], url_path='stock_entries')
    def stock_entries(self, request):
        qs = StockEntry.objects.select_related('inventory_item', 'added_by')
        item_id = request.query_params.get('item')
        date    = request.query_params.get('date')
        if item_id:
            qs = qs.filter(inventory_item_id=item_id)
        if date:
            qs = qs.filter(date=date)
        page = self.paginate_queryset(qs)
        serializer = StockEntrySerializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    @action(detail=False, methods=['post'], url_path='stock_in')
    def stock_in(self, request):
        serializer = StockEntryWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        entry = _service.record_stock_in(serializer.validated_data, added_by=request.user)
        return Response(StockEntrySerializer(entry).data, status=status.HTTP_201_CREATED)

    # ------------------------------------------------------------------
    # Daily rollouts
    # ------------------------------------------------------------------

    @action(detail=False, methods=['get'], url_path='rollouts')
    def rollouts(self, request):
        from apps.orders.models import BatchIngredient
        used_subquery = (
            BatchIngredient.objects
            .filter(rollout=OuterRef('pk'))
            .values('rollout')
            .annotate(total=Sum('quantity_used'))
            .values('total')
        )
        qs = (
            DailyRollout.objects
            .select_related('inventory_item', 'rolled_out_by')
            .annotate(quantity_used=Coalesce(
                Subquery(used_subquery, output_field=DecimalField()),
                Value(Decimal('0'), output_field=DecimalField()),
            ))
        )
        date    = request.query_params.get('date')
        item_id = request.query_params.get('item')
        if date:
            qs = qs.filter(date=date)
        if item_id:
            qs = qs.filter(inventory_item_id=item_id)
        page = self.paginate_queryset(qs)
        serializer = DailyRolloutSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    @action(detail=False, methods=['post'], url_path='rollout')
    def rollout(self, request):
        serializer = DailyRolloutWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        rollout = _service.record_rollout(serializer.validated_data, rolled_out_by=request.user)
        return Response(DailyRolloutSerializer(rollout).data, status=status.HTTP_201_CREATED)


class SupplierViewSet(viewsets.GenericViewSet):
    """
    Supplier CRUD. Writes restricted to manager/inventory_clerk.
    """
    queryset = Supplier.objects.prefetch_related('products')

    def get_permissions(self):
        if self.action in {'create', 'partial_update', 'update'}:
            return [IsManagerOrInventory()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action in {'create', 'partial_update', 'update'}:
            return SupplierWriteSerializer
        return SupplierSerializer

    def list(self, request):
        qs = self.get_queryset()
        page = self.paginate_queryset(qs)
        serializer = SupplierSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    def retrieve(self, request, pk=None):
        supplier = self.get_queryset().get(pk=pk)
        return Response(SupplierSerializer(supplier).data)

    def create(self, request):
        serializer = SupplierWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        supplier = serializer.save()
        return Response(SupplierSerializer(supplier).data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk=None):
        supplier = self.get_queryset().get(pk=pk)
        serializer = SupplierWriteSerializer(supplier, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(SupplierSerializer(supplier).data)


