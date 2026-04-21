from django.db import models
from django.db.models import Count, IntegerField, OuterRef, Subquery, Sum, Value
from django.db.models.functions import Coalesce
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.accounts.models import User
from apps.notifications.models import TriggerEvent
from core.permissions import (
    IsBaker, IsDriver, IsDriverOrFrontDesk, IsManagerOrFrontDesk,
)
from .models import DailyBatchItem, MenuItem, Order, Sale, SaleItem
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
    SaleCreateSerializer,
    SaleSerializer,
)
from .services import OrderService, ProductionService


def _trigger_notification(order, event: str, extra_context: dict | None = None):
    """Fire-and-forget wrapper — a notification failure never breaks the order flow."""
    try:
        from apps.notifications.services import NotificationService
        NotificationService.dispatch_for_order(order, event, extra_context=extra_context)
    except Exception:
        pass


class OrderViewSet(viewsets.GenericViewSet):
    """
    Handles all order lifecycle endpoints.
    List / detail use different serializers (ISP).
    Action permissions are set per-action (ISP).
    """
    _service = OrderService()

    queryset = (
        Order.objects
        .select_related('customer', 'assigned_to', 'driver', 'created_by')
        .prefetch_related('items', 'status_history__changed_by')
    )

    def get_serializer_class(self):
        if self.action == 'list':
            return OrderListSerializer
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderDetailSerializer

    def get_permissions(self):
        if self.action == 'track':
            return [AllowAny()]
        if self.action in ('create', 'post_to_baker', 'dispatch_order'):
            return [IsManagerOrFrontDesk()]
        if self.action == 'record_payment':
            return [IsDriverOrFrontDesk()]
        if self.action in ('accept', 'quality_check'):
            return [IsBaker()]
        if self.action in ('mark_delivered', 'upload_proof'):
            return [IsDriverOrFrontDesk()]
        if self.action == 'accept_delivery':
            return [IsDriver()]
        if self.action in ('send_payment_reminder', 'send_overdue_notice'):
            return [IsManagerOrFrontDesk()]
        return [IsAuthenticated()]

    # ------------------------------------------------------------------
    # CRUD
    # ------------------------------------------------------------------

    def list(self, request):
        qs = self.get_queryset()

        # Role-based filtering
        role = request.user.role
        if role == 'baker':
            qs = qs.filter(status__in=['baker', 'quality'])
        elif role == 'driver':
            # Drivers only see orders assigned to them (dispatched or delivered)
            # plus orders that are ready and unassigned (available to pick up).
            qs = qs.filter(
                status__in=['ready', 'dispatched', 'delivered']
            ).filter(
                models.Q(driver=request.user) | models.Q(driver__isnull=True, status='ready')
            )
        elif role == 'decorator':
            qs = qs.filter(status='decorator')

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
        # Fire confirmation SMS — event is chosen by delivery_type × payment_status
        from apps.notifications.services import NotificationService
        event = NotificationService.get_order_created_event(order)
        _trigger_notification(order, event)
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

    @action(detail=True, methods=['post'], url_path='accept_delivery')
    def accept_delivery(self, request, pk=None):
        """Driver confirms they are accepting and heading out for delivery.
        Persists driver_accepted=True and sends the ORDER_DISPATCHED SMS to the customer.
        """
        order = get_object_or_404(self.get_queryset(), pk=pk)
        order.driver = request.user          # needed so notification context resolves driver_name/phone
        order.driver_accepted = True
        order.save(update_fields=['driver', 'driver_accepted', 'updated_at'])
        _trigger_notification(order, TriggerEvent.ORDER_DISPATCHED)
        return Response(OrderDetailSerializer(order).data)

    @action(detail=True, methods=['post'], url_path='quality_check')
    def quality_check(self, request, pk=None):
        order = get_object_or_404(self.get_queryset(), pk=pk)
        order = self._service.advance_status(order, 'quality', by=request.user)
        return Response(OrderDetailSerializer(order).data)

    # future enhancement — packing step removed from flow
    # @action(detail=True, methods=['post'], url_path='mark_packing')
    # def mark_packing(self, request, pk=None):
    #     order = get_object_or_404(self.get_queryset(), pk=pk)
    #     order = self._service.advance_status(order, 'packing', by=request.user)
    #     return Response(OrderDetailSerializer(order).data)

    @action(detail=True, methods=['post'], url_path='mark_ready')
    def mark_ready(self, request, pk=None):
        order = get_object_or_404(self.get_queryset(), pk=pk)
        order = self._service.advance_status(order, 'ready', by=request.user)
        # Trigger notification: different message if pickup vs delivery
        event = (
            TriggerEvent.ORDER_READY_DELIVERY
            if order.delivery_type == 'delivery'
            else TriggerEvent.ORDER_READY_PICKUP
        )
        _trigger_notification(order, event)
        return Response(OrderDetailSerializer(order).data)

    @action(detail=True, methods=['post'], url_path='dispatch')
    def dispatch_order(self, request, pk=None):
        order = get_object_or_404(self.get_queryset(), pk=pk)
        # COD orders (payment_terms='on_delivery') are intentionally dispatched unpaid —
        # the driver collects payment at the door. Only block non-COD unpaid orders.
        if order.payment_status != 'paid' and order.payment_terms != 'on_delivery':
            return Response(
                {'detail': 'Order must be fully paid before it can be dispatched to a driver.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = DispatchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        driver = get_object_or_404(User, pk=serializer.validated_data['driver_id'], role='driver')
        order = self._service.dispatch_order(order, driver=driver, by=request.user)
        _trigger_notification(order, TriggerEvent.ORDER_DISPATCHED)
        return Response(OrderDetailSerializer(order).data)

    @action(detail=True, methods=['post'], url_path='mark_delivered')
    def mark_delivered(self, request, pk=None):
        order = get_object_or_404(self.get_queryset(), pk=pk)
        order = self._service.advance_status(order, 'delivered', by=request.user)
        order.driver_delivered = True
        order.save(update_fields=['driver_delivered', 'updated_at'])
        _trigger_notification(order, TriggerEvent.ORDER_DELIVERED)
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
        # Pass the exact payment amount recorded in *this* transaction as extra_context.
        # Without this, {{amount}} resolves to order.amount_paid (cumulative total),
        # which doubles when a second payment is made on a deposit order.
        payment_amount = float(serializer.validated_data['amount'])
        _trigger_notification(
            order,
            TriggerEvent.PAYMENT_RECEIVED,
            extra_context={'amount': f'{payment_amount:,.0f}'},
        )
        return Response(OrderDetailSerializer(order).data)

    @action(detail=True, methods=['post'], url_path='send_payment_reminder')
    def send_payment_reminder(self, request, pk=None):
        """Staff action: manually send a payment-reminder SMS to the customer."""
        order = get_object_or_404(self.get_queryset(), pk=pk)
        outstanding = max(0.0, float(order.total_price) - float(order.amount_paid))
        if outstanding == 0:
            # amount_paid already covers the total — payment_status may be stale.
            # Self-heal the status so the order leaves the Awaiting Payment tab.
            self._service._sync_payment(order)
            return Response(
                {'detail': 'Order is already fully paid. Payment status has been corrected.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        _trigger_notification(
            order,
            TriggerEvent.PAYMENT_REMINDER,
            extra_context={'balance': f'{outstanding:,.0f}', 'total_price': f'{float(order.total_price):,.0f}'},
        )
        return Response({'detail': 'Payment reminder sent.'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='send_overdue_notice')
    def send_overdue_notice(self, request, pk=None):
        """Staff action: manually send an overdue-payment SMS to the customer."""
        order = get_object_or_404(self.get_queryset(), pk=pk)
        outstanding = max(0.0, float(order.total_price) - float(order.amount_paid))
        if outstanding == 0:
            self._service._sync_payment(order)
            return Response(
                {'detail': 'Order is already fully paid. Payment status has been corrected.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        _trigger_notification(
            order,
            TriggerEvent.PAYMENT_OVERDUE,
            extra_context={'balance': f'{outstanding:,.0f}', 'total_price': f'{float(order.total_price):,.0f}'},
        )
        return Response({'detail': 'Overdue notice sent.'}, status=status.HTTP_200_OK)

    # ------------------------------------------------------------------
    # Aggregated summary — used by dashboard / reports KPI cards
    # ------------------------------------------------------------------

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        qs = self.get_queryset()

        # Apply the same role-based and query-param filters as list()
        role = request.user.role
        if role == 'baker':
            qs = qs.filter(status__in=['baker', 'quality'])
        elif role == 'driver':
            qs = qs.filter(status__in=['ready', 'dispatched', 'delivered'])
        elif role == 'decorator':
            qs = qs.filter(status='decorator')

        if status_filter := request.query_params.get('status'):
            qs = qs.filter(status=status_filter)
        if date_filter := request.query_params.get('pickup_date'):
            qs = qs.filter(pickup_date=date_filter)

        from apps.finance.models import FinancialTransaction

        agg = qs.aggregate(
            count=Count('id'),
            total_price=Sum('total_price'),
        )

        total_price = float(agg['total_price'] or 0)

        # Revenue comes from the transaction ledger — single source of truth.
        total_revenue = float(
            FinancialTransaction.objects
            .filter(order__in=qs.values('id'), direction='in')
            .aggregate(t=Sum('amount'))['t'] or 0
        )

        by_status = {
            val: qs.filter(status=val).count()
            for val in ['pending', 'paid', 'baker', 'quality', 'decorator', 'ready', 'dispatched', 'delivered']
        }

        by_payment_method = {
            val: float(
                FinancialTransaction.objects
                .filter(order__in=qs.values('id'), direction='in', payment_method=val)
                .aggregate(t=Sum('amount'))['t'] or 0
            )
            for val in ['cash', 'bank_transfer', 'mobile_money', 'card']
        }

        return Response({
            'count':              agg['count'],
            'total_revenue':      total_revenue,
            'total_price':        total_price,
            'total_outstanding':  total_price - total_revenue,
            'by_status':          by_status,
            'by_payment_method':  by_payment_method,
        })


class MenuViewSet(viewsets.GenericViewSet):
    queryset = MenuItem.objects.filter(is_active=True)
    pagination_class = None

    def get_permissions(self):
        write_actions = {'create', 'partial_update', 'destroy', 'category_detail'}
        if self.action in write_actions:
            return [IsManagerOrFrontDesk()]
        if self.action == 'categories' and self.request.method == 'POST':
            return [IsManagerOrFrontDesk()]
        return [IsAuthenticated()]

    def list(self, request):
        today = timezone.now().date()
        # Correlated subquery: sum quantity_remaining across today's batches for each menu item.
        stock_subquery = Subquery(
            DailyBatchItem.objects
            .filter(menu_item=OuterRef('pk'), baked_at__date=today)
            .values('menu_item')
            .annotate(total=Sum('quantity_remaining'))
            .values('total'),
            output_field=IntegerField(),
        )
        qs = (
            MenuItem.objects
            .filter(is_active=True)
            .annotate(stock_today=Coalesce(stock_subquery, Value(0)))
        )
        return Response(MenuItemSerializer(qs, many=True).data)

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

    def destroy(self, request, pk=None):
        """Soft-delete — sets is_active=False rather than removing the row."""
        item = get_object_or_404(MenuItem, pk=pk)
        item.is_active = False
        item.save(update_fields=['is_active'])
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get', 'post'], url_path='categories')
    def categories(self, request):
        if request.method == 'GET':
            cats = (
                MenuItem.objects
                .filter(is_active=True)
                .values_list('category', flat=True)
                .distinct()
                .order_by('category')
            )
            return Response(list(cats))
        # POST — validate the name and return the slug; no DB write needed
        # (the category persists naturally once an item is saved with it)
        name = (request.data.get('name') or '').strip().lower()
        if not name:
            return Response(
                {'name': ['This field is required.']},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({'slug': name}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['patch', 'delete'], url_path=r'categories/(?P<slug>[^/.]+)')
    def category_detail(self, request, slug=None):
        if request.method == 'PATCH':
            new_name = (request.data.get('name') or '').strip().lower()
            if not new_name:
                return Response(
                    {'name': ['This field is required.']},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            MenuItem.objects.filter(category=slug).update(category=new_name)
            return Response({'slug': new_name})
        # DELETE — reject if any active items still use this category
        if MenuItem.objects.filter(category=slug, is_active=True).exists():
            count = MenuItem.objects.filter(category=slug, is_active=True).count()
            return Response(
                {'detail': f'Cannot delete — {count} item(s) still use this category.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


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


class SaleViewSet(viewsets.GenericViewSet):
    """
    Walk-in sales — POST /api/sales/ to record, GET /api/sales/ for history.
    No production pipeline. Created and immediately complete.
    """
    queryset = Sale.objects.prefetch_related('items').select_related('served_by')

    def get_permissions(self):
        return [IsManagerOrFrontDesk()]

    def list(self, request):
        page = self.paginate_queryset(self.get_queryset())
        if page is not None:
            return self.get_paginated_response(SaleSerializer(page, many=True).data)
        return Response(SaleSerializer(self.get_queryset(), many=True).data)

    def create(self, request):
        serializer = SaleCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        sale = Sale.objects.create(
            total_price=data['total_price'],
            payment_method=data['payment_method'],
            customer_name=data.get('customer_name', ''),
            served_by=request.user,
        )
        SaleItem.objects.bulk_create([
            SaleItem(
                sale=sale,
                name=item['name'],
                quantity=item['quantity'],
                unit_price=item['unit_price'],
            )
            for item in data['items']
        ])

        sale.refresh_from_db()
        from apps.finance.services import FinanceService
        FinanceService.record_sale(sale=sale, recorded_by=request.user)
        return Response(SaleSerializer(sale).data, status=status.HTTP_201_CREATED)
