from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.accounts.models import User
from core.permissions import (
    IsBaker, IsDriver, IsManager, IsManagerOrFrontDesk,
)
from .models import DailyBatchItem, MenuItem, Order
from .serializers import (
    AdvanceStatusSerializer,
    DailyBatchItemSerializer,
    DailyBatchItemWriteSerializer,
    DispatchSerializer,
    MenuItemSerializer,
    OrderCreateSerializer,
    OrderDetailSerializer,
    OrderListSerializer,
    RecordPaymentSerializer,
)
from .services import OrderService, ProductionService


class OrderViewSet(viewsets.GenericViewSet):
    """
    Handles all order lifecycle endpoints.
    List / detail use different serializers (ISP).
    Action permissions are set per-action (ISP).
    """
    queryset = (
        Order.objects
        .select_related('customer', 'assigned_to', 'driver', 'created_by')
        .prefetch_related('items', 'status_history__changed_by')
    )
    _service = OrderService()

    def get_serializer_class(self):
        if self.action == 'list':
            return OrderListSerializer
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderDetailSerializer

    def get_permissions(self):
        if self.action == 'track':
            return [AllowAny()]
        if self.action in ('create', 'post_to_baker', 'dispatch', 'record_payment'):
            return [IsManagerOrFrontDesk()]
        if self.action in ('accept', 'quality_check'):
            return [IsBaker()]
        if self.action == 'mark_delivered':
            return [IsDriver()]
        return [IsAuthenticated()]

    # ------------------------------------------------------------------
    # CRUD
    # ------------------------------------------------------------------

    def list(self, request):
        qs = self.get_queryset()

        # Role-based filtering: bakers/drivers/decorators/packing see only
        # orders relevant to their current stage.
        role = request.user.role
        if role == 'baker':
            qs = qs.filter(status__in=['baker', 'quality'])
        elif role == 'driver':
            qs = qs.filter(status__in=['ready', 'dispatched', 'delivered'])
        elif role == 'decorator':
            qs = qs.filter(status='decorator')
        elif role == 'packing':
            qs = qs.filter(status='packing')

        # Optional query filters
        status_filter = request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        date_filter = request.query_params.get('pickup_date')
        if date_filter:
            qs = qs.filter(pickup_date=date_filter)

        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = OrderListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = OrderListSerializer(qs, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = self._service.create_order(serializer.validated_data, created_by=request.user)
        return Response(OrderDetailSerializer(order).data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):
        order = get_object_or_404(self.get_queryset(), pk=pk)
        return Response(OrderDetailSerializer(order).data)

    def partial_update(self, request, pk=None):
        order = get_object_or_404(self.get_queryset(), pk=pk)
        self.check_object_permissions(request, order)
        # Only allow manager/front-desk to patch non-status fields
        allowed_fields = {
            'special_notes', 'note_for_customer', 'pickup_date',
            'pickup_time', 'delivery_type', 'delivery_address',
            'estimated_minutes',
        }
        data = {k: v for k, v in request.data.items() if k in allowed_fields}
        for field, value in data.items():
            setattr(order, field, value)
        order.save(update_fields=list(data.keys()) + ['updated_at'])
        return Response(OrderDetailSerializer(order).data)

    # ------------------------------------------------------------------
    # Public tracking (no auth)
    # ------------------------------------------------------------------

    @action(detail=False, methods=['get'], url_path='track/(?P<tracking_id>[^/.]+)')
    def track(self, request, tracking_id=None):
        order = get_object_or_404(
            Order.objects.select_related('customer').prefetch_related('status_history'),
            tracking_id=tracking_id,
        )
        # Minimal public response — no pricing, no internal notes
        return Response({
            'tracking_id':  order.tracking_id,
            'status':       order.status,
            'pickup_date':  order.pickup_date,
            'pickup_time':  str(order.pickup_time),
            'delivery_type': order.delivery_type,
            'customer_name': order.customer.name,
            'status_history': [
                {'to_status': h.to_status, 'changed_at': h.changed_at}
                for h in order.status_history.all()
            ],
        })

    # ------------------------------------------------------------------
    # Status-transition actions
    # ------------------------------------------------------------------

    @action(detail=True, methods=['post'], url_path='post_to_baker')
    def post_to_baker(self, request, pk=None):
        order = get_object_or_404(self.get_queryset(), pk=pk)
        order = self._service.post_to_baker(order, by=request.user)
        return Response(OrderDetailSerializer(order).data)

    @action(detail=True, methods=['post'], url_path='accept')
    def accept(self, request, pk=None):
        order = get_object_or_404(self.get_queryset(), pk=pk)
        order.assigned_to = request.user
        order.save(update_fields=['assigned_to', 'updated_at'])
        return Response(OrderDetailSerializer(order).data)

    @action(detail=True, methods=['post'], url_path='quality_check')
    def quality_check(self, request, pk=None):
        order = get_object_or_404(self.get_queryset(), pk=pk)
        order = self._service.advance_status(order, 'quality', by=request.user)
        return Response(OrderDetailSerializer(order).data)

    @action(detail=True, methods=['post'], url_path='mark_packing')
    def mark_packing(self, request, pk=None):
        order = get_object_or_404(self.get_queryset(), pk=pk)
        order = self._service.advance_status(order, 'packing', by=request.user)
        return Response(OrderDetailSerializer(order).data)

    @action(detail=True, methods=['post'], url_path='mark_ready')
    def mark_ready(self, request, pk=None):
        order = get_object_or_404(self.get_queryset(), pk=pk)
        order = self._service.advance_status(order, 'ready', by=request.user)
        return Response(OrderDetailSerializer(order).data)

    @action(detail=True, methods=['post'], url_path='dispatch')
    def dispatch(self, request, pk=None):
        order = get_object_or_404(self.get_queryset(), pk=pk)
        serializer = DispatchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        driver = get_object_or_404(User, pk=serializer.validated_data['driver_id'], role='driver')
        order = self._service.dispatch_order(order, driver=driver, by=request.user)
        return Response(OrderDetailSerializer(order).data)

    @action(detail=True, methods=['post'], url_path='mark_delivered')
    def mark_delivered(self, request, pk=None):
        order = get_object_or_404(self.get_queryset(), pk=pk)
        order = self._service.advance_status(order, 'delivered', by=request.user)
        order.driver_delivered = True
        order.save(update_fields=['driver_delivered', 'updated_at'])
        return Response(OrderDetailSerializer(order).data)

    @action(detail=True, methods=['post'], url_path='record_payment')
    def record_payment(self, request, pk=None):
        order = get_object_or_404(self.get_queryset(), pk=pk)
        serializer = RecordPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = self._service.record_payment(
            order,
            amount=float(serializer.validated_data['amount']),
            method=serializer.validated_data['method'],
            by=request.user,
        )
        return Response(OrderDetailSerializer(order).data)


class MenuViewSet(viewsets.GenericViewSet):
    queryset = MenuItem.objects.filter(is_active=True)

    def get_permissions(self):
        if self.action in ('create', 'partial_update'):
            return [IsManager()]
        return [IsAuthenticated()]

    def list(self, request):
        page = self.paginate_queryset(self.get_queryset())
        if page is not None:
            return self.get_paginated_response(MenuItemSerializer(page, many=True).data)
        return Response(MenuItemSerializer(self.get_queryset(), many=True).data)

    def create(self, request):
        serializer = MenuItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = serializer.save()
        return Response(MenuItemSerializer(item).data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk=None):
        item = get_object_or_404(MenuItem, pk=pk)
        serializer = MenuItemSerializer(item, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ProductionViewSet(viewsets.GenericViewSet):
    """Baker's daily batch log — /api/production/batches/."""
    _service = ProductionService()

    def get_permissions(self):
        if self.action == 'create':
            return [IsBaker()]
        return [IsAuthenticated()]

    def list(self, request):
        batches = self._service.get_today_batches()
        page = self.paginate_queryset(batches)
        if page is not None:
            return self.get_paginated_response(DailyBatchItemSerializer(page, many=True).data)
        return Response(DailyBatchItemSerializer(batches, many=True).data)

    def create(self, request):
        serializer = DailyBatchItemWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        batch = self._service.create_batch(serializer.validated_data, baked_by=request.user)
        return Response(DailyBatchItemSerializer(batch).data, status=status.HTTP_201_CREATED)
